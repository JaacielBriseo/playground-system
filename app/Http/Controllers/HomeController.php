<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Cashier\Cashier;

class HomeController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $plan = null;

        try {
            $priceId = config('cashier.price_id');

            if ($priceId && config('cashier.secret')) {
                $price = Cashier::stripe()
                    ->prices->retrieve($priceId, ['expand' => ['product']]);

                $plan = [
                    'amount'         => $price->unit_amount / 100,
                    'currency'       => strtoupper($price->currency),
                    'interval'       => $price->recurring->interval,
                    'interval_count' => $price->recurring->interval_count,
                    'product_name'   => $price->product->name ?? null,
                ];
            }
        } catch (\Exception $e) {
            Log::warning('Could not fetch Stripe price for landing page: ' . $e->getMessage());
        }

        return Inertia::render('welcome', ['plan' => $plan]);
    }
}
