<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use OwenIt\Auditing\Models\Audit;

class AuditController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'event' => ['nullable', 'string', 'max:255'],
            'auditable_type' => ['nullable', 'string', 'max:255'],
        ]);

        $audits = Audit::query()
            ->with('user')
            ->latest()
            ->when($filters['event'] ?? null, fn ($query, string $event) => $query->where('event', $event))
            ->when($filters['auditable_type'] ?? null, fn ($query, string $type) => $query->where('auditable_type', $type))
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('event', 'like', "%{$search}%")
                        ->orWhere('auditable_type', 'like', "%{$search}%")
                        ->orWhere('url', 'like', "%{$search}%")
                        ->orWhere('ip_address', 'like', "%{$search}%")
                        ->orWhere('old_values', 'like', "%{$search}%")
                        ->orWhere('new_values', 'like', "%{$search}%");
                });
            })
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Audit $audit) => [
                'id' => $audit->id,
                'event' => $audit->event,
                'user' => $audit->user?->full_name ?? 'System',
                'auditable_type' => $audit->auditable_type,
                'auditable_name' => class_basename($audit->auditable_type),
                'auditable_id' => $audit->auditable_id,
                'change_count' => max(count($audit->old_values ?? []), count($audit->new_values ?? [])),
                'url' => $audit->url,
                'ip_address' => $audit->ip_address,
                'user_agent' => $audit->user_agent,
                'tags' => $audit->tags,
                'created_at' => $audit->created_at?->toISOString(),
            ]);

        return Inertia::render('Audit/Index', [
            'audits' => $audits,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'event' => $filters['event'] ?? 'all',
                'auditable_type' => $filters['auditable_type'] ?? 'all',
            ],
            'events' => Audit::query()->select('event')->distinct()->orderBy('event')->pluck('event'),
            'auditableTypes' => Audit::query()->select('auditable_type')->distinct()->orderBy('auditable_type')->pluck('auditable_type'),
        ]);
    }

    public function show(Audit $audit): Response
    {
        $audit->load('user');

        return Inertia::render('Audit/Show', [
            'audit' => [
                'id' => $audit->id,
                'event' => $audit->event,
                'user' => $audit->user ? [
                    'id' => $audit->user->id,
                    'name' => $audit->user->full_name,
                    'email' => $audit->user->email,
                ] : null,
                'auditable' => [
                    'type' => $audit->auditable_type,
                    'name' => class_basename($audit->auditable_type),
                    'id' => $audit->auditable_id,
                ],
                'old_values' => $audit->old_values ?? [],
                'new_values' => $audit->new_values ?? [],
                'url' => $audit->url,
                'ip_address' => $audit->ip_address,
                'user_agent' => $audit->user_agent,
                'tags' => $audit->tags,
                'created_at' => $audit->created_at?->toISOString(),
                'updated_at' => $audit->updated_at?->toISOString(),
            ],
        ]);
    }
}
