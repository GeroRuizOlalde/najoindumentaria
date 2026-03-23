"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  buildUrl?: (page: number) => string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  buildUrl,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  const baseClass =
    "inline-flex h-9 w-9 items-center justify-center text-sm transition-colors";

  function PageItem({ page }: { page: number }) {
    const active = currentPage === page;
    const cls = cn(
      baseClass,
      active ? "bg-black text-white" : "text-gray-text hover:text-black"
    );

    if (buildUrl) {
      return (
        <Link href={buildUrl(page)} className={cls}>
          {page}
        </Link>
      );
    }
    return (
      <button type="button" onClick={() => onPageChange?.(page)} className={cls}>
        {page}
      </button>
    );
  }

  function NavButton({
    page,
    disabled,
    children,
  }: {
    page: number;
    disabled: boolean;
    children: React.ReactNode;
  }) {
    const cls =
      "inline-flex h-9 w-9 items-center justify-center text-gray-text transition-colors hover:text-black disabled:opacity-30";

    if (buildUrl && !disabled) {
      return (
        <Link href={buildUrl(page)} className={cls}>
          {children}
        </Link>
      );
    }
    return (
      <button
        type="button"
        onClick={() => onPageChange?.(page)}
        disabled={disabled}
        className={cls}
      >
        {children}
      </button>
    );
  }

  return (
    <nav className={cn("flex items-center justify-center gap-1", className)}>
      <NavButton page={currentPage - 1} disabled={currentPage === 1}>
        <ChevronLeft className="h-4 w-4" />
      </NavButton>

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-sm text-gray-text">
            ...
          </span>
        ) : (
          <PageItem key={page} page={page} />
        )
      )}

      <NavButton page={currentPage + 1} disabled={currentPage === totalPages}>
        <ChevronRight className="h-4 w-4" />
      </NavButton>
    </nav>
  );
}
