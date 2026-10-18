import { notFound } from "next/navigation";
import { EmployerDashboard } from "@/components/employer/dashboard";
import { EmployerAccreditation } from "@/components/employer/accreditation";
import { CompanyProfile } from "@/components/employer/company-profile";
import { NotificationsPage } from "@/components/dashboard/notifications-page";
import { AccountSettings } from "@/components/dashboard/account-settings";

export default async function EmployerSection({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  switch (section) {
    case "dashboard":
      return <EmployerDashboard />;
    case "accreditation":
      return <EmployerAccreditation />;
    case "profile":
      return <CompanyProfile />;
    case "notifications":
      return <NotificationsPage />;
    case "settings":
      return <AccountSettings />;
    default:
      notFound();
  }
}
