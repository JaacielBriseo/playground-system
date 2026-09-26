<?php

namespace Tests\Feature;

use App\Enums\RolesEnum;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolePermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionsSeeder::class);
    }

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get('/admin')->assertRedirect('/login');
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $tenant->subscriptions()->create([
            'type' => 'default',
            'stripe_id' => 'sub_' . Str::random(14),
            'stripe_status' => 'active',
            'stripe_price' => 'price_test',
            'quantity' => 1,
        ]);
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $user->assignRole(RolesEnum::AccountOwner);

        $this->actingAs($user->fresh())->get('/admin')->assertOk();
    }
}
