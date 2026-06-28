import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, type PropsWithChildren } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const page = usePage();
    const { auth } = page.props as {
        auth?: {
            permissions?: string[];
            roles?: string[];
        };
    };
    const { url } = page;

    useEffect(() => {
        window.rjlAuth = auth;
    }, [auth]);

    const resolvedBreadcrumbs =
        breadcrumbs.length > 0 ? breadcrumbs : breadcrumbsFromUrl(url);

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={resolvedBreadcrumbs} />
                <div className="space-y-5 p-5">{children}</div>
            </AppContent>
        </AppShell>
    );
}

function breadcrumbsFromUrl(url: string): BreadcrumbItem[] {
    const pathname = url.split('?')[0] || '/';
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length === 0) {
        return [{ title: 'Dashboard', href: '/dashboard' }];
    }

    return segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;

        return {
            title: titleFromSegment(segment),
            href,
        };
    });
}

function titleFromSegment(segment: string): string {
    if (/^\d+$/.test(segment)) {
        return `#${segment}`;
    }

    return segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
