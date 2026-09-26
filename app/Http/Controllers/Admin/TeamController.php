<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function index(Request $request): Response
    {
        $membership = $request->user()->loadMissing('teamMember')->teamMember;
        abort_if($membership === null, 403);

        $team = Team::with([
            'members.user',
            'invitations' => fn ($q) => $q->pending()->with('inviter'),
        ])->findOrFail($membership->team_id);

        return Inertia::render('admin/team/index', [
            'team'        => [
                'id'          => $team->id,
                'name'        => $team->name,
                'slug'        => $team->slug,
                'is_personal' => $team->is_personal,
            ],
            'members'     => $team->members->map(fn ($m) => [
                'id'      => $m->id,
                'user_id' => $m->user_id,
                'name'    => $m->user->name,
                'email'   => $m->user->email,
                'role'    => $m->role,
            ]),
            'invitations' => $team->invitations->map(fn ($i) => [
                'id'         => $i->id,
                'email'      => $i->email,
                'invited_by' => $i->inviter?->name,
                'expires_at' => $i->expires_at,
            ]),
        ]);
    }
}
