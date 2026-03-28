import React, { useState, useEffect } from 'react';
import { ArrowRight, BarChart3, Route, Satellite, ShieldCheck, Waves, Wind, Boxes, Droplets, Tent, Clock, Truck, Activity, AlertTriangle, Users, MapPin } from 'lucide-react';

const TYPE_LABELS = {
  debris: 'Enkaz',
  collapse: 'Yapı hasarı',
  flood: 'Su baskını',
  bridge: 'Köprü riski',
  fire: 'Yangın',
  gas: 'Gaz riski',
  landslide: 'Heyelan',
};

const ROUTE_COPY = {
  safest: 'Primer güvenli koridor',
  balanced: 'Dengeli geçiş',
  shortest: 'Kısa ama riskli hat',
  contingency: 'Yedek acil hat',
};

const TIMELINE_DATA = [
  { hour: 0, label: 'Afet Anı', phase: 'İlk Şok & Değerlendirme', detail: 'Uydu görüntüleri alınıyor, hasar tespiti başlıyor', severity: 100, color: '#ef4444' },
  { hour: 1, label: 'T+1 Saat', phase: 'Acil Müdahale', detail: 'AFAD ekipleri yola çıkıyor, ilk triage başlıyor', severity: 95, color: '#ef4444' },
  { hour: 3, label: 'T+3 Saat', phase: 'Arama & Kurtarma', detail: 'Enkaz altı taramaları devam ediyor, köpek timleri aktif', severity: 88, color: '#f97316' },
  { hour: 6, label: 'T+6 Saat', phase: 'Pik İhtiyaç Dönemi', detail: 'Sıvı, barınma ve tıbbi malzeme talebi en üst seviyede', severity: 80, color: '#f97316' },
  { hour: 12, label: 'T+12 Saat', phase: 'Koordinasyon', detail: 'Lojistik hatlar oluşturuluyor, yardım koridorları aktif', severity: 55, color: '#eab308' },
  { hour: 18, label: 'T+18 Saat', phase: 'Stabilizasyon', detail: 'Kritik vakaların çoğu tahliye edildi, barınma kurulumu', severity: 35, color: '#22c55e' },
  { hour: 24, label: 'T+24 Saat', phase: 'Koridor Stabil', detail: 'Tüm güvenli geçiş hatları açık, lojistik akışı düzenli', severity: 15, color: '#22c55e' },
];

function toneForRoute(routeKey) {
  if (routeKey === 'safest') return 'positive';
  if (routeKey === 'shortest') return 'danger';
  if (routeKey === 'contingency') return 'neutral';
  return 'warning';
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="live-clock">
      <div className="live-dot" />
      <span>{time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      <span className="live-date">{time.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
    </div>
  );
}

export default function Dashboard({
  scenario,
  routeData,
  activeRouteKey,
  setActiveRouteKey,
}) {
  const [timelineHour, setTimelineHour] = useState(0);

  const routeEntries = routeData?.routes
    ? Object.entries(routeData.routes).filter(([, route]) => Boolean(route))
    : [];

  const hazardEntries = Object.entries(scenario?.stats?.countsByType || {});
  const currentTimeline = TIMELINE_DATA.reduce((prev, curr) => curr.hour <= timelineHour ? curr : prev, TIMELINE_DATA[0]);

  const CITY_POPULATION = {
    'Hatay': 1686000,
    'İzmir': 4462000,
    'İstanbul': 15655000,
    'Trabzon': 818000,
  };

  const severityVal = parseFloat(scenario?.stats?.averageSeverity || 0);
  
  // Şiddeti gerçekçi seviyeye çekiyoruz (örn. 0.9 severity için 7.6 gibi)
  const magnitude = severityVal > 0 
    ? (severityVal * 4.5 + 3.5).toFixed(1) 
    : '0.0';

  // Etkilenen nüfusu, doğrudan şehrin total nüfusuna ve felaket şiddetine orantılıyoruz
  const basePop = CITY_POPULATION[scenario?.city] || 1500000;
  const impactMultiplier = severityVal * (scenario?.stats?.hazardCount || 1) * 0.08;
  const rawAffectedPop = Math.floor(basePop * impactMultiplier);
  const affectedPop = scenario 
    ? rawAffectedPop.toLocaleString('tr-TR') 
    : '0';

  return (
    <aside className="dashboard dashboard-grid">

      {/* Canlı Durum Paneli */}
      <div className="panel floating-panel dashboard-card" style={{gridColumn: '1 / -1'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div className="system-pulse">
              <Activity size={18} />
            </div>
            <div>
              <strong style={{fontSize: '0.95rem'}}>BKZS Komuta Konsolu Aktif</strong>
              <p style={{margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)'}}>
                {scenario?.city} görev alanı • {scenario?.stats?.hazardCount || 0} aktif tehdit
              </p>
            </div>
          </div>
          <LiveClock />
        </div>
      </div>

      {/* Deprem & Etki Kartları */}
      <div className="panel floating-panel dashboard-card" style={{gridColumn: '1 / -1'}}>
        <div className="section-title">
          <AlertTriangle size={16} />
          <span>Afet Etki Özeti</span>
        </div>
        <div className="metric-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
          <div className="metric-card impact-card">
            <span>Deprem Şiddeti</span>
            <strong style={{fontSize: '1.4rem', color: 'var(--rose)'}}>{magnitude}</strong>
            <div className="severity-bar">
              <div className="severity-fill" style={{width: `${Math.min(parseFloat(magnitude) * 10, 100)}%`}} />
            </div>
          </div>
          <div className="metric-card impact-card">
            <div style={{display:'flex', alignItems:'center', gap: '4px'}}><Users size={14} /> <span>Etkilenen Nüfus</span></div>
            <strong style={{color: 'var(--amber)'}}>{affectedPop}</strong>
          </div>
          <div className="metric-card impact-card">
            <div style={{display:'flex', alignItems:'center', gap: '4px'}}><MapPin size={14} /> <span>Tehdit Noktası</span></div>
            <strong>{scenario?.stats?.hazardCount ?? 0}</strong>
          </div>
          <div className="metric-card impact-card">
            <span>Kapalı Segment</span>
            <strong style={{color: 'var(--rose)'}}>{scenario?.stats?.blockedSegments ?? 0}</strong>
          </div>
        </div>
      </div>

      {/* AI Tespit Dağılımı */}
      <div className="panel floating-panel dashboard-card">
        <div className="section-title">
          <BarChart3 size={16} />
          <span>AI tespit dağılımı</span>
        </div>

        <div className="stack-list">
          {hazardEntries.map(([type, count]) => {
            const width = `${Math.max(24, (count / Math.max(scenario.stats.hazardCount, 1)) * 100)}%`;
            return (
              <div key={type} className="stack-row">
                <div className="stack-copy">
                  <strong>{TYPE_LABELS[type] || type}</strong>
                  <span>{count} bulgu</span>
                </div>
                <div className="stack-bar">
                  <div className="stack-fill" style={{ width }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk Katmanları & Hava Durumu */}
      <div className="panel floating-panel dashboard-card">
          <div className="section-title">
            <ShieldCheck size={16} />
            <span>Risk & Meteoroloji</span>
          </div>

        <div className="metric-grid compact">
          <div className="metric-card">
            <span>Hazırlılık</span>
            <strong>{scenario?.stats?.readinessScore ?? 0}</strong>
          </div>
          <div className="metric-card">
            <span>Ort. Şiddet</span>
            <strong>{scenario?.stats?.averageSeverity ?? 0}</strong>
          </div>
        </div>

        <div className="weather-strip">
          <div>
            <span>🌡️ {scenario?.weather?.temperatureC ?? 0}°C</span>
          </div>
          <div>
            <Waves size={15} />
            <span>{scenario?.weather?.humidity ?? 0}% nem</span>
          </div>
          <div>
            <Wind size={15} />
            <span>{scenario?.weather?.windKmh ?? 0} km/sa</span>
          </div>
          <div>
            <span>👁 {scenario?.weather?.visibilityKm ?? 0} km</span>
          </div>
          {scenario?.weather?.condition && (
            <div>
              <span>☁️ {scenario.weather.condition}</span>
            </div>
          )}
          {scenario?.weather?.feelsLikeC != null && (
            <div>
              <span>🤒 {scenario.weather.feelsLikeC}°C his.</span>
            </div>
          )}
        </div>
      </div>

      {/* Koridor Karşılaştırması */}
      <div className="panel floating-panel dashboard-card">
        <div className="section-title">
          <Route size={16} />
          <span>Koridor karşılaştırması</span>
        </div>

        <div className="mini-route-list compact-route-list route-grid-list">
          {routeEntries.map(([routeKey, route]) => (
            <button
              type="button"
              key={routeKey}
              className={`mini-route-card tone-${toneForRoute(routeKey)} ${activeRouteKey === routeKey ? 'is-active' : ''}`}
              onClick={() => setActiveRouteKey(routeKey)}
            >
              <div>
                <strong>{ROUTE_COPY[routeKey] || routeKey}</strong>
                <p>{route.distanceKm} km</p>
              </div>
              <div>
                <strong>{route.etaMinutes} dk</strong>
                <p>risk {route.riskScore}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Neden Bu Rota */}
      {routeData?.analysis && (
        <div className="panel floating-panel dashboard-card">
          <div className="section-title">
            <ArrowRight size={16} />
            <span>Neden bu rota?</span>
          </div>

          <div className="analysis-card analysis-grid-card">
            <div className="analysis-stat">
              <span>Risk azalımı</span>
              <strong>%{Math.round(routeData.analysis.riskReductionPercent || 0)}</strong>
            </div>
            <div className="analysis-stat">
              <span>Kaçınılan hücre</span>
              <strong>{routeData.analysis.avoidedBlockedCells}</strong>
            </div>
            <div className="analysis-stat">
              <span>Tarama kapsamı</span>
              <strong>{routeData.analysis.scanSummary.sectorsScanned}</strong>
            </div>
          </div>

          <div className="bullet-list compact-bullet-list">
            {(routeData.analysis.brief || []).map((line) => (
              <div key={line} className="bullet-item">
                <span className="bullet-dot" />
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Kaynak Dağıtım Asistanı */}
      <div className="panel floating-panel dashboard-card">
        <div className="section-title">
          <Boxes size={16} />
          <span>AI Kaynak Dağıtım Asistanı</span>
        </div>
        <div className="metric-grid compact" style={{gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '10px'}}>
          <div className="metric-card">
            <div style={{display:'flex', alignItems:'center', gap:'4px'}}><Tent size={14} /> <span>Çadır (Ort.)</span></div>
            <strong>{scenario ? Math.floor(rawAffectedPop / 12).toLocaleString('tr-TR') : 0} Adet</strong>
          </div>
          <div className="metric-card">
            <div style={{display:'flex', alignItems:'center', gap:'4px'}}><Droplets size={14} /> <span>Su İhtiyacı</span></div>
            <strong>{scenario ? Math.floor(rawAffectedPop / 1500).toLocaleString('tr-TR') : 0} Ton</strong>
          </div>
          <div className="metric-card">
            <div style={{display:'flex', alignItems:'center', gap:'4px'}}><Truck size={14} /> <span>Ambulans</span></div>
            <strong>{scenario ? Math.floor(rawAffectedPop / 4500).toLocaleString('tr-TR') : 0} Araç</strong>
          </div>
          <div className="metric-card">
            <div style={{display:'flex', alignItems:'center', gap:'4px'}}><Users size={14} /> <span>Personel</span></div>
            <strong>{scenario ? Math.floor(rawAffectedPop / 800).toLocaleString('tr-TR') : 0} Ekip</strong>
          </div>
          <div className="metric-card">
            <div style={{display:'flex', alignItems:'center', gap:'4px', color:'var(--rose)'}}><Activity size={14} /> <span>S. Hastane</span></div>
            <strong>{scenario ? Math.max(2, Math.floor(rawAffectedPop / 35000)) : 0} Birim</strong>
          </div>
          <div className="metric-card">
            <div style={{display:'flex', alignItems:'center', gap:'4px', color:'var(--amber)'}}><ShieldCheck size={14} /> <span>Kışla/Ordu</span></div>
            <strong>{scenario ? Math.max(1, Math.floor(rawAffectedPop / 65000)) : 0} Tabur</strong>
          </div>
        </div>
      </div>

      {/* İnteraktif 24 Saatlik Zaman Çizelgesi */}
      <div className="panel floating-panel dashboard-card" style={{gridColumn: '1 / -1'}}>
        <div className="section-title">
          <Clock size={16} />
          <span>24 Saatlik Tahmin Çizelgesi</span>
        </div>

        <div className="timeline-interactive">
          <div className="timeline-current-phase" style={{borderLeftColor: currentTimeline.color}}>
            <div className="timeline-phase-header">
              <strong style={{color: currentTimeline.color}}>{currentTimeline.label}</strong>
              <span className="timeline-phase-name">{currentTimeline.phase}</span>
            </div>
            <p>{currentTimeline.detail}</p>
            <div className="severity-bar" style={{marginTop: '8px'}}>
              <div className="severity-fill" style={{
                width: `${currentTimeline.severity}%`,
                background: `linear-gradient(90deg, ${currentTimeline.color}, ${currentTimeline.color}88)`
              }} />
            </div>
            <span style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>Risk seviyesi: %{currentTimeline.severity}</span>
          </div>

          <div className="timeline-slider-area">
            <input
              type="range"
              min="0"
              max="24"
              value={timelineHour}
              onChange={(e) => setTimelineHour(parseInt(e.target.value))}
              className="timeline-slider"
            />
            <div className="timeline-markers">
              {TIMELINE_DATA.map(t => (
                <div key={t.hour} className="timeline-marker" style={{left: `${(t.hour / 24) * 100}%`}}>
                  <div className="marker-dot" style={{background: t.color}} />
                </div>
              ))}
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px'}}>
              <span>0s</span><span>6s</span><span>12s</span><span>18s</span><span>24s</span>
            </div>
          </div>
        </div>
      </div>

      {/* BKZS Zaman Penceresi */}
      <div className="panel floating-panel dashboard-card" style={{gridColumn: '1 / -1'}}>
        <div className="section-title">
          <Satellite size={16} />
          <span>BKZS zaman penceresi</span>
        </div>

        <div className="compact-timeline-list timeline-stat-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
          <div className="timeline-stat">
            <span>Son tarama</span>
            <strong>{scenario?.mission?.scanAgeMinutes} dk</strong>
            <p>güncellendi</p>
          </div>
          <div className="timeline-stat">
            <span>AI güven</span>
            <strong>%{Math.round((scenario?.mission?.confidence || 0) * 100)}</strong>
            <p>doğrulama</p>
          </div>
          <div className="timeline-stat">
            <span>Aktif rota</span>
            <strong>{ROUTE_COPY[activeRouteKey] || activeRouteKey}</strong>
            <p>haritada vurgulanıyor</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
