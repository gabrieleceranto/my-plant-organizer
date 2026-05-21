import { plants as allPlants, groups as allGroups } from '@/lib/data';
import PhotoBadge from '@/app/components/PhotoBadge';

type LightLevel = 'pieno_sole' | 'parziale' | 'luce_indiretta';

interface GroupPlant {
  id: number;
  name: string;
  category: string;
  light: LightLevel;
  root_depth_cm: number;
  image_path: string;
}

interface PlantGroup {
  id: number;
  name: string;
  description: string | null;
  group_type: 'stesso_vaso' | 'vicine';
  plant_group_members: { plants: GroupPlant }[];
}

interface PlantLight {
  id: number;
  name: string;
  light: LightLevel;
  image_path: string;
}

const lightConfig: Record<LightLevel, { label: string; icon: string; desc: string }> = {
  pieno_sole:     { label: 'Pieno sole',     icon: '☀️', desc: '6+ ore di sole diretto' },
  parziale:       { label: 'Parziale',       icon: '⛅', desc: '3–6 ore di sole' },
  luce_indiretta: { label: 'Luce indiretta', icon: '🌤', desc: 'Ombra luminosa o controluce' },
};

const categoryColor: Record<string, string> = {
  Succulenta: '#dcfce7',
  Cactus: '#fef9c3',
  Ornamentale: '#dbeafe',
  Aromatica: '#f0fdf4',
  Fioritura: '#fce7f3',
  Ortaggio: '#fff7ed',
  'Albero da frutto': '#fef3c7',
  Rampicante: '#ede9fe',
  Arbusto: '#f3f4f6',
  Sconosciuta: '#f9fafb',
};

function categoryBg(category: string) {
  for (const [key, color] of Object.entries(categoryColor)) {
    if (category.includes(key)) return color;
  }
  return '#f3f4f6';
}

export default function AbbinnamentiPage() {

  const groups = allGroups as unknown as PlantGroup[];
  const plants = allPlants as PlantLight[];

  const stessoVaso = groups.filter((g) => g.group_type === 'stesso_vaso');
  const vicine = groups.filter((g) => g.group_type === 'vicine');

  const byLight: Record<LightLevel, PlantLight[]> = {
    pieno_sole: plants.filter((p) => p.light === 'pieno_sole'),
    parziale: plants.filter((p) => p.light === 'parziale'),
    luce_indiretta: plants.filter((p) => p.light === 'luce_indiretta'),
  };

  return (
    <>
      <header className="site-header">
        <h1>
          Abbinamenti & Luce
          <span>Gruppi, sinergie e requisiti luminosi</span>
        </h1>
        <a href="/" className="btn-logout">← Catalogo</a>
      </header>

      <main className="abbinamenti-main">

        {/* Stesso vaso */}
        <section className="abb-section">
          <h2 className="abb-section-title">Nello stesso vaso</h2>
          <p className="abb-section-desc">Piante con stessa esigenza di luce, esigenze idriche compatibili e sinergie attive.</p>
          <div className="abb-grid">
            {stessoVaso.map((g) => {
              const lights = [...new Set(g.plant_group_members.map((m) => m.plants.light))];
              const sharedLight = lights.length === 1 ? lights[0] as LightLevel : null;
              const maxDepth = Math.max(...g.plant_group_members.map((m) => m.plants.root_depth_cm));
              const fits30 = maxDepth <= 30;
              return (
                <div key={g.id} className={`abb-card${fits30 ? '' : ' abb-card-warn'}`}>
                  <div className="abb-card-header">
                    <span className="abb-card-type abb-type-vaso">stesso vaso</span>
                    {sharedLight && (
                      <span className="abb-light-badge">
                        {lightConfig[sharedLight].icon} {lightConfig[sharedLight].label}
                      </span>
                    )}
                    <span className={`abb-depth-badge ${fits30 ? 'abb-depth-ok' : 'abb-depth-warn'}`}>
                      {fits30 ? `min. ${maxDepth}cm` : `richiede ${maxDepth}cm`}
                    </span>
                  </div>
                  <h3 className="abb-card-name">{g.name}</h3>
                  {g.description && <p className="abb-card-desc">{g.description}</p>}
                  <div className="abb-plants">
                    {g.plant_group_members.map((m) => (
                      <PhotoBadge
                        key={m.plants.id}
                        name={m.plants.name}
                        imagePath={m.plants.image_path || null}
                        className="abb-plant-tag"
                        style={{ background: categoryBg(m.plants.category) }}
                        title={`${m.plants.root_depth_cm}cm di profondità`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Vicine */}
        <section className="abb-section">
          <h2 className="abb-section-title">Da tenere vicine</h2>
          <p className="abb-section-desc">La prossimità attiva la sinergia — non devono condividere il vaso né la stessa esposizione.</p>
          <div className="abb-grid">
            {vicine.map((g) => {
              const lights = [...new Set(g.plant_group_members.map((m) => m.plants.light))];
              const sharedLight = lights.length === 1 ? lights[0] as LightLevel : null;
              return (
                <div key={g.id} className="abb-card">
                  <div className="abb-card-header">
                    <span className="abb-card-type abb-type-vicine">vicine</span>
                    {sharedLight ? (
                      <span className="abb-light-badge">
                        {lightConfig[sharedLight].icon} {lightConfig[sharedLight].label}
                      </span>
                    ) : (
                      <span className="abb-light-badge abb-light-mixed">posizioni diverse</span>
                    )}
                  </div>
                  <h3 className="abb-card-name">{g.name}</h3>
                  {g.description && <p className="abb-card-desc">{g.description}</p>}
                  <div className="abb-plants">
                    {g.plant_group_members.map((m) => (
                      <PhotoBadge
                        key={m.plants.id}
                        name={`${lightConfig[m.plants.light].icon} ${m.plants.name}`}
                        imagePath={m.plants.image_path || null}
                        className="abb-plant-tag"
                        style={{ background: categoryBg(m.plants.category) }}
                        title={lightConfig[m.plants.light].label}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Luce */}
        <section className="abb-section">
          <h2 className="abb-section-title">Per esigenza di luce</h2>
          <p className="abb-section-desc">Piante con lo stesso requisito luminoso — posizionali nella stessa zona del terrazzo.</p>
          <div className="light-grid">
            {(Object.entries(lightConfig) as [LightLevel, typeof lightConfig[LightLevel]][]).map(([key, cfg]) => (
              <div key={key} className={`light-col light-col-${key}`}>
                <div className="light-col-header">
                  <span className="light-icon">{cfg.icon}</span>
                  <div>
                    <div className="light-label">{cfg.label}</div>
                    <div className="light-desc">{cfg.desc}</div>
                  </div>
                </div>
                <div className="light-plants">
                  {byLight[key].map((p) => (
                    <PhotoBadge
                      key={p.id}
                      name={p.name}
                      imagePath={p.image_path || null}
                      className="light-plant-tag"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        Terrazzo · abbinamenti basati su sinergie reali
      </footer>
    </>
  );
}
