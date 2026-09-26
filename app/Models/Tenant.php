<?php

namespace App\Models;

use App\Models\Concerns\Searchable;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Cashier\Billable;
use Laravel\Cashier\Subscription;

/**
 * The unit of isolation, and the Stripe customer (Cashier's Billable lives here
 * rather than on User, so a whole account shares one subscription).
 *
 * @property int $id
 * @property string $name
 * @property string $status 'active' | 'suspended' — a platform-level lock, independent of Stripe
 * @property string|null $stripe_id
 * @property string|null $pm_last_four
 * @property CarbonImmutable|null $trial_ends_at
 * @property-read Collection<int, User> $users
 * @property-read int|null $users_count
 * @property-read Collection<int, Subscription> $subscriptions
 */
class Tenant extends Model
{
    use Billable, HasFactory, Searchable;

    protected $fillable = [
        'name',
        'status',
    ];

    /** @return HasMany<User, $this> */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    // Add your tenant-owned relations here, e.g.:
    // public function projects(): HasMany
    // {
    //     return $this->hasMany(Project::class);
    // }
}
