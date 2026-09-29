import { Link, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Home, Dumbbell, History, BarChart3, Bot, User, LogOut } from 'lucide-react';
import { useAuth } from '../auth';
import SwitchButton from './kokonutui/switch-button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from './ui/sidebar';

const links = [
  { to: '/', label: 'Home', end: true, icon: Home },
  { to: '/log', label: 'Log Workout', icon: Dumbbell },
  { to: '/history', label: 'History', icon: History },
  { to: '/insights', label: 'Split', icon: BarChart3 },
  { to: '/coach', label: 'Coach', icon: Bot },
  { to: '/profile', label: 'Profile', icon: User },
];

function isLinkActive(pathname: string, to: string, end?: boolean) {
  if (end) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function Layout() {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="px-3 py-4">
          <Link className="px-2 text-lg font-extrabold tracking-tight" to="/">
            Gym Tracker
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {links.map((link) => (
                  <SidebarMenuItem key={link.to}>
                    <SidebarMenuButton
                      isActive={isLinkActive(location.pathname, link.to, link.end)}
                      render={<Link to={link.to} />}
                    >
                      <link.icon />
                      <span>{link.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="gap-2 px-3 py-3">
          <SwitchButton className="w-full justify-start" size="sm" />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={logout}>
                <LogOut />
                <span>Log out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center gap-2 border-b px-4 py-3 md:hidden">
          <SidebarTrigger />
          <span className="font-semibold">Gym Tracker</span>
        </header>
        <div className="mx-auto w-full max-w-6xl px-6 py-8 md:px-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
