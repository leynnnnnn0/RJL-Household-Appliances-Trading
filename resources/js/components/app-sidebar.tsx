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
import { 
  BookOpen, 
  ChartArea, 
  ChartBar, 
  CreditCard, 
  CreditCardIcon, 
  DollarSign, 
  Factory, 
  Folder, 
  LayoutGrid, 
  List, 
  Map, 
  UsersRoundIcon 
} from 'lucide-react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';
import { IconMoneybag, IconTools } from '@tabler/icons-react';

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
    title: 'Customers',
    href: '/customers',
    icon: UsersRoundIcon,
  },
];

const salesNavItems: NavItem[] = [
  {
    title: 'POS Cash Orders',
    href: '/pos-cash-orders',
    icon: IconMoneybag,
  },
  {
    title: 'POS Cash Orders Sales',
    href: '/pos-cash-order-sales',
    icon: ChartArea,
  },
  {
    title: 'POS Installment Orders',
    href: '/pos-installment-orders',
    icon: CreditCardIcon,
  },
  {
    title: 'POS Credit Orders Sales',
    href: '/pos-installment-orders-sales',
    icon: ChartBar,
  },
];

const referencesNavItems: NavItem[] = [
  {
    title: 'Locations',
    href: '/locations',
    icon: Map,
  },
  {
    title: 'Suppliers',
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
        <NavMain items={mainNavItems} label="Platform" />
        <NavMain items={salesNavItems} label="Sales" />
        <NavMain items={referencesNavItems} label="References" />
      </SidebarContent>
      <SidebarFooter>
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}