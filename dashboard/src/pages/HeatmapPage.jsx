import React, { useState, useEffect } from 'react';
import { fetchHeatmapData } from '../services/heatmapService';
import HeatmapMap from '../components/HeatmapMap';
import VillageSidebar from '../components/VillageSidebar';
import StatsCard from '../components/StatsCard';

/**
 * District Risk Heatmap — supervisor command-center page.
 * Dark-themed, spacious layout. Map dominates the viewport.
 * Sidebar only appears on village marker click.
 */
export default function HeatmapPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVillage, setSelectedVillage] = useState(null);

  useEffect(() => {
    fetchHeatmapData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="heatmap-page-dark">
        <div className="heatmap-loading">
          <div className="heatmap-spinner" />
          <div>Loading district intelligence…</div>
        </div>
      </div>
    );
  }

  const { villageSummaries, globalTotals } = data || {
    villageSummaries: [],
    globalTotals: { totalPatients: 0, highRiskVillages: 0, totalTbDefaulters: 0, totalMissedVaccinations: 0 },
  };

  return (
    <div className="heatmap-page-dark">
      {/* Page header */}
      <div className="heatmap-header">
        <h2>🗺️ District Risk Heatmap</h2>
        <p>Real-time village surveillance. Click any marker to drill down.</p>
      </div>

      {/* Stats row — reuses existing StatsCard (dark-themed via CSS variable override) */}
      <div className="heatmap-stats-row">
        <StatsCard icon="🚨" value={globalTotals.highRiskVillages}       label="High-Risk Villages"    color="var(--danger-color)"  />
        <StatsCard icon="🦠" value={globalTotals.totalTbDefaulters}      label="TB Defaulters"         color="var(--warning-color)" />
        <StatsCard icon="💉" value={globalTotals.totalMissedVaccinations} label="Missed Vaccinations"  color="var(--warning-color)" />
        <StatsCard icon="👥" value={globalTotals.totalPatients}           label="Patients Mapped"      color="var(--primary-color)" />
      </div>

      {/* Main body — map fills available space, sidebar appears on selection */}
      <div className="heatmap-body">
        <HeatmapMap
          villages={villageSummaries}
          onSelectVillage={setSelectedVillage}
          selectedVillage={selectedVillage}
        />

        {selectedVillage && (
          <VillageSidebar
            village={selectedVillage}
            onClose={() => setSelectedVillage(null)}
          />
        )}
      </div>
    </div>
  );
}
