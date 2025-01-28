import React, { FC } from 'react'
import styles from './Post.module.scss'
import { IPost, IPostClient } from '@/types/post.interface'
import Image from 'next/image'
import { time2TimeAgo } from '@/utils/convertData'
import { useReaction } from './useReaction'
import { useAuthRedirect } from './useAuthRedirect'
import { useGraphPopup } from './useGraphPopup'
import { useSchedulePopup } from './useSchedulePopup'
import { useSubscription } from './useSubscription'
import { useAuth } from '@/providers/AuthProvider'
import { CalendarCheck, GitFork } from 'lucide-react'

const GraphPopUp = React.lazy(() => import('./GraphPopUp/GraphPopUp'));
const SchedulePopUp = React.lazy(() => import('./SchedulePopUp/SchedulePopUp'));


//  ССылка на S3 Yandex
const BASE_S3_URL = process.env.NEXT_PUBLIC_S3_URL;

const Post: FC<IPostClient> = ({ id, graph, content, imgPath, user, createdAt, reactions, isReacted: initialIsReacted, isSubToGraph }) => {

  const { isLoggedIn } = useAuth();

  // Реакция 
  const { isReacted, reactionsState, handleReactionClick } = useReaction(id, initialIsReacted, reactions);
  const handleClick = useAuthRedirect();

  // Подписка на граф
  const { isSubscribed, toggleSubscription, isLoading } = useSubscription(isSubToGraph, graph?._id || '');

  // Расписание
  const { isSchedulePopupOpen, handleScheduleButtonClick, closeSchedulePopup } = useSchedulePopup();

  // Система графов
  const { isGraphPopupOpen, handleGraphButtonClick, closeGraphPopup } = useGraphPopup();
  const fullImageUrl = `${BASE_S3_URL}/${imgPath}`;


  return (
    <div className={styles.PostWrapper} key={id}>

      {/* Шапка */}
      <div className={styles.header}>

        <div className={styles.leftPart}>
          <div className={styles.whoPosted}>
            <span>{graph.name}</span>
            <span>{time2TimeAgo(createdAt)}</span>
          </div>

          {isLoggedIn && (
            <button
              onClick={toggleSubscription}
              disabled={isLoading}
              className={`${styles.subscriptionButton} ${
                isSubscribed ? styles.subscribed : styles.unsubscribed
              }`}
            >
              {isLoading ? 'Загрузка...' : isSubscribed ? 'Подписаться' : 'Отписаться'}
            </button>
          )}
        </div>


        <div className={styles.buttons}>
          <div className={styles.iconBlock} onClick={handleScheduleButtonClick}>
            <CalendarCheck 
              color="rgb(var(--main-Color))" 
              size={26} 
              strokeWidth={0.9} 
            />
          </div>

        
          {graph && (
            <div className={styles.iconBlock} onClick={handleGraphButtonClick} >
              <GitFork 
                color="rgb(var(--main-Color))" 
                size={26} 
                strokeWidth={0.9}
              />
            </div>
          )}
        </div>

      </div>
      
      {/* Основной пост */}
      <div className={styles.body}>
        <span>{content}</span>

        {imgPath && (
          <div className={styles.imageContainer}>
            <Image src={fullImageUrl} alt="Post Image" width={450} height={300} className={styles.postImage} />
          </div>
        )}
      </div>

      {/* Система графов */}
      {isGraphPopupOpen && <GraphPopUp parentGraph={graph} isGraphPopupOpen={isGraphPopupOpen} closeGraphPopup={closeGraphPopup} />}

      {/* Расписание */}
      {isSchedulePopupOpen && <SchedulePopUp graph={graph} isSchedulePopupOpen={isSchedulePopupOpen} closeSchedulePopup={closeSchedulePopup} />}
      
      {/* Реакции */}
      <div className={styles.reactionList}>
        {reactionsState.length > 0 &&
          reactionsState.map((reaction: any) => (
            <div
              key={reaction._id}
              className={`${styles.reactionBlock} ${isReacted ? styles.active : styles.inactive}`}
              onClick={() => handleClick(reaction._id, id, handleReactionClick)}
            >
              <span className={styles.reactionEmoji}>{reaction.emoji}</span>
              <span className={styles.reactionCount}>{reaction.clickNum}</span>
              <span className={styles.reactionText}>{reaction.text}</span>
            </div>
          ))}
      </div>

    </div>
  );
};

export default Post;



