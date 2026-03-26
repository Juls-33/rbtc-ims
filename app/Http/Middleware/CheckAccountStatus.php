<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckAccountStatus
{
    public function handle(Request $request, Closure $next)
{
    if (auth()->check()) {
        if (auth()->user()->status === 'INACTIVE') {
            auth()->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => 'This account is deactivated. Please contact the administrator.',
            ]);
        }
    }
    return $next($request);
}
}