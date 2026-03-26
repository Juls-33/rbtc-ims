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
    if (auth()->check()) {
        $user = auth()->user();

        // --- THE FIX: ADD STATUS CHECK ---
        // Only force a password change if the account is ACTIVE.
        // If they are INACTIVE, we skip this and let CheckAccountStatus kick them out.
        if ($user->status === 'ACTIVE' && $user->must_change_password) {
            
            $exemptRoutes = [
                'password.force-change',
                'password.force-update',
                'logout',
            ];

            if (!$request->routeIs($exemptRoutes)) {
                return redirect()->route('password.force-change');
            }
        }
    }

    return $next($request);
}
}