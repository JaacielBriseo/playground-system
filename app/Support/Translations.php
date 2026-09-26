<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

/**
 * Loads the flat JSON dictionary for a locale so it can be shared with Inertia.
 *
 * Keys are the source English strings, matching Laravel's own __('Some string')
 * convention, so a missing translation falls back to readable English on both
 * sides of the stack rather than to a dotted key.
 */
class Translations
{
    /**
     * @return array<string, string>
     */
    public static function forLocale(string $locale): array
    {
        // Cached in production only — in local dev you want edits to lang/*.json
        // to show up on the next request without clearing anything.
        if (! app()->isProduction()) {
            return self::load($locale);
        }

        return Cache::rememberForever("translations.{$locale}", fn (): array => self::load($locale));
    }

    /**
     * @return array<string, string>
     */
    private static function load(string $locale): array
    {
        $path = lang_path("{$locale}.json");

        if (! File::exists($path)) {
            return [];
        }

        return json_decode(File::get($path), true) ?: [];
    }
}
