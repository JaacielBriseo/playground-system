<?php

namespace App\Providers;

use App\Listeners\LogCashierWebhookActivity;
use App\Models\Tenant;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Laravel\Cashier\Cashier;
use Laravel\Cashier\Events\WebhookHandled;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void {}

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Cashier::useCustomerModel(Tenant::class);
        JsonResource::withoutWrapping();
        Event::listen(WebhookHandled::class, LogCashierWebhookActivity::class);
        $this->configureCommands();
        $this->configureDates();
        $this->configureUrl();
        $this->configureRateLimiting();
        $this->enforceProductionSecurity();
        Model::shouldBeStrict(! App::isProduction());
    }

    /**
     * It's recommended to use CarbonImmutable as it's immutable and thread-safe to avoid issues with mutability.
     *
     * @see https://dyrynda.com.au/blog/laravel-immutable-dates
     */
    private function configureDates(): void
    {
        Date::use(CarbonImmutable::class);
    }

    /**
     * Configure the application's commands.
     */
    private function configureCommands(): void
    {
        DB::prohibitDestructiveCommands(App::isProduction());
    }

    /**
     * Configure the application's URL.
     * This is optional, but it's recommended to force HTTPS in production.
     *
     * @see https://laravel.com/docs/octane#serving-your-application-via-https
     */
    private function configureUrl(): void
    {
        URL::forceHttps(App::isProduction());
    }

    private function configureRateLimiting(): void
    {
        RateLimiter::for('global', function (Request $request) {
            return Limit::perMinute(2)->by(optional($request->user())->id ?: $request->ip());
        });
    }

    private function enforceProductionSecurity(): void
    {
        if (! App::isProduction()) {
            return;
        }

        if (! config('session.secure')) {
            throw new \RuntimeException('SESSION_SECURE_COOKIE must be true in production.');
        }

        if (! config('session.encrypt')) {
            throw new \RuntimeException('SESSION_ENCRYPT must be true in production.');
        }

        if (! config('cashier.price_id')) {
            throw new \RuntimeException('STRIPE_PRICE_ID must be set in production — without it nobody can subscribe.');
        }

        if (! config('cashier.webhook.secret')) {
            throw new \RuntimeException('STRIPE_WEBHOOK_SECRET must be set in production — subscription state would never update.');
        }
    }
}
