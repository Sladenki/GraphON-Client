import SiteMapGraph from './SiteMapGraph';

export default function GraphView({ searchQuery }: { searchQuery: string }) {
  return <SiteMapGraph searchQuery={searchQuery} />;
}
