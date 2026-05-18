import { PortalShell } from "@/components/shared/PortalShell";
import { portalSidebarItems } from "@/components/shared/PortalSidebarConfigs";

export default function DepartmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell role="department-head" sidebarItems={portalSidebarItems["department-head"]} title="Department" badge="Head of Dept" theme="light">
      {children}
    </PortalShell>
  );
}
