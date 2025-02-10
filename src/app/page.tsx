'use client'

import PostFeed from "@/components/ui/PostFeed/PostFeed";
import { useAuth } from "@/providers/AuthProvider";
import styles from './page.module.scss'
import Tabs from "@/components/ui/Tabs/Tabs";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useState } from "react";

const Homepage = () => {

  const { user } = useAuth();
  const isAuth = user && Object.keys(user).length > 0;
  const isMobile = useMediaQuery(680)

  const [activeTab, setActiveTab] = useState('main');

  // Логика для выбора правильного URL запроса в зависимости от состояния isLoggedIn
  const serverRequest = activeTab === 'main'
    ? isAuth ? 'post/getPostsAuth' : 'post/getPostsNoAuth'
    : 'graphSubs/getSubsPosts';

  const tabs = [
    { name: 'main', label: 'Главная', render: () => <></> },
    { name: 'subs', label: 'Подписки', render: () => <></> },
  ];


  return (
    <>
      {isMobile && isAuth &&(
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      <div className={styles.PostFeedWrapper}>
      
        {/* @ts-expect-error */}
        <PostFeed key={serverRequest} serverRequest={serverRequest} isLoggedIn={isAuth} />
      </div>
      
    </>
  );
};

export default Homepage;