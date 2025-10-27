import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, CreditCard, DollarSign, Factory, Folder, LayoutGrid, List, Map } from 'lucide-react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';
import { IconTools } from '@tabler/icons-react';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
      {
        title: 'Items',
        href: '/items',
        icon: IconTools,
    },
       {
        title: 'Locations',
        href: '/locations',
        icon: Map,
    },
       {
        title: 'Supplier',
        href: '/suppliers',
        icon: Factory,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'POS System (CASH)',
        href: '/pos-cash',
        icon: DollarSign,
    },
    {
        title: 'POS System (CREDIT)',
        href: '/pos-credit',
        icon: CreditCard,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <h1 className='font-bold text-2xl'>RJL Home Depot</h1>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
