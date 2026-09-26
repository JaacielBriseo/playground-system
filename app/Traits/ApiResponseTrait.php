<?php

namespace App\Traits;

trait ApiResponseTrait
{
    public function successResponse($data = [], $message = 'Success', $code = 200)
    {
        return response()->json([
            'ok' => true,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    public function errorResponse($message, $code = 400, $errors = [])
    {
        return response()->json([
            'ok' => false,
            'message' => $message,
            'errors' => $errors,
        ], $code);
    }
}
