<?php

namespace Tests\Unit\Models;

use App\Models\TeamInvitation;
use Tests\TestCase;

/**
 * Pure state logic — no database needed.
 */
class TeamInvitationTest extends TestCase
{
    public function test_a_future_unaccepted_invitation_is_pending(): void
    {
        $invitation = new TeamInvitation([
            'expires_at'  => now()->addDay(),
            'accepted_at' => null,
        ]);

        $this->assertTrue($invitation->isPending());
        $this->assertFalse($invitation->isExpired());
    }

    public function test_an_accepted_invitation_is_no_longer_pending(): void
    {
        $invitation = new TeamInvitation([
            'expires_at'  => now()->addDay(),
            'accepted_at' => now(),
        ]);

        $this->assertFalse($invitation->isPending());
    }

    public function test_a_past_expiry_is_expired_and_not_pending(): void
    {
        $invitation = new TeamInvitation([
            'expires_at'  => now()->subMinute(),
            'accepted_at' => null,
        ]);

        $this->assertTrue($invitation->isExpired());
        $this->assertFalse($invitation->isPending());
    }
}
