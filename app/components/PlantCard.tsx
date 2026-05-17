import Image from 'next/image';
import type { Plant } from '@/lib/types';

const healthLabel: Record<string, string> = {
  ok: 'Sana',
  warn: 'Attenzione',
  bad: 'Urgente',
};

export default function PlantCard({ plant, index }: { plant: Plant; index: number }) {
  return (
    <div className="card" style={{ animationDelay: `${index * 0.018}s` }}>
      <Image
        className="card-img"
        src={plant.image_path}
        alt={plant.name}
        width={180}
        height={180}
        loading="lazy"
      />
      <div className="card-body">
        <div>
          <div className="card-top">
            <div className="card-names">
              <div className="card-name">{plant.name}</div>
              <div className="card-latin">{plant.latin}</div>
            </div>
            <div className="card-id">#{String(plant.id).padStart(2, '0')}</div>
          </div>
          <span className="card-category">{plant.category}</span>
          <div className="card-note">{plant.note}</div>
        </div>
        <div className="card-footer">
          <div className={`health-badge ${plant.health}`}>
            <div className="health-dot" />
            {healthLabel[plant.health]}
          </div>
          <div className="id-badge">ID {plant.id}</div>
        </div>
      </div>
    </div>
  );
}
