import { useState } from "react";
import CreateNewTopic from "../CreateNewTopic/CreateNewTopic";

import styles from './SelectTopics.module.scss'

// @ts-expect-error 123
const SelectTopics = ({ mainTopics, selectedTopic, setSelectedTopic }) => {
    const [searchTerm, setSearchTerm] = useState('');
  
    const handleSearchChange = (e: any) => {
      setSearchTerm(e.target.value);
    };
  
    const handleItemSelect = (item: any) => {
      if (!selectedTopic) {
        setSelectedTopic(item);
      }
    };
  
    const filteredTopics = mainTopics.filter((topic: any) =>
      topic.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [openCreateNewTopic, setOpenCreateNewTopic] = useState(false);
  
    return (
      <div className={styles.selectTopicsWrapper}>
        {!selectedTopic && (
          <>
            <div className={styles.searchAndCreate}>
              <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Поиск по существующим графам..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />

                <button
                  className={styles.createNewGraphButton}
                  onClick={() => setOpenCreateNewTopic(true)}
                >
                  Создать новый граф!
                </button>
            </div>

            <CreateNewTopic
              onClose={() => setOpenCreateNewTopic(false)}
              isOpen={openCreateNewTopic}
            />

            <span>Существующие графы:</span>

            <ul className={styles.topicsList}>
              {filteredTopics.map((topic: any) => (
                <li
                  key={topic._id}
                  className={styles.topicItem}
                  onClick={() => handleItemSelect(topic)}
                >
                  {topic.name}
                </li>
              ))}
            </ul>
          </>
        )}
        {selectedTopic && (
          <div className={styles.selectedTopic}>
            <p>Вы выбрали: <strong>{selectedTopic.name}</strong></p>
          </div>
        )}
      </div>
    );
  };
  
  export default SelectTopics;