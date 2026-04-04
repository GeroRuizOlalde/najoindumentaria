import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ListToolbarProps {
  search?: string;
  placeholder: string;
  resetHref: string;
  hiddenFields?: Record<string, string | undefined>;
  children?: React.ReactNode;
}

export function ListToolbar({
  search,
  placeholder,
  resetHref,
  hiddenFields = {},
  children,
}: ListToolbarProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <form method="GET" className="flex flex-1 flex-col gap-3 sm:flex-row">
        {Object.entries(hiddenFields).map(([key, value]) =>
          value ? <input key={key} type="hidden" name={key} value={value} /> : null
        )}
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder={placeholder}
          className="h-10 w-full border border-border bg-white px-4 text-sm text-black placeholder:text-gray-light focus:border-black focus:outline-none"
        />
        <div className="flex gap-2">
          <Button type="submit" variant="primary">
            Buscar
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={resetHref}>Limpiar</Link>
          </Button>
        </div>
      </form>
      {children}
    </div>
  );
}
