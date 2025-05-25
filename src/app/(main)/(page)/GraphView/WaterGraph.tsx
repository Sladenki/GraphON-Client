import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

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
  const [currentLevel, setCurrentLevel] = useState<string | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [parentNode, setParentNode] = useState<GraphNode | null>(null);

  const defaultImage = '/images/graphAva/default.jpg';

  useEffect(() => {
    // Initialize with root node (КГТУ)
    const rootNode = mockData.find(node => node.name === "КГТУ");
    if (rootNode) {
      setParentNode(rootNode);
      const childNodes = mockData.filter(node => 
        node.parentGraphId?.$oid === rootNode._id.$oid
      );
      setNodes(childNodes);
    }
  }, []);

  const handleNodeClick = (node: GraphNode) => {
    if (node.childGraphNum > 0) {
      setCurrentLevel(node._id.$oid);
      const childNodes = mockData.filter(n => 
        n.parentGraphId?.$oid === node._id.$oid
      );
      setNodes(childNodes);
      setParentNode(node);
    }
  };

  const handleBack = () => {
    if (parentNode?.parentGraphId?.$oid) {
      const newParent = mockData.find(node => 
        node._id.$oid === parentNode?.parentGraphId?.$oid
      );
      if (newParent) {
        setParentNode(newParent);
        const childNodes = mockData.filter(node => 
          node.parentGraphId?.$oid === newParent._id.$oid
        );
        setNodes(childNodes);
        setCurrentLevel(newParent._id.$oid);
      }
    } else {
      // Return to root
      const rootNode = mockData.find(node => node.name === "КГТУ");
      if (rootNode) {
        setParentNode(rootNode);
        const childNodes = mockData.filter(node => 
          node.parentGraphId?.$oid === rootNode._id.$oid
        );
        setNodes(childNodes);
        setCurrentLevel(null);
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-blue-50 to-blue-100 overflow-hidden">
      {/* Parent Node */}
      <AnimatePresence>
        {parentNode && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-32 h-32 rounded-full bg-white shadow-lg overflow-hidden cursor-pointer"
              onClick={() => handleBack()}
            >
              <Image
                src={parentNode.imgPath || defaultImage}
                alt={parentNode.name}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 w-full bg-black bg-opacity-50 text-white text-center py-1 text-sm">
                {parentNode.name}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Child Nodes */}
      <AnimatePresence>
        {nodes.map((node, index) => {
          const angle = (2 * Math.PI * index) / nodes.length;
          const radius = 200;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <motion.div
              key={node._id.$oid}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{ 
                scale: 1,
                x: x,
                y: y,
                transition: { delay: index * 0.1 }
              }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                x: x,
                y: y,
              }}
            >
              <motion.div
                className="relative w-24 h-24 rounded-full bg-white shadow-lg overflow-hidden cursor-pointer"
                onClick={() => handleNodeClick(node)}
                whileTap={{ scale: 0.9 }}
              >
                <Image
                  src={node.imgPath || defaultImage}
                  alt={node.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 w-full bg-black bg-opacity-50 text-white text-center py-1 text-xs">
                  {node.name}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default WaterGraph; 