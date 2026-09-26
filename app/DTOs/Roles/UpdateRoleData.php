<?php

namespace App\DTOs\Roles;

readonly class UpdateRoleData
{
    public function __construct(
        public string $name,
        public string $label,
        public ?array $permissions = null,
    ) {}

    public static function fromValidated(array $validated): self
    {
        return new self(
            name: $validated['name'],
            label: $validated['label'],
            // null means "not provided, don't touch"; [] means "clear all"
            permissions: array_key_exists('permissions', $validated) ? ($validated['permissions'] ?? []) : null,
        );
    }
}
