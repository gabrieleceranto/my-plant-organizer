import { plants } from '@/lib/data';
import PlantGrid from './components/PlantGrid';

export default function Page() {
  return <PlantGrid plants={plants} />;
}
