"use client";

import Link from "next/link";
import { FC } from "react";
import { IUser } from "@/types/user.interface";
import Image from "next/image";

import styles from './ProfileUser.module.scss'


const ProfileUser: FC<{user: IUser}> = ({ user }) => {

    return (
        <Link href={{ pathname: "/profile" }}>
            <div 
                className={styles.ProfileCornerWrapper}  
            >
                {user?.avaPath && (
                    <Image
                        className={styles.img} 
                        src={user.avaPath} 
                        alt="Аватар"
                        width={55}
                        height={55} 
                    />
                )}
            </div>
        </Link>
    )
}

export default ProfileUser





