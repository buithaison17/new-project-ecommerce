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
            toastOptions={{
                duration: 3000,
                style: {
                    borderRadius: "16px",
                    border: "1px solid #bbf7d0",
                    fontWeight: 600,
                },
            }}
        />
    </StrictMode>,
);
