'use client'

import PostFeed from "@/components/ui/PostFeed/PostFeed";
import { useAuth } from "@/providers/AuthProvider";



export default async function Subs() {
    const { isLoggedIn } = useAuth();

    const serverRequest = 'graphSubs/getSubsPosts'

    return (
        <>
            <span>Подписки юзера</span>
            <PostFeed serverRequest={serverRequest} isLoggedIn={isLoggedIn} />
        </>
    );
}