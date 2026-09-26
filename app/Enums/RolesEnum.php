<?php

namespace App\Enums;

enum RolesEnum: string
{
    case SuperAdmin = 'super_admin';
    case AccountOwner = 'account_owner';
    case TeamMember = 'team_member';
}
