import FirstVariant from './FirstVariant';
import HierarchyGraph from './HierarchyGraph';
import SecondVariant from './SecondVariant';
import SiteMapGraph from './SiteMapGraph';
import BiomeScene from './BiomeScene';

// export default function GraphView({ searchQuery }: { searchQuery: string }) {
//   return <SiteMapGraph searchQuery={searchQuery} />;
// }

// export default function GraphView({ searchQuery }: { searchQuery: string }) {
//   return <HierarchyGraph searchQuery={searchQuery} />;
// }

export default function GraphView({ searchQuery }: { searchQuery: string }) {
  // return <BiomeScene searchQuery={searchQuery} />;
  return <FirstVariant searchQuery={searchQuery} />;
}


// export default function GraphView({ searchQuery }: { searchQuery: string }) {
//   return <SecondVariant searchQuery={searchQuery} />;
// }