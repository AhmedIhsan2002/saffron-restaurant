<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    /**
     * قائمة كل الفئات (نشطة وغير نشطة).
     */
    public function index(): AnonymousResourceCollection
    {
        $categories = Category::query()
            ->withCount('products')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return CategoryResource::collection($categories);
    }

    /**
     * تفاصيل فئة.
     */
    public function show(int $id): CategoryResource|JsonResponse
    {
        $category = Category::withCount('products')->find($id);

        if (!$category) {
            return response()->json(['message' => 'الفئة غير موجودة'], 404);
        }

        return new CategoryResource($category);
    }

    /**
     * إنشاء فئة.
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['is_active'] = $data['is_active'] ?? true;

        $category = Category::create($data);

        return response()->json([
            'success' => true,
            'data'    => new CategoryResource($category),
        ], 201);
    }

    /**
     * تعديل فئة.
     */
    public function update(StoreCategoryRequest $request, int $id): JsonResponse
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json(['message' => 'الفئة غير موجودة'], 404);
        }

        $category->update($request->validated());

        return response()->json([
            'success' => true,
            'data'    => new CategoryResource($category->fresh()),
        ]);
    }

    /**
     * حذف فئة.
     */
    public function destroy(int $id): JsonResponse
    {
        $category = Category::withCount('products')->find($id);

        if (!$category) {
            return response()->json(['message' => 'الفئة غير موجودة'], 404);
        }

        // نمنع الحذف لو فيه منتجات (حماية إضافية)
        if ($category->products_count > 0) {
            return response()->json([
                'message' => "لا يمكن حذف الفئة: تحتوي على {$category->products_count} منتجًا",
            ], 409);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الفئة',
        ]);
    }
}