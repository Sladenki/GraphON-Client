// graphUtils.ts
export interface GraphNode {
    id: string;  // Добавлено
    name: string;
    group: number;
    color: string;
}
  
export interface GraphLink {
    source: string;
    target: string;
}

export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

const LEVEL_COLORS = {
    0: '#0000ff', // Корень (КГТУ) - синий
    1: '#ff69b4', // Категории - розовый
    2: '#00ced1'  // Подкатегории - голубой
};

export const buildGraphHierarchy = (): GraphData => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const nodeMap = new Map<string, GraphNode>();

    // Добавляем корневой узел (КГТУ)
    const rootNode: GraphNode = {
        id: 'kgtu',
        name: 'КГТУ',
        group: 0,
        color: LEVEL_COLORS[0]
    };
    nodes.push(rootNode);
    nodeMap.set('kgtu', rootNode);

    // Структура данных
    const structure = {
        'КГТУ': {
            'Творчество': [
                'Открытая лига КВН «Плотва»',
                'Ансамбль академического танца «СТЕПанида»',
                'Вокальная студия «COOL MUSIC CLUB»',
                'Театральная студия',
                'Союз любителей авторской песни «Сфера общения»'
            ],
            'Волонтёрство и патриотизм': [
                'Российский союз сельской молодёжи',
                'Центр духовно-патриотического развития и культурно-творческих инициатив студентов',
                'Волонтёрский корпус'
            ],
            'Спорт и туризм': [
                'Экспедиционно-туристский клуб «Калейдоскоп»',
                'Студенческий спортивный клуб «Янтарный рыцарь»'
            ],
            'Медиа': [
                'Студенческий журнал «SWOT»'
            ],
            'Студенческие отряды': [
                'Штаб студенческих отрядов',
                'Студенческие отряды'
            ],
            'Наука и интеллект': [
                'Клуб любителей истории Отечества «КЛИО»',
                'Что? Где? Когда?'
            ],
            'Студенческое самоуправление': [
                'Студенческий совет КГТУ',
                'Профсоюз обучающихся',
                'Совет старост',
                'Курсантско-студенческий совет БГАРФ',
                'Совет обучающихся КМРК',
                'Совет общежитий'
            ]
        }
    };

    // Создаем узлы и связи
    Object.entries(structure['КГТУ']).forEach(([category, subcategories]) => {
        // Создаем узел категории
        const categoryId = `cat_${category}`;
        const categoryNode: GraphNode = {
            id: categoryId,
            name: category,
            group: 1,
            color: LEVEL_COLORS[1]
        };
        nodes.push(categoryNode);
        nodeMap.set(categoryId, categoryNode);

        // Создаем связь от корня к категории
        links.push({
            source: 'kgtu',
            target: categoryId
        });

        // Создаем узлы подкатегорий и их связи
        (subcategories as string[]).forEach(subcategory => {
            const subcategoryId = `sub_${subcategory}`;
            const subcategoryNode: GraphNode = {
                id: subcategoryId,
                name: subcategory,
                group: 2,
                color: LEVEL_COLORS[2]
            };
            nodes.push(subcategoryNode);
            nodeMap.set(subcategoryId, subcategoryNode);

            // Создаем связь от категории к подкатегории
            links.push({
                source: categoryId,
                target: subcategoryId
            });
        });
    });

    return { nodes, links };
};
