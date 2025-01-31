"use client";

import Link from "next/link";

import styles from './ProfileUser.module.scss'

import { FC, useState } from "react";
import { ISessionUser, IUser } from "@/types/user.interface";


const ProfileUser: FC<{user: IUser}> = ({ user }) => {

    const [isHovering, setIsHovered] = useState(false);
    const onMouseEnter = () => setIsHovered(true);
    const onMouseLeave = () => setIsHovered(false);

    return (
        <
        >
            <Link href={{ pathname: "/profile" }}>
                <div 
                    className={styles.ProfileCornerWrapper}
                    onMouseEnter={onMouseEnter}    
                >
                    {user?.avaPath && <img  className={styles.img} src={user.avaPath} alt="" />}
                </div>
            </Link>
            


        </>


    )
}

export default ProfileUser





