import React, { FC } from 'react'
import styles from './GraphList.module.scss'
import GraphBlock from '../../../../../components/ui/GraphBlock/GraphBlock'
import { IGraphList } from '@/types/graph.interface'
import { useSchedulePopup } from './useSchedulePopUp'
import SchedulePopUp from '../../../../../components/ui/SchedulePopUp/SchedulePopUp'

const GraphsList: FC<{ allGraphs: any}> = ({ allGraphs }) => {
  
  // Открытие PopUp расписания
  const { isSchedulePopupOpen, handleScheduleButtonClick, closeSchedulePopup } = useSchedulePopup();

  // Id выбранного объединения
  const [selectedGraphId, setSelectedGraphId] = React.useState<string | null>(null);

  return (
    <div className={styles.postsListWrapper}>
      {allGraphs.map((graph: IGraphList, index: number) => (
        <div key={graph._id}  style={{ "--delay": index * 0.1 + "s" } as React.CSSProperties}>
          <div className={styles.graphItem}>
            <GraphBlock 
              id={graph._id}
              name={graph.name}
              isSubToGraph={graph.isSubscribed}
              imgPath={graph.imgPath}

              // Для PopUp расписания
              handleScheduleButtonClick={handleScheduleButtonClick}
              setSelectedGraphId={setSelectedGraphId}
            />
          </div>

        </div>

      ))}

      {/* Модальное окно расписания */}
      {isSchedulePopupOpen && (
        <SchedulePopUp graphId={selectedGraphId} isSchedulePopupOpen={isSchedulePopupOpen} closeSchedulePopup={closeSchedulePopup} />
      )}
    </div>
  )
}

export default GraphsList