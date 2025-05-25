import FirstVariant from './FirstVariant';
import HierarchyGraph from './HierarchyGraph';
import SecondVariant from './SecondVariant';
import SiteMapGraph from './SiteMapGraph';
import BubbleGraph from './BubbleGraph';
import BiomeScene from './BiomeScene';
import WaterGraph from './WaterGraph';

// export default function GraphView({ searchQuery }: { searchQuery: string }) {
//   return <SiteMapGraph searchQuery={searchQuery} />;
// }

// export default function GraphView({ searchQuery }: { searchQuery: string }) {
//   return <HierarchyGraph searchQuery={searchQuery} />;
// }

// export default function GraphView({ searchQuery }: { searchQuery: string }) {
//   return <FirstVariant searchQuery={searchQuery} />;
// }

// export default function GraphView({ searchQuery }: { searchQuery: string }) {
//   return <BubbleGraph searchQuery={searchQuery} />;
// }

// export default function GraphView({ searchQuery }: { searchQuery: string }) {
//   return <BiomeScene searchQuery={searchQuery} />;
// }

// export default function GraphView({ searchQuery }: { searchQuery: string }) {
//   return <SecondVariant searchQuery={searchQuery} />;
// }

export default function GraphView({ searchQuery }: { searchQuery: string }) {
  return <WaterGraph searchQuery={searchQuery} />;
}