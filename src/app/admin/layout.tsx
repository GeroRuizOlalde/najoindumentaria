import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/admin/sidebar";
import { NotificationListener } from "@/components/admin/notification-listener";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-off-white">
      <Sidebar
        userName={session.user.name || "Admin"}
        userRole={session.user.role || "ADMIN"}
      />
      <main className="lg:pl-60">
        <div className="px-6 py-8 lg:px-10 lg:py-10 max-w-7xl">
          {children}
        </div>
      </main>
      <NotificationListener />
    </div>
  );
}
