"use client";

import React from 'react'

import styles from './Sidebar.module.scss'

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { sidebar } from '@/constants/sidebar';

import RenderMenuList from './RenderMenuList/RenderMenuList';


const Sidebar: React.FC<{}> = ({}) => {

  const small = useMediaQuery('(max-width: 1000px)')

  return (
    <div className={styles.sidebar}>
        
        {/* @ts-expect-error типизация */}
      <RenderMenuList arrayItems={sidebar} small={small}  />

    </div>
  )
}


export default Sidebar