"use client";

import { useEffect, useRef, useCallback } from "react";
import { Toaster, toast } from "sonner";
import { formatPriceFromDecimal } from "@/lib/utils";
import { useNotifications } from "./notification-context";

const POLL_INTERVAL = 30_000; // 30 seconds

interface NotificationOrder {
  id: string;
  orderCode: string;
  amount: string;
  customer: { name: string };
  product?: { name: string } | null;
  items?: { product?: { name: string } | null }[];
}

export function NotificationListener() {
  const lastCheckedRef = useRef(new Date().toISOString());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { incrementNewOrders, setPendingReviews } = useNotifications();

  const playSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/notification.wav");
        audioRef.current.volume = 0.7;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {}
  }, []);

  useEffect(() => {
    // Carga inicial: obtener conteos sin `since`
    fetch(`/api/admin/notifications?since=${encodeURIComponent(lastCheckedRef.current)}`)
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.pendingReviews === "number") {
          setPendingReviews(data.pendingReviews);
        }
        if (data.timestamp) lastCheckedRef.current = data.timestamp;
      })
      .catch(() => {});
  }, [setPendingReviews]);

  useEffect(() => {
    const checkForNewOrders = async () => {
      try {
        const res = await fetch(
          `/api/admin/notifications?since=${encodeURIComponent(lastCheckedRef.current)}`
        );
        if (!res.ok) return;

        const data = await res.json();

        if (data.orders && data.orders.length > 0) {
          playSound();
          incrementNewOrders(data.orders.length);

          data.orders.forEach((order: NotificationOrder) => {
            toast.success(`Nuevo pedido ${order.orderCode}`, {
              description: `${order.customer.name} — ${order.product?.name || order.items?.[0]?.product?.name || "Pedido"} — ${formatPriceFromDecimal(Number(order.amount))}`,
              action: {
                label: "Ver pedido",
                onClick: () => {
                  window.location.href = `/admin/pedidos/${order.id}`;
                },
              },
              duration: 10_000,
            });
          });
        }

        if (typeof data.pendingReviews === "number") {
          setPendingReviews(data.pendingReviews);
        }

        if (data.timestamp) {
          lastCheckedRef.current = data.timestamp;
        }
      } catch {}
    };

    const interval = setInterval(checkForNewOrders, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [playSound, incrementNewOrders, setPendingReviews]);

  return (
    <Toaster
      position="top-right"
      richColors
      toastOptions={{
        style: { fontFamily: "inherit" },
      }}
    />
  );
}
