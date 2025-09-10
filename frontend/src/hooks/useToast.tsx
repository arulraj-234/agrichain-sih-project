import type { ReactNode } from "react";
import {
  toast as toastify,
  ToastContainer,

} from "react-toastify";
import type { ToastOptions, Id } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type ToastType = "success" | "error" | "info" | "warning" | "default" ;

interface ToastArgs extends ToastOptions {
  title?: ReactNode;
  description?: ReactNode;
  type?: ToastType;
}

export function toast({
  title,
  description,
  type = "default",
  ...options
}: ToastArgs): Id {
  const content = (
    <div>
      {title && <p className="font-semibold">{title}</p>}
      {description && <p className="text-sm opacity-80">{description}</p>}
    </div>
  );

  switch (type) {
    case "success":
      return toastify.success(content, options);
    case "error":
      return toastify.error(content, options);
    case "info":
      return toastify.info(content, options);
    case "warning":
      return toastify.warning(content, options);
    default:
      return toastify(content, options);
  }
}

export function useToast() {
  return {
    toast,
    dismiss: (id?: Id) => toastify.dismiss(id),
  };
}

export function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
    />
  );
}
