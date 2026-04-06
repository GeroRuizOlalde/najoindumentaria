"use client";

import { createContext, useContext, useState } from "react";

interface NotificationCounts {
  newOrders: number;
  pendingReviews: number;
}

interface NotificationContextValue extends NotificationCounts {
  setNewOrders: (count: number) => void;
  setPendingReviews: (count: number) => void;
  incrementNewOrders: (count: number) => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  newOrders: 0,
  pendingReviews: 0,
  setNewOrders: () => {},
  setPendingReviews: () => {},
  incrementNewOrders: () => {},
});

export function NotificationProvider({
  children,
  initialPendingReviews = 0,
}: {
  children: React.ReactNode;
  initialPendingReviews?: number;
}) {
  const [newOrders, setNewOrders] = useState(0);
  const [pendingReviews, setPendingReviews] = useState(initialPendingReviews);

  function incrementNewOrders(count: number) {
    setNewOrders((prev) => prev + count);
  }

  return (
    <NotificationContext.Provider
      value={{
        newOrders,
        pendingReviews,
        setNewOrders,
        setPendingReviews,
        incrementNewOrders,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
