import { notFound } from "next/navigation";
import { AdminDashboard } from "@/components/admin/dashboard";
import { AdminAccreditations } from "@/components/admin/accreditation";
import { UserManagement } from "@/components/admin/users";
import { VacancyOversight } from "@/components/admin/vacancies";
import { ApplicationMonitoring } from "@/components/admin/monitoring";
import { LaborMarketReports } from "@/components/admin/reports";
import { AnnouncementManagement } from "@/components/admin/announcements";
import { AuditLogPage } from "@/components/admin/audit-log";
import { NotificationsPage } from "@/components/dashboard/notifications-page";
import { AccountSettings } from "@/components/dashboard/account-settings";

export default async function AdminSection({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  switch (section) {
    case "dashboard":
      return <AdminDashboard />;
    case "accreditation":
      return <AdminAccreditations />;
    case "users":
      return <UserManagement />;
    case "jobs":
      return <VacancyOversight />;
    case "applications":
      return <ApplicationMonitoring />;
    case "reports":
      return <LaborMarketReports />;
    case "announcements":
      return <AnnouncementManagement />;
    case "audit":
      return <AuditLogPage />;
    case "notifications":
      return <NotificationsPage />;
    case "settings":
      return <AccountSettings />;
    default:
      notFound();
  }
}
