import React, { FC, useCallback, useOptimistic, useState } from 'react'
import styles from './Post.module.scss'
import { IPost, IPostClient } from '@/types/post.interface'
import Image from 'next/image'
import { time2TimeAgo } from '@/utils/convertData'
import { UserPostReactionService } from '@/services/userPostReaction.service'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import GraphPopUp from './GraphPopUp/GraphPopUp'

//  ССылка на S3 Yandex
const BASE_S3_URL = process.env.NEXT_PUBLIC_S3_URL;

const Post: FC<IPostClient> = ({ id, graphId, content, imgPath, user, createdAt, reactions, isReacted: initialIsReacted, keywords }) => {

  // Фото поста
  const fullImageUrl = `${BASE_S3_URL}/${imgPath}`;

  const [isReacted, setIsReacted] = useState(initialIsReacted);
  const [reactionsState, setReactionsState] = useState(reactions || []);

  const queryClient = useQueryClient();

  const mutation = useMutation({

    mutationFn: ({ reactionId, postId, isReacted }: { reactionId: string, postId: string, isReacted: boolean }) => {
      return UserPostReactionService.createUserAndReactionConnection(reactionId, postId, isReacted);
    },

      // Оптимистичное обновление перед отправкой запроса
      onMutate: async ({ reactionId, isReacted }) => {
        await queryClient.cancelQueries({ queryKey: ['reactions', id] });

        // Сохраняем предыдущие данные для отката при ошибке
        const previousReactions = queryClient.getQueryData(['reactions', id]);

        // Оптимистично обновляем данные
        queryClient.setQueryData(['reactions', id], (oldReactions: any) => {
          if (!oldReactions) {
            return []; // Возвращаем пустой массив, если данных нет
          }
        
          return oldReactions.map((reaction: any) => {
            if (reaction._id === reactionId) {
              return {
                ...reaction,
                clickNum: isReacted ? reaction.clickNum - 1 : reaction.clickNum + 1,
              };
            }
            return reaction;
          });
        });

        // Обновляем локальное состояние
        setReactionsState((prevReactions) =>
          prevReactions.map((reaction) =>
            reaction._id === reactionId
              ? { ...reaction, clickNum: isReacted ? reaction.clickNum - 1 : reaction.clickNum + 1 }
              : reaction
          )
        );

        setIsReacted(!isReacted); // Оптимистично инвертируем флаг

        // Возвращаем данные для потенциального отката
        return { previousReactions };
      },


      // Откат изменений при ошибке
      onError: (error, _, context) => {
        console.error('Ошибка при обновлении реакции:', error);
        if (context?.previousReactions) {
          queryClient.setQueryData(['reactions', id], context.previousReactions);
        }
        setIsReacted(isReacted); // Возвращаем исходное значение
      },
      onSuccess: () => {
        // Локальное состояние уже обновлено, кэш можно оставить как есть или дополнительно обновить
        queryClient.invalidateQueries({ queryKey: ['reactions', id] });
      },

    }
  );

  // Функция для обработки клика на реакцию
  const handleReactionClick = useCallback((reactionId: string, postId: string) => {
    if (!mutation.isPending) {
      mutation.mutate({ reactionId, postId, isReacted });
    }
  }, [isReacted, mutation]);


  // PopUp Для графа
  const [isGraphPopupOpen, setGraphPopupOpen] = useState(false);

  const handleGraphButtonClick = () => {
    setGraphPopupOpen(true);
  };

  const closeGraphPopup = () => {
    setGraphPopupOpen(false);
  };

  return (
    <div className={styles.PostWrapper} key={id}>

      <div className={styles.userPart}>
        {/* <Image src={user.avaPath} className={styles.imgUser} alt='Аватарка' width={70} height={70} /> */}
        <span>{user.name}</span>
        <span>{time2TimeAgo(createdAt)}</span>

        {/* Кнопка для открытия pop-up окна */}
        <button onClick={handleGraphButtonClick} className={styles.graphButton}>
          Система графов
        </button>

      </div>

      {content}

      {imgPath && (
        <div className={styles.imageContainer}>
          <Image
            src={fullImageUrl}
            alt='Post Image'
            width={600}
            height={400}
            className={styles.postImage}
          />
        </div>
      )}

      {isGraphPopupOpen && (
        <GraphPopUp 
          graphId={graphId} 
          isGraphPopupOpen={isGraphPopupOpen}
          closeGraphPopup={closeGraphPopup}
        />
      )}

      <div className={styles.reactionList}>
        {reactionsState && reactionsState.length > 0 && reactionsState.map((reaction) => (
          <div
            key={reaction._id}
            className={styles.reactionBlock}
            onClick={() => handleReactionClick(reaction._id, id)}
          >
            {isReacted ? (
              <span style={{ color: '#D8BFD8' }}>
                оп {reaction.emoji}
              </span>
            ) : (
              <span>
                не-оп {reaction.emoji}
              </span>
            )}
            <span>{reaction.clickNum}</span>
            <span>{reaction.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Post;


