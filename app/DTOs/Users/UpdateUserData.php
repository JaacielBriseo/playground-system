<?php

namespace App\DTOs\Users;

readonly class UpdateUserData
{
    public function __construct(
        public ?string $name = null,
        public ?string $email = null,
        public ?string $password = null,
        public ?array $roles = null,
        private array $provided = [],
    ) {}

    public function isProvided(string $field): bool
    {
        return in_array($field, $this->provided);
    }

    public static function fromValidated(array $validated): self
    {
        return new self(
            name: $validated['name'] ?? null,
            email: $validated['email'] ?? null,
            password: $validated['password'] ?? null,
            roles: $validated['roles'] ?? null,
            provided: array_keys($validated),
        );
    }
}
