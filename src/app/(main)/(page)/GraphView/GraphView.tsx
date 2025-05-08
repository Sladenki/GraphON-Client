import HierarchyGraph from './HierarchyGraph';

export default function GraphView({ searchQuery }: { searchQuery: string }) {
  return <HierarchyGraph searchQuery={searchQuery} />;
}