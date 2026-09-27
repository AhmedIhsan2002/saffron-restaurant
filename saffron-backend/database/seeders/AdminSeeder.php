<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use RuntimeException;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@saffron.test');
        $password = env('ADMIN_PASSWORD');

        if (!$password) {
            if (app()->environment('production')) {
                throw new RuntimeException('ADMIN_PASSWORD must be configured before seeding production.');
            }
            $password = 'admin1234';
        }

        Admin::updateOrCreate(
            ['email' => $email],
            [
                'name' => env('ADMIN_NAME', 'مدير شفرة'),
                'password' => $password,
                'role' => 'admin',
            ]
        );
    }
}
