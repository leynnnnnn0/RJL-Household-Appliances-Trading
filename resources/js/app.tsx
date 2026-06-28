import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from '@/components/ui/sonner';
import { initializeTheme } from './hooks/use-appearance';

const appName = 'JDL';

type AuthPermissions = {
    permissions?: string[];
    roles?: string[];
};

declare global {
    interface Window {
        can: (permission: string) => boolean;
        rjlAuth?: AuthPermissions;
    }
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        window.rjlAuth = (props.initialPage.props as { auth?: AuthPermissions }).auth;

        const can = (permission: string) => {
            const auth = window.rjlAuth;

            return (
                auth?.roles?.includes('super admin') ||
                auth?.permissions?.includes(permission) ||
                false
            );
        };

        window.can = can;

        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
                <Toaster position="top-right" />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
