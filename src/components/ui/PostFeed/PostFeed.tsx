"use client";

import { FC, useEffect, useRef, useState } from "react";
import PostsList from "../PostsList/PostsList";
import { useFetchBunchData } from "@/hooks/useFetchBunchData";
import { SpinnerLoader } from "../SpinnerLoader/SpinnerLoader";
import NoInfo from "../NoInfo/NoInfo";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";



interface PostFeedProps {
  serverRequest: string;
  initialPosts?: any[];
  isLoggedIn: boolean
}


const PostFeed: FC<PostFeedProps> = ({serverRequest, isLoggedIn}) => {
  const { logout } = useAuth();
  const { push } = useRouter();

  const { allPosts, isPostsFetching, isEndPosts, loaderRef, error } = useFetchBunchData(serverRequest, [], isLoggedIn);

  useEffect(() => {
    if (error?.response?.status === 401) {
      handleLogout();
    }
  }, [error]);

  const handleLogout = async () => {
    await logout();
    push("/"); // Перенаправление на главную страницу после выхода
  };

  if (error && error.response?.status !== 401) {
    return <div>Ошибка загрузки: {error.message || "Неизвестная ошибка"}</div>;
  }

  return (
    <>
      {allPosts?.length === 0 && !isPostsFetching && <span>Публикации отсутсвуют</span>}

      {allPosts?.length > 0 && <PostsList allPosts={allPosts} />}

      {isPostsFetching && !isEndPosts && <SpinnerLoader/>}

      {isEndPosts && allPosts?.length > 0 && (
        <div style={{ marginBottom: 70, marginTop: 50, textAlign: "center"}}>
          <NoInfo/>
        </div>
      )}

      <div ref={loaderRef} />

    </>
  )
}

export default PostFeed


