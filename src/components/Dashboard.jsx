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
  activeInfoWindow,
  setActiveInfoWindow,
}) {
  const [timelineHour, setTimelineHour] = useState(0);
  const [liveOffset, setLiveOffset] = useState({ mag: 0, pop: 0, haz: 0, blk: 0 });

  useEffect(() => {
    if (!scenario) return;
    
    // Şehir değiştiğinde offset'i sıfırlıyoruz ki saçma farklar oluşmasın
    setLiveOffset({ mag: 0, pop: 0, haz: 0, blk: 0, temp: 0, humid: 0, wind: 0 });

    const interval = setInterval(() => {
      setLiveOffset(prev => ({
        // Şiddet değeri sabittir, revizyonlar çok nadir olur (burada sabit bırakıyoruz)
        mag: prev.mag,
        
        // Etkilenen nüfus zamanla yavaşça artar (yeni hasar tespitleri vb.)
        // Her 3 saniyede 0 ila 4 kişi ekleniyor (saatte ~2400 kişi)
        pop: prev.pop + Math.floor(Math.random() * 5), 
        
        // Kapalı yol veya tespit edilen tehlikeler çok nadir güncellenir
        haz: prev.haz + (Math.random() > 0.98 ? 1 : 0), 
        blk: prev.blk + (Math.random() > 0.98 ? 1 : 0),
        
        // Meteoroloji istasyonu canlı sensör simülasyonu (birikimsiz/driftsiz sabit radyo oynamaları)
        temp: (Math.random() * 0.2 - 0.1), // ±0.1 derece oynama çok yavaş ve gerçekçi
        humid: Math.floor(Math.random() * 2) === 1 ? 1 : 0, // Sadece 0 veya 1 (çok nadir oynar)
        wind: (Math.random() * 0.6 - 0.3), // ±0.3 km/sa oynama
      }));
    }, 4500); // 4.5 saniyede bir güncellenerek daha sakin kalacak
    
    return () => clearInterval(interval);
  }, [scenario?.id]);

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
  
  // Şiddeti gerçekçi seviyeye çekiyoruz (Depremler 5.7 ile 8 arasında kalsın istendi)
  // severityVal aralığı: Trabzon (~0.45) - Hatay (~0.9)
  // Bunu 5.7 - 8.0 aralığına oturtmak için: val * 3.5 + 4.5 kullanıyoruz:
  const baseMag = severityVal > 0 ? (severityVal * 3.5 + 4.5) : 0;
  // 5.7 ile 8.0 arası kesilecek şekilde clamp:
  const clampedMag = Math.max(5.7, Math.min(8.0, baseMag));
  const magnitude = clampedMag > 0 ? (clampedMag + liveOffset.mag).toFixed(1) : '0.0';

  // Etkilenen nüfusu hesapla ve canlı artış ekle
  const baseCityPop = CITY_POPULATION[scenario?.city] || 1500000;
  const impactMultiplier = severityVal * (scenario?.stats?.hazardCount || 1) * 0.08;
  const rawAffectedPop = Math.floor(baseCityPop * impactMultiplier);
  const livePop = rawAffectedPop > 0 ? Math.max(0, rawAffectedPop + liveOffset.pop) : 0;
  const affectedPop = livePop > 0 ? livePop.toLocaleString('tr-TR') : '0';

  const baseHaz = scenario?.stats?.hazardCount ?? 0;
  const displayHaz = baseHaz > 0 ? Math.max(0, baseHaz + liveOffset.haz) : 0;

  const baseBlk = scenario?.stats?.blockedSegments ?? 0;
  const displayBlk = baseBlk > 0 ? Math.max(0, baseBlk + liveOffset.blk) : 0;

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
              <strong style={{fontSize: '0.95rem'}}>Quicpass Komuta Konsolu Aktif</strong>
              <p style={{margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)'}}>
                {scenario?.city} görev alanı • {displayHaz} aktif tehdit
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
        <div className="earthquake-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
          {scenario?.hazards?.length === 0 ? (
             <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '12px' }}>Olay bekleniyor...</div>
          ) : (
            scenario?.hazards?.map((hazard, idx) => (
              <div
                key={hazard.id}
                className={`incident-row flash-new ${hazard.id === activeInfoWindow ? 'active-incident' : ''}`}
                onClick={() => setActiveInfoWindow(hazard.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="incident-index">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff' }}>{hazard.label}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Etki Alanı: Merkez ({(idx * 15) + 3} sn. önce eklendi)</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--rose)' }}>{(hazard.severity * 10).toFixed(1)} Şiddet</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hazard.radiusKm} km çap</span>
                </div>
              </div>
            ))
          )}
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
            <span style={{ transition: 'color 0.3s' }}>🌡️ {(((scenario?.weather?.temperatureC ?? 0) + (liveOffset.temp || 0))).toFixed(1)}°C</span>
          </div>
          <div>
            <Waves size={15} />
            <span style={{ transition: 'color 0.3s' }}>{Math.max(0, Math.round((scenario?.weather?.humidity ?? 0) + (liveOffset.humid || 0)))}% nem</span>
          </div>
          <div>
            <Wind size={15} />
            <span style={{ transition: 'color 0.3s' }}>{Math.max(0, (scenario?.weather?.windKmh ?? 0) + (liveOffset.wind || 0)).toFixed(1)} km/sa</span>
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
            <strong>{scenario ? Math.floor(livePop / 12).toLocaleString('tr-TR') : 0} Adet</strong>
          </div>
          <div className="metric-card">
            <div style={{display:'flex', alignItems:'center', gap:'4px'}}><Droplets size={14} /> <span>Su İhtiyacı</span></div>
            <strong>{scenario ? Math.floor(livePop / 1500).toLocaleString('tr-TR') : 0} Ton</strong>
          </div>
          <div className="metric-card">
            <div style={{display:'flex', alignItems:'center', gap:'4px'}}><Truck size={14} /> <span>Ambulans</span></div>
            <strong>{scenario ? Math.floor(livePop / 4500).toLocaleString('tr-TR') : 0} Araç</strong>
          </div>
          <div className="metric-card">
            <div style={{display:'flex', alignItems:'center', gap:'4px'}}><Users size={14} /> <span>Personel</span></div>
            <strong>{scenario ? Math.floor(livePop / 800).toLocaleString('tr-TR') : 0} Ekip</strong>
          </div>
          <div className="metric-card">
            <div style={{display:'flex', alignItems:'center', gap:'4px', color:'var(--rose)'}}><Activity size={14} /> <span>S. Hastane</span></div>
            <strong>{scenario ? Math.max(2, Math.floor(livePop / 35000)) : 0} Birim</strong>
          </div>
          <div className="metric-card">
            <div style={{display:'flex', alignItems:'center', gap:'4px', color:'var(--amber)'}}><ShieldCheck size={14} /> <span>Kışla/Ordu</span></div>
            <strong>{scenario ? Math.max(1, Math.floor(livePop / 65000)) : 0} Tabur</strong>
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
          <span>Quicpass zaman penceresi</span>
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
