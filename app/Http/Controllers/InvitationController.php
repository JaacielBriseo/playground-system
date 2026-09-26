<?php

namespace App\Http\Controllers;

use App\Models\TeamInvitation;
use App\Services\InvitationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    public function __construct(private InvitationService $invitationService) {}

    public function show(string $token): Response|RedirectResponse
    {
        $invitation = TeamInvitation::with('team')
            ->where('token', $token)
            ->firstOrFail();

        if (! $invitation->isPending()) {
            return redirect()->route('login')
                ->with('error', __('This invitation has expired or was already used.'));
        }

        return Inertia::render('invitation/accept', [
            'teamName' => $invitation->team->name,
            'email'    => $invitation->email,
            'token'    => $token,
        ]);
    }

    public function accept(Request $request, string $token): RedirectResponse
    {
        $invitation = TeamInvitation::with('team')
            ->where('token', $token)
            ->firstOrFail();

        if (! $invitation->isPending()) {
            return redirect()->route('login')
                ->with('error', __('This invitation has expired or was already used.'));
        }

        $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = $this->invitationService->accept($invitation, $request->name, $request->password);

        try {
            activity('saas')
                ->causedBy($user)
                ->log('team_member.joined');
        } catch (\Throwable) {
        }

        Auth::login($user);

        return redirect()->route('admin.index');
    }
}
