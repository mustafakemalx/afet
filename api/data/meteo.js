const axios = require('axios');

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const CACHE_TTL_MS = 5 * 60 * 1000;

const cache = new Map();

const WEATHER_CODES = {
  0: 'Acik',
  1: 'Az bulutlu',
  2: 'Parcali bulutlu',
  3: 'Kapali',
  45: 'Sisli',
  48: 'Kiraagi sis',
  51: 'Hafif cise',
  53: 'Cise',
  55: 'Yogun cise',
  61: 'Hafif yagmur',
  63: 'Yagmur',
  65: 'Yogun yagmur',
  71: 'Hafif kar',
  73: 'Kar',
  75: 'Yogun kar',
  80: 'SagAnak',
  81: 'Yagmur saganagi',
  82: 'Yogun saganak',
  95: 'Firtina',
  96: 'Dolu ihtimali',
  99: 'Dolu',
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function codeToLabel(code) {
  if (code in WEATHER_CODES) return WEATHER_CODES[code];
  return 'Degisken';
}

async function fetchOpenMeteoWeather(lat, lon, cityKey = 'default') {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const key = `${cityKey}:${lat.toFixed(3)}:${lon.toFixed(3)}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.data;

  const params = {
    latitude: lat,
    longitude: lon,
    timezone: 'auto',
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'wind_speed_10m',
      'weather_code',
    ].join(','),
  };

  const response = await axios.get(OPEN_METEO_URL, {
    params,
    timeout: 7000,
  });

  const current = response?.data?.current;
  if (!current) return null;

  const temperatureC = Number(current.temperature_2m);
  const windKmh = Number(current.wind_speed_10m);
  const humidity = Number(current.relative_humidity_2m);
  const feelsLikeC = Number(current.apparent_temperature);
  const weatherCode = Number(current.weather_code);

  const weather = {
    temperatureC: Number.isFinite(temperatureC) ? Math.round(temperatureC) : 0,
    windKmh: Number.isFinite(windKmh) ? Math.round(windKmh) : 0,
    humidity: Number.isFinite(humidity) ? Math.round(humidity) : 0,
    visibilityKm: clamp(12 - (Number.isFinite(humidity) ? humidity / 20 : 2), 2, 12),
    condition: codeToLabel(weatherCode),
    feelsLikeC: Number.isFinite(feelsLikeC) ? Math.round(feelsLikeC) : Math.round(temperatureC || 0),
    source: 'Open-Meteo (Canli)',
  };

  cache.set(key, { ts: Date.now(), data: weather });
  return weather;
}

async function fetchRealtimeWeatherForScenario(scenario) {
  if (!scenario?.center || !Array.isArray(scenario.center)) return null;
  const city = String(scenario.city || '').toLowerCase();
  if (city !== 'trabzon') return null;
  const [lat, lon] = scenario.center;
  return fetchOpenMeteoWeather(Number(lat), Number(lon), scenario.city || scenario.id || 'scenario');
}

module.exports = {
  fetchRealtimeWeatherForScenario,
};
