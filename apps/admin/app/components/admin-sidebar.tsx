import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '@einao/ui'
import {
  ChevronRight,
  Image,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  Mail,
  Newspaper,
  FileText,
  Plus,
  Settings,
  Users,
  Wrench,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation, useMatch } from 'react-router'
import { API_BASE_URL } from '../lib/api'

type NavItem = { title: string; to: string; end?: boolean; icon?: LucideIcon }
type NavGroup = {
  title: string
  icon: LucideIcon
  items: NavItem[]
}

const topNavBefore: NavItem[] = [
  { title: 'Overview', to: '/', end: true, icon: LayoutDashboard },
]

const insightsGroup: NavGroup = {
  title: 'Insights',
  icon: Newspaper,
  items: [
    { title: 'All Insights', to: '/posts' },
    { title: 'New Blog Post', to: '/posts/new?post_type=blog', icon: Plus },
    { title: 'Categories', to: '/categories' },
    { title: 'Tags', to: '/tags' },
  ],
}

const workGroup: NavGroup = {
  title: 'Work',
  icon: FileText,
  items: [
    { title: 'All Work', to: '/work' },
    { title: 'New Work', to: '/work?item=new', icon: Plus },
    { title: 'Industries (Categories)', to: '/industries' },
    { title: 'Tags', to: '/tags' },
  ],
}

const capabilitiesGroup: NavGroup = {
  title: 'Capabilities',
  icon: Wrench,
  items: [
    { title: 'All Capabilities', to: '/capabilities' },
    { title: 'New Capability', to: '/capabilities?item=new', icon: Plus },
  ],
}

const topNavAfter: NavItem[] = [
  { title: 'Solutions', to: '/solutions', icon: Wrench },

  { title: 'Media', to: '/media', icon: Image },
  { title: 'Team', to: '/team', icon: Users },
  { title: 'Contact', to: '/contact', icon: Mail },
  { title: 'Site Config', to: '/config', icon: Settings },
  { title: 'Page Settings', to: '/page-settings', icon: FileText },
]

function NavMenuItem({ item }: { item: NavItem }) {
  const match = useMatch({ path: item.to, end: item.end ?? false })
  const { isMobile, setOpenMobile } = useSidebar()
  const isActive = Boolean(match)
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
        <NavLink
          to={item.to}
          end={item.end}
          onClick={() => isMobile && setOpenMobile(false)}
          className={isActive ? '[&>span]:text-primary' : ''}
        >
          {item.icon && <item.icon className="size-4" />}
          <span className="font-medium">{item.title}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function CollapsibleNavGroup({ group }: { group: NavGroup }) {
  const location = useLocation()
  const isActive = group.items.some((item) => location.pathname.startsWith(item.to))
  const [open, setOpen] = useState(isActive)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={group.title}
        onClick={() => setOpen(!open)}
        isActive={isActive}
        className={isActive ? '[&>span]:text-primary' : ''}
      >
        <group.icon className="size-4" />
        <span className="font-medium">{group.title}</span>
        <ChevronRight
          className={`ml-auto size-4 transition-transform ${open ? 'rotate-90' : ''}`}
        />
      </SidebarMenuButton>
      {open && (
        <SidebarMenuSub>
          {group.items.map((item) => (
            <SubMenuItem key={item.to} item={item} />
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  )
}

function SubMenuItem({ item }: { item: NavItem }) {
  const match = useMatch({ path: item.to, end: item.end ?? false })
  const { isMobile, setOpenMobile } = useSidebar()
  const isActive = Boolean(match)
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={isActive}>
        <NavLink
          to={item.to}
          end={item.end}
          onClick={() => isMobile && setOpenMobile(false)}
          className={isActive ? 'text-primary' : ''}
        >
          {item.icon && <item.icon className="size-4" />}
          <span>{item.title}</span>
        </NavLink>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}

type User = { id: number; name: string; email: string; role: string } | null

export function AdminSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: User }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Einao Solutions">
              <NavLink to="/">
                <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg">
                  <img
                    src="/einao-logo.png"
                    alt="Einao Solutions"
                    className="size-full object-contain"
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                  <span className="font-medium">Einao Solutions</span>
                  <span className="text-xs">Admin Console</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {topNavBefore.map((item) => (
              <NavMenuItem key={item.to} item={item} />
            ))}
            <CollapsibleNavGroup group={insightsGroup} />
            <CollapsibleNavGroup group={workGroup} />
            <CollapsibleNavGroup group={capabilitiesGroup} />
            {topNavAfter.map((item) => (
              <NavMenuItem key={item.to} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                {user?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-sm font-medium">{user?.name ?? 'Unknown'}</span>
                <span className="truncate text-xs text-muted-foreground">{user?.email ?? ''}</span>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Log out"
              onClick={async () => {
                const logoutUrl = `${API_BASE_URL}/api/v1/auth/logout`
                await fetch(logoutUrl, {
                  method: 'POST',
                  credentials: 'include',
                })
                window.location.href = '/'
              }}
            >
              <LogOut className="size-4" />
              <span className="font-medium">Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

