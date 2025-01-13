import React, { FC, useCallback, useOptimistic, useState } from 'react'
import styles from './Post.module.scss'
import { IPost, IPostClient } from '@/types/post.interface'
import Image from 'next/image'
import { time2TimeAgo } from '@/utils/convertData'
import GraphPopUp from './GraphPopUp/GraphPopUp'
import { useReaction } from './useReaction'
import { useAuthRedirect } from './useAuthRedirect'
import { useGraphPopup } from './useGraphPopup'
import { useMutation } from '@tanstack/react-query'
import { GraphSubsService } from '@/services/graphSubs.service'
import { useSchedulePopup } from './useSchedulePopup'
import SchedulePopUp from './SchedulePopUp/SchedulePopUp'


//  ССылка на S3 Yandex
const BASE_S3_URL = process.env.NEXT_PUBLIC_S3_URL;

const Post: FC<IPostClient> = ({ id, graph, content, imgPath, user, createdAt, reactions, isReacted: initialIsReacted }) => {
  const { isReacted, reactionsState, handleReactionClick } = useReaction(id, initialIsReacted, reactions);
  const handleClick = useAuthRedirect();
  const { isGraphPopupOpen, handleGraphButtonClick, closeGraphPopup } = useGraphPopup();
  const { isSchedulePopupOpen, handleScheduleButtonClick, closeSchedulePopup } = useSchedulePopup();

  const fullImageUrl = `${BASE_S3_URL}/${imgPath}`;


  // Состояние для отслеживания загрузки и ошибки
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Мутация для подписки через GraphSubsService
  const mutation = useMutation({
    mutationFn: (graphId: string) => GraphSubsService.toggleGraphSub(graphId),
    onMutate: () => {
      setIsSubscribing(true);  // Начинаем процесс подписки
    },
    onError: (error) => {
      console.error('Ошибка при подписке на граф:', error);
      setIsSubscribing(false);
    },
    onSuccess: () => {
      setIsSubscribing(false);  // Завершаем процесс подписки
    }
  });

  // Функция обработки клика по кнопке
  const handleSubscribeClick = () => {
    if (graph && graph._id) {
      mutation.mutate(graph._id);  // Отправляем запрос на подписку
    }
  };

  console.log('graph', graph)

  return (
    <div className={styles.PostWrapper} key={id}>

      {/* Шапка */}
      <div className={styles.userPart}>
        <Image src={user.avaPath} className={styles.imgUser} alt="Аватарка" width={70} height={70} />
        <span>{user.name}</span>
        <span>{time2TimeAgo(createdAt)}</span>
        <p>Граф - {graph.name}</p>

        <button onClick={handleSubscribeClick} disabled={isSubscribing || mutation.isLoading}>
          {isSubscribing || mutation.isLoading ? 'Подписка...' : 'Подписаться на граф'}
        </button>

        <button onClick={handleScheduleButtonClick}>
          Узнать расписание графа
        </button>

        {graph && (
          <button onClick={handleGraphButtonClick} >
            Система графов
          </button>
        )}

      </div>

      {content}

      {imgPath && (
        <div className={styles.imageContainer}>
          <Image src={fullImageUrl} alt="Post Image" width={600} height={400} className={styles.postImage} />
        </div>
      )}

      {isGraphPopupOpen && <GraphPopUp parentGraph={graph} isGraphPopupOpen={isGraphPopupOpen} closeGraphPopup={closeGraphPopup} />}

      {isSchedulePopupOpen && <SchedulePopUp graph={graph} isSchedulePopupOpen={isSchedulePopupOpen} closeSchedulePopup={closeSchedulePopup} />}

      <div className={styles.reactionList}>
        {reactionsState.length > 0 &&
          reactionsState.map((reaction) => (
            <div key={reaction._id} className={styles.reactionBlock} onClick={() => handleClick(reaction._id, id, handleReactionClick)}>
              <span style={{ color: isReacted ? '#D8BFD8' : 'inherit' }}>{isReacted ? 'оп' : 'не-оп'} {reaction.emoji}</span>
              <span>{reaction.clickNum}</span>
              <span>{reaction.text}</span>
            </div>
          ))}
      </div>

    </div>
  );
};

export default Post;



