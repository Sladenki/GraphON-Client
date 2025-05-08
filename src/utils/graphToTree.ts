// Преобразует массив графов и корневой граф в структуру для react-d3-tree

interface GraphNode {
  _id: string;
  name: string;
  parentGraphId?: string;
}

interface TreeNode {
  name: string;
  attributes?: Record<string, any>;
  children?: TreeNode[];
  _id?: string;
}

export function buildTreeData(root: GraphNode, allGraphs: GraphNode[]): TreeNode {
  // Индексируем по parentGraphId
  const byParent: Record<string, GraphNode[]> = {};
  allGraphs.forEach(g => {
    if (!byParent[g.parentGraphId || 'root']) byParent[g.parentGraphId || 'root'] = [];
    byParent[g.parentGraphId || 'root'].push(g);
  });

  function build(node: GraphNode): TreeNode {
    const children = byParent[node._id] || [];
    return {
      name: node.name,
      _id: node._id,
      children: children.map(build),
    };
  }

  return build(root);
} 