<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityLogResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $logs = Activity::query()
            ->with(['causer', 'subject'])
            ->when(
                $request->log_name,
                fn ($q, $n) => $q->where('log_name', $n)
            )
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 25));

        return Inertia::render('super-admin/activity-log/index', [
            'logs' => ActivityLogResource::collection($logs)->additional([
                'total_count' => $logs->total(),
            ]),
        ]);
    }
}
