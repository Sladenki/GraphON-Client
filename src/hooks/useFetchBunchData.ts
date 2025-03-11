import { axiosAuth, axiosClassic } from "@/api/interceptors";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const useFetchBunchData = (serverRequest: string, initialPosts: any[], isLoggedIn: any) => {
  const [allPosts, setAllPosts] = useState<any[]>(initialPosts);
  const [isEndPosts, setIsEndPosts] = useState<boolean>(false);
  const [isPostsFetching, setIsPostsFetching] = useState<boolean>(false);
  const [error, setError] = useState<any | null>(null);
  const [retryCount, setRetryCount] = useState(0); // Количество попыток запроса

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const skipRef = useRef<number>(initialPosts.length); // Используем useRef, чтобы избежать лишних ререндеров
  const MAX_RETRIES = 3; // Максимальное количество повторных попыток

  // Мемоизируем выбор axiosInstance, чтобы он не пересоздавался при каждом ререндере
  const axiosInstance = useMemo(() => (isLoggedIn ? axiosAuth : axiosClassic), [isLoggedIn]);

  // Обернем fetchPosts в useCallback, чтобы не пересоздавать функцию при каждом ререндере
  const fetchPosts = useCallback(async () => {
    if (isPostsFetching || isEndPosts || retryCount >= MAX_RETRIES) return; // Не загружаем, если уже идет загрузка или достигли конца

    setIsPostsFetching(true);
    setError(null);

    try {
      const res = await axiosInstance.get(`${serverRequest}?skip=${skipRef.current}`);
      const data = res.data;

      if (data.length === 0) {
        setIsEndPosts(true);
      } else {
        setAllPosts((prevPosts) => [...prevPosts, ...data]);
        skipRef.current += data.length; // Обновляем skip через useRef (без ререндера)
      }
    } catch (err: any) {
      console.error("Ошибка при загрузке:", err);
      
      if (err.response?.status === 404) {
        setIsEndPosts(true); // Если 404 — останавливаем загрузку
      } else {
        setRetryCount((prev) => prev + 1); // Увеличиваем счетчик повторов
      }

      setError(err);
    } finally {
      setIsPostsFetching(false);
    }
  }, [axiosInstance, serverRequest, isEndPosts, isPostsFetching, retryCount]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchPosts(); // Загружаем новые посты при пересечении
      },
      { root: null, rootMargin: "200px", threshold: 1.0 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [fetchPosts]); // Теперь useEffect зависит только от fetchPosts

  return { allPosts, isPostsFetching, isEndPosts, loaderRef, error };
};
