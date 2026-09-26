<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

/**
 * Spatie's Role plus a `label` column — the human-readable name shown in the
 * super admin UI, while `name` stays the machine key used by middleware.
 *
 * config/permission.php points at this class, so Role::create() and the
 * HasRoles trait return this type rather than the package's.
 *
 * @property int $id
 * @property string $name
 * @property string $label
 * @property string $guard_name
 * @property-read int|null $users_count
 */
class Role extends SpatieRole
{
    /** @var list<string> */
    protected $fillable = ['name', 'label', 'guard_name'];

    /**
     * Narrows the parent's `RoleContract|Role` docblock to this model, which is
     * what it actually returns — the package builds it with static::query().
     *
     * @param  array<string, mixed>  $attributes
     * @return static
     */
    public static function create(array $attributes = [])
    {
        /** @var static */
        return parent::create($attributes);
    }
}
