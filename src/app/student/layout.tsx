import { PageShell } from "@/components/shared/PageShell";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageShell>{children}</PageShell>;
}
