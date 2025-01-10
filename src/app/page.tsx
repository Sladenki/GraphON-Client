'use client'

import PostFeed from "@/components/ui/PostFeed/PostFeed";
import { useAuth } from "@/providers/AuthProvider";

const Homepage = () => {
  const { isLoggedIn } = useAuth();

  // Логика для выбора правильного URL запроса в зависимости от состояния isLoggedIn
  const serverRequest = isLoggedIn ? 'post/getPostsAuth' : 'post/getPostsNoAuth';

  return (
    <>
      <p>Homepage 2 - ниже посты</p>
      <PostFeed serverRequest={serverRequest} isLoggedIn={isLoggedIn} />
    </>
  );
};

export default Homepage;