import React, { useState } from 'react';
import AssetTable from './AssetTable';
import { FiChevronDown, FiChevronRight, FiMapPin } from 'react-icons/fi';
import './GroupedAssetView.css';

export default function GroupedAssetView({ assets, isLoading, showActions, onView, onEdit, onDelete }) {
  const [expandedGroups, setExpandedGroups] = useState({});

  if (isLoading) {
    return <div className="loading-state">Memuat data per ruangan...</div>;
  }

  if (!assets || assets.length === 0) {
    return <div className="empty-state">Tidak ada data aset untuk ditampilkan.</div>;
  }

  // Group assets by location (unit + room)
  const groupedData = assets.reduce((acc, asset) => {
    const loc = asset.location || 'Tidak Diketahui';
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(asset);
    return acc;
  }, {});

  const toggleGroup = (loc) => {
    setExpandedGroups(prev => ({
      ...prev,
      [loc]: !prev[loc]
    }));
  };

  return (
    <div className="grouped-asset-container">
      {Object.entries(groupedData).sort(([a], [b]) => a.localeCompare(b)).map(([location, items]) => {
        const isExpanded = !!expandedGroups[location];
        return (
          <div key={location} className="asset-group-card">
            <div 
              className={`asset-group-header ${isExpanded ? 'expanded' : ''}`}
              onClick={() => toggleGroup(location)}
            >
              <div className="asset-group-title">
                {isExpanded ? <FiChevronDown size={20} /> : <FiChevronRight size={20} />}
                <FiMapPin className="location-icon" />
                <h3>{location}</h3>
              </div>
              <span className="asset-count-badge">{items.length} Aset</span>
            </div>
            
            {isExpanded && (
              <div className="asset-group-body">
                <AssetTable
                  assets={items}
                  isLoading={false}
                  showActions={showActions}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
