import React from 'react'
import styles from './SpinnerLoader.module.scss'

export const SpinnerLoader = () => {
  return (
    <div className={styles.loader}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80" preserveAspectRatio="xMidYMid" >
        <path fill="none"  d="M24.3,30C11.4,30,5,43.3,5,50s6.4,20,19.3,20c19.3,0,32.1-40,51.4-40 C88.6,30,95,43.3,95,50s-6.4,20-19.3,20C56.4,70,43.6,30,24.3,30z"  strokeWidth="7"></path>
        <path fill="none"  d="M24.3,30C11.4,30,5,43.3,5,50s6.4,20,19.3,20c19.3,0,32.1-40,51.4-40 C88.6,30,95,43.3,95,50s-6.4,20-19.3,20C56.4,70,43.6,30,24.3,30z" stroke="rgba(var(--main-Color))" strokeWidth="7" strokeDasharray="110 8 7 6 5 4 3 2 1 110"><animate attributeName="stroke-dashoffset" calcMode="linear" values="0;256.6" keyTimes="0;1" dur="2" begin="0s" repeatCount="indefinite"></animate></path>
      </svg>
    </div>
  )
}
