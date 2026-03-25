import { getCustomerFromSession } from "@/lib/customer-auth";
import { redirect } from "next/navigation";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await getCustomerFromSession();
  if (!customer) redirect("/login-cliente");

  return <>{children}</>;
}
