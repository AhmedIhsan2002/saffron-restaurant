<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\StoreProductRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * قائمة المنتجات (كل المنتجات، نشطة وغير نشطة).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()->with('category');

        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', (int) $categoryId);
        }

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $products = $query
            ->orderBy('category_id')
            ->orderBy('id', 'desc')
            ->paginate(20);

        return response()->json([
            'data' => ProductResource::collection($products->items()),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
            ],
        ]);
    }

    /**
     * تفاصيل منتج مع خياراته.
     */
    public function show(int $id): ProductResource|JsonResponse
    {
        $product = Product::with(['category', 'options.values' => function ($q) {
            $q->orderBy('sort_order');
        }])->find($id);

        if (!$product) {
            return response()->json(['message' => 'المنتج غير موجود'], 404);
        }

        return new ProductResource($product);
    }

    /**
     * حذف منتج.
     */
    public function destroy(int $id): JsonResponse
    {
        $product = Product::withCount('orderItems')->find($id);

        if (!$product) {
            return response()->json(['message' => 'المنتج غير موجود'], 404);
        }

        // حماية: منع الحذف لو المنتج مرتبط بطلبات سابقة
        if ($product->order_items_count > 0) {
            return response()->json([
                'message' => "لا يمكن حذف المنتج: مرتبط بـ {$product->order_items_count} طلب",
                'hint'    => 'يمكنك تعطيله بدلًا من حذفه',
            ], 409);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف المنتج',
        ]);
    }

        /**
     * إنشاء منتج جديد مع خياراته.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $data = $request->validated();

        $product = DB::transaction(function () use ($data) {
            $product = Product::create($this->extractProductData($data));
            $this->syncOptions($product, $data['options'] ?? []);

            return $product;
        });

        return response()->json([
            'success' => true,
            'data'    => new ProductResource($product->load('options.values')),
        ], 201);
    }

    /**
     * تعديل منتج وخياراته.
     */
    public function update(StoreProductRequest $request, int $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'المنتج غير موجود'], 404);
        }

        $data = $request->validated();

        DB::transaction(function () use ($product, $data) {
            $product->update($this->extractProductData($data));

            // احذف كل الخيارات القديمة وأعِد إنشاءها
            $product->options()->delete();
            $this->syncOptions($product, $data['options'] ?? []);
        });

        return response()->json([
            'success' => true,
            'data'    => new ProductResource($product->fresh(['options.values'])),
        ]);
    }

    // ---------------------------
    // Helpers
    // ---------------------------

    /**
     * استخرج بيانات المنتج (بدون options).
     */
    private function extractProductData(array $data): array
    {
        return [
            'category_id' => $data['category_id'],
            'name'        => $data['name'],
            'slug'        => $data['slug'],
            'description' => $data['description'] ?? null,
            'image'       => $data['image'] ?? null,
            'price'       => $data['price'],
            'old_price'   => $data['old_price'] ?? null,
            'is_featured' => $data['is_featured'] ?? false,
            'is_active'   => $data['is_active'] ?? true,
        ];
    }

    /**
     * أنشئ الخيارات وقيمها.
     */
    private function syncOptions(Product $product, array $options): void
    {
        foreach ($options as $index => $optData) {
            $option = $product->options()->create([
                'name'        => $optData['name'],
                'type'        => $optData['type'],
                'is_required' => $optData['is_required'] ?? false,
                'sort_order'  => $optData['sort_order'] ?? $index + 1,
            ]);

            foreach ($optData['values'] as $vIndex => $valData) {
                $option->values()->create([
                    'name'        => $valData['name'],
                    'extra_price' => $valData['extra_price'] ?? 0,
                    'sort_order'  => $valData['sort_order'] ?? $vIndex + 1,
                ]);
            }
        }
    }
}