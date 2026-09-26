<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The tenant is the unit of isolation AND the Stripe customer — Cashier's
 * Billable trait lives on App\Models\Tenant, not on User, so a whole account
 * shares one subscription. See App\Providers\AppServiceProvider.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            // Platform-level lock, set by a super admin. Independent of the
            // Stripe subscription state — CheckActiveSubscription honours both.
            $table->string('status')->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
