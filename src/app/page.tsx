'use client'

import PostFeed from "@/components/ui/PostFeed/PostFeed";
import { useAuth } from "@/providers/AuthProvider";

const Homepage = () => {
  const serverRequest = 'post/getPosts';

  const { isLoggedIn } = useAuth();

  return (
    <>
      <p>Homepage 2 - ниже посты</p>
      <PostFeed serverRequest={serverRequest} isLoggedIn={isLoggedIn} />
    </>
  );
};

export default Homepage;