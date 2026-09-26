<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <title>{{ __('Team invitation') }}</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 8px; padding: 32px; }
        h1 { font-size: 22px; color: #111; }
        p { color: #555; line-height: 1.6; }
        .btn { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; }
        .footer { margin-top: 32px; font-size: 12px; color: #aaa; }
    </style>
</head>
<body>
    <div class="container">
        <h1>{{ __('You have been invited to :team', ['team' => $teamName]) }}</h1>
        <p>{!! __('<strong>:inviter</strong> has invited you to join <strong>:team</strong>.', ['inviter' => e($inviterName), 'team' => e($teamName)]) !!}</p>
        <p>{{ __('Click the button below to accept and create your account. This invitation expires on :date.', ['date' => $expiresAt]) }}</p>
        <a href="{{ $acceptUrl }}" class="btn">{{ __('Accept invitation') }}</a>
        <div class="footer">
            {{ __('If you were not expecting this invitation you can safely ignore this email.') }}
        </div>
    </div>
</body>
</html>
