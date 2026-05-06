import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, Activity, Puzzle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Repositories", url: "/", icon: LayoutGrid, exact: true },
  { title: "Agent Runs", url: "/agent-runs", icon: Activity },
  { title: "Integrations", url: "/integrations", icon: Puzzle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex items-center gap-2.5 px-3 py-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-primary/25 bg-primary/8">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
              <polyline
                points="2,4.5 6.5,7.5 2,10.5"
                stroke="#7C3AED"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="8.5" y1="10.5" x2="13" y2="10.5"
                stroke="#7C3AED"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight text-foreground">Agent Hub</div>
              <div className="text-[11px] text-text-muted">Developer Portal</div>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-widest text-text-muted">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url, item.exact)}
                    tooltip={item.title}
                    className="gap-2.5"
                  >
                    <Link to={item.url} className="flex items-center gap-2.5">
                      <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                      {!collapsed && (
                        <span className="text-[13px] font-medium">{item.title}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
