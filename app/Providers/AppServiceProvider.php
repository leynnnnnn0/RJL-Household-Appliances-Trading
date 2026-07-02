<?php

namespace App\Providers;

use App\Models\User;
use App\Services\Audits\AuditLogger;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::before(fn (User $user) => $user->hasRole('super admin') ? true : null);

        Event::listen(Login::class, function (Login $event) {
            if ($event->user instanceof User) {
                app(AuditLogger::class)->logAuthEvent('login', $event->user);
            }
        });

        Event::listen(Logout::class, function (Logout $event) {
            if ($event->user instanceof User) {
                app(AuditLogger::class)->logAuthEvent('logout', $event->user);
            }
        });
    }
}
