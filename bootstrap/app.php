<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\DoctorMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\ForcePasswordChange::class, // Run this site-wide
        ]);

        // 2. Route Aliases (These map the strings in web.php to the actual classes)
        $middleware->alias([
            'nurse' => \App\Http\Middleware\NurseMiddleware::class,
            'doctor' => \App\Http\Middleware\DoctorMiddleware::class,
            'force.password.change' => \App\Http\Middleware\ForcePasswordChange::class,
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
