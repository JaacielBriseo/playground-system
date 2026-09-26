<?php

namespace Tests\Fixtures;

use App\Models\Concerns\HasTenantScope;
use Illuminate\Database\Eloquent\Model;

/**
 * Stand-in for a tenant-owned domain model.
 *
 * The template ships no domain models, but the tenancy mechanism still has to
 * be pinned by tests. This is the smallest thing that exercises it: a model
 * carrying tenant_id and the HasTenantScope trait, exactly like the models a
 * real project will add. Its table is created per-test by TenantScopeTest.
 */
class ScopedFixture extends Model
{
    use HasTenantScope;

    protected $table = 'scoped_fixtures';

    protected $fillable = ['tenant_id', 'name'];

    public $timestamps = false;
}
