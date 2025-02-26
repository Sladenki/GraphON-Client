"use client";

import React from 'react'

import styles from './Sidebar.module.scss'

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { sidebar, sidebarTwo } from '@/constants/sidebar';

import RenderMenuList from './RenderMenuList/RenderMenuList';


const Sidebar: React.FC<{}> = ({}) => {

  const small = useMediaQuery(1000)

  return (
    <div className={styles.sidebar}>
        
      <RenderMenuList arrayItems={sidebar} small={small}  />

      <RenderMenuList arrayItems={sidebarTwo} small={small}  />

    </div>
  )
}


export default Sidebar