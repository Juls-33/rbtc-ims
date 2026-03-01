<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForcePasswordChange
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Check if user is logged in
        if (auth()->check()) {
            $user = auth()->user();

            // Check the flag
            if ($user->must_change_password) {
                
                // Define routes that are EXEMPT from the trap
                $exemptRoutes = [
                    'password.force-change',
                    'password.force-update',
                    'logout',
                ];

                // If NOT on an exempt route, force redirect
                if (!$request->routeIs($exemptRoutes)) {
                    return redirect()->route('password.force-change');
                }
            }
        }

        return $next($request);
    }
}