"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  Building2,
  CheckSquare,
  FileText,
  Globe,
  LayoutDashboard,
  Lightbulb,
  Menu,
  Settings,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, enabled: true, exact: true },
  { href: "/clients", label: "Clients", icon: Building2, enabled: true },
  { href: "/websites", label: "Websites", icon: Globe, enabled: true },
  { href: "/agents/test", label: "Agent test", icon: Bot, enabled: true },
  { href: "/recommendations", label: "Recommendations", icon: Lightbulb, enabled: false },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, enabled: false },
  { href: "/pages", label: "Pages", icon: StickyNote, enabled: true },
  { href: "/reports", label: "Reports", icon: FileText, enabled: false },
  { href: "/settings", label: "Settings", icon: Settings, enabled: false },
] as const;

function isNavActive(pathname: string, href: string, exact?: boolean) {
  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = isNavActive(pathname, item.href, "exact" in item ? item.exact : false);

        if (!item.enabled) {
          return (
            <span
              key={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/60"
              title="Coming in a future phase"
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppSidebar() {
  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar md:flex md:flex-col">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <BarChart3 className="size-5" />
          <span className="font-semibold">SEO Ops Console</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </div>
      </aside>

      <div className="flex items-center border-b px-4 py-3 md:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" aria-label="Open navigation">
                <Menu className="size-4" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="border-b px-4 py-4">
              <SheetTitle className="flex items-center gap-2">
                <BarChart3 className="size-5" />
                SEO Ops Console
              </SheetTitle>
            </SheetHeader>
            <div className="p-3">
              <NavLinks />
            </div>
          </SheetContent>
        </Sheet>
        <span className="ml-3 font-semibold">SEO Ops Console</span>
      </div>
    </>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AppSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}

export function DashboardHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="flex-1 p-4 sm:p-6">{children}</main>;
}
