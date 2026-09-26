<?php

use App\Exceptions\KnownException;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__ . '/../routes/api.php',
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Trust the nginx reverse-proxy (which sits in front behind CloudFront).
        // nginx resolves the real client IP and passes it as X-Forwarded-For,
        // so $request->ip() and throttle middleware see the correct per-client address.
        $middleware->trustProxies(at: '*');
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);
        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if (! $request->expectsJson()) {
                return Inertia::render('errors/not-found')
                    ->toResponse($request)
                    ->setStatusCode(404);
            }

            return response()->json(['ok' => false, 'message' => 'Not Found', 'errors' => (object) []], 404);
        });

        $exceptions->render(function (KnownException $e, Request $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'ok'      => false,
                    'message' => $e->getMessage(),
                    'errors'  => (object) [],
                ], $e->status);
            }

            return back()->with('error', $e->getMessage());
        });
    })->create();
