import { toast } from "sonner";

export const notifySuccess = (title: string, description?: string) =>
  toast.success(title, {
    description,
    style: {
      backgroundColor: "#e3f6e3", // мягкий зелёный
      color: "#1b4332",
    },
  });

export const notifyInfo = (title: string, description?: string) =>
  toast.info(title, {
    description,
    style: {
      backgroundColor: "#e9f0fa", // мягкий голубой
      color: "#1d3557",
    },
  });
