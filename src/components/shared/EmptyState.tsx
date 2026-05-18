import { Inbox } from "lucide-react";

export function EmptyState({
  icon,
  title,
  desc,
}: {
  icon?: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mb-4 text-muted-foreground">
        {icon || <Inbox size={24} />}
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-[280px]">{desc}</p>
    </div>
  );
}
