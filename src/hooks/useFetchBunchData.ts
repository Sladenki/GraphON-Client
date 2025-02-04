import { axiosAuth, axiosClassic } from "@/api/interceptors";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const useFetchBunchData = (serverRequest: string, initialPosts: any[], isLoggedIn: boolean) => {
  const [allPosts, setAllPosts] = useState<any[]>(initialPosts);
  const [isEndPosts, setIsEndPosts] = useState<boolean>(false);
  const [isPostsFetching, setIsPostsFetching] = useState<boolean>(false);
  const [error, setError] = useState<any | null>(null);

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const skipRef = useRef<number>(initialPosts.length); // Используем useRef, чтобы избежать лишних ререндеров

  // Мемоизируем выбор axiosInstance, чтобы он не пересоздавался при каждом ререндере
  const axiosInstance = useMemo(() => (isLoggedIn ? axiosAuth : axiosClassic), [isLoggedIn]);

  // Обернем fetchPosts в useCallback, чтобы не пересоздавать функцию при каждом ререндере
  const fetchPosts = useCallback(async () => {
    if (isPostsFetching || isEndPosts) return; // Не загружаем, если уже идет загрузка или достигли конца

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
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setIsPostsFetching(false);
    }
  }, [axiosInstance, serverRequest, isEndPosts, isPostsFetching]);

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

// export const useFetchBunchData = (serverRequest: string, initialPosts: any[], isLoggedIn: boolean) => {
//   const [allPosts, setAllPosts] = useState<any[]>(initialPosts);
//   const [skip, setSkip] = useState<number>(initialPosts.length);
//   const [isEndPosts, setIsEndPosts] = useState<boolean>(false);
//   const [isPostsFetching, setIsPostFetching] = useState<boolean>(false);
//   const [error, setError] = useState<any | null>(null);

//   const loaderRef = useRef(null);

//   const fetchPosts = async () => {
//     if (isPostsFetching || isEndPosts) return; // Останавливаем, если идет загрузка или достигли конца
//     setIsPostFetching(true);
//     setError(null);

//     try {
//       const axiosInstance = isLoggedIn ? axiosAuth : axiosClassic; // Выбор экземпляра axios
//       const res = await axiosInstance.get(`${serverRequest}?skip=${skip}`);
//       const data = res.data;

//       if (data.length === 0) {
//         setIsEndPosts(true);
//       } else {
//         setAllPosts((prevPosts) => [...prevPosts, ...data]);
//         setSkip((prevSkip) => prevSkip + data.length); // Обновляем skip на длину новых данных
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err);
//     } finally {
//       setIsPostFetching(false);
//     }
//   };

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting) fetchPosts(); // Вызываем fetchPosts при пересечении loaderRef
//       },
//       { root: null, rootMargin: "200px", threshold: 1.0 }
//     );

//     if (loaderRef.current) observer.observe(loaderRef.current);

//     return () => {
//       observer.disconnect();
//     };
//   }, [skip, isEndPosts]); // Добавляем зависимости

//   return { allPosts, isPostsFetching, isEndPosts, loaderRef, error  };
// };