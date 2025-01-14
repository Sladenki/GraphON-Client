import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPostReactionService } from '@/services/userPostReaction.service';


export const useReaction = (id: string, initialIsReacted: boolean, reactions: any) => {
  const [isReacted, setIsReacted] = useState(initialIsReacted);
  const [reactionsState, setReactionsState] = useState(reactions);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ reactionId, postId, isReacted }: { reactionId: string, postId: string, isReacted: boolean }) =>
      UserPostReactionService.createUserAndReactionConnection(reactionId, postId, isReacted),

    onMutate: async ({ reactionId, isReacted }) => {
      await queryClient.cancelQueries({ queryKey: ['reactions', id] });
      const previousReactions = queryClient.getQueryData(['reactions', id]);

      queryClient.setQueryData(['reactions', id], (oldReactions: any) => {
        if (!oldReactions) return [];
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

      setReactionsState((prevReactions: any) =>
        prevReactions.map((reaction: any) =>
          reaction._id === reactionId
            ? { ...reaction, clickNum: isReacted ? reaction.clickNum - 1 : reaction.clickNum + 1 }
            : reaction
        )
      );

      setIsReacted(!isReacted);

      return { previousReactions };
    },

    onError: (error, _, context) => {
      if (context?.previousReactions) {
        queryClient.setQueryData(['reactions', id], context.previousReactions);
      }
      setIsReacted(isReacted);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reactions', id] });
    },
  });

  const handleReactionClick = useCallback(
    (reactionId: string, postId: string) => {
      if (!mutation.isPending) {
        mutation.mutate({ reactionId, postId, isReacted });
      }
    },
    [isReacted, mutation]
  );

  return {
    isReacted,
    reactionsState,
    handleReactionClick,
  };
};
