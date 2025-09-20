"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { GraphService } from "@/services/graph.service";
import { EventService } from "@/services/event.service";
import { SpinnerLoader } from "@/components/global/SpinnerLoader/SpinnerLoader";
import VirtualizedEventsList from "@/app/(main)/(page)/EventsList/VirtualizedEventsList";
import { EventItem } from "@/types/schedule.interface";
import styles from "./page.module.scss";
import Image from "next/image";

export default function GraphPage() {
  const params = useParams();
  const graphId = String(params?.id || "");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["graphById", graphId],
    queryFn: () => GraphService.getGraphById(graphId),
    enabled: Boolean(graphId),
    staleTime: 60_000,
  });

  const { data: eventsResp, isLoading: loadingEvents, refetch: refetchEvents } = useQuery({
    queryKey: ["eventsByGraphPublic", graphId],
    queryFn: () => EventService.getEventsByGraphId(graphId),
    enabled: Boolean(graphId),
    staleTime: 30_000,
  });

  if (!graphId) return null;
  if (isLoading) return <SpinnerLoader />;
  if (isError || !data) return (
    <div className={styles.errorWrapper}>
      <p>Ошибка загрузки</p>
      <button onClick={() => refetch()} className={styles.retry}>Повторить</button>
    </div>
  );

  const BASE_S3_URL = process.env.NEXT_PUBLIC_S3_URL;
  const fullImageUrl = data?.imgPath ? `${BASE_S3_URL}/${data.imgPath}` : "/noImage.png";

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.hero}>
        <div className={styles.heroMedia}>
          <Image src={fullImageUrl} alt={data.name} fill className={styles.heroImage} />
          <div className={styles.heroOverlay} />
        </div>
        <div className={styles.heroContent}>
          <div className={styles.badges}>
            <span className={styles.badge}>Подписчики: {data.subsNum}</span>
            {data.parentGraphId?.name && (
              <span className={styles.badge}>Категория: {data.parentGraphId.name}</span>
            )}
          </div>
          <h1 className={styles.title}>{data.name}</h1>
          {data.directorName && (
            <div className={styles.director}>Руководитель: {data.directorName}</div>
          )}
        </div>
      </header>

      {data.about && (
        <section className={styles.aboutSection}>
          <h2 className={styles.sectionTitle}>О сообществе</h2>
          <p className={styles.about}>{data.about}</p>
        </section>
      )}

      <section className={styles.eventsSection}>
        <h2 className={styles.sectionTitle}>Мероприятия</h2>
        {loadingEvents ? (
          <SpinnerLoader />
        ) : Array.isArray(eventsResp?.data) && eventsResp.data.length > 0 ? (
          <VirtualizedEventsList
            events={eventsResp.data as unknown as EventItem[]}
            onDelete={() => { refetchEvents(); }}
            itemHeight={420}
            containerHeight={typeof window !== 'undefined' ? window.innerHeight - 200 : 600}
          />
        ) : (
          <div className={styles.empty}>Нет мероприятий</div>
        )}
      </section>
    </div>
  );
}


