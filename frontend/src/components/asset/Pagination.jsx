import React from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import PropTypes from 'prop-types';

export default function Pagination({
  currentPage,
  itemsPerPage,
  onPageChange = () => {},
  onItemsPerPageChange = () => {},
  hasMore,
  totalPages,
  totalItems
}) {
  const getPageNumbers = () => {
    if (!totalPages) return [currentPage];
    
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 2) {
        end = 3;
      }
      if (currentPage >= totalPages - 1) {
        start = totalPages - 2;
      }
      
      if (start > 2) {
        pages.push('ellipsis-left');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push('ellipsis-right');
      }
      
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="pagination-footer-row">
      <div className="pagination-btns-group">
        <button
          type="button"
          className="page-nav-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          aria-label="Halaman Sebelumnya"
        >
          <FiChevronLeft size={16} strokeWidth={2.5} />
        </button>

        {getPageNumbers().map((page, idx) => {
          if (page === 'ellipsis-left' || page === 'ellipsis-right') {
            return (
              <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                ...
              </span>
            );
          }
          return (
            <button
              key={page}
              type="button"
              className={`page-num-btn ${currentPage === page ? 'active' : ''}`}
              aria-current={currentPage === page ? 'page' : undefined}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          );
        })}

        <button
          type="button"
          className="page-nav-btn"
          disabled={totalPages ? currentPage === totalPages : !hasMore}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Halaman Berikutnya"
        >
          <FiChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>

      <div className="items-per-page-select-container">
        <select
          aria-label="Jumlah item per halaman"
          className="items-per-page-select"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        >
          <option value={5}>5 / halaman</option>
          <option value={10}>10 / halaman</option>
          <option value={20}>20 / halaman</option>
        </select>
        <span className="dropdown-arrow-wrapper">
          <FiChevronDown size={16} strokeWidth={2.5} />
        </span>
      </div>
    </div>
  );
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func,
  onItemsPerPageChange: PropTypes.func,
  hasMore: PropTypes.bool.isRequired,
  totalPages: PropTypes.number,
  totalItems: PropTypes.number
};
