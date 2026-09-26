<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\RegistrationService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class RegisteredUserController extends Controller
{
    public function __construct(private RegistrationService $registrationService) {}

    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    public function store(Request $request): SymfonyResponse
    {
        $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        ['user' => $user, 'tenant' => $tenant] = $this->registrationService->register(
            $request->name,
            $request->email,
            $request->password,
        );

        try {
            activity('saas')
                ->causedBy($user)
                ->performedOn($tenant)
                ->withProperties(['email' => $user->email])
                ->log('tenant.registered');
        } catch (\Throwable $e) {
            Log::error('Failed to write tenant.registered activity log', [
                'user_id'   => $user->id,
                'tenant_id' => $tenant->id,
                'error'     => $e->getMessage(),
            ]);
        }

        event(new Registered($user));

        Auth::login($user);

        return Inertia::location(route('verification.notice'));
    }
}
