<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use App\Services\TeamService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TeamApiController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private TeamService $teamService) {}

    private function resolveTeam(Request $request): Team
    {
        $membership = $request->user()->loadMissing('teamMember')->teamMember;
        abort_if($membership === null, 403);

        return Team::findOrFail($membership->team_id);
    }

    public function invite(Request $request): JsonResponse
    {
        $team = $this->resolveTeam($request);

        $validated = $request->validate([
            'email' => [
                'required', 'email',
                Rule::unique('team_invitations', 'email')
                    ->where('team_id', $team->id)
                    ->whereNull('accepted_at'),
                Rule::unique('users', 'email'),
            ],
        ]);

        $invitation = $this->teamService->invite($team, $validated['email'], $request->user()->id);

        return $this->successResponse(
            ['email' => $invitation->email],
            __('Invitation sent to :email', ['email' => $invitation->email]),
            201,
        );
    }

    public function removeMember(Request $request, User $user): JsonResponse
    {
        $team = $this->resolveTeam($request);

        $this->teamService->removeMember($team, $user, $request->user());

        activity('saas')
            ->causedBy($request->user())
            ->performedOn($user)
            ->log('team_member.removed');

        return $this->successResponse([], __(':name was removed from the team.', ['name' => $user->name]));
    }

    public function cancelInvitation(Request $request, TeamInvitation $invitation): JsonResponse
    {
        $team = $this->resolveTeam($request);

        abort_if($invitation->team_id !== $team->id, 403);

        $this->teamService->cancelInvitation($invitation);

        return $this->successResponse([], __('Invitation cancelled.'));
    }

    public function resendInvitation(Request $request, TeamInvitation $invitation): JsonResponse
    {
        $team = $this->resolveTeam($request);

        abort_if($invitation->team_id !== $team->id, 403);

        $this->teamService->resendInvitation($invitation);

        return $this->successResponse([], __('Invitation resent to :email', ['email' => $invitation->email]));
    }
}
