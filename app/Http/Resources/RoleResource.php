<?php

namespace App\Http\Resources;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Role
 */
class RoleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'label'       => $this->label,
            'users_count' => $this->users_count ?? 0,
            'permissions' => $this->when(
                $this->relationLoaded('permissions'),
                fn () => PermissionResource::collection($this->permissions)
            ),
        ];
    }
}
