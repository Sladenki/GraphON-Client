"use client";

import Link from "next/link";
import { FC } from "react";
import { IUser } from "@/types/user.interface";
import Image from "next/image";

import styles from './ProfileUser.module.scss'

import NoImage from '../../../../../public/noImage.png'


const ProfileUser: FC<{user: IUser}> = ({ user }) => {

    return (
        <Link href={{ pathname: "/profile" }}>
            <div 
                className={styles.ProfileCornerWrapper}  
            >
                <Image
                    className={styles.img} 
                    src={user.avaPath ? user.avaPath : NoImage} 
                    alt="Аватар"
                    width={55}
                    height={55} 
                />
            </div>
        </Link>
    )
}

export default ProfileUser





