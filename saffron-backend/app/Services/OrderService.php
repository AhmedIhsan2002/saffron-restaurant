<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderService
{
    /**
     * إنشاء طلب جديد.
     *
     * @throws ValidationException
     */
    public function create(array $data): Order
    {
             // ✅ تحقق: هل الطلبات مفتوحة؟
        if (!Setting::get('orders_open', true)) {
            $hours = Setting::get('working_hours', null);
            $hint = '';

            if ($hours && is_array($hours) && isset($hours['open'], $hours['close'])) {
                $hint = " (أوقات العمل: {$hours['open']} - {$hours['close']})";
            }

            throw ValidationException::withMessages([
                'orders' => [
                    "استقبال الطلبات مغلق حاليًا{$hint}. الرجاء المحاولة لاحقًا.",
                ],
            ]);
        }
        return DB::transaction(function () use ($data) {

            // 1. حمّل كل المنتجات المعنية مع خياراتها وقيمها
            $productIds = collect($data['items'])->pluck('product_id')->unique()->values();
            $products = Product::query()
                ->with(['options.values'])
                ->whereIn('id', $productIds)
                ->where('is_active', true)
                ->get()
                ->keyBy('id');

            // 2. جهّز عناصر الطلب واحسب الأسعار
            $items = [];
            $subtotal = 0;

            foreach ($data['items'] as $index => $itemData) {
                $product = $products->get($itemData['product_id']);

                if (!$product) {
                    throw ValidationException::withMessages([
                        "items.{$index}.product_id" => "المنتج غير متوفر أو غير نشط",
                    ]);
                }

                $prepared = $this->prepareItem($product, $itemData, $index);
                $items[] = $prepared['item'];
                $subtotal += $prepared['line_total'];
            }

            // 3. احسب الإجمالي (مع الضريبة إن وُجدت)
            $taxRate   = (int) (Setting::get('tax_rate', 0) ?? 0);
            $taxAmount = round($subtotal * ($taxRate / 100), 2);
            $total     = round($subtotal + $taxAmount, 2);

            // 4. أنشئ الطلب (order_number مؤقت)
            $order = Order::create([
                'order_number' => 'PENDING-' . uniqid(),
                'public_token' => Str::random(48),
                'table_number' => $data['table_number'],
                'guest_name'   => $data['guest_name'] ?? null,
                'notes'        => $data['notes'] ?? null,
                'subtotal'     => $subtotal,
                'total'        => $total,
                'status'       => Order::STATUS_PENDING,
            ]);

            // 5. أنشئ العناصر
            foreach ($items as $item) {
                $order->items()->create($item);
            }

            // 6. حدّث order_number بالصيغة النهائية بناءً على id
            $order->order_number = $this->generateOrderNumber($order->id);
            $order->save();

            return $order->fresh(['items']);
        });
    }

    /**
     * جهّز عنصرًا واحدًا: تحقق من الخيارات، احسب السعر، ابنِ الـ snapshot.
     */
    private function prepareItem(Product $product, array $itemData, int $index): array
    {
        $quantity = (int) $itemData['quantity'];
        $selectedOptions = collect($itemData['options'] ?? []);

        $optionsSnapshot = [];
        $optionsExtraSum = 0.0;

        // لكل خيار مُعطى من العميل
        foreach ($selectedOptions as $optIndex => $optData) {
            $option = $product->options->firstWhere('id', $optData['option_id']);

            if (!$option) {
                throw ValidationException::withMessages([
                    "items.{$index}.options.{$optIndex}.option_id" =>
                        "الخيار «{$optData['option_id']}» لا ينتمي لهذا المنتج",
                ]);
            }

            $valueIds = array_unique($optData['value_ids']);
            $values   = $option->values->whereIn('id', $valueIds);

            // تأكد أن كل القيم تنتمي فعلًا لهذا الخيار
            if ($values->count() !== count($valueIds)) {
                throw ValidationException::withMessages([
                    "items.{$index}.options.{$optIndex}.value_ids" =>
                        "إحدى قيم الخيار غير صحيحة",
                ]);
            }

            // تأكد من نوع الاختيار
            if ($option->type === 'single' && count($valueIds) > 1) {
                throw ValidationException::withMessages([
                    "items.{$index}.options.{$optIndex}.value_ids" =>
                        "الخيار «{$option->name}» يسمح بقيمة واحدة فقط",
                ]);
            }

            foreach ($values as $value) {
                $optionsSnapshot[] = [
                    'option_id'   => $option->id,
                    'option_name' => $option->name,
                    'value_id'    => $value->id,
                    'value_name'  => $value->name,
                    'extra_price' => $value->extra_price,
                ];
                $optionsExtraSum += (float) $value->extra_price;
            }
        }

        // تحقق أن كل خيار مطلوب قد اختير
        $providedOptionIds = $selectedOptions->pluck('option_id')->all();
        foreach ($product->options as $option) {
            if ($option->is_required && !in_array($option->id, $providedOptionIds, true)) {
                throw ValidationException::withMessages([
                    "items.{$index}.options" =>
                        "الخيار «{$option->name}» مطلوب",
                ]);
            }
        }

        $unitPrice  = (float) $product->price + $optionsExtraSum;
        $lineTotal  = round($unitPrice * $quantity, 2);

        return [
            'item' => [
                'product_id'       => $product->id,
                'name_snapshot'    => $product->name,
                'price_snapshot'   => $product->price,
                'quantity'         => $quantity,
                'options_snapshot' => $optionsSnapshot,
            ],
            'line_total' => $lineTotal,
        ];
    }

    /**
     * صيغة order_number: SF-YYYY-NNNN
     */
    private function generateOrderNumber(int $id): string
    {
        return sprintf('SF-%s-%04d', now()->year, $id);
    }
}
