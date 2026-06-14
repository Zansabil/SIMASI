import React from 'react';

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-9-6" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default function Pagination({
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  hasMore
}) {
  return (
    <div className="pagination-footer-row">
      <div className="pagination-btns-group">
        <button
          className="page-nav-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          aria-label="Halaman Sebelumnya"
        >
          <ChevronLeftIcon />
        </button>

        <button className="page-num-btn active">
          {currentPage}
        </button>

        <button
          className="page-nav-btn"
          disabled={!hasMore}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Halaman Berikutnya"
        >
          <ChevronRightIcon />
        </button>
      </div>

      <div className="items-per-page-select-container">
        <select
          className="items-per-page-select"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        >
          <option value={5}>5 / halaman</option>
          <option value={10}>10 / halaman</option>
          <option value={20}>20 / halaman</option>
        </select>
        <span className="dropdown-arrow-wrapper">
          <ChevronDownIcon />
        </span>
      </div>
    </div>
  );
}
