import React, { FC } from 'react'
import styles from './GraphList.module.scss'
import GraphBlock from '../GraphBlock/GraphBlock'
import { IGraphList } from '@/types/graph.interface'

const GraphsList: FC<{ allGraphs: any}> = ({ allGraphs }) => {

  return (
    <div className={styles.PostsListWrapper}>
      {allGraphs.map((graph: IGraphList) => (
        <div key={graph._id} className={styles.graphBlock}>
          <GraphBlock 
            id={graph._id}
            name={graph.name}
            isSubToGraph={graph.isSubscribed}
            imgPath={graph.imgPath}
          />
        </div>

      ))}
    </div>
  )
}

export default GraphsList