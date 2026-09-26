<?php

namespace Tests\Feature\Settings;

use App\Enums\RolesEnum;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolePermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

class PasswordUpdateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionsSeeder::class);
    }

    private function subscribedUser(): User
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

        return $user->fresh();
    }

    public function test_password_can_be_updated()
    {
        $user = $this->subscribedUser();

        $response = $this
            ->actingAs($user)
            ->from('/admin/settings/password')
            ->put('/admin/settings/password', [
                'current_password' => 'password',
                'password' => 'new-password',
                'password_confirmation' => 'new-password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/admin/settings/password');

        $this->assertTrue(Hash::check('new-password', $user->refresh()->password));
    }

    public function test_correct_password_must_be_provided_to_update_password()
    {
        $user = $this->subscribedUser();

        $response = $this
            ->actingAs($user)
            ->from('/admin/settings/password')
            ->put('/admin/settings/password', [
                'current_password' => 'wrong-password',
                'password' => 'new-password',
                'password_confirmation' => 'new-password',
            ]);

        $response
            ->assertSessionHasErrors('current_password')
            ->assertRedirect('/admin/settings/password');
    }
}
