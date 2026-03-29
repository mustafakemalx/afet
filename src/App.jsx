import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { AlertTriangle, Orbit, Radar, WifiOff, Bell, BellRing, Info, CheckCircle, X, RefreshCw, Trash2, BookOpen, Truck } from 'lucide-react';
import MapComponent from './components/MapComponent';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import './index.css';

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5001';

function getSite(scenario, siteId) {
  return scenario?.sites?.find((site) => site.id === siteId) || null;
}

function App() {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedStartSiteId, setSelectedStartSiteId] = useState('');
  const [selectedEndSiteId, setSelectedEndSiteId] = useState('');
  const [routeData, setRouteData] = useState(null);
  const [activeRouteKey, setActiveRouteKey] = useState('safest');
  const [dispatchActive, setDispatchActive] = useState(false);
  const [scanPulse, setScanPulse] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRouting, setIsRouting] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [mapStyle, setMapStyle] = useState('street');
  const [isOffline, setIsOffline] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Base state
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);

  const addNotification = (msg, type = 'info') => {
    const id = Date.now() + Math.random();
    const newNotif = {
      id,
      message: msg,
      type,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      toast: true
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
    setTimeout(() => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, toast: false } : n));
    }, 4500);
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleOffline = () => {
    const next = !isOffline;
    setIsOffline(next);
    if (next) {
      addNotification('Mesh Ağı Aktif (Offline Mod). Veriler önbellekten okunuyor.', 'danger');
    } else {
      addNotification('Uydu ve İnternet bağlantısı sağlandı. Online mod devrede.', 'success');
    }
  };

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/scenarios`);
        const incomingScenarios = response.data || [];
        setScenarios(incomingScenarios);

        if (incomingScenarios.length > 0) {
          const firstScenario = incomingScenarios[0];
          setActiveInfoWindow(null);
          setSelectedScenario(firstScenario);
          setSelectedStartSiteId(firstScenario.defaultRoute.startSiteId);
          setSelectedEndSiteId(firstScenario.defaultRoute.endSiteId);
          await fetchRoute(firstScenario, firstScenario.defaultRoute.startSiteId, firstScenario.defaultRoute.endSiteId, false);
        }
      } catch (error) {
        console.error('Failed to load scenarios', error);
      } finally {
        setLoading(false);
        addNotification('Quicpass Komuta Konsolu Başlatıldı.', 'success');
      }
    };

    loadScenarios();
  }, []);

  const fetchRoute = async (scenario, startSiteId, endSiteId, withScanAnimation = true) => {
    if (!scenario) {
      return;
    }

    const startSite = getSite(scenario, startSiteId);
    const endSite = getSite(scenario, endSiteId);
    if (!startSite || !endSite) {
      return;
    }

    setIsRouting(true);
    setDispatchActive(false);

    if (withScanAnimation) {
      setScanPulse(true);
      addNotification('Yerli uydu taraması ve rota yeniden hesaplanıyor...', 'info');
    } else {
      addNotification('Güvenli rota yeniden oluşturuluyor...', 'info');
    }

    try {
      const response = await axios.post(`${API_BASE}/api/route`, {
        scenarioId: scenario.id,
        start: startSite.coords,
        end: endSite.coords,
        includeContingency: true,
      });

      setRouteData(response.data);
      setSelectedScenario(response.data.scenario);
      setActiveRouteKey(response.data.analysis?.recommendedMode || 'safest');
      addNotification('Görev koridoru hazır. En güvenli rota aktif.', 'success');
      if (response.data.scenario.stats.criticalCount >= 2) {
         setTimeout(() => addNotification(`${response.data.scenario.city} görev alanında kritik bulgular var!`, 'danger'), 800);
      }
    } catch (error) {
      console.error('Route request failed', error);
      addNotification('Rota hesaplanamadı veya AFAD sunucusuna ulaşılamadı.', 'danger');
    } finally {
      setIsRouting(false);
      window.setTimeout(() => setScanPulse(false), 900);
    }
  };

  // Automatically trigger a map view focus when notifications arrive
  useEffect(() => {
    // Left intentionally blank. The system only tracks visual events now.
  }, [scanPulse, isOffline, selectedScenario, routeData]);

  const handleScenarioSelect = (scenarioId) => {
    const scenario = scenarios.find((entry) => entry.id === scenarioId);
    if (!scenario) {
      return;
    }

    const nextStart = scenario.defaultRoute.startSiteId;
    const nextEnd = scenario.defaultRoute.endSiteId;

    setSelectedScenario(scenario);
    setSelectedStartSiteId(nextStart);
    setSelectedEndSiteId(nextEnd);
    setDispatchActive(false); // Immediately stop vehicle logic when swapping cities
    setRouteData(null);
    addNotification(`${scenario.city} görev alanı yükleniyor...`, 'neutral');
    fetchRoute(scenario, nextStart, nextEnd, true);
  };

  const handleRefresh = () => {
    fetchRoute(selectedScenario, selectedStartSiteId, selectedEndSiteId, true);
  };

  const handleRouteUpdate = (startSiteId = selectedStartSiteId, endSiteId = selectedEndSiteId) => {
    fetchRoute(selectedScenario, startSiteId, endSiteId, false);
  };

  const handleStartChange = (siteId) => {
    setSelectedStartSiteId(siteId);
    const siteLabel = getSite(selectedScenario, siteId)?.label;
    addNotification(`Çıkış noktası ${siteLabel} olarak güncellendi.`, 'neutral');
    handleRouteUpdate(siteId, selectedEndSiteId);
  };

  const handleEndChange = (siteId) => {
    setSelectedEndSiteId(siteId);
    const siteLabel = getSite(selectedScenario, siteId)?.label;
    addNotification(`Varış hedefi ${siteLabel} olarak güncellendi.`, 'neutral');
    handleRouteUpdate(selectedStartSiteId, siteId);
  };

  if (loading) {
    return (
      <div className="launch-screen">
        <div className="launch-core">
          <Orbit size={42} />
        </div>
        <h1>Quicpass Mission Console</h1>
        <p>Uydu tarama, risk birleştirme ve güvenli koridor motoru başlatılıyor.</p>
      </div>
    );
  }

  const alertState = selectedScenario?.stats?.criticalCount >= 2;
  const activeStart = getSite(selectedScenario, selectedStartSiteId);
  const activeEnd = getSite(selectedScenario, selectedEndSiteId);

  return (
    <div className="app-shell">
      <Sidebar
        scenarios={scenarios}
        selectedScenario={selectedScenario}
        selectedStartSiteId={selectedStartSiteId}
        selectedEndSiteId={selectedEndSiteId}
        onScenarioSelect={handleScenarioSelect}
        onStartChange={handleStartChange}
        onEndChange={handleEndChange}
        onRefresh={handleRefresh}
        routeData={routeData}
        dispatchActive={dispatchActive}
        setDispatchActive={setDispatchActive}
        theme={theme}
        setTheme={setTheme}
        mapStyle={mapStyle}
        setMapStyle={setMapStyle}
        isRouting={isRouting}
        isOffline={isOffline}
        toggleOffline={toggleOffline}
      />

      <div className="notif-fixed-wrapper">
        <button className="notif-bell" onClick={() => setIsGuideOpen(true)} title="Kullanım Kılavuzu">
           <BookOpen size={20} />
        </button>
        <button className="notif-bell" onClick={handleRefresh} disabled={isRouting} title="Verileri Güncelle">
           <RefreshCw size={20} className={isRouting ? 'spin' : ''} />
        </button>
        <div className="notif-bell" onClick={() => setIsNotifOpen(!isNotifOpen)}>
           {notifications.length > 0 ? <BellRing size={20} /> : <Bell size={20} />}
           {notifications.length > 0 && <div className="notif-badge">{notifications.length > 9 ? '9+' : notifications.length}</div>}
        </div>
        {isNotifOpen && (
          <div className="notif-dropdown">
            <div className="notif-header">
              <span>Bildirim Geçmişi</span>
              <X size={18} style={{cursor:'pointer'}} onClick={() => setIsNotifOpen(false)} />
            </div>
            <div className="notif-body">
              {notifications.length === 0 ? (
                <div className="empty-notif">Henüz bildirim yok.</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`notif-item type-${n.type}`}>
                     <div style={{flex: 1}}>
                       <div>{n.message}</div>
                       <div className="notif-time">{n.time}</div>
                     </div>
                     <Trash2 size={14} className="notif-delete" onClick={() => deleteNotification(n.id)} />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {isGuideOpen && (
        <div className="guide-modal-overlay" onClick={() => setIsGuideOpen(false)}>
          <div className="guide-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="guide-header">
              <h2><BookOpen size={22} style={{ marginRight: '8px' }}/> Quicpass Kullanım Kılavuzu</h2>
              <button className="close-guide" onClick={() => setIsGuideOpen(false)}><X size={24} /></button>
            </div>
            <div className="guide-body">
              <section>
                <h3>1. Sistemin Amacı ve Hedefi</h3>
                <p><strong>Quicpass (Akıllı Afet Yönetimi Sistemi)</strong>, afet alanlarında sahadan gelen anlık uydu verileri ve sensör bildirimlerini işleyerek <strong>yapay zeka (AI) güdümlü güvenli kargo/kurtarma rotaları</strong> çizen proaktif bir komuta ekranıdır.</p>
              </section>

              <hr />

              <section>
                <h3>2. Harita Göstergeleri</h3>
                <ul>
                  <li><strong style={{color: '#ef4444'}}>Kırmızı Çemberler:</strong> Uydu analizinden veya sahadan bildirilen <em>Enkaz Alanı / Yapısal Çökme</em> bölgelerini temsil eder. Araçlar bu bölgelere girmemelidir.</li>
                  <li><strong style={{color: '#22c55e'}}>Yeşil Parçalı Çizgi:</strong> <strong>A* Navigasyon Algoritması</strong> ile çizilen "En Güvenli Rota". Enkazın haritası çıkarıldıkça anlık olarak yolunu değiştirir.</li>
                  <li><strong style={{color: '#f59e0b'}}>Turuncu / Mavi İkonlar:</strong> Sırasıyla toplanma alanları ve komuta/lojistik üslerini temsil eder. Ulaşım buralar arasında sağlanır.</li>
                </ul>
              </section>

              <hr />

              <section>
                <h3>3. Canlı Sensörler ve Raporlama</h3>
                <p>Sistem, anlık olarak <strong>Open-Meteo Weather API</strong> kullanarak görev alanının canlı meteorolojik verilerini sağlar. Paneldeki "Risk & Meteoroloji" sekmesinde saniyede rüzgar hızı (km/sa), nem ve sıcaklık oynamalarını <em>canlı sarsıntı/sensör</em> verisi gibi hissedebilirsiniz. Bu, olası çadır kent alanlarının şartlarının bilinmesi için hayatidir.</p>
                <p>Zaman ilerledikçe, Afet sekmesindeki "Ortalama Etkilenen Nüfus" sayısının zamanla nasıl yavaş yavaş raporlanıp yükseldiğini görebilirsiniz.</p>
              </section>

              <hr />

              <section>
                <h3>4. Yapay Zeka (AI) Kaynak Optimizasyonu</h3>
                <p>Uygulamamızın sol tarafındaki <strong>Akıllı Dağıtım Analizi</strong>, tamamen etkilenen canlı nüfusa oranla optimize edilmektedir. Nüfus dinamik olarak arttıkça; sistemin ihtiyaç duyduğu çadır, içme suyu, personel, ambulans ve ağır iş makinesi sayıları <strong>dünya standartlarına (WHO / SPHERE) göre</strong> otomatik olarak milisaniyeler içinde tekrar hesaplanır ve güncellenir.</p>
              </section>

              <hr />

              <section>
                <h3>5. Offline / Mesh Ağı Modu</h3>
                <p>İletişim altyapısının çökmesi durumunda sol alttan aktifleştirilen "Offline Mod", uygulamanın yerel bellekteki en son başarılı haritalandırmaları üzerinden çalışmasını sağlar. Yeni veri gelmese bile sahadaki araç ilerlemeye devam edebilir.</p>
              </section>

              <div className="guide-footer">
                <p><em>Afet yönetiminde her saniye önemlidir.</em></p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="workspace">
        <section className="mission-strip">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div>
              <p className="eyebrow">Afet Yönetiminde Yerli Uydu Verisi Entegrasyonu</p>
              <h1>{selectedScenario?.name}</h1>
              <p className="mission-brief">{selectedScenario?.mission?.brief}</p>
            </div>
            <button className="base-btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '1.05rem' }} onClick={() => {
              setDispatchActive(true);
            }}>
              <Truck size={20} />
              Saha Ekiplerini Sevk Et
            </button>
          </div>
        </section>

        <section className="map-stage">
          <MapComponent
            scenario={selectedScenario}
            routeData={routeData}
            mapStyle={mapStyle}
            activeRouteKey={activeRouteKey}
            dispatchActive={dispatchActive}
            activeInfoWindow={activeInfoWindow}
            setActiveInfoWindow={setActiveInfoWindow}
            simVehicleType={'truck'}
            simVehicleDir={1}
            isSimulation={false}
          />
          <Dashboard
            scenario={selectedScenario}
            routeData={routeData}
            activeRouteKey={activeRouteKey}
            setActiveRouteKey={setActiveRouteKey}
            activeInfoWindow={activeInfoWindow}
            setActiveInfoWindow={setActiveInfoWindow}
          />
        </section>
      </main>

      <div className="toast-container">
        {notifications.filter(n => n.toast).slice(0, 4).map((n, i, arr) => (
          <div key={`toast-${n.id}`} className={`toast toast-${n.type}`} style={{ opacity: 1 - (i * 0.2) }}>
            {n.type === 'danger' && <AlertTriangle size={20} />}
            {n.type === 'success' && <CheckCircle size={20} />}
            {n.type === 'info' && <Orbit size={20} className={scanPulse ? 'spin' : ''} />}
            {n.type === 'neutral' && <Info size={20} />}
            <div>{n.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
