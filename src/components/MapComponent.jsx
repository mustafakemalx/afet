import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, Circle, Marker, InfoWindow, Rectangle } from '@react-google-maps/api';

// API anahtarını doğrudan yazıyoruz (test amaçlı)
const GOOGLE_MAPS_KEY = 'AIzaSyAalgHoNB06A4G40NJZEjJWWrthTWjQ08s';

const ROUTE_STYLES = {
  safest: { strokeColor: '#22c55e', strokeWeight: 7, strokeOpacity: 0.95 },
  balanced: { strokeColor: '#f59e0b', strokeWeight: 5, strokeOpacity: 0.85, strokeDashArray: '8 10' },
  shortest: { strokeColor: '#ef4444', strokeWeight: 4, strokeOpacity: 0.7, strokeDashArray: '4 12' },
  contingency: { strokeColor: '#38bdf8', strokeWeight: 4, strokeOpacity: 0.8, strokeDashArray: '12 10' },
};

const ROLE_COLORS = {
  command: '#0ea5e9',
  logistics: '#a855f7',
  hospital: '#22c55e',
  shelter: '#f59e0b',
  target: '#ef4444',
};

const ROLE_LABELS = {
  command: 'Komuta',
  logistics: 'Lojistik',
  hospital: 'Hastane',
  shelter: 'Toplanma',
  target: 'Hedef',
};

const MAP_STYLES_DARK = [
  { elementType: 'geometry', stylers: [{ color: '#0a1929' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a1929' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b8399' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#1a3a5c' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#162d44' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a3a5c' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1e3a5f' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d2137' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3a6a8a' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#0f2a40' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#5a8aaa' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#0f2a40' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#0c2035' }] },
];

const containerStyle = { width: '100%', height: '100%' };

function getMapTypeId(mapStyle) {
  if (mapStyle === 'satellite') return 'hybrid';
  if (mapStyle === 'street') return 'roadmap';
  return 'roadmap';
}

function buildMarkerIcon(role) {
  const color = ROLE_COLORS[role] || '#94a3b8';
  return {
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: 1.6,
    anchor: { x: 12, y: 24 },
  };
}

const dispatchMarkerIcon = {
  path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
  fillColor: '#22c55e',
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 2.5,
  scale: 1.8,
  anchor: { x: 12, y: 24 },
};

function toLatLng(coords) {
  return { lat: coords[0], lng: coords[1] };
}

function toLatLngPath(path) {
  return path.map((p) => ({ lat: p[0], lng: p[1] }));
}

export default function MapComponent({ scenario, routeData, mapStyle, activeRouteKey, dispatchActive }) {
  const [dispatchIndex, setDispatchIndex] = useState(0);
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
  });

  const activeRoute = routeData?.routes?.[activeRouteKey] || routeData?.routes?.safest || null;

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Fly to scenario bounds
  useEffect(() => {
    if (!mapRef.current || !scenario) return;
    const map = mapRef.current;

    if (scenario.bounds) {
      const bounds = new window.google.maps.LatLngBounds(
        { lat: scenario.bounds[0][0], lng: scenario.bounds[0][1] },
        { lat: scenario.bounds[1][0], lng: scenario.bounds[1][1] }
      );
      map.fitBounds(bounds, 40);
    } else if (scenario.center) {
      map.panTo(toLatLng(scenario.center));
      map.setZoom(13);
    }
  }, [scenario]);

  // Dispatch animation
  useEffect(() => {
    if (!dispatchActive || !activeRoute?.path?.length) return undefined;

    let index = 0;
    setDispatchIndex(0);
    const interval = window.setInterval(() => {
      if (index >= activeRoute.path.length - 1) {
        window.clearInterval(interval);
        return;
      }
      index += 1;
      setDispatchIndex(index);
    }, 420);

    return () => window.clearInterval(interval);
  }, [dispatchActive, activeRoute]);

  if (!isLoaded) {
    return (
      <div className="map-shell" style={{ display: 'grid', placeItems: 'center', background: '#0a1929' }}>
        <div style={{ color: '#6b8399', fontSize: '0.9rem' }}>Harita yükleniyor...</div>
      </div>
    );
  }

  const isDark = mapStyle === 'dark';
  const mapTypeId = getMapTypeId(mapStyle);

  return (
    <div className="map-shell">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={scenario?.center ? toLatLng(scenario.center) : { lat: 39.0, lng: 35.0 }}
        zoom={13}
        onLoad={onMapLoad}
        mapTypeId={mapTypeId}
        options={{
          styles: isDark ? MAP_STYLES_DARK : [],
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: { position: 3 },
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy',
          minZoom: 5,
          maxZoom: 18,
        }}
      >
        {/* Scenario boundary rectangle */}
        {scenario?.bounds && (
          <Rectangle
            bounds={{
              north: scenario.bounds[1][0],
              south: scenario.bounds[0][0],
              east: scenario.bounds[1][1],
              west: scenario.bounds[0][1],
            }}
            options={{
              strokeColor: '#38bdf8',
              strokeOpacity: 0.9,
              strokeWeight: 2,
              fillColor: '#38bdf8',
              fillOpacity: 0.04,
            }}
          />
        )}

        {/* Safe corridors */}
        {scenario?.safeCorridors?.map((corridor) => (
          <Polyline
            key={corridor.id}
            path={toLatLngPath(corridor.path)}
            options={{
              strokeColor: '#34d399',
              strokeWeight: 3,
              strokeOpacity: 0.85,
              strokeDashArray: [10, 10],
              icons: [{
                icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.85, strokeColor: '#34d399', scale: 3 },
                offset: '0',
                repeat: '20px',
              }],
            }}
          />
        ))}

        {/* Hazard circles */}
        {scenario?.hazards?.map((hazard) => (
          <Circle
            key={hazard.id}
            center={toLatLng(hazard.center)}
            radius={hazard.radiusKm * 1000}
            options={{
              strokeColor: hazard.color || '#ef4444',
              strokeWeight: 2,
              fillColor: hazard.color || '#ef4444',
              fillOpacity: 0.18,
              strokeOpacity: 0.8,
            }}
            onClick={() => setActiveInfoWindow(hazard.id)}
          >
            {activeInfoWindow === hazard.id && (
              <InfoWindow position={toLatLng(hazard.center)} onCloseClick={() => setActiveInfoWindow(null)}>
                <div style={{ color: '#111', fontFamily: 'inherit', padding: '4px' }}>
                  <strong>{hazard.label}</strong><br />
                  {hazard.typeLabel}<br />
                  Şiddet: %{Math.round(hazard.severity * 100)}
                </div>
              </InfoWindow>
            )}
          </Circle>
        ))}

        {/* Dangerous cells */}
        {routeData?.dangerousCells?.slice(0, 140).map((cell, index) => {
          const halfLat = routeData.cellDimensions.lat / 2;
          const halfLon = routeData.cellDimensions.lon / 2;
          const color = cell.topDriver?.color || (cell.blocked ? '#ef4444' : '#f59e0b');

          return (
            <Rectangle
              key={`cell-${index}`}
              bounds={{
                north: cell.lat + halfLat,
                south: cell.lat - halfLat,
                east: cell.lon + halfLon,
                west: cell.lon - halfLon,
              }}
              options={{
                strokeColor: color,
                strokeWeight: 1,
                fillColor: color,
                fillOpacity: cell.blocked ? 0.34 : 0.18,
                strokeOpacity: 0.6,
              }}
            />
          );
        })}

        {/* Routes */}
        {routeData?.routes &&
          Object.entries(routeData.routes)
            .filter(([, route]) => Boolean(route))
            .map(([routeKey, route]) => {
              const style = ROUTE_STYLES[routeKey] || ROUTE_STYLES.balanced;
              const isActive = routeKey === activeRouteKey;
              return (
                <Polyline
                  key={routeKey}
                  path={toLatLngPath(route.path)}
                  options={{
                    strokeColor: style.strokeColor,
                    strokeWeight: isActive ? style.strokeWeight : Math.max(2, style.strokeWeight - 2),
                    strokeOpacity: isActive ? style.strokeOpacity : 0.28,
                    zIndex: isActive ? 10 : 1,
                  }}
                />
              );
            })}

        {/* Site markers */}
        {scenario?.sites?.map((site) => (
          <Marker
            key={site.id}
            position={toLatLng(site.coords)}
            icon={buildMarkerIcon(site.role)}
            onClick={() => setActiveInfoWindow(`site-${site.id}`)}
          >
            {activeInfoWindow === `site-${site.id}` && (
              <InfoWindow onCloseClick={() => setActiveInfoWindow(null)}>
                <div style={{ color: '#111', fontFamily: 'inherit', padding: '4px' }}>
                  <strong>{site.label}</strong><br />
                  Rol: {ROLE_LABELS[site.role] || site.role}
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}

        {/* Dispatch unit */}
        {dispatchActive && activeRoute?.path?.[dispatchIndex] && (
          <Marker
            position={toLatLng(activeRoute.path[dispatchIndex])}
            icon={dispatchMarkerIcon}
            zIndex={100}
          />
        )}
      </GoogleMap>

      <div className="map-legend">
        <div className="map-legend-title">Gösterge</div>
        <div className="map-legend-item"><span className="legend-line" style={{ background: '#22c55e' }} /> Güvenli Rota</div>
        <div className="map-legend-item"><span className="legend-line" style={{ background: '#f59e0b' }} /> Dengeli Rota</div>
        <div className="map-legend-item"><span className="legend-line" style={{ background: '#ef4444' }} /> Riskli Rota</div>
        <div className="map-legend-item"><span className="legend-line" style={{ background: '#38bdf8', opacity: 0.7 }} /> Yedek Hat</div>
        <div className="map-legend-item"><span className="legend-circle hazard" /> Tehlike Bölgesi</div>
        <div className="map-legend-item"><span className="legend-circle safe" /> Güvenli Koridor</div>
      </div>
    </div>
  );
}
