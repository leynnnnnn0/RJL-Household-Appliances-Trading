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
}
