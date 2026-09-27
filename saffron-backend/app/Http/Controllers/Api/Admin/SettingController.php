<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSettingsRequest;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SettingController extends Controller
{
    /**
     * عرض كل الإعدادات.
     */
    public function index(): JsonResponse
    {
        $settings = Setting::query()
            ->orderBy('group')
            ->orderBy('key')
            ->get()
            ->map(fn ($s) => [
                'key'   => $s->key,
                'value' => $s->value,
                'type'  => $s->type,
                'group' => $s->group,
            ]);

        return response()->json(['data' => $settings]);
    }

    /**
     * تحديث عدة إعدادات دفعة واحدة.
     */
    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        $items = $request->validated()['settings'];

        DB::transaction(function () use ($items) {
            foreach ($items as $item) {
                Setting::updateOrCreate(
                    ['key' => $item['key']],
                    [
                        'value' => $this->serializeValue($item['value'], $item['type']),
                        'type'  => $item['type'],
                        'group' => $item['group'] ?? 'general',
                    ]
                );
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الإعدادات',
        ]);
    }

    /**
     * حوّل القيمة إلى نص للتخزين.
     */
    private function serializeValue(mixed $value, string $type): ?string
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'boolean' => $value ? '1' : '0',
            'json'    => is_string($value) ? $value : json_encode($value, JSON_UNESCAPED_UNICODE),
            default   => (string) $value,
        };
    }
}