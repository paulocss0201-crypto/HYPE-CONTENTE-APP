import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav, MobileDrawer } from "./MobileNav";
import { MobileTopbar } from "./Topbar";

export function AppShell() {
  return (
    <div className="min-h-screen bg-ink-950">
      <Sidebar />
      <MobileDrawer />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <MobileTopbar />
        <main className="flex-1 pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
