import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraphNode } from '../types';
import styles from './SubgraphPopUp.module.scss';
import { useMutation } from '@tanstack/react-query';
import { ScheduleService } from '@/services/schedule.service';

import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { ScheduleList } from '@/components/ui/ScheduleList/ScheduleList';

interface SubgraphPopUpProps {
  subgraph: GraphNode | null;
  onClose: () => void;
}

const SubgraphPopUp = ({ subgraph, onClose }: SubgraphPopUpProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (subgraph) {
      setIsVisible(true);
    }
  }, [subgraph]);

  // Получение расписания для графа
  const { mutate, data, isPending } = useMutation({
    mutationFn: (graphId: string) => ScheduleService.getFullScheduleByGraphId(graphId),
  });

  useEffect(() => {
    if (subgraph?._id) {
      mutate(subgraph._id.$oid);
    }
  }, [subgraph, mutate]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && subgraph && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className={styles.popup}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.header}>
              <h2>{subgraph.name}</h2>
              <button className={styles.closeButton} onClick={handleClose}>
                ×
              </button>
            </div>
            {subgraph.directorName && (
              <div className={styles.directorInfo}>
                <span className={styles.directorName}>
                  {subgraph.directorName}
                </span>
                {subgraph.directorVkLink && (
                  <a
                    href={subgraph.directorVkLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.vkLink}
                  >
                    VK
                  </a>
                )}
              </div>
            )}
            
            {/* Отображение расписания */}
            <div className={styles.scheduleContainer}>
              {isPending ? (
                <SpinnerLoader />
              ) : data?.data ? (
                <div className={styles.lightThemeWrapper}>
                  <ScheduleList
                    schedule={data.data.schedule}
                    events={data.data.events}
                  />
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubgraphPopUp; 