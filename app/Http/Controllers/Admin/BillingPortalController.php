<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class BillingPortalController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $tenant = $request->user()->load('tenant')->tenant;

        $url = $tenant->billingPortalUrl(route('admin.index'));

        return Inertia::location($url);
    }
}
