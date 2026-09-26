<?php

namespace App\Enums;

/**
 * Platform-level permissions shipped with the template.
 *
 * Add your own domain permissions here as you build modules (e.g.
 * ManageProjects = 'manage-projects'), then grant them in
 * Database\Seeders\RolePermissionsSeeder.
 */
enum PermissionsEnum: string
{
    case ViewPlatformMetrics = 'view-platform-metrics';
}
