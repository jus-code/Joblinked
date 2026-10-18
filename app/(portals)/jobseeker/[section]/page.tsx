import { notFound } from "next/navigation";
import { JobSeekerDashboard } from "@/components/jobseeker/dashboard";
import { JobSeekerProfile } from "@/components/jobseeker/profile";
import { ResumeManagement } from "@/components/jobseeker/resumes";
import { JobSeekerOpportunities } from "@/components/jobseeker/opportunities";
import { NotificationsPage } from "@/components/dashboard/notifications-page";
import { AccountSettings } from "@/components/dashboard/account-settings";

export default async function JobSeekerSection({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  switch (section) {
    case "dashboard":
      return <JobSeekerDashboard />;
    case "profile":
      return <JobSeekerProfile />;
    case "resumes":
      return <ResumeManagement />;
    case "recommended":
      return <JobSeekerOpportunities />;
    case "saved":
      return <JobSeekerOpportunities saved />;
    case "notifications":
      return <NotificationsPage />;
    case "settings":
      return <AccountSettings />;
    default:
      notFound();
  }
}
