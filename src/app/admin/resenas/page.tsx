import Link from "next/link";
import { MessageSquareQuote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { ReviewStatusActions } from "@/components/admin/review-status-actions";
import {
  hasAdminPermission,
  requireAdminPermission,
} from "@/lib/admin-permissions";
import { getReviews } from "@/lib/queries/reviews";
import type { ReviewStatus } from "@/generated/prisma/client";
import { formatDateAR } from "@/lib/utils";

const STATUS_STYLES: Record<ReviewStatus, "warning" | "success" | "error"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
};

interface Props {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function ReviewsPage({ searchParams }: Props) {
  const session = await requireAdminPermission("reviews.view");
  const canManage = hasAdminPermission(session.user.role, "reviews.manage");
  const params = await searchParams;

  const status = params.status as ReviewStatus | undefined;

  const { reviews, total, totalPages, currentPage } = await getReviews({
    page: parseInt(params.page || "1"),
    search: params.search,
    status,
  });

  const buildUrl = (page: number) => {
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.status) qs.set("status", params.status);
    if (page > 1) qs.set("page", String(page));
    const query = qs.toString();
    return query ? `/admin/resenas?${query}` : "/admin/resenas";
  };

  return (
    <>
      <PageHeader title="Resenas" description={`${total} resenas registradas`} />

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {[
          { value: "", label: "Todas" },
          { value: "PENDING", label: "Pendientes" },
          { value: "APPROVED", label: "Aprobadas" },
          { value: "REJECTED", label: "Rechazadas" },
        ].map((tab) => {
          const active = (params.status || "") === tab.value;
          const href = tab.value ? `/admin/resenas?status=${tab.value}` : "/admin/resenas";

          return (
            <Link
              key={tab.label}
              href={href}
              className={`inline-flex h-10 items-center justify-center border px-4 text-xs uppercase tracking-wider transition-colors ${
                active
                  ? "border-black bg-black text-white"
                  : "border-border bg-white text-gray-text hover:text-black"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <ListToolbar
        search={params.search}
        placeholder="Buscar por cliente, producto o texto"
        resetHref={params.status ? `/admin/resenas?status=${params.status}` : "/admin/resenas"}
        hiddenFields={{ status: params.status }}
      />

      {reviews.length === 0 ? (
        <EmptyState
          icon={<MessageSquareQuote className="h-12 w-12" />}
          title="Sin resenas"
          description="Las reseñas de clientes apareceran aca para su moderacion."
        />
      ) : (
        <>
          <div className="border border-border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Puntaje</TableHead>
                  <TableHead>Contenido</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div>
                        <Link
                          href={`/producto/${review.product.slug}`}
                          className="font-medium hover:underline"
                        >
                          {review.product.name}
                        </Link>
                        <p className="text-xs text-gray-text">
                          {review.product.brand.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{review.customer.name}</p>
                        <p className="text-xs text-gray-text">
                          {review.customer.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{review.rating}/5</TableCell>
                    <TableCell className="max-w-sm">
                      <p className="text-sm font-medium">{review.title || "Sin titulo"}</p>
                      <p className="line-clamp-2 text-xs text-gray-text">
                        {review.content}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_STYLES[review.status]}>
                        {review.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-text">
                      {formatDateAR(review.createdAt, "dd/MM/yy")}
                    </TableCell>
                    <TableCell>
                      {canManage ? (
                        <ReviewStatusActions
                          reviewId={review.id}
                          status={review.status}
                        />
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              buildUrl={buildUrl}
            />
          </div>
        </>
      )}
    </>
  );
}
