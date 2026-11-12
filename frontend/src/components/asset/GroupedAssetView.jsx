import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import AssetTable from './AssetTable';
import { FiChevronDown, FiChevronRight, FiMapPin, FiPrinter } from 'react-icons/fi';
import { groupAssetsByLocation } from '../../utils/groupAssetsByLocation';
import './GroupedAssetView.css';

export default function GroupedAssetView({
  assets = [],
  isLoading,
  onView,
  onEdit,
  onDelete,
  showActions = true,
  onNavigateToRepair,
  onDeleteSubAsset,
  activeRepairCodes = [],
  inProgressRepairCodes = [],
  onPrintRoom,
  printingRoomKey = null,
}) {

  const [expandedGroups, setExpandedGroups] = useState({});

  // Reset status expand ketika data assets berubah (misal karena filter atau refetch)
  useEffect(() => {
    setExpandedGroups({});
  }, [assets]);

  if (isLoading) {
    return <div className="loading-state">Memuat data per ruangan...</div>;
  }

  if (!assets || assets.length === 0) {
    return <div className="empty-state">Tidak ada data aset untuk ditampilkan.</div>;
  }

  // Group assets by location (unit + room) and sort alphabetically (extracted logic)
  const sortedGroupedData = useMemo(() => {
    return groupAssetsByLocation(assets);
  }, [assets]);

  const toggleGroup = (loc) => {
    setExpandedGroups(prev => ({
      ...prev,
      [loc]: !prev[loc]
    }));
  };

  return (
    <div className="grouped-asset-container">
      {sortedGroupedData.map(([location, items]) => {
        const isExpanded = !!expandedGroups[location];
        const firstAsset = items[0] || {};
        const unitName = firstAsset.unit && firstAsset.unit !== '-' ? firstAsset.unit : '';
        const roomName = firstAsset.location && firstAsset.location !== '-' ? firstAsset.location : location;
        const totalUnits = items.reduce((sum, item) => sum + (Number(item.quantity || item.jumlah_aset) || 0), 0);
        const isPrintingThis = printingRoomKey === location;

        return (
          <div key={location} className="asset-group-card">
            <div 
              className={`asset-group-header ${isExpanded ? 'expanded' : ''}`}
              onClick={() => toggleGroup(location)}
            >
              <div className="asset-group-title">
                {isExpanded ? <FiChevronDown size={20} /> : <FiChevronRight size={20} />}
                <FiMapPin className="location-icon" />
                {unitName && <span className="group-unit-badge">{unitName}</span>}
                <h3>{roomName}</h3>
              </div>

              <div className="asset-group-right">
                <span className="asset-count-badge">
                  {items.length} Jenis Aset ({totalUnits} Unit)
                </span>
                {onPrintRoom && (
                  <button
                    type="button"
                    className="btn-print-room"
                    title={`Cetak PDF daftar aset ruangan ${location}`}
                    disabled={isPrintingThis}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrintRoom(unitName, roomName, location);
                    }}
                  >
                    <FiPrinter size={14} />
                    <span>{isPrintingThis ? 'Mencetak...' : 'Cetak Ruangan'}</span>
                  </button>
                )}
              </div>
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
                  onUpdateSubAssetCondition={null}
                  onNavigateToRepair={onNavigateToRepair}
                  onDeleteSubAsset={onDeleteSubAsset}
                  activeRepairCodes={activeRepairCodes}
                  inProgressRepairCodes={inProgressRepairCodes}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

GroupedAssetView.propTypes = {
  assets: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  showActions: PropTypes.bool,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onPrintRoom: PropTypes.func,
  printingRoomKey: PropTypes.string,
};
