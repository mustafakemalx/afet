const SCENARIOS = [
  {
    id: 'hatay-urban',
    name: 'Hatay Merkez / Antakya Kurtarma Koridoru',
    city: 'Hatay',
    center: [36.2015, 36.1607],
    bounds: [
      [36.186, 36.136],
      [36.217, 36.191],
    ],
    mission: {
      title: 'Yoğun enkaz altında güvenli ulaşım ve medikal sevk',
      brief:
        'Göktürk-1 uydu görüntüleri ve İHA termal taramaları ile Asi nehri çevresindeki taşkın ve yıkım riski analiz edilerek AFAD ekipleri ve ambulanslar için güvenli geçiş rotası oluşturulmaktadır.',
      updatedAt: new Date().toISOString(),
      nextWindow: new Date(Date.now() + 12 * 60000).toISOString(),
      scanAgeMinutes: 4,
      sourceLabel: 'Göktürk-1 Yüksek Çözünürlüklü Optik',
      resolutionLabel: '0.5.m Özel Tarama',
      scanAreaKm2: 18.4,
      confidence: 0.94,
    },
    weather: {
      temperatureC: 18,
      windKmh: 12,
      humidity: 55,
      visibilityKm: 8.5,
    },
    sites: [
      { id: 'cmd', label: 'AFAD İl Kriz ve Koordinasyon Merkezi', role: 'command', coords: [36.1948, 36.1452] },
      { id: 'log', label: 'Hatay Havalimanı Akıllı Lojistik Üssü', role: 'logistics', coords: [36.1889, 36.1738] },
      { id: 'field', label: 'Antakya Sahra Hastanesi (UMKE)', role: 'hospital', coords: [36.2108, 36.1845] },
      { id: 'shelter', label: 'Millet Bahçesi Çadırkenti', role: 'shelter', coords: [36.2141, 36.1522] },
      { id: 'rescue', label: 'Atatürk Caddesi Ağır Hasarlı Bölge', role: 'target', coords: [36.2062, 36.1764] },
    ],
    defaultRoute: { startSiteId: 'cmd', endSiteId: 'rescue' },
    hazards: [
      { id: 'hz-1', type: 'collapse', label: 'Blok Halinde Yapısal Çökme', center: [36.2002, 36.1577], radiusKm: 0.75, severity: 0.96 },
      { id: 'hz-2', type: 'debris', label: 'Ana Arter Üzeri Yığın Enkaz', center: [36.2059, 36.1699], radiusKm: 0.48, severity: 0.89 },
      { id: 'hz-3', type: 'flood', label: 'Asi Nehri Taşkın Etkisi', center: [36.1968, 36.1728], radiusKm: 0.52, severity: 0.78 },
      { id: 'hz-4', type: 'bridge', label: 'Köprü Ayağında Fiziksel Hasar', center: [36.2037, 36.1814], radiusKm: 0.44, severity: 0.94 },
      { id: 'hz-5', type: 'gas', label: 'Doğalgaz Ana Dağıtım Sızıntısı', center: [36.2089, 36.1626], radiusKm: 0.36, severity: 0.82 },
    ],
    safeCorridors: [
      { id: 'sc-1', label: 'Kuzey Otoyolu Güvenli Sevk Aksı', path: [[36.1932, 36.1449], [36.2119, 36.1826]], widthKm: 0.42, boost: 30 },
      { id: 'sc-2', label: 'AFAD Acil Müdahale Şeridi', path: [[36.1896, 36.1718], [36.2132, 36.1534]], widthKm: 0.28, boost: 22 },
    ],
  },
  {
    id: 'izmir-flood',
    name: 'İzmir Körfezi Tsunami / Taşkın Ağları',
    city: 'İzmir',
    center: [38.4325, 27.153],
    bounds: [
      [38.414, 27.129],
      [38.448, 27.183],
    ],
    mission: {
      title: 'Kıyı Şeridi Taşkın ve Deprem İkincil Etki Analizi',
      brief:
        'Kıyı şeridinde meydana gelen taşkın suları ve ikincil sarsıntılar sonrası, yüksek zemin tahliye yolları belirlenerek acil sığınağa ulaşım ağları çıkarılmaktadır.',
      updatedAt: new Date().toISOString(),
      nextWindow: new Date(Date.now() + 15 * 60000).toISOString(),
      scanAgeMinutes: 6,
      sourceLabel: 'İMECE Uydu Verisi Sentezi',
      resolutionLabel: '0.9 m SAR Görüntüsü',
      scanAreaKm2: 21.8,
      confidence: 0.88,
    },
    weather: {
      temperatureC: 22,
      windKmh: 35,
      humidity: 78,
      visibilityKm: 6.2,
    },
    sites: [
      { id: 'cmd', label: 'İzmir AFAD Ana Komuta', role: 'command', coords: [38.4209, 27.1359] },
      { id: 'dock', label: 'Alsancak Deniz Lojistik İskelesi', role: 'logistics', coords: [38.4261, 27.1704] },
      { id: 'field', label: 'Ege Üniversitesi Hastanesi (Sahra)', role: 'hospital', coords: [38.4444, 27.1745] },
      { id: 'shelter', label: 'Bornova Güvenli Toplanma Noktası', role: 'shelter', coords: [38.4414, 27.1411] },
      { id: 'rescue', label: 'Kordon Su Baskını Mahsur Alan', role: 'target', coords: [38.4338, 27.1631] },
    ],
    defaultRoute: { startSiteId: 'dock', endSiteId: 'rescue' },
    hazards: [
      { id: 'hz-1', type: 'flood', label: 'Ağır Taşkın Suyu Cebi', center: [38.4314, 27.1573], radiusKm: 0.88, severity: 0.96 },
      { id: 'hz-2', type: 'debris', label: 'Sürüklenmiş Araç ve Moloz', center: [38.4369, 27.1481], radiusKm: 0.56, severity: 0.82 },
      { id: 'hz-3', type: 'bridge', label: 'Alt Geçit İptali (Su Dolu)', center: [38.4298, 27.1687], radiusKm: 0.47, severity: 0.95 },
      { id: 'hz-4', type: 'gas', label: 'Riskli Yüksek Gerilim Noktası', center: [38.4396, 27.1605], radiusKm: 0.31, severity: 0.75 },
    ],
    safeCorridors: [
      { id: 'sc-1', label: 'Yüksek Rakım Tahliye Şeridi', path: [[38.4211, 27.1364], [38.4445, 27.1738]], widthKm: 0.38, boost: 28 },
      { id: 'sc-2', label: 'İç Mahalle UMKE İntikal Hattı', path: [[38.4411, 27.1413], [38.4341, 27.1642]], widthKm: 0.22, boost: 16 },
    ],
  },
  {
    id: 'istanbul-logistics',
    name: 'İstanbul Beklenen Depremi Öncelikli Sevk',
    city: 'İstanbul',
    center: [41.0156, 28.9638],
    bounds: [
      [40.996, 28.939],
      [41.033, 28.99],
    ],
    mission: {
      title: 'Tarihi Yarımada ve Arter Köprü Hasar Taraması',
      brief:
        'Sismik izolatörü olmayan binalardaki hasar ile ana lojistik arterlerdeki (E-5) duman ve yıkım riskleri işlenerek acil hastane koridorları canlı olarak yönetilmektedir.',
      updatedAt: new Date().toISOString(),
      nextWindow: new Date(Date.now() + 8 * 60000).toISOString(),
      scanAgeMinutes: 3,
      sourceLabel: 'Göktürk-2 SAR & Optik Birleştirme',
      resolutionLabel: '0.4 m Netlik',
      scanAreaKm2: 24.6,
      confidence: 0.92,
    },
    weather: {
      temperatureC: 15,
      windKmh: 24,
      humidity: 62,
      visibilityKm: 7.5,
    },
    sites: [
      { id: 'cmd', label: 'AKOM Kriz Yönetim Merkezi', role: 'command', coords: [41.0049, 28.9463] },
      { id: 'warehouse', label: 'Kızılay Kuzey Marmara Deposu', role: 'logistics', coords: [41.0102, 28.9816] },
      { id: 'field', label: 'Çam & Sakura Şehir Hastanesi', role: 'hospital', coords: [41.0286, 28.9861] },
      { id: 'shelter', label: 'Yenikapı Toplanma ve Tahliye Merkezi', role: 'shelter', coords: [41.0271, 28.9508] },
      { id: 'rescue', label: 'Fatih Tarihi Yarımada Arama Bölgesi', role: 'target', coords: [41.0184, 28.9727] },
    ],
    defaultRoute: { startSiteId: 'cmd', endSiteId: 'field' },
    hazards: [
      { id: 'hz-1', type: 'fire', label: 'Sanayi Tesisinde Yangın', center: [41.0157, 28.9651], radiusKm: 0.69, severity: 0.88 },
      { id: 'hz-2', type: 'bridge', label: 'Viyadük / Kavşak Çatlağı', center: [41.0217, 28.9577], radiusKm: 0.52, severity: 0.93 },
      { id: 'hz-3', type: 'debris', label: 'Geniş Yıkım ve Yola Taşma', center: [41.0104, 28.9738], radiusKm: 0.43, severity: 0.85 },
      { id: 'hz-4', type: 'collapse', label: 'Tarihi Bina Tamamen Çıkartma', center: [41.0231, 28.9806], radiusKm: 0.35, severity: 0.80 },
    ],
    safeCorridors: [
      { id: 'sc-1', label: 'Hastane Helikopter Servis Rotası', path: [[41.0048, 28.9469], [41.0284, 28.9858]], widthKm: 0.35, boost: 26 },
      { id: 'sc-2', label: 'Askeri Lojistik Transfer Şeridi', path: [[41.0104, 28.9812], [41.0188, 28.9726]], widthKm: 0.18, boost: 20 },
    ],
  },
];

const HAZARD_META = {
  debris: { label: 'Enkaz / Moloz', weight: 60, blockFactor: 1.0, color: '#f97316' },
  collapse: { label: 'Ağır Hasarlı Yapı', weight: 55, blockFactor: 0.95, color: '#ef4444' },
  flood: { label: 'Su Taşkını / Sel', weight: 65, blockFactor: 1.0, color: '#38bdf8' },
  bridge: { label: 'Ulaşım Ağı Kopukluğu', weight: 75, blockFactor: 1.0, color: '#f59e0b' },
  fire: { label: 'Büyük Çaplı Yangın', weight: 68, blockFactor: 0.95, color: '#f43f5e' },
  landslide: { label: 'Heyelan / Toprak Kayması', weight: 66, blockFactor: 1.0, color: '#84cc16' },
  gas: { label: 'Zehirli Gaz / Sızıntı', weight: 45, blockFactor: 0.6, color: '#c084fc' },
};

function getScenarioById(id) {
  return SCENARIOS.find((scenario) => scenario.id === id);
}

function getSiteById(scenario, siteId) {
  return scenario.sites.find((site) => site.id === siteId);
}

function summarizeScenario(scenario) {
  const countsByType = scenario.hazards.reduce((acc, hazard) => {
    acc[hazard.type] = (acc[hazard.type] || 0) + 1;
    return acc;
  }, {});

  const criticalCount = scenario.hazards.filter((hazard) => hazard.severity >= 0.85).length;
  const blockedSegments = scenario.hazards.filter((hazard) => HAZARD_META[hazard.type]?.blockFactor >= 0.9).length;
  const avgSeverity =
    scenario.hazards.reduce((total, hazard) => total + hazard.severity, 0) / scenario.hazards.length;

  return {
    id: scenario.id,
    name: scenario.name,
    city: scenario.city,
    center: scenario.center,
    mission: scenario.mission,
    weather: scenario.weather,
    stats: {
      hazardCount: scenario.hazards.length,
      blockedSegments,
      criticalCount,
      averageSeverity: Number(avgSeverity.toFixed(2)),
      readinessScore: Math.max(46, Math.round(100 - avgSeverity * 34 - criticalCount * 4)),
      countsByType,
    },
  };
}

module.exports = {
  SCENARIOS,
  HAZARD_META,
  getScenarioById,
  getSiteById,
  summarizeScenario,
};
