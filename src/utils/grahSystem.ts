// graphUtils.ts
export interface GraphNode {
    id: string;  // Добавлено
    name: string;
    isParent?: boolean; // Сделано необязательным
    hasChildren?: boolean; // Сделано необязательным
}
  
export interface GraphLink {
    source: string;
    target: string;
}

export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

export const buildGraphHierarchy = (parentGraph: GraphNode, allGraphs: any[]): GraphData => {
    if (!allGraphs || allGraphs.length === 0) return { nodes: [], links: [] };

    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const nodeMap = new Map<string, GraphNode>();

    // Добавляем родительский узел
    const parentNode: GraphNode = {
        // @ts-expect-error ошибка типизации
        id: parentGraph._id,
        name: parentGraph.name,
        isParent: true,
        hasChildren: false
    };
    nodes.push(parentNode);
    // @ts-expect-error ошибка типизации
    nodeMap.set(parentGraph._id, parentNode);

    // Создаем узлы и связи
    allGraphs.forEach((graph) => {
        let node = nodeMap.get(graph._id);
        if (!node) {
            node = {
                id: graph._id,
                name: graph.name,
                isParent: false,
                hasChildren: false
            };
            nodes.push(node);
            nodeMap.set(graph._id, node);
        }

        // Добавляем связь и помечаем родительский узел как имеющий потомков
        if (graph.parentGraphId) {
            links.push({
                source: graph.parentGraphId,
                target: graph._id
            });

            const parentNode = nodeMap.get(graph.parentGraphId);
            if (parentNode) {
                parentNode.hasChildren = true;
            }
        }
    });

    return { nodes, links };
};
