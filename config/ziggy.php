<?php

return [
    'except' => [
        'debugbar.*',
        'sanctum.*',
        'storage.*',
        'horizon.*',
        'telescope.*',
        'cashier.*',
    ],

    'groups' => [
        // Unauthenticated users
        'guest' => [
            'home',
            'unauthorized',
            'login',
            'register',
            'password.*',
            'verification.*',
            'password.confirm',
            'logout',
            'invitation.*',
        ],

        // account_owner and team_member — admin panel users
        'tenant' => [
            'home',
            'unauthorized',
            'logout',
            'verification.*',
            'password.confirm',
            'subscription.*',
            'admin.*',
            'api.user',
        ],

        // super_admin — super-admin panel users
        'super_admin' => [
            'home',
            'unauthorized',
            'logout',
            'verification.*',
            'password.confirm',
            'super-admin.*',
            'api.user',
        ],
    ],
];
