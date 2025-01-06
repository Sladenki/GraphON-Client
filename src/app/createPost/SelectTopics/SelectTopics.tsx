import { useState } from "react";

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
  
    return (
      <div>
        {!selectedTopic && (
          <>
            <input
              type="text"
              placeholder="Поиск..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <ul style={{ border: '1px solid #ccc', padding: '10px', maxHeight: '150px', overflowY: 'auto' }}>
              {filteredTopics.map((topic: any) => (
                <li
                  key={topic._id}
                  onClick={() => handleItemSelect(topic)}
                  style={{ cursor: 'pointer', padding: '5px' }}
                >
                  {topic.name}
                </li>
              ))}
            </ul>
          </>
        )}
        {selectedTopic && (
          <div>
            <p>Вы выбрали: {selectedTopic.name}</p>
          </div>
        )}
      </div>
    );
  };
  
  export default SelectTopics;