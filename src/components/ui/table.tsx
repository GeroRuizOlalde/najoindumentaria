import { cn } from "@/lib/utils";

export function Table({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn("w-full text-sm", className)}>{children}</table>
    </div>
  );
}

export function TableHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <thead className={cn("border-b border-border", className)}>{children}</thead>;
}

export function TableBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <tbody className={cn(className)}>{children}</tbody>;
}

export function TableRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={cn(
        "border-b border-border transition-colors hover:bg-off-white/50",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-text",
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-4 py-3 text-sm", className)}>{children}</td>
  );
}
