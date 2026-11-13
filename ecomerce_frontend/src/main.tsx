import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { router } from "./router/router";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router}></RouterProvider>
        <Toaster
            position="top-right"
            containerStyle={{
                top: "var(--toast-top, 84px)",
                right: "max(16px, calc((100vw - 80rem) / 2 + 1.5rem))",
            }}
            toastOptions={{
                duration: 3000,
                style: {
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    fontWeight: 600,
                    fontSize: "13px",
                    color: "#0f172a",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
                },
                success: {
                    style: {
                        background: "#ffffff",
                        border: "1px solid #86efac",
                        color: "#065f46",
                    },
                    iconTheme: {
                        primary: "#10b981",
                        secondary: "#ffffff",
                    },
                },
            }}
        />
    </StrictMode>,
);
