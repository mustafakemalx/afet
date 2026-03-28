import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, Orbit, Radar, WifiOff, Bell, BellRing, Info, CheckCircle, X, RefreshCw, Trash2 } from 'lucide-react';
import MapComponent from './components/MapComponent';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import './index.css';

const API_BASE = 'http://localhost:5001';

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
  const [mapStyle, setMapStyle] = useState('satellite');
  const [isOffline, setIsOffline] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

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
          setSelectedScenario(firstScenario);
          setSelectedStartSiteId(firstScenario.defaultRoute.startSiteId);
          setSelectedEndSiteId(firstScenario.defaultRoute.endSiteId);
          await fetchRoute(firstScenario, firstScenario.defaultRoute.startSiteId, firstScenario.defaultRoute.endSiteId, false);
        }
      } catch (error) {
        console.error('Failed to load scenarios', error);
        setStatusText('Senaryo verisi yüklenemedi');
      } finally {
        setLoading(false);
        addNotification('BKZS Komuta Konsolu Başlatıldı.', 'success');
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
        <h1>BKZS Mission Console</h1>
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

      <main className="workspace">
        <section className="mission-strip">
          <div>
            <p className="eyebrow">Afet Yönetiminde Yerli Uydu Verisi Entegrasyonu</p>
            <h1>{selectedScenario?.name}</h1>
            <p className="mission-brief">{selectedScenario?.mission?.brief}</p>
          </div>
        </section>

        <section className="map-stage">
          <MapComponent
            scenario={selectedScenario}
            routeData={routeData}
            mapStyle={mapStyle}
            activeRouteKey={activeRouteKey}
            dispatchActive={dispatchActive}
          />
          <Dashboard
            scenario={selectedScenario}
            routeData={routeData}
            activeRouteKey={activeRouteKey}
            setActiveRouteKey={setActiveRouteKey}
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
