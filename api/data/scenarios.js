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
      { id: 'field-2', label: 'Defne Devlet Hastanesi', role: 'hospital', coords: [36.1852, 36.1432] },
      { id: 'field-3', label: 'Özel Mozaik Hastanesi', role: 'hospital', coords: [36.2168, 36.1601] },
      { id: 'military-1', label: '8. Komando Tugayı', role: 'military', coords: [36.2201, 36.1895] },
      { id: 'military-2', label: 'Serinyol Jandarma Eğitim', role: 'military', coords: [36.2045, 36.1362] },
      { id: 'shelter', label: 'Millet Bahçesi Çadırkenti', role: 'shelter', coords: [36.2141, 36.1522] },
      { id: 'rescue', label: 'Atatürk Caddesi Ağır Hasarlı Bölge', role: 'target', coords: [36.2062, 36.1764] },
    ],
    defaultRoute: { startSiteId: 'cmd', endSiteId: 'rescue' },
    hazards: [
      { id: 'hz-1', type: 'collapse', label: 'Ana Sarsıntı: Antakya Merkez', center: [36.2002, 36.1577], radiusKm: 1.2, severity: 0.96, delaySec: 0 },
      { id: 'hz-2', type: 'collapse', label: 'Artçı: Defne Fay Çöküntüsü', center: [36.1859, 36.1499], radiusKm: 0.8, severity: 0.82, delaySec: 10 },
      { id: 'hz-3', type: 'collapse', label: 'Artçı: Serinyol Ağır Hasar', center: [36.2068, 36.1728], radiusKm: 0.5, severity: 0.88, delaySec: 25 },
      { id: 'hz-4', type: 'collapse', label: 'Artçı: Kuzey Otoyolu Yıkımı', center: [36.2137, 36.1814], radiusKm: 0.6, severity: 0.94, delaySec: 40 },
      { id: 'hz-5', type: 'collapse', label: 'Artçı: Asi Nehri Çevresi Çökme', center: [36.1989, 36.1626], radiusKm: 0.7, severity: 0.75, delaySec: 55 },
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
      { id: 'field-2', label: 'Tepecik Eğitim Araştırma', role: 'hospital', coords: [38.4239, 27.1584] },
      { id: 'field-3', label: 'Alsancak Devlet Hastanesi', role: 'hospital', coords: [38.4385, 27.1425] },
      { id: 'military-1', label: 'Ege Ordusu Komutanlığı', role: 'military', coords: [38.4140, 27.1700] },
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
      { id: 'field-2', label: 'Samatya Eğitim Araştırma', role: 'hospital', coords: [41.0012, 28.9375] },
      { id: 'field-3', label: 'Haseki Kardiyoloji Ens.', role: 'hospital', coords: [41.0118, 28.9431] },
      { id: 'military-1', label: 'Gülhane Askeri Tıp Akademisi', role: 'military', coords: [41.0150, 28.9800] },
      { id: 'military-2', label: 'Kuzey Deniz Saha Kom.', role: 'military', coords: [41.0320, 28.9500] },
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
  {
    id: 'trabzon-flood',
    name: 'Trabzon Sel ve Heyelan Koridoru',
    city: 'Trabzon',
    center: [41.0015, 39.7178],
    bounds: [
      [40.982, 39.676],
      [41.024, 39.766],
    ],
    mission: {
      title: 'Yagis kaynakli sel ve heyelan lojistik yonetimi',
      brief:
        'Trabzon merkez ve kiyi hattinda sel, su taskini ve heyelan riskleri icin acil mudahale ekiplerinin guvenli ulasim koridorlari hesaplanmaktadir.',
      updatedAt: new Date().toISOString(),
      nextWindow: new Date(Date.now() + 10 * 60000).toISOString(),
      scanAgeMinutes: 5,
      sourceLabel: 'Sentinel-2 + Yerel Izleme',
      resolutionLabel: '10 m',
      scanAreaKm2: 19.2,
      confidence: 0.9,
    },
    weather: {
      temperatureC: 14,
      windKmh: 18,
      humidity: 82,
      visibilityKm: 6.5,
    },
    sites: [
      { id: 'cmd', label: 'Trabzon AFAD Koordinasyon', role: 'command', coords: [40.9971, 39.7193] },
      { id: 'log', label: 'Trabzon Lojistik Transfer', role: 'logistics', coords: [41.0116, 39.7442] },
      { id: 'field', label: 'Acil Saglik Noktasi', role: 'hospital', coords: [41.0073, 39.7057] },
      { id: 'field-2', label: 'Kaşüstü Eğitim ve Araştırma Hast.', role: 'hospital', coords: [40.9855, 39.7501] },
      { id: 'military-1', label: '4. Motorlu Piyade Tugayı', role: 'military', coords: [40.9920, 39.7285] },
      { id: 'shelter', label: 'Toplanma Alani', role: 'shelter', coords: [40.9924, 39.6944] },
      { id: 'rescue', label: 'Riskli Dere Yatagi', role: 'target', coords: [41.0163, 39.7338] },
    ],
    defaultRoute: { startSiteId: 'cmd', endSiteId: 'rescue' },
    hazards: [
      { id: 'hz-1', type: 'flood', label: 'Dere Taskini', center: [41.0122, 39.7264], radiusKm: 0.74, severity: 0.91 },
      { id: 'hz-2', type: 'landslide', label: 'Yamac Kaymasi', center: [40.9968, 39.7392], radiusKm: 0.52, severity: 0.86 },
      { id: 'hz-3', type: 'debris', label: 'Yol Uzeri Moloz', center: [41.0051, 39.7093], radiusKm: 0.39, severity: 0.78 },
      { id: 'hz-4', type: 'bridge', label: 'Menfez Hasari', center: [41.0175, 39.7451], radiusKm: 0.33, severity: 0.83 },
    ],
    safeCorridors: [
      { id: 'sc-1', label: 'Sahil Acil Intikal Hatti', path: [[40.9973, 39.6876], [41.0144, 39.7482]], widthKm: 0.31, boost: 24 },
      { id: 'sc-2', label: 'Kuzey Transfer Seridi', path: [[40.9898, 39.7051], [41.0216, 39.7367]], widthKm: 0.25, boost: 18 },
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
