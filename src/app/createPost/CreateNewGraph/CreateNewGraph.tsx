import PopUpWrapper from '@/components/ui/PopUpWrapper/PopUpWrapper'
import { GraphService } from '@/services/graph.service'
import { useMutation } from '@tanstack/react-query'
import React, { FC, useState } from 'react'

import styles from './CreateNewGraph.module.scss'
import { useRouter } from 'next/navigation'

interface CreateNewTopicProps {
    onClose: () => void
    isOpen: boolean

}

const CreateNewGraph: FC<CreateNewTopicProps> = ({onClose, isOpen}) => {

  const { push } = useRouter();

  const [graphName, setGraphName] = useState("");

  const createGraphMutation = useMutation({
    mutationFn: async (name: string) => {
      return GraphService.createGraph(name);
    },
    onSuccess: () => {
      onClose(); // Закрыть попап после успешного создания графа
      window.location.href = "/createPost";
    },
  });
    
  return (
    <PopUpWrapper onClose={onClose} isOpen={isOpen} width={400} height={300}>
      <div className={styles.createTopicWrapper}>
        <h2 className={styles.title}>Создать новый граф</h2>
        <input
          type="text"
          className={styles.input}
          placeholder="Название графа"
          value={graphName}
          onChange={(e) => setGraphName(e.target.value)}
        />
        <button
          className={styles.createButton}
          onClick={() => createGraphMutation.mutate(graphName)}
          disabled={createGraphMutation.isPending || !graphName.trim()}
        >
          Создать!
        </button>
      </div>
    </PopUpWrapper>
    
  )
}

export default CreateNewGraph