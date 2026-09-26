<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

/**
 * Portable case-insensitive search across one or more columns.
 *
 * Postgres has ILIKE; MySQL and SQLite do not. Lowering both sides works
 * everywhere, so search behaves the same in dev (SQLite), CI and production
 * regardless of driver.
 *
 *     User::search($request->search, ['name', 'email'])->paginate();
 *
 * Note this cannot use a plain index on the column. If a table grows past the
 * point where that matters, replace the call site with a real full-text index
 * (MySQL FULLTEXT / Postgres tsvector) rather than widening this helper.
 */
trait Searchable
{
    /**
     * @param  array<int, string>  $columns
     */
    public function scopeSearch(Builder $query, ?string $term, array $columns): Builder
    {
        $term = trim((string) $term);

        if ($term === '' || $columns === []) {
            return $query;
        }

        $needle = '%' . mb_strtolower($term) . '%';

        return $query->where(function (Builder $q) use ($columns, $needle): void {
            foreach ($columns as $column) {
                $q->orWhereRaw('LOWER(' . $q->getQuery()->getGrammar()->wrap($q->qualifyColumn($column)) . ') LIKE ?', [$needle]);
            }
        });
    }
}
