<?php

namespace App\DTOs\Roles;

readonly class CreateRoleData
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
            permissions: $validated['permissions'] ?? null,
        );
    }
}
