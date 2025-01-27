'use client'

import PostFeed from "@/components/ui/PostFeed/PostFeed";
import { useAuth } from "@/providers/AuthProvider";
import styles from './Subs.module.scss'


const Subs = () => {
    const { isLoggedIn } = useAuth();

    const serverRequest = 'graphSubs/getSubsPosts'

    return (
        <div className={styles.SubsWrapper}>
            <PostFeed serverRequest={serverRequest} isLoggedIn={isLoggedIn} />
        </div>
    );
}

export default Subs