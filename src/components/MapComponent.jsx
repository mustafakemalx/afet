import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, Circle, Marker, InfoWindow, Rectangle, DirectionsRenderer } from '@react-google-maps/api';

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
  military: '#0f766e',
};

const ROLE_LABELS = {
  command: 'Komuta',
  logistics: 'Lojistik',
  hospital: 'Hastane',
  shelter: 'Toplanma',
  target: 'Hedef',
  military: 'Kışla/Askeri B.',
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

// Basit matematiksel rota yönlendirme fonksiyonu (Heading)
function computeHeading(p1, p2) {
  if (!p1 || !p2) return 0;
  const dLng = (p2.lng - p1.lng) * Math.PI / 180;
  const lat1 = p1.lat * Math.PI / 180;
  const lat2 = p2.lat * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  let heading = (Math.atan2(y, x) * 180) / Math.PI;
  return (heading + 360) % 360;
}

export default function MapComponent({ scenario, routeData, mapStyle, activeRouteKey, dispatchActive, activeInfoWindow, setActiveInfoWindow, simVehicleType, isSimulation, simWaypoints }) {
  const [dispatchIndex, setDispatchIndex] = useState(0);
  const [vehicleHeading, setVehicleHeading] = useState(0);
  const [directionsCache, setDirectionsCache] = useState({});
  const [animPath, setAnimPath] = useState([]);
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

  // Directions API implementation - Snap coordinates to real streets
  useEffect(() => {
    if (!isLoaded || !routeData?.routes || !window.google?.maps?.DirectionsService) return;

    const ds = new window.google.maps.DirectionsService();

    Object.entries(routeData.routes).forEach(([routeKey, route]) => {
      if (!route || !route.path || route.path.length < 2) return;

      if (directionsCache[routeKey] && directionsCache[routeKey].originalPath === route.path && !simWaypoints) {
        return; // Already calculated (except when detour requested)
      }

      const path = route.path;
      const origin = toLatLng(path[0]);
      const destination = toLatLng(path[path.length - 1]);
      const pts = path.slice(1, -1);

      // We wrap the request in a function to let us retry with fewer waypoints if Google fails to find a path
      const tryFetchRoute = (waypointCount) => {
        let waypoints = [];
        
        // Priority 1: Force Detour simWaypoints
        if (simWaypoints && simWaypoints.length > 0) {
          simWaypoints.forEach(wp => {
            waypoints.push({ location: new window.google.maps.LatLng(wp[0], wp[1]), stopover: false });
          });
        } 
        // Priority 2: Standard route waypoints to snap to dummy backend polyline
        else if (pts.length > 0 && waypointCount > 0) {
          const step = Math.max(1, Math.floor(pts.length / (waypointCount + 1)));
          for (let i = 1; i <= waypointCount; i++) {
            const pt = pts[i * step];
            if (pt) waypoints.push({ location: toLatLng(pt), stopover: false }); // 'stopover: false' means "via point", pass through without strictly breaking the route into legs
          }
        }

        ds.route(
          {
            origin,
            destination,
            waypoints,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              setDirectionsCache((prev) => ({
                ...prev,
                [routeKey]: { result, originalPath: route.path }
              }));
            } else if (status === window.google.maps.DirectionsStatus.ZERO_RESULTS && waypointCount > 0) {
              console.warn(`Waypoints too strict for ${routeKey}, retrying with fewer points...`);
              tryFetchRoute(0); // Noktalar tamamen hatalıysa sıfır nokta (en azından dümdüz gitsin)
            } else if (status === window.google.maps.DirectionsStatus.REQUEST_DENIED) {
              console.error('Google Maps Directions API is NOT enabled! Please enable it in Google Cloud Console.');
              alert('DİKKAT: Google Maps "Directions API" hesabınızda kapalı! Yolları takip eden navigasyon çizgisi için Google Cloud paneline girip "Directions API" yi aktifleştirmeniz gerekmektedir.');
            } else {
              console.warn(`Directions request completely failed for ${routeKey}:`, status);
            }
          }
        );
      };

      tryFetchRoute(1); // Sadece 1 (TAM ORTA) noktayı vererek Google'ın ana yollardan sapmasını maksimum engelliyoruz
    });
  }, [routeData, directionsCache, isLoaded]);

  // Dispatch animation preparation
  useEffect(() => {
    if (!dispatchActive) {
      setAnimPath([]);
      return;
    }
    
    // Feature: Helicopters ignore roads and fly straight to the target
    if (simVehicleType === 'heli') {
      // Fly directly from the active command/military base to the target
      const baseSite = scenario.sites.find(s => s.role === 'military' || s.role === 'command');
      const targetSite = scenario.sites.find(s => s.role === 'target');
      
      const startP = toLatLng(baseSite.coords);
      const endP = toLatLng(targetSite.coords);
      
      // Interpolate points for a smooth flight animation
      const steps = 1500;
      const path = [];
      for(let i=0; i<=steps; i++) {
        path.push({
          lat: startP.lat + (endP.lat - startP.lat) * (i/steps),
          lng: startP.lng + (endP.lng - startP.lng) * (i/steps),
        });
      }
      setAnimPath(path);
      return;
    }

    const cached = directionsCache[activeRouteKey];
    if (cached) {
      // Directions API returning a beautiful overview path
      setAnimPath(cached.result.routes[0].overview_path);
    } else if (activeRoute?.path) {
      // Fallback path
      setAnimPath(toLatLngPath(activeRoute.path));
    } else {
      setAnimPath([]);
    }
  }, [dispatchActive, activeRouteKey, directionsCache, activeRoute, simVehicleType, scenario]);

  useEffect(() => {
    if (!animPath || animPath.length === 0) return undefined;

    let index = 0;
    setDispatchIndex(0);
    setVehicleHeading(0);

    const interval = window.setInterval(() => {
      if (index >= animPath.length - 1) {
        window.clearInterval(interval);
        return;
      }
      
      // Calculate rotation towards next ping
      const p1 = animPath[index];
      const p2 = animPath[index + 1];
      if (p1 && p2) {
        setVehicleHeading(computeHeading(p1, p2));
      }

      index += 1;
      setDispatchIndex(index);
    }, 150); // Speed optimized for road curve smoothing

    return () => window.clearInterval(interval);
  }, [animPath]);

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

        {/* Safe corridors kapatıldı */}

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

        {/* Dangerous cells kapalı - Harita temizliği için */}

        {/* Routes */}
        {routeData?.routes &&
          Object.entries(routeData.routes)
            .filter(([, route]) => Boolean(route))
            .map(([routeKey, route]) => {
              const style = ROUTE_STYLES[routeKey] || ROUTE_STYLES.balanced;
              const isActive = routeKey === activeRouteKey;
              const cached = directionsCache[routeKey];

              if (cached) {
                return (
                  <DirectionsRenderer
                    key={`directions-${routeKey}`}
                    directions={cached.result}
                    options={{
                      polylineOptions: {
                        strokeColor: style.strokeColor,
                        strokeWeight: isActive ? style.strokeWeight + 1 : Math.max(2, style.strokeWeight - 2),
                        strokeOpacity: isActive ? style.strokeOpacity : 0.28,
                        zIndex: isActive ? 10 : 1,
                      },
                      suppressMarkers: true,
                      preserveViewport: true,
                    }}
                  />
                );
              }

              // Fallback to straight lines while fetching
              return (
                <Polyline
                  key={`poly-${routeKey}`}
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
        {dispatchActive && animPath[dispatchIndex] && (
          <Marker
            position={animPath[dispatchIndex]}
            icon={simVehicleType === 'heli' ? {
              // The Heli SVG points UP naturally, so rotation maps perfectly to 0=North
              path: 'M17.42 12.06L16 11V6H14L10 9H3C2.45 9 2 9.45 2 10V14C2 14.55 2.45 15 3 15H10L14 18V13L16 12V16L18 16.5V13.5L20.5 14L22 12L17.42 12.06Z M12 3H14V5H12V3Z M12 19H14V21H12V19Z M2 3H10V5H2V3Z', 
              fillColor: '#0ea5e9',
              fillOpacity: 1,
              scale: 1.1,
              rotation: vehicleHeading,
              anchor: new window.google.maps.Point(12, 12),
            } : {
              // The Truck SVG points LEFT normally. We offset internal rotation mentally or via SVG.
              // To offset rotation easily, we just add 90 or 180 to vehicleHeading. Truck facing left means -90 deg.
              path: 'M20,8h-3V4H3C1.9,4,1,4.9,1,6v11h2c0,1.66,1.34,3,3,3s3-1.34,3-3h6c0,1.66,1.34,3,3,3s3-1.34,3-3h2v-5L20,8z M6,18c-0.55,0-1-0.45-1-1s0.45-1,1-1s1,0.45,1,1S6.55,18,6,18z M19.5,9.5l1.96,2.5H17V9.5H19.5z M18,18c-0.55,0-1-0.45-1-1s0.45-1,1-1s1,0.45,1,1S18.55,18,18,18z',
              fillColor: '#22c55e',
              fillOpacity: 1,
              scale: 0.9,
              rotation: vehicleHeading - 90, // Fix truck's orthogonal SVG orientation!
              anchor: new window.google.maps.Point(12, 12)
            }}
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
