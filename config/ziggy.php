<?php

return [
    'except' => [
        'debugbar.*',
        'sanctum.*',
        'storage.*',
        'horizon.*',
        'telescope.*',
    ],

    'groups' => [
        // Unauthenticated users
        'guest' => [
            'home',
            'unauthorized',
            'login',
            'password.*',
            'verification.*',
            'password.confirm',
            'logout',
        ],

        // Authenticated users without panel access
        'user' => [
            'home',
            'unauthorized',
            'logout',
            'verification.*',
            'password.confirm',
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
