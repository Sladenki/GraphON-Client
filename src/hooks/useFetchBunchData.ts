import { axiosAuth, axiosClassic } from "@/api/interceptors";
import { useAuth } from "@/providers/AuthProvider";
import { useCallback, useEffect, useRef, useState } from "react";

export const useFetchBunchData = (serverRequest: string, initialPosts: any[], isLoggedIn: boolean) => {
  // console.log('isLoggedIn', isLoggedIn)
  const [allPosts, setAllPosts] = useState<any[]>(initialPosts);
  const [skip, setSkip] = useState<number>(initialPosts.length);
  const [isEndPosts, setIsEndPosts] = useState<boolean>(false);
  const [isPostsFetching, setIsPostFetching] = useState<boolean>(false);
  const [error, setError] = useState<any | null>(null);

  const loaderRef = useRef(null);

  const fetchPosts = async () => {
    if (isPostsFetching || isEndPosts) return; // Останавливаем, если идет загрузка или достигли конца
    setIsPostFetching(true);
    setError(null);

    try {
      const axiosInstance = isLoggedIn ? axiosAuth : axiosClassic; // Выбор экземпляра axios
      // console.log('axiosInstance', axiosInstance.toString())
      const res = await axiosInstance.get(`${serverRequest}?skip=${skip}`);
      const data = res.data;

      if (data.length === 0) {
        setIsEndPosts(true);
      } else {
        setAllPosts((prevPosts) => [...prevPosts, ...data]);
        setSkip((prevSkip) => prevSkip + data.length); // Обновляем skip на длину новых данных
      }
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setIsPostFetching(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchPosts(); // Вызываем fetchPosts при пересечении loaderRef
      },
      { root: null, rootMargin: "200px", threshold: 1.0 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      observer.disconnect();
    };
  }, [skip, isEndPosts]); // Добавляем зависимости

  return { allPosts, isPostsFetching, isEndPosts, loaderRef, error  };
};