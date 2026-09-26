<?php

namespace App\Enums;

/**
 * Platform-level permissions shipped with the template.
 *
 * These cover the SaaS layer only. Add your own domain permissions here as you
 * build modules (e.g. ManageProjects = 'manage-projects'), then grant them in
 * Database\Seeders\RolePermissionsSeeder.
 */
enum PermissionsEnum: string
{
    // Super Admin — platform management
    case ManageTenants = 'manage-tenants';
    case ImpersonateTenants = 'impersonate-tenants';
    case ViewPlatformMetrics = 'view-platform-metrics';

    // Account Owner — scoped to their own tenant
    case ManageSubscription = 'manage-subscription';
    case ManageTeam = 'manage-team';
    case ViewDashboard = 'view-dashboard';
}
