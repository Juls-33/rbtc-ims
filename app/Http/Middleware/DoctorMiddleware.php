<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DoctorMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
{
    // Check if the user is logged in and has the doctor role
    // Adjust 'role' to whatever column you use (e.g., is_doctor, type, etc.)
    if (auth()->check() && auth()->user()->role === 'Doctor') {
        return $next($request);
    }

    // Kick them back to login or home if they aren't a doctor
    return redirect('/')->with('error', 'Unauthorized access.');
}
}
