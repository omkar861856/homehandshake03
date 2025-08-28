"use client";

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ToastType = "info" | "success" | "error" | "warning";
type ToastItem = { id: string; message: string; type: ToastType };
type ToastContextType = {
  addToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    const toast = { id, message, type };
    setToasts((t) => [toast, ...t]);
    // auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((t) => t.filter((tt) => tt.id !== id));
    }, 3000);
  }, []);

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "min(90vw, 520px)",
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              marginTop: 8,
              padding: "12px 14px",
              borderRadius: 8,
              minWidth: 280,
              maxWidth: 520,
              width: "100%",
              boxShadow: "0 2px 6px rgba(0,0,0,.15)",
              color: "#0f172a",
              backgroundColor:
                t.type === "success"
                  ? "#ecfdf5"
                  : t.type === "error"
                  ? "#fef2f2"
                  : t.type === "warning"
                  ? "#fffbeb"
                  : "#e6f4ff",
              border:
                t.type === "error"
                  ? "1px solid #fecaca"
                  : t.type === "success"
                  ? "1px solid #a7f3d0"
                  : "1px solid #bfdbfe",
              fontSize: 14,
              lineHeight: 1.4,
              pointerEvents: "auto",
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx.addToast;
};
