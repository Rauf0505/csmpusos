import { PortalShell } from "@/components/shared/PortalShell";
import { portalSidebarItems } from "@/components/shared/PortalSidebarConfigs";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell role="teacher" sidebarItems={portalSidebarItems.teacher} title="Faculty" badge="Professor" theme="light">
      {children}
    </PortalShell>
  );
}
