import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';

/**
 * Auto-fit map bounds to village markers.
 */
function FitBounds({ villages }) {
  const map = useMap();
  useEffect(() => {
    if (villages.length === 0) return;
    const bounds = villages.map(v => v.coordinates);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
  }, [villages, map]);
  return null;
}

function getMarkerColor(riskScore) {
  if (riskScore >= 6) return '#EF4444';
  if (riskScore >= 3) return '#F59E0B';
  return '#22C55E';
}

function getMarkerRadius(riskScore, totalPatients) {
  const base = Math.max(8, Math.min(totalPatients * 2, 28));
  if (riskScore >= 6) return base + 6;
  if (riskScore >= 3) return base + 3;
  return base;
}

/**
 * Leaflet map with risk-scored circle markers, tooltips, legend overlay.
 * Uses CartoDB Dark Matter tiles for command-center aesthetic.
 * Centered on India with subcontinent bounds lock.
 */
export default function HeatmapMap({ villages, onSelectVillage, selectedVillage }) {
  const indiaCenter = [22.5, 80.0];

  // Lock pan to Indian subcontinent
  const indiaBounds = [[6.5, 68.0], [37.0, 97.5]];

  return (
    <div className="heatmap-map-container">
      <MapContainer
        center={indiaCenter}
        zoom={5}
        minZoom={4}
        maxBounds={indiaBounds}
        maxBoundsViscosity={0.9}
        style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-lg)' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <FitBounds villages={villages} />

        {villages.map(v => {
          const color = getMarkerColor(v.riskScore);
          const radius = getMarkerRadius(v.riskScore, v.totalPatients);
          const isSelected = selectedVillage?.village === v.village;
          const isHigh = v.riskScore >= 6;

          return (
            <CircleMarker
              key={v.village}
              center={v.coordinates}
              radius={radius}
              pathOptions={{
                color: isSelected ? '#fff' : color,
                fillColor: color,
                fillOpacity: isSelected ? 0.9 : 0.6,
                weight: isSelected ? 3 : 1.5,
                className: isHigh ? 'heatmap-marker-pulse' : '',
              }}
              eventHandlers={{ click: () => onSelectVillage(v) }}
            >
              <Tooltip direction="top" offset={[0, -radius]} className="heatmap-tooltip">
                <div style={{ textAlign: 'center' }}>
                  <strong>{v.village}</strong>
                  <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.85 }}>
                    {v.totalPatients} patients &bull; {v.highRiskCount} high risk
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Empty overlay */}
      {villages.length === 0 && (
        <div className="heatmap-empty-overlay">
          <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }}>🗺️</div>
          <div>No synced village data yet</div>
          <div style={{ fontSize: '13px', marginTop: '6px', opacity: 0.6 }}>
            Data will appear when ASHA workers sync patient records.
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="heatmap-legend">
        <div className="heatmap-legend-title">Risk Density</div>
        <div className="heatmap-legend-item">
          <span className="heatmap-legend-dot" style={{ backgroundColor: '#EF4444' }} />
          <span>High (≥6)</span>
        </div>
        <div className="heatmap-legend-item">
          <span className="heatmap-legend-dot" style={{ backgroundColor: '#F59E0B' }} />
          <span>Medium (3–5)</span>
        </div>
        <div className="heatmap-legend-item">
          <span className="heatmap-legend-dot" style={{ backgroundColor: '#22C55E' }} />
          <span>Low (&lt;3)</span>
        </div>
      </div>
    </div>
  );
}
