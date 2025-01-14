import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';


export const useAuthRedirect = () => {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const handleClick = (reactionId: string, postId: string, handleReactionClick: Function) => {
    if (!isLoggedIn) {
      router.push('/signIn');
    } else {
      handleReactionClick(reactionId, postId);
    }
  };

  return handleClick;
};
