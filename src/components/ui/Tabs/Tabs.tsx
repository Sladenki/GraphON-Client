"use client"

import React, { FC, useState } from 'react';  
// import { AnimatePresence, Variants, motion } from 'framer-motion'
import styles from './Tabs.module.scss'
  


// const tabContentVariants: Variants = {
// 	initial: {
// 		y: 10,
// 		opacity: 0
// 	},
// 	enter: {
// 		y: 0,
// 		opacity: 1
// 	},
// 	exit: {
// 		y: -10,
// 		opacity: 0
// 	}
// }

const Tabs: FC<{tabs: any, activeTab: string, setActiveTab: (tab: string) => void}> = ({ tabs, activeTab, setActiveTab }) => {  

	return (
		<div className={styles.tabWrapper}>

            {/* Заголовки табов */}
			<div className={styles.tabHeader}>
				{tabs.map((tab: any) => (
                    <div
                        key={tab.name}
                        className={[
                            styles.tabItem,
                            activeTab === tab.name ? styles.selected : '',
                        ].join(' ')}
						onClick={() => setActiveTab(tab.name)}
                    >

						{activeTab === tab.name && <div className={styles.indicator} />}
				
						<div className={styles.tabName}>
                            {tab.label}
                        </div>
                        
					</div>
				))}
			</div>
            
            {/* Информация от выбранного таба */}
			<div className={styles.tabContent}>
				{tabs.find((tab: any) => tab.name === activeTab)?.render()}
			</div>

		</div>
	)
};

export default Tabs