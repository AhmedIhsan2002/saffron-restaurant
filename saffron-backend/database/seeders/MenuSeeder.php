<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductOption;
use App\Models\OptionValue;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        // ============================================
        // نظّف الجداول بالترتيب الصحيح
        // ============================================
        OptionValue::query()->delete();
        ProductOption::query()->delete();
        Product::query()->delete();
        Category::query()->delete();

        // ============================================
        // الفئات
        // ============================================
        $categories = [
            ['name' => 'مقبلات',   'slug' => 'appetizers', 'sort_order' => 1, 'image' => null],
            ['name' => 'مشاوي',    'slug' => 'grills',     'sort_order' => 2, 'image' => null],
            ['name' => 'وجبات',    'slug' => 'meals',      'sort_order' => 3, 'image' => null],
            ['name' => 'مشروبات',  'slug' => 'drinks',     'sort_order' => 4, 'image' => null],
            ['name' => 'حلويات',   'slug' => 'desserts',   'sort_order' => 5, 'image' => null],
        ];

        foreach ($categories as $data) {
            Category::create($data);
        }

        // ============================================
        // المنتجات
        // ============================================
        $appetizers = Category::where('slug', 'appetizers')->first();
        $grills     = Category::where('slug', 'grills')->first();
        $meals      = Category::where('slug', 'meals')->first();
        $drinks     = Category::where('slug', 'drinks')->first();
        $desserts   = Category::where('slug', 'desserts')->first();

        // مقبلات
        $this->createProduct($appetizers, [
            'name' => 'حمص بالطحينة', 'slug' => 'hummus',
            'description' => 'حمص كريمي مع طحينة وزيت زيتون بكر',
            'price' => 15000, 'is_featured' => true,
        ], [
            ['name' => 'الحجم', 'type' => 'single', 'is_required' => true, 'values' => [
                ['name' => 'عادي', 'extra_price' => 0],
                ['name' => 'كبير', 'extra_price' => 5000],
            ]],
            ['name' => 'الإضافات', 'type' => 'multiple', 'is_required' => false, 'values' => [
                ['name' => 'صنوبر', 'extra_price' => 8000],
                ['name' => 'لحم مفروم', 'extra_price' => 10000],
            ]],
        ]);

        $this->createProduct($appetizers, [
            'name' => 'متبل باذنجان', 'slug' => 'mutabbal',
            'description' => 'باذنجان مشوي مع طحينة وليمون',
            'price' => 14000, 'is_featured' => false,
        ]);

        $this->createProduct($appetizers, [
            'name' => 'فتوش', 'slug' => 'fattoush',
            'description' => 'سلطة فتوش طازجة مع خبز مقرمش',
            'price' => 12000, 'is_featured' => true,
        ]);

        $this->createProduct($appetizers, [
            'name' => 'تبولة', 'slug' => 'tabbouleh',
            'description' => 'بقدونس وبرغل وليمون',
            'price' => 11000, 'is_featured' => false,
        ]);

        // مشاوي
        $this->createProduct($grills, [
            'name' => 'شيش طاووق', 'slug' => 'shish-tawook',
            'description' => 'قطع دجاج متبلة مشوية على الفحم',
            'price' => 35000, 'old_price' => 40000, 'is_featured' => true,
        ], [
            ['name' => 'الحجم', 'type' => 'single', 'is_required' => true, 'values' => [
                ['name' => 'نصف', 'extra_price' => 0],
                ['name' => 'كامل', 'extra_price' => 15000],
            ]],
            ['name' => 'الإضافات', 'type' => 'multiple', 'is_required' => false, 'values' => [
                ['name' => 'ثومية', 'extra_price' => 3000],
                ['name' => 'خبز إضافي', 'extra_price' => 2000],
            ]],
        ]);

        $this->createProduct($grills, [
            'name' => 'كباب حلبي', 'slug' => 'kebab-halabi',
            'description' => 'كباب لحم مفروم متبل بالبهارات الشامية',
            'price' => 42000, 'is_featured' => true,
        ]);

        $this->createProduct($grills, [
            'name' => 'شيش كباب', 'slug' => 'shish-kebab',
            'description' => 'قطع لحم غنم مشوية',
            'price' => 48000, 'is_featured' => false,
        ]);

        // وجبات
        $this->createProduct($meals, [
            'name' => 'برغر لحم', 'slug' => 'beef-burger',
            'description' => 'برغر لحم مع جبن شيدر وخس وطماطم',
            'price' => 30000, 'is_featured' => true,
        ], [
            ['name' => 'درجة الاستواء', 'type' => 'single', 'is_required' => true, 'values' => [
                ['name' => 'متوسط', 'extra_price' => 0],
                ['name' => 'ويل دن', 'extra_price' => 0],
                ['name' => 'ول دان', 'extra_price' => 0],
            ]],
            ['name' => 'الإضافات', 'type' => 'multiple', 'is_required' => false, 'values' => [
                ['name' => 'جبن إضافي', 'extra_price' => 4000],
                ['name' => 'بيكون', 'extra_price' => 8000],
            ]],
        ]);

        $this->createProduct($meals, [
            'name' => 'شاورما دجاج', 'slug' => 'chicken-shawarma',
            'description' => 'شاورما دجاج مع ثومية ومخلل',
            'price' => 22000, 'is_featured' => true,
        ], [
            ['name' => 'الحجم', 'type' => 'single', 'is_required' => true, 'values' => [
                ['name' => 'عادي', 'extra_price' => 0],
                ['name' => 'جامبو', 'extra_price' => 7000],
            ]],
        ]);

        // مشروبات
        $this->createProduct($drinks, [
            'name' => 'عصير برتقال', 'slug' => 'orange-juice',
            'description' => 'عصير برتقال طازج',
            'price' => 12000, 'is_featured' => false,
        ], [
            ['name' => 'الحجم', 'type' => 'single', 'is_required' => true, 'values' => [
                ['name' => 'وسط', 'extra_price' => 0],
                ['name' => 'كبير', 'extra_price' => 4000],
            ]],
        ]);

        $this->createProduct($drinks, [
            'name' => 'لبن عيران', 'slug' => 'ayran',
            'description' => 'لبن مخفوق بالنعناع',
            'price' => 8000, 'is_featured' => false,
        ]);

        $this->createProduct($drinks, [
            'name' => 'شاي', 'slug' => 'tea',
            'description' => 'شاي سوري مع نعناع',
            'price' => 5000, 'is_featured' => false,
        ]);

        $this->createProduct($drinks, [
            'name' => 'ماء صغير', 'slug' => 'water-small',
            'description' => 'قنينة ماء 0.5 لتر',
            'price' => 3000, 'is_featured' => false,
        ]);

        // حلويات
        $this->createProduct($desserts, [
            'name' => 'كنافة نابلسية', 'slug' => 'knafeh',
            'description' => 'كنافة بالجبن مع قطر',
            'price' => 18000, 'is_featured' => true,
        ]);

        $this->createProduct($desserts, [
            'name' => 'مهلبية', 'slug' => 'muhallebi',
            'description' => 'مهلبية بالحليب مع فستق',
            'price' => 13000, 'is_featured' => false,
        ]);
    }

    /**
     * Helper: أنشئ منتجًا مع خياراته وقيمه.
     */
    private function createProduct(Category $category, array $data, array $options = []): void
    {
        $data['category_id'] = $category->id;

        $product = Product::create($data);

        foreach ($options as $index => $optionData) {
            $option = ProductOption::create([
                'product_id'  => $product->id,
                'name'        => $optionData['name'],
                'type'        => $optionData['type'],
                'is_required' => $optionData['is_required'],
                'sort_order'  => $index + 1,
            ]);

            foreach ($optionData['values'] as $i => $valueData) {
                OptionValue::create([
                    'option_id'   => $option->id,
                    'name'        => $valueData['name'],
                    'extra_price' => $valueData['extra_price'],
                    'sort_order'  => $i + 1,
                ]);
            }
        }
    }
}