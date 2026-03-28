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

async function fetchGoogleWeather(lat, lon, apiKey) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const key = `google:${lat.toFixed(3)}:${lon.toFixed(3)}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.data;

  // Google Maps Platform Weather API kullanımı
  // Not: Bu endpoint için Google Cloud Console => "Weather API" aktif edilmelidir!
  const url = `https://weather.googleapis.com/v1/currentConditions?latitude=${lat}&longitude=${lon}&key=${apiKey}`;

  try {
    const response = await axios.get(url, { timeout: 7000 });
    const current = response?.data;
    if (!current) throw new Error('No current conditions returned');

    const weather = {
      temperatureC: current.temperatureCelsius ?? 18,
      windKmh: current.windSpeedKph ?? 12,
      humidity: current.relativeHumidity ?? 50,
      visibilityKm: current.visibilityKm ?? 10,
      condition: current.condition || 'Bilinmiyor',
      feelsLikeC: current.feelsLikeCelsius ?? current.temperatureCelsius ?? 18,
      source: 'Google Maps API',
    };

    cache.set(key, { ts: Date.now(), data: weather });
    return weather;
  } catch (error) {
    console.warn('[Google Weather API Error]', error?.response?.status || error.message);
    
    // Google 404 veya 403 (Referer engeli vs) verirse direkt açık kaynak API'mize (Open-Meteo) fallback yapiyoruz.
    try {
      const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`;
      const fallbackPayload = await axios.get(openMeteoUrl, { timeout: 7000 });
      const current = fallbackPayload?.data?.current;
      if (current) {
        const temp = Number(current.temperature_2m);
        const wCode = Number(current.weather_code);
        return {
          temperatureC: Number.isFinite(temp) ? Math.round(temp) : 18,
          windKmh: Number.isFinite(Number(current.wind_speed_10m)) ? Math.round(Number(current.wind_speed_10m)) : 12,
          humidity: Number.isFinite(Number(current.relative_humidity_2m)) ? Math.round(Number(current.relative_humidity_2m)) : 50,
          visibilityKm: 8,
          condition: codeToLabel(wCode),
          feelsLikeC: Number.isFinite(Number(current.apparent_temperature)) ? Math.round(Number(current.apparent_temperature)) : 18,
          source: 'Open-Meteo Fallback',
        };
      }
    } catch(fallbackErr) {
       console.warn('[OpenMeteo Fallback Error]', fallbackErr.message);
    }
    
    // Her iki API de patlarsa mock/yedek veri dön
    return {
      temperatureC: 18,
      windKmh: 12,
      humidity: 50,
      visibilityKm: 8,
      condition: 'Bağlantı Hatası',
      feelsLikeC: 18,
      source: 'Offline Cache',
    };
  }
}

async function fetchRealtimeWeatherForScenario(scenario) {
  if (!scenario?.center || !Array.isArray(scenario.center)) return null;
  const [lat, lon] = scenario.center;
  // Environment variable içindeki API anahtarını kullanıyoruz (App içinden veya process.env'den)
  const apiKey = process.env.GOOGLE_MAPS_KEY || 'AIzaSyAalgHoNB06A4G40NJZEjJWWrthTWjQ08s';
  return fetchGoogleWeather(Number(lat), Number(lon), apiKey);
}

module.exports = {
  fetchRealtimeWeatherForScenario,
};
