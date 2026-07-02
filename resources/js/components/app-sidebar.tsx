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
import Logo from "../../images/logo.png";
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
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
  PersonStandingIcon, 
  ScrollText,
  Settings, 
  StoreIcon, 
  UserSquare2Icon, 
  UsersRoundIcon 
} from 'lucide-react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';
import { IconCashBanknote, IconMoneybag, IconMoneybagMove, IconTools } from '@tabler/icons-react';
import { permission } from 'process';

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
    permission: 'can view items'
  },
  {
    title: 'Roles',
    href: '/roles',
    icon: Settings,
    permission: 'can access roles',
  },
  {
    title: 'Audits',
    href: '/audits',
    icon: ScrollText,
    permission: 'can view audit logs',
  },
];

const salesNavItems: NavItem[] = [
  {
    title: 'Sales',
    href: '/sales',
    icon: ChartBar,
    permission: 'can view installment orders sales'
  },
  {
    title: 'POS Cash Orders',
    href: '/pos-cash-orders',
    icon: IconMoneybag,
    permission: 'can view cash orders'
  },
  {
    title: 'POS Cash Orders Sales',
    href: '/pos-cash-order-sales',
    icon: ChartArea,
        permission: 'can view cash orders sales'
  },
  {
    title: 'POS Credit Orders',
    href: '/pos-installment-orders',
    icon: CreditCardIcon,
     permission: 'can view installment orders'
  },
  {
    title: 'POS Credit Orders Sales',
    href: '/pos-installment-orders-sales',
    icon: ChartBar,
    permission: 'can view installment orders sales'
  },
  {
    title: "Bulk Payments",
    href: '/bulk-payments',
    icon: IconCashBanknote,
    permission: 'can access bulk payments'
  },
        {
    title: 'Expense Record',
    href: '/expense-record',
    icon: IconMoneybagMove,
        permission: 'can view expense records'
  },
];

const peopleNavItem: NavItem[] = [
      {
    title: 'Users',
    href: '/users',
    icon: PersonStandingIcon,
        permission: 'can view users'
  },
    {
    title: 'Employees',
    href: '/employees',
    icon: UserSquare2Icon,
        permission: 'can view employees'
  },
      {
    title: 'Customers',
    href: '/customers',
    icon: UsersRoundIcon,
        permission: 'can view customers'
  },
];

const referencesNavItems: NavItem[] = [
    {
        title: 'Locations',
        href: '/locations',
        icon: Map,
        permission: 'can manage locations',
    },
    {
        title: 'Suppliers',
        href: '/suppliers',
        icon: Factory,
        permission: 'can manage suppliers',
    },
    {
        title: 'Branches',
        href: '/branches',
        icon: StoreIcon,
        permission: 'can manage branches',
    },
];

const footerNavItems: NavItem[] = [
  {
    title: 'POS System (CASH)',
    href: '/pos-cash',
    icon: DollarSign,
        permission: 'can access cash pos'
  },
  {
    title: 'POS System (CREDIT)',
    href: '/pos-credit',
    icon: CreditCard,
        permission: 'can access credit pos'
  },
];

export function AppSidebar() {
   const {auth} = usePage().props as any;
   const filterByPermission = (items: (NavItem & { permission?: string })[]) => {
  return items.filter(item => 
      !item.permission || auth.permissions?.includes(item.permission) || auth.roles?.includes('super admin')
    );
  };
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href='/dashboard' prefetch>
                <img src={Logo} alt="logo" className='size-10'/>
                <h1 className="font-bold text-lg">RJL Home Depot</h1>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
           <SidebarContent>
        <NavMain items={filterByPermission(mainNavItems)} label="Platform" />
        <NavMain items={filterByPermission(salesNavItems)} label="Sales" />
        <NavMain items={filterByPermission(peopleNavItem)} label="People" />
        <NavMain items={filterByPermission(referencesNavItems)} label="References" />
      </SidebarContent>
      <SidebarFooter>
        <NavFooter items={filterByPermission(footerNavItems)} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
