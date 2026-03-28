const axios = require('axios');

const STAC_SEARCH_URL = 'https://earth-search.aws.element84.com/v1/search';
const CACHE_TTL_MS = 10 * 60 * 1000;

const cache = new Map();

function toBbox(bounds) {
  if (!Array.isArray(bounds) || bounds.length < 2) return null;
  const [sw, ne] = bounds;
  if (!Array.isArray(sw) || !Array.isArray(ne)) return null;

  const south = Number(sw[0]);
  const west = Number(sw[1]);
  const north = Number(ne[0]);
  const east = Number(ne[1]);

  if (![south, west, north, east].every(Number.isFinite)) return null;
  return [west, south, east, north];
}

function pickQuicklook(assets = {}) {
  return (
    assets.visual?.href ||
    assets.rendered_preview?.href ||
    assets.thumbnail?.href ||
    null
  );
}

async function fetchSentinelMetaForScenario(scenario) {
  if (!scenario?.bounds) return null;

  const cached = cache.get(scenario.id);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.meta;
  }

  const bbox = toBbox(scenario.bounds);
  if (!bbox) return null;

  const startDate = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString();
  const endDate = new Date().toISOString();

  const payload = {
    collections: ['sentinel-2-l2a'],
    bbox,
    datetime: `${startDate}/${endDate}`,
    limit: 1,
    sortby: [{ field: 'properties.datetime', direction: 'desc' }],
  };

  const response = await axios.post(STAC_SEARCH_URL, payload, {
    timeout: 7000,
  });

  const feature = response?.data?.features?.[0];
  if (!feature) {
    const meta = { enabled: true, available: false };
    cache.set(scenario.id, { ts: Date.now(), meta });
    return meta;
  }

  const meta = {
    enabled: true,
    available: true,
    dataset: 'COPERNICUS/S2_SR_HARMONIZED',
    sceneId: feature.id,
    acquiredAt: feature.properties?.datetime || null,
    cloudCover: feature.properties?.['eo:cloud_cover'] ?? null,
    quicklookUrl: pickQuicklook(feature.assets),
    provider: 'Sentinel-2 L2A',
  };

  cache.set(scenario.id, { ts: Date.now(), meta });
  return meta;
}

function mergeScenarioWithSentinel(scenario, sentinelMeta) {
  if (!sentinelMeta) {
    return {
      ...scenario,
      sentinelMeta: { enabled: false, available: false },
    };
  }

  return {
    ...scenario,
    mission: {
      ...scenario.mission,
      sourceLabel: `${scenario.mission.sourceLabel} + Sentinel-2`,
      updatedAt: sentinelMeta.acquiredAt || scenario.mission.updatedAt,
      resolutionLabel: 'Sentinel-2 L2A (10m)',
    },
    sentinelMeta,
  };
}

module.exports = {
  fetchSentinelMetaForScenario,
  mergeScenarioWithSentinel,
};
