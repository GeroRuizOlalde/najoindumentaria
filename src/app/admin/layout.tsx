import { Sidebar } from "@/components/admin/sidebar";
import { NotificationListener } from "@/components/admin/notification-listener";
import { NotificationProvider } from "@/components/admin/notification-context";
import { requireAdminPermission } from "@/lib/admin-permissions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminPermission("dashboard.view");

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-off-white">
        <Sidebar
          userName={session.user.name || "Admin"}
          userRole={session.user.role || "ADMIN"}
        />
        <main className="lg:pl-60">
          <div className="px-6 pt-16 pb-8 lg:px-10 lg:py-10 max-w-7xl">
            {children}
          </div>
        </main>
        <NotificationListener />
      </div>
    </NotificationProvider>
  );
}
