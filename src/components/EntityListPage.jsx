import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * EntityListPage — Reusable enterprise list page shell.
 *
 * Props:
 *  - title          : Page heading
 *  - description    : Optional subtitle
 *  - addLabel       : "+ Add X" button label
 *  - addRoute       : Route to navigate to when add is clicked
 *  - onAdd          : Optional callback (overrides addRoute)
 *  - searchValue    : Controlled search string
 *  - onSearchChange : Search onChange handler
 *  - filters        : Optional JSX for extra filter controls
 *  - loading        : Boolean — shows skeleton rows
 *  - error          : String — shows error banner
 *  - children       : The <table> or list body
 *  - totalCount     : Optional record count badge
 */
export default function EntityListPage({
  title,
  description,
  addLabel,
  addRoute,
  onAdd,
  searchValue = '',
  onSearchChange,
  filters,
  loading,
  error,
  children,
  totalCount,
  headerActions,
}) {
  const navigate = useNavigate();

  const handleAdd = () => {
    if (onAdd) { onAdd(); return; }
    if (addRoute) navigate(addRoute);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Page Header ── */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <h5 className="fw-bold text-dark mb-0">{title}</h5>
          {description && (
            <span className="text-muted small">{description}</span>
          )}
        </div>

        <div className="d-flex align-items-center gap-2">
          {headerActions}
          {addLabel && (
            <button
              className="btn btn-primary btn-sm fw-medium d-flex align-items-center gap-1"
              style={{ height: '36px', paddingLeft: '14px', paddingRight: '14px' }}
              onClick={handleAdd}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/>
              </svg>
              {addLabel}
            </button>
          )}
        </div>
      </div>

      {/* ── Toolbar: Search + Filters ── */}
      <div className="d-flex align-items-center flex-wrap gap-2">
        <div
          className="d-flex align-items-center border rounded bg-white"
          style={{ height: '36px', paddingLeft: '10px', paddingRight: '10px', gap: '8px', flex: '1', minWidth: '200px', maxWidth: '360px' }}
        >
          <svg className="text-muted" width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.156a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
          </svg>
          <input
            type="text"
            className="border-0 bg-transparent outline-0 w-100 small"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchValue}
            onChange={e => onSearchChange && onSearchChange(e.target.value)}
            style={{ outline: 'none', fontSize: '13px' }}
          />
        </div>

        {filters}

        {totalCount !== undefined && (
          <span className="ms-auto text-muted small">
            {totalCount} record{totalCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="alert alert-danger py-2 px-3 small border-0 rounded-2 d-flex align-items-center gap-2" role="alert">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
          </svg>
          {error}
        </div>
      )}

      {/* ── Table Card ── */}
      <div className="card border-0 shadow-sm rounded-3" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="p-5 text-center">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="text-muted small mt-2">Loading {title.toLowerCase()}...</div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
