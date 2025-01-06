"use client";

import React from 'react'

import styles from './Sidebar.module.scss'

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { sidebar, sidebarTwo } from '@/constants/sidebar';

import RenderMenuList from './RenderMenuList/RenderMenuList';
import Logo from './Logo/Logo';


const Sidebar: React.FC<{}> = ({}) => {

  const small = useMediaQuery(1000)

  return (
    <div className={styles.sidebar}>

      <Logo small={small} />
        
      <RenderMenuList arrayItems={sidebar} small={small}  />

      <RenderMenuList arrayItems={sidebarTwo} small={small}  />

    </div>
  )
}


export default Sidebar