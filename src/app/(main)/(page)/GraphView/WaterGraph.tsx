import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './WaterGraph.module.scss';

interface GraphNode {
  _id: { $oid: string };
  name: string;
  imgPath?: string;
  parentGraphId?: { $oid: string };
  childGraphNum: number;
  ownerUserId: { $oid: string };
  subsNum: number;
  directorName?: string;
  directorVkLink?: string;
  vkLink?: string;
}

interface WaterGraphProps {
  searchQuery: string;
}

const mockData: GraphNode[] = [
  {
    "_id": { "$oid": "67a499dd08ac3c0df94d6ab7" },
    "name": "КГТУ",
    "ownerUserId": { "$oid": "67a499dd08ac3c0df94d6ab7" },
    "subsNum": 4,
    "childGraphNum": 7,
    // "imgPath": "images/graphAva/klgtu.jpg"
  },
  {
    "_id": { "$oid": "67bcde0b5bc6b1601911698e" },
    "name": "Наука и интеллект",
    "ownerUserId": { "$oid": "67ac9400050e69a0404f69e9" },
    "subsNum": 0,
    "childGraphNum": 2,
    // "imgPath": "images/graphAva/Science.jpg",
    "parentGraphId": { "$oid": "67a499dd08ac3c0df94d6ab7" }
  },
  {
    "_id": { "$oid": "67bcde0b5bc6b1601911698f" },
    "name": "Студенческое самоуправление",
    "ownerUserId": { "$oid": "67ac9400050e69a0404f69e9" },
    "subsNum": 0,
    "childGraphNum": 6,
    // "imgPath": "images/graphAva/StudentGov.jpg",
    "parentGraphId": { "$oid": "67a499dd08ac3c0df94d6ab7" }
  },
  {
    "_id": { "$oid": "67bcde0b5bc6b16019116990" },
    "name": "Творчество",
    "ownerUserId": { "$oid": "67ac9400050e69a0404f69e9" },
    "subsNum": 0,
    "childGraphNum": 5,
    // "imgPath": "images/graphAva/Creativity.jpg",
    "parentGraphId": { "$oid": "67a499dd08ac3c0df94d6ab7" }
  },
  {
    "_id": { "$oid": "67bcde0b5bc6b16019116991" },
    "name": "Спорт и туризм",
    "ownerUserId": { "$oid": "67ac9400050e69a0404f69e9" },
    "subsNum": 0,
    "childGraphNum": 2,
    // "imgPath": "images/graphAva/SportTourism.jpg",
    "parentGraphId": { "$oid": "67a499dd08ac3c0df94d6ab7" }
  },
  {
    "_id": { "$oid": "67bcde0b5bc6b16019116992" },
    "name": "Волонтерство и патриотизм",
    "ownerUserId": { "$oid": "67ac9400050e69a0404f69e9" },
    "subsNum": 0,
    "childGraphNum": 3,
    // "imgPath": "images/graphAva/Volunteering.jpg",
    "parentGraphId": { "$oid": "67a499dd08ac3c0df94d6ab7" }
  },
  {
    "_id": { "$oid": "67bcde0b5bc6b16019116993" },
    "name": "Медиа",
    "ownerUserId": { "$oid": "67ac9400050e69a0404f69e9" },
    "subsNum": 0,
    "childGraphNum": 1,
    // "imgPath": "images/graphAva/Media.jpg",
    "parentGraphId": { "$oid": "67a499dd08ac3c0df94d6ab7" }
  },
  {
    "_id": { "$oid": "67bcde0b5bc6b16019116994" },
    "name": "Студенческие отряды",
    "ownerUserId": { "$oid": "67ac9400050e69a0404f69e9" },
    "subsNum": 0,
    "childGraphNum": 1,
    // "imgPath": "images/graphAva/StudentSquads.jpg",
    "parentGraphId": { "$oid": "67a499dd08ac3c0df94d6ab7" }
  },
  {
    "_id": { "$oid": "67be1a6138db96e59ae8c147" },
    "name": "Что? Где? Когда?",
    "directorName": "Степанищев Вадим Геннадьевич",
    "directorVkLink": "",
    "vkLink": "https://vk.com/chtogdekogdakstu",
    "ownerUserId": { "$oid": "67be1a6138db96e59ae8c146" },
    "subsNum": 0,
    "childGraphNum": 0,
    // "imgPath": "images/graphAva/WhereWho.jpg",
    "parentGraphId": { "$oid": "67bcde0b5bc6b1601911698e" }
  },
  {
    "_id": { "$oid": "67be1a6138db96e59ae8c148" },
    "name": "Клуб любителей истории Отечества «КЛИО»",
    "directorName": "Благов Сергей Викторович",
    "directorVkLink": "",
    "vkLink": "https://vk.com/klgtu39.klio?from=search",
    "ownerUserId": { "$oid": "67be1a6138db96e59ae8c146" },
    "subsNum": 0,
    "childGraphNum": 0,
    // "imgPath": "images/graphAva/Klio.jpg",
    "parentGraphId": { "$oid": "67bcde0b5bc6b1601911698e" }
  },
  {
    "_id": { "$oid": "67be1a6138db96e59ae8c149" },
    "name": "Студенческий совет КГТУ",
    "directorName": "Макаров Роман Леонидович",
    "directorVkLink": "https://vk.com/scoodyboo",
    "vkLink": "https://vk.com/students_council?from=groups",
    "ownerUserId": { "$oid": "67be1a6138db96e59ae8c146" },
    "subsNum": 0,
    "childGraphNum": 0,
    // "imgPath": "images/graphAva/StudentCouncil.jpg",
    "parentGraphId": { "$oid": "67bcde0b5bc6b1601911698f" }
  },
  {
    "_id": { "$oid": "67be1a6138db96e59ae8c14a" },
    "name": "Совет старост",
    "directorName": "Шишло Юлия Ивановна",
    "directorVkLink": "https://vk.com/id345526461",
    "vkLink": "https://vk.com/klgtu39.elders_council?from=groups",
    "ownerUserId": { "$oid": "67be1a6138db96e59ae8c146" },
    "subsNum": 0,
    "childGraphNum": 0,
    // "imgPath": "images/graphAva/EldersCouncil.jpg",
    "parentGraphId": { "$oid": "67bcde0b5bc6b1601911698f" }
  },
  {
    "_id": { "$oid": "67be1a6138db96e59ae8c14b" },
    "name": "Совет общежитий",
    "directorName": "Садыков Ильяз Исламович",
    "directorVkLink": "https://vk.com/id819377294",
    "vkLink": "https://vk.com/klgtu39.studgorod?from=groups",
    "ownerUserId": { "$oid": "67be1a6138db96e59ae8c146" },
    "subsNum": 0,
    "childGraphNum": 0,
    // "imgPath": "images/graphAva/DormCouncil.jpg",
    "parentGraphId": { "$oid": "67bcde0b5bc6b1601911698f" }
  },
  {
    "_id": { "$oid": "67be1a6138db96e59ae8c14c" },
    "name": "Профсоюз обучающихся",
    "directorName": "Азбукин Алексей Вадимович",
    "directorVkLink": "https://vk.com/aleximusazb",
    "vkLink": "https://vk.com/profkom_kgtu?from=groups",
    "ownerUserId": { "$oid": "67be1a6138db96e59ae8c146" },
    "subsNum": 0,
    "childGraphNum": 0,
    // "imgPath": "images/graphAva/TradeUnion.jpg",
    "parentGraphId": { "$oid": "67bcde0b5bc6b1601911698f" }
  },
  {
    "_id": { "$oid": "67be1a6138db96e59ae8c14d" },
    "name": "Курсантско-студенческий совет БГАРФ",
    "directorName": "Чуканцев Павел",
    "directorVkLink": "https://vk.com/annn_stasik",
    "vkLink": "https://vk.com/kss__bgarf?from=search",
    "ownerUserId": { "$oid": "67be1a6138db96e59ae8c146" },
    "subsNum": 0,
    "childGraphNum": 0,
    // "imgPath": "images/graphAva/BGARF.jpg",
    "parentGraphId": { "$oid": "67bcde0b5bc6b1601911698f" }
  },
  {
    "_id": { "$oid": "67be1a6138db96e59ae8c14e" },
    "name": "Совет обучающихся КМРК",
    "directorName": "Втулкин Даниил Максимович",
    "directorVkLink": "https://vk.com/nutellqa_kmrk",
    "vkLink": "https://vk.com/studsovetkmrk?from=search",
    "ownerUserId": { "$oid": "67be1a6138db96e59ae8c146" },
    "subsNum": 0,
    "childGraphNum": 0,
    // "imgPath": "images/graphAva/KMRK.jpg",
    "parentGraphId": { "$oid": "67bcde0b5bc6b1601911698f" }
  },
  {
    "_id": { "$oid": "67be1a6138db96e59ae8c14f" },
    "name": "Ансамбль академического танца «СТЕПанида»",
    "directorName": "Меднис Наталья Вольдемаровна",
    "directorVkLink": "",
    "vkLink": "https://vk.com/kdckgtu?from=groups",
    "ownerUserId": { "$oid": "67be1a6138db96e59ae8c146" },
    "subsNum": 0,
    "childGraphNum": 0,
    // "imgPath": "images/graphAva/Stepanida.jpg",
    "parentGraphId": { "$oid": "67bcde0b5bc6b16019116990" }
  },
  {
    "_id": { "$oid": "67be1a6138db96e59ae8c150" },
    "name": "Союз любителей гитарной песни «Среда обитания»",
    "directorName": "Итбаев Евгений Раулевич",
    "directorVkLink": "",
    "vkLink": "",
    "ownerUserId": { "$oid": "67be1a6138db96e59ae8c146" },
    "subsNum": 0,
    "childGraphNum": 0,
    // "imgPath": "images/graphAva/GuitarClub.jpg",
    "parentGraphId": { "$oid": "67bcde0b5bc6b16019116990" }
  },
  {
    "_id": { "$oid": "67be1a6138db96e59ae8c151" },
    "name": "Вокальная студия «COOL MUSIC CLUB»",
    "directorName": "Невдах Артем Сергеевич",
    "directorVkLink": "",
    "vkLink": "https://vk.com/kdckgtu?from=groups",
    "ownerUserId": { "$oid": "67be1a6138db96e59ae8c146" },
    "subsNum": 0,
    "childGraphNum": 0,
    // "imgPath": "images/graphAva/CoolMusic.jpg",
    "parentGraphId": { "$oid": "67bcde0b5bc6b16019116990" }
  },
  {
    "_id": { "$oid": "67be1a6138db96e59ae8c152" },
    "name": "Театральная студия",
    "directorName": "Зеленая Дарья Николаевна",
    "directorVkLink": "",
    "vkLink": "",
    "ownerUserId": { "$oid": "67be1a6138db96e59ae8c146" },
    "subsNum": 0,
    "childGraphNum": 0,
    // "imgPath": "images/graphAva/Theater.jpg",
    "parentGraphId": { "$oid": "67bcde0b5bc6b16019116990" }
  },
  {
    "_id": { "$oid": "67be1a6138db96e59ae8c153" },
    "name": "Открытая Лига КВН «Плотва»",
    "directorName": "Наставнёв Владимир Олегович",
    "directorVkLink": "https://vk.com/von_39",
    "vkLink": "https://vk.com/klgtu39.ligaplotva",
    "ownerUserId": { "$oid": "67be1a6138db96e59ae8c146" },
    "subsNum": 0,
    "childGraphNum": 0,
    // "imgPath": "images/graphAva/KVN.jpg",
    "parentGraphId": { "$oid": "67bcde0b5bc6b16019116990" }
  },
  {
    "_id": { "$oid": "67be1a6138db96e59ae8c154" },
    "name": "Студенческий спортивный клуб «Янтарный рыцарь»",
    "directorName": "Кучинская Светлана Викторовна",
    "directorVkLink": "https://vk.com/thisssveet",
    "vkLink": "https://vk.com/amber_knights?from=groups",
    "ownerUserId": { "$oid": "67be1a6138db96e59ae8c146" },
    "subsNum": 0,
    "childGraphNum": 0,
    // "imgPath": "images/graphAva/AmberKnight.jpg",
    "parentGraphId": { "$oid": "67bcde0b5bc6b16019116991" }
  },
  {
    "_id": { "$oid": "67be1a6138db96e59ae8c155" },
    "name": "Экспедиционно-туристский клуб «Калейдоскоп»",
    "directorName": "Невдах Артем Сергеевич",
    "directorVkLink": "",
    "vkLink": "https://vk.com/club222835448",
    "ownerUserId": { "$oid": "67be1a6138db96e59ae8c146" },
    "subsNum": 0,
    "childGraphNum": 0,
    // "imgPath": "images/graphAva/Kaleidoscope.jpg",
    "parentGraphId": { "$oid": "67bcde0b5bc6b16019116991" }
  },
  {
    "_id": { "$oid": "67be1a6138db96e59ae8c156" },
    "name": "Волонтерский корпус",
    "directorName": "Фоменко Дарья Александровна",
    "directorVkLink": "https://vk.com/d.ariiia",
    "vkLink": "https://vk.com/klgtu39.volunteers?from=search",
    "ownerUserId": { "$oid": "67be1a6138db96e59ae8c146" },
    "subsNum": 0,
    "childGraphNum": 0,
    // "imgPath": "images/graphAva/Volunteers.jpg",
    "parentGraphId": { "$oid": "67bcde0b5bc6b16019116992" }
  },
  {
    "_id": { "$oid": "67be1a6138db96e59ae8c157" },
    "name": "Центр духовно-патриотического развития и культурно-творческих инициатив студентов и курсантов КГТУ",
    "directorName": "Шахов Вячеслав Александрович",
    "directorVkLink": "",
    "vkLink": "",
    "ownerUserId": { "$oid": "67be1a6138db96e59ae8c146" },
    "subsNum": 0,
    "childGraphNum": 0,
    // "imgPath": "images/graphAva/PatriotCenter.jpg",
    "parentGraphId": { "$oid": "67bcde0b5bc6b16019116992" }
  },
  {
    "_id": { "$oid": "67be1a6138db96e59ae8c158" },
    "name": "Российский союз сельской молодежи",
    "directorName": "Голубенко Виктор Иванович",
    "directorVkLink": "https://vk.com/powered_by_vitek",
    "vkLink": "",
    "ownerUserId": { "$oid": "67be1a6138db96e59ae8c146" },
    "subsNum": 0,
    "childGraphNum": 0,
    // "imgPath": "images/graphAva/RuralYouth.jpg",
    "parentGraphId": { "$oid": "67bcde0b5bc6b16019116992" }
  },
  {
    "_id": { "$oid": "67be1a6138db96e59ae8c159" },
    "name": "Студенческий журнал «SWOT»",
    "directorName": "Зорин Владислав Вадимович",
    "directorVkLink": "https://vk.com/vladzzzorin",
    "vkLink": "https://vk.com/swot39?from=groups",
    "ownerUserId": { "$oid": "67be1a6138db96e59ae8c146" },
    "subsNum": 0,
    "childGraphNum": 0,
    // "imgPath": "images/graphAva/SWOT.jpg",
    "parentGraphId": { "$oid": "67bcde0b5bc6b16019116993" }
  },
  {
    "_id": { "$oid": "67be1a6138db96e59ae8c15a" },
    "name": "Штаб студенческих отрядов",
    "directorName": "Зверева Олеся Романовна",
    "directorVkLink": "https://vk.com/olessyrom",
    "vkLink": "https://vk.com/kgtuso?from=groups",
    "ownerUserId": { "$oid": "67be1a6138db96e59ae8c146" },
    "subsNum": 0,
    "childGraphNum": 0,
    // "imgPath": "images/graphAva/StudentSquadsHQ.jpg",
    "parentGraphId": { "$oid": "67bcde0b5bc6b16019116994" }
  }
];

const WaterGraph = ({ searchQuery }: WaterGraphProps) => {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [rootNode, setRootNode] = useState<GraphNode | null>(null);
  const [firstLevelNodes, setFirstLevelNodes] = useState<GraphNode[]>([]);
  const [activeChildNodes, setActiveChildNodes] = useState<GraphNode[]>([]);

  // Calculate positions for first level nodes in a circle
  const getFirstLevelPosition = (index: number, total: number) => {
    const angle = (2 * Math.PI * index) / total;
    const radius = 280; // Distance from center
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  // Calculate positions for second level nodes relative to their parent
  const getSecondLevelPosition = (index: number, total: number, parentPosition: { x: number, y: number }) => {
    const angle = (2 * Math.PI * index) / total;
    const radius = 160; // Distance from parent
    const offsetX = Math.cos(angle) * radius;
    const offsetY = Math.sin(angle) * radius;
    
    return {
      x: parentPosition.x + offsetX,
      y: parentPosition.y + offsetY,
    };
  };

  useEffect(() => {
    // Initialize with root node (КГТУ)
    const root = mockData.find(node => node.name === "КГТУ");
    if (root) {
      setRootNode(root);
      const children = mockData.filter(node => 
        node.parentGraphId?.$oid === root._id.$oid
      );
      setFirstLevelNodes(children);
    }
  }, []);

  const handleNodeClick = (node: GraphNode) => {
    if (node.childGraphNum > 0) {
      if (activeNodeId === node._id.$oid) {
        // If clicking the same node, close it
        setActiveNodeId(null);
        setActiveChildNodes([]);
      } else {
        // Open new node
        setActiveNodeId(node._id.$oid);
        const childNodes = mockData.filter(n => 
          n.parentGraphId?.$oid === node._id.$oid
        );
        setActiveChildNodes(childNodes);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.graphContainer}>
        {/* Root Node */}
        <AnimatePresence>
          {rootNode && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={styles.rootNode}
            >
              <div className={styles.nodeContent}>
                <span className={styles.rootNodeContent}>{rootNode.name}</span>
              </div>
              <div className={styles.nodeOverlay} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* First Level Nodes */}
        <AnimatePresence>
          {firstLevelNodes.map((node, index) => {
            const position = getFirstLevelPosition(index, firstLevelNodes.length);
            const isActive = activeNodeId === node._id.$oid;

            return (
              <motion.div
                key={node._id.$oid}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{ 
                  scale: 1,
                  x: position.x,
                  y: position.y,
                  transition: { 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }
                }}
                exit={{ scale: 0 }}
                className="absolute"
                style={{
                  x: position.x,
                  y: position.y,
                }}
              >
                <motion.div
                  className={`${styles.firstLevelNode} ${isActive ? styles.activeNode : ''}`}
                  onClick={() => handleNodeClick(node)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className={styles.nodeContent}>
                    <span className={styles.firstLevelNodeContent}>{node.name}</span>
                  </div>
                  <div className={styles.nodeOverlay} />
                </motion.div>

                {/* Second Level Nodes */}
                <AnimatePresence>
                  {isActive && activeChildNodes.map((childNode, childIndex) => {
                    const childPosition = getSecondLevelPosition(
                      childIndex,
                      activeChildNodes.length,
                      position
                    );

                    return (
                      <motion.div
                        key={childNode._id.$oid}
                        initial={{ scale: 0, x: 0, y: 0 }}
                        animate={{ 
                          scale: 1,
                          x: childPosition.x - position.x,
                          y: childPosition.y - position.y,
                          transition: { 
                            delay: childIndex * 0.1,
                            type: "spring",
                            stiffness: 100
                          }
                        }}
                        exit={{ scale: 0 }}
                        className="absolute"
                        style={{
                          x: childPosition.x - position.x,
                          y: childPosition.y - position.y,
                        }}
                      >
                        <motion.div
                          className={styles.secondLevelNode}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <div className={styles.nodeContent}>
                            <span className={styles.secondLevelNodeContent}>{childNode.name}</span>
                          </div>
                          <div className={styles.nodeOverlay} />
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WaterGraph; 