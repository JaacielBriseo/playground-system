<?php

namespace Tests\Feature;

use Database\Seeders\RolePermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use CreatesUsers, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionsSeeder::class);
    }

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get('/super-admin')->assertRedirect('/login');
    }

    public function test_super_admins_can_visit_the_dashboard()
    {
        $this->actingAs($this->superAdmin())->get('/super-admin')->assertOk();
    }

    public function test_regular_users_cannot_visit_the_dashboard()
    {
        $this->actingAs($this->regularUser())->get('/super-admin')->assertForbidden();
    }
}
