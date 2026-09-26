<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('super-admin/index', [
            'metrics' => $this->metrics(),
        ]);
    }

    /**
     * @return array<string, int>
     */
    private function metrics(): array
    {
        return [
            'users'              => User::count(),
            'roles'              => Role::count(),
            'signups_this_month' => User::where('created_at', '>=', now()->startOfMonth())->count(),
        ];
    }
}
