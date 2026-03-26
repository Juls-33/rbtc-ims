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
        // 1. Keep only standard Inertia/Asset middleware here
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // 2. COMBINE ALL ALIASES INTO ONE BLOCK
        $middleware->alias([
            'nurse' => \App\Http\Middleware\NurseMiddleware::class,
            'doctor' => \App\Http\Middleware\DoctorMiddleware::class,
            'force.password.change' => \App\Http\Middleware\ForcePasswordChange::class,
            'checkStatus' => \App\Http\Middleware\CheckAccountStatus::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();