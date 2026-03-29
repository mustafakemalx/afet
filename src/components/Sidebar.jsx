import React from 'react';
import {
  Activity,
  Layers,
  Map,
  Moon,
  RefreshCw,
  Satellite,
  Sparkles,
  Sun,
  Truck,
  Wifi,
  WifiOff,
} from 'lucide-react';

function formatClock(isoString) {
  if (!isoString) {
    return '--:--';
  }

  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString));
}

function formatPercent(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

export default function Sidebar({
  scenarios,
  selectedScenario,
  onScenarioSelect,
  onRefresh,
  routeData,
  theme,
  setTheme,
  mapStyle,
  setMapStyle,
  dispatchActive,
  setDispatchActive,
  isRouting,
  isOffline,
  toggleOffline,
  dispatchStatus,
  setDispatchStatus,
  vehicleDir,
  setVehicleDir,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div>
          <div className="brand-row">
            <Activity size={28} />
            <div>
              <p className="eyebrow">Quicpass destekli</p>
              <h2>Mission Console</h2>
            </div>
          </div>
          <p className="muted-copy">
            Uydu tespitlerini, risk katmanlarını ve kurtarma rotalarını tek ekranda birleştiren demo.
          </p>
        </div>
        <button className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} type="button">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <section className="panel">
        <div className="section-title">
          <Sparkles size={16} />
          <span>Görev senaryoları</span>
        </div>

        <div className="scenario-grid">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              className={`scenario-card ${selectedScenario?.id === scenario.id ? 'is-selected' : ''}`}
              onClick={() => onScenarioSelect(scenario.id)}
            >
              <div>
                <strong>{scenario.city}</strong>
                <p>{scenario.mission.title}</p>
              </div>
              <span>{scenario.stats.criticalCount} kritik bulgu</span>
            </button>
          ))}
        </div>
      </section>

      {selectedScenario && (
        <section className="panel">
          <div className="section-title">
            <Satellite size={16} />
            <span>Uydu görev özeti</span>
          </div>

          <div className="metric-grid compact">
            <div className="metric-card">
              <span>Son tarama</span>
              <strong>{formatClock(selectedScenario.mission.updatedAt)}</strong>
            </div>
            <div className="metric-card">
              <span>Sonraki pencere</span>
              <strong>{formatClock(selectedScenario.mission.nextWindow)}</strong>
            </div>
            <div className="metric-card">
              <span>Çözünürlük</span>
              <strong>{selectedScenario.mission.resolutionLabel}</strong>
            </div>
            <div className="metric-card">
              <span>Güven skoru</span>
              <strong>{formatPercent(selectedScenario.mission.confidence)}</strong>
            </div>
          </div>
        </section>
      )}

      {selectedScenario && (
        <>
          <section className="panel">
            <div className="section-title">
              <Map size={16} />
              <span>Otonom Filo Operasyonları</span>
            </div>

            <div className="action-row" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <button
                className={`btn ${isOffline ? 'danger' : 'secondary'}`}
                type="button"
                onClick={toggleOffline}
              >
                {isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
                Bağlantı (Online/Mesh)
              </button>
              
              {dispatchStatus === 'idle' && (
                <button
                  className="btn primary"
                  type="button"
                  onClick={() => {
                    setDispatchActive(true);
                    setVehicleDir(1);
                    setDispatchStatus('dispatching');
                  }}
                  disabled={!routeData}
                >
                  <Truck size={16} />
                  Ekibi Sevk Et
                </button>
              )}

              {dispatchStatus === 'dispatching' && (
                <div style={{ padding: '10px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', borderRadius: '4px', color: '#38bdf8', fontWeight: 'bold', textAlign: 'center', fontSize: '13px' }}>
                  <span className="blink">Ekip Hedefe İlerliyor...</span>
                </div>
              )}

              {dispatchStatus === 'arrived' && (
                <button
                  className="btn"
                  style={{ background: 'var(--amber)', color: 'black', border: '1px solid var(--amber)' }}
                  type="button"
                  onClick={() => {
                    setVehicleDir(-1);
                    setDispatchStatus('returning');
                  }}
                >
                  <Truck size={16} style={{ transform: 'scaleX(-1)' }} />
                  Ekibi Geri Çek
                </button>
              )}

              {dispatchStatus === 'returning' && (
                <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid var(--amber)', borderRadius: '4px', color: 'var(--amber)', fontWeight: 'bold', textAlign: 'center', fontSize: '13px' }}>
                  <span className="blink">Ekip Geri Dönüyor...</span>
                </div>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="section-title">
              <Layers size={16} />
              <span>Harita katmanı</span>
            </div>

            <div className="toggle-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { id: 'street', label: 'Sokak' },
                { id: 'dark', label: 'Gece' },
                { id: 'satellite', label: 'Uydu' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`toggle-chip ${mapStyle === option.id ? 'is-active' : ''}`}
                  onClick={() => setMapStyle(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </aside>
  );
}
