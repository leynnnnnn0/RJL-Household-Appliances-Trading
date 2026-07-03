<?php

namespace App\Services\Audits;

use App\Models\User;
use Illuminate\Http\Request;
use OwenIt\Auditing\Models\Audit;

class AuditLogger
{
    public function logAuthEvent(string $event, User $user, ?Request $request = null): void
    {
        $request ??= request();

        Audit::create([
            'user_type' => User::class,
            'user_id' => $user->id,
            'event' => $event,
            'auditable_type' => User::class,
            'auditable_id' => $user->id,
            'old_values' => [],
            'new_values' => [
                'user' => $user->full_name,
                'email' => $user->email,
                'event' => $event,
            ],
            'url' => $request->fullUrl(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'tags' => 'authentication',
        ]);
    }

    public function logFailedLogin(?User $user, array $credentials, ?Request $request = null): void
    {
        $request ??= request();

        Audit::create([
            'user_type' => $user ? User::class : null,
            'user_id' => $user?->id,
            'event' => 'failed_login',
            'auditable_type' => User::class,
            'auditable_id' => $user?->id ?? 0,
            'old_values' => [],
            'new_values' => [
                'email' => $credentials['email'] ?? null,
                'user_found' => (bool) $user,
                'event' => 'failed_login',
            ],
            'url' => $request->fullUrl(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'tags' => 'authentication',
        ]);
    }
}
