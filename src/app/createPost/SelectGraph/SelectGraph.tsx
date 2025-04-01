import { useState } from "react";


import styles from './SelectGraph.module.scss'
import EventForm from "../EventCreate/EventCreate";
import CreateNewGraph from "../CreateNewGraph/CreateNewGraph";
import ButtonActive from "@/components/ui/ButtonActive/ButtonActive";

// @ts-expect-error 123
const SelectGraph = ({ mainTopics, selectedGraph, setSelectedGraph }) => {

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: any) => {
    setSearchTerm(e.target.value);
  };

  const handleItemSelect = (item: any) => {
    if (!selectedGraph) {
      setSelectedGraph(item);
    }
  };

  const filteredTopics = mainTopics.filter((topic: any) =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [openCreateNewTopic, setOpenCreateNewTopic] = useState(false);

  const [openEventForm, setOpenEventForm] = useState(false);

  return (
    <div className={styles.selectTopicsWrapper}>
      {!selectedGraph && (
        <div className={styles.selectedGraphBlock}>
          <div className={styles.searchAndCreate}>
            <input
                type="text"
                className={styles.searchInput}
                placeholder="Поиск по графам..."
                value={searchTerm}
                onChange={handleSearchChange}
              />

              <ButtonActive
                text="Создать новый граф!"
                onClick={() => setOpenCreateNewTopic(true)}
              />
          </div>

          <CreateNewGraph
            onClose={() => setOpenCreateNewTopic(false)}
            isOpen={openCreateNewTopic}
          />

          <span className={styles.allowedGraphs}>Вы можете выбрать граф из списка существующих</span>

          <div className={styles.topicsList}>
            {filteredTopics.map((topic: any) => (
              <div
                key={topic._id}
                className={styles.topicItem}
                onClick={() => handleItemSelect(topic)}
              >
                {topic.name}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.afterSelectGraph}>
        {selectedGraph && (
          <div className={styles.selectedGraph}>
            <span>Мероприятие будут опубликовано в графе: <strong>{selectedGraph.name}</strong></span>
          </div>
        )}

        {selectedGraph._id && (
          <ButtonActive 
            text="Создать мероприятия"
            onClick={() => setOpenEventForm(true)}
          />
        )}

        {openEventForm && (
          <EventForm 
            graphId={selectedGraph._id} 
            isOpen={openEventForm}
            onClose={() => setOpenEventForm(false)}
          />
        )}

      </div>

    </div>
  );
};
  
  export default SelectGraph;