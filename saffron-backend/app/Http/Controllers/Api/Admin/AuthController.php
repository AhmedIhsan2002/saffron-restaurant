<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * تسجيل دخول المدير.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string', 'min:6'],
        ], [
            'email.required'    => 'البريد الإلكتروني مطلوب',
            'email.email'       => 'صيغة البريد غير صحيحة',
            'password.required' => 'كلمة المرور مطلوبة',
            'password.min'      => 'كلمة المرور قصيرة جدًا',
        ]);

        $admin = Admin::where('email', $credentials['email'])->first();

        if (!$admin || !Hash::check($credentials['password'], $admin->password)) {
            throw ValidationException::withMessages([
                'email' => ['بيانات الدخول غير صحيحة'],
            ]);
        }

        // أنشئ توكن Sanctum
        $token = $admin->createToken('admin-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token'   => $token,
            'admin'   => [
                'id'    => $admin->id,
                'name'  => $admin->name,
                'email' => $admin->email,
                'role'  => $admin->role,
            ],
        ]);
    }

    /**
     * بيانات المدير الحالي.
     */
    public function me(Request $request): JsonResponse
    {
        $admin = $request->user();

        return response()->json([
            'admin' => [
                'id'    => $admin->id,
                'name'  => $admin->name,
                'email' => $admin->email,
                'role'  => $admin->role,
            ],
        ]);
    }

    /**
     * تسجيل الخروج (حذف التوكن الحالي).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الخروج بنجاح',
        ]);
    }
}