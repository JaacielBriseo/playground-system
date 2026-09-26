<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Spatie\Activitylog\Models\Activity;

/**
 * @mixin Activity
 */
class ActivityLogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // causer is polymorphic; in this app it is always a User (or null for
        // system-generated entries).
        $causer = $this->causer instanceof User ? $this->causer : null;

        return [
            'id'           => $this->id,
            'log_name'     => $this->log_name,
            'description'  => $this->description,
            'event'        => $this->event,
            'causer_name'  => $causer?->name,
            'causer_email' => $causer?->email,
            'subject_type' => $this->subject_type ? class_basename($this->subject_type) : null,
            'subject_id'   => $this->subject_id,
            'properties'   => $this->properties,
            'created_at'   => $this->created_at,
        ];
    }
}
