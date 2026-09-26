<?php

namespace Tests\Feature\Settings;

use Database\Seeders\RolePermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

class PasswordUpdateTest extends TestCase
{
    use CreatesUsers, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionsSeeder::class);
    }

    public function test_password_can_be_updated()
    {
        $user = $this->superAdmin();

        $response = $this
            ->actingAs($user)
            ->from('/super-admin/settings/password')
            ->put('/super-admin/settings/password', [
                'current_password' => 'password',
                'password' => 'new-password',
                'password_confirmation' => 'new-password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/super-admin/settings/password');

        $this->assertTrue(Hash::check('new-password', $user->refresh()->password));
    }

    public function test_correct_password_must_be_provided_to_update_password()
    {
        $user = $this->superAdmin();

        $response = $this
            ->actingAs($user)
            ->from('/super-admin/settings/password')
            ->put('/super-admin/settings/password', [
                'current_password' => 'wrong-password',
                'password' => 'new-password',
                'password_confirmation' => 'new-password',
            ]);

        $response
            ->assertSessionHasErrors('current_password')
            ->assertRedirect('/super-admin/settings/password');
    }
}
