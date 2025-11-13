import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { Toaster } from "@/components/ui/sonner"

const appName = "JDL";

declare global {
    interface Window {
        can: (permission: string) => boolean;
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
        // Set up the can function here where we have access to props
        const can = (permission: string) => {
            const auth = (props.initialPage.props as any).auth;
            return auth.permissions?.includes(permission) || false;
        };
        
        window.can = can;

        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
                <Toaster position='top-right'/>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();