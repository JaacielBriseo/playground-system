<?php

namespace Tests\Feature\Settings;

use App\Enums\RolesEnum;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolePermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ProfileUpdateTest extends TestCase
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

    public function test_profile_page_is_displayed()
    {
        $response = $this
            ->actingAs($this->subscribedUser())
            ->get('/admin/settings/profile');

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated()
    {
        $user = $this->subscribedUser();

        $response = $this
            ->actingAs($user)
            ->patch('/admin/settings/profile', [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/admin/settings/profile');

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged()
    {
        $user = $this->subscribedUser();

        $response = $this
            ->actingAs($user)
            ->patch('/admin/settings/profile', [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/admin/settings/profile');

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_user_can_delete_their_account()
    {
        $user = $this->subscribedUser();

        $response = $this
            ->actingAs($user)
            ->delete('/admin/settings/profile', [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    public function test_correct_password_must_be_provided_to_delete_account()
    {
        $user = $this->subscribedUser();

        $response = $this
            ->actingAs($user)
            ->from('/admin/settings/profile')
            ->delete('/admin/settings/profile', [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect('/admin/settings/profile');

        $this->assertNotNull($user->fresh());
    }
}
