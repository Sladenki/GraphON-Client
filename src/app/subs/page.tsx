'use client'

import PostFeed from "@/components/ui/PostFeed/PostFeed";
import { useAuth } from "@/providers/AuthProvider";



const Subs = () => {
    const { isLoggedIn } = useAuth();

    const serverRequest = 'graphSubs/getSubsPosts'

    return (
        <>
            <span>Подписки юзера</span>
            <PostFeed serverRequest={serverRequest} isLoggedIn={isLoggedIn} />
        </>
    );
}

export default Subs