<?php

namespace Tests\Feature\Settings;

use Database\Seeders\RolePermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

class ProfileUpdateTest extends TestCase
{
    use CreatesUsers, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionsSeeder::class);
    }

    public function test_profile_page_is_displayed()
    {
        $response = $this
            ->actingAs($this->superAdmin())
            ->get('/super-admin/settings/profile');

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated()
    {
        $user = $this->superAdmin();

        $response = $this
            ->actingAs($user)
            ->patch('/super-admin/settings/profile', [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/super-admin/settings/profile');

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged()
    {
        $user = $this->superAdmin();

        $response = $this
            ->actingAs($user)
            ->patch('/super-admin/settings/profile', [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/super-admin/settings/profile');

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_user_can_delete_their_account()
    {
        $user = $this->superAdmin();

        $response = $this
            ->actingAs($user)
            ->delete('/super-admin/settings/profile', [
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
        $user = $this->superAdmin();

        $response = $this
            ->actingAs($user)
            ->from('/super-admin/settings/profile')
            ->delete('/super-admin/settings/profile', [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect('/super-admin/settings/profile');

        $this->assertNotNull($user->fresh());
    }
}
