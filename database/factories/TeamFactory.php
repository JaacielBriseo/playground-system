<?php

namespace Database\Factories;

use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Team>
 */
class TeamFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->company();

        return [
            'name'        => $name,
            'slug'        => Str::slug($name),
            'is_personal' => false,
        ];
    }

    public function personal(): static
    {
        return $this->state(['is_personal' => true]);
    }
}
