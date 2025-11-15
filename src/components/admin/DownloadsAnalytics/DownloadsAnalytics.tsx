"use client";

import { useQuery } from "@tanstack/react-query";
import { DownloadsService } from "@/services/downloads.service";
import styles from "./DownloadsAnalytics.module.scss";
import { Activity } from "lucide-react";

export function DownloadsAnalytics() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["downloads", "count", "admin"],
    queryFn: async () => {
      const { data } = await DownloadsService.getTotalDownloads();
      return data.count;
    },
    refetchInterval: 60000,
  });

  return (
    <div className={styles.card}>
      <div className={styles.icon}>
        <Activity size={22} />
      </div>
      <div className={styles.content}>
        <p className={styles.label}>Аналитика скачиваний</p>
        {isError ? (
          <p className={styles.error}>Не удалось загрузить данные</p>
        ) : (
          <p className={styles.value}>
            {isLoading || typeof data !== "number" ? "—" : data.toLocaleString("ru-RU")}
          </p>
        )}
      </div>
    </div>
  );
}

