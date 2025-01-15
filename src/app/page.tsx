'use client'

import PostFeed from "@/components/ui/PostFeed/PostFeed";
import { useAuth } from "@/providers/AuthProvider";
import styles from './page.module.scss'

const Homepage = () => {
  const { isLoggedIn } = useAuth();

  // Логика для выбора правильного URL запроса в зависимости от состояния isLoggedIn
  const serverRequest = isLoggedIn ? 'post/getPostsAuth' : 'post/getPostsNoAuth';

  return (
    <>
      <p>Homepage 2 - ниже посты</p>
      <div className={styles.PostFeedWrapper}>
        <PostFeed serverRequest={serverRequest} isLoggedIn={isLoggedIn} />
      </div>
      
    </>
  );
};

export default Homepage;