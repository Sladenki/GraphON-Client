'use client'

import LoginButton from "@/components/global/ProfileCorner/LoginButton/LoginButton";
import styles from './signIn.module.scss'


const Signin = () => {
  return (
    <div className={styles.SigninWrapper}>
      <LoginButton/>
    </div>
  );
}

export default Signin