'use client'

import PostFeed from "@/components/ui/PostFeed/PostFeed";
import { useAuth } from "@/providers/AuthProvider";
import styles from './page.module.scss'


const Homepage = () => {

  const { user } = useAuth();

  const isAuth = user && Object.keys(user).length > 0;


  // Логика для выбора правильного URL запроса в зависимости от состояния isLoggedIn
  const serverRequest = isAuth ? 'post/getPostsAuth' : 'post/getPostsNoAuth';

  return (
    <>
      {/* <p>Homepage 2 - ниже посты</p> */}
      <div className={styles.PostFeedWrapper}>
        {/* @ts-expect-error */}
        <PostFeed serverRequest={serverRequest} isLoggedIn={isAuth} />
      </div>
      
    </>
  );
};

export default Homepage;