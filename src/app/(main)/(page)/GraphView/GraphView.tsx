import FirstVariant from './FirstVariant';
import HierarchyGraph from './HierarchyGraph';
import SiteMapGraph from './SiteMapGraph';

// export default function GraphView({ searchQuery }: { searchQuery: string }) {
//   return <SiteMapGraph searchQuery={searchQuery} />;
// }

// export default function GraphView({ searchQuery }: { searchQuery: string }) {
//   return <HierarchyGraph searchQuery={searchQuery} />;
// }

export default function GraphView({ searchQuery }: { searchQuery: string }) {
  return <FirstVariant searchQuery={searchQuery} />;
}
