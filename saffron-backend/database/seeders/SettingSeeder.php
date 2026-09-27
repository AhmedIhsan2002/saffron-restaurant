<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // عام
            ['key' => 'restaurant_name',    'value' => 'شفرة',         'type' => 'string',  'group' => 'general'],
            ['key' => 'restaurant_tagline', 'value' => 'منيو رقمي احترافي', 'type' => 'string', 'group' => 'general'],
            ['key' => 'restaurant_address', 'value' => 'دمشق - شارع المزة', 'type' => 'string', 'group' => 'general'],
            ['key' => 'restaurant_phone',   'value' => '+963 11 123 4567', 'type' => 'string', 'group' => 'general'],

            // عملة
            ['key' => 'currency',    'value' => 'SYP', 'type' => 'string',  'group' => 'currency'],
            ['key' => 'currency_symbol', 'value' => 'ل.س', 'type' => 'string', 'group' => 'currency'],
            ['key' => 'tax_rate',    'value' => '0',   'type' => 'integer', 'group' => 'currency'],

            // تشغيل
            ['key' => 'orders_open',    'value' => '1', 'type' => 'boolean', 'group' => 'general'],
            ['key' => 'working_hours',  'value' => json_encode(['open' => '09:00', 'close' => '23:30'], JSON_UNESCAPED_UNICODE), 'type' => 'json', 'group' => 'general'],

            // تواصل
            ['key' => 'whatsapp_number', 'value' => '', 'type' => 'string', 'group' => 'contact'],
            ['key' => 'whatsapp_enabled','value' => '0', 'type' => 'boolean','group' => 'contact'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}