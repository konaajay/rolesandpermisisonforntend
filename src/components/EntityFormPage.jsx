import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * EntityFormPage — Reusable enterprise full-page form shell.
 *
 * Props:
 *  - title          : Page heading  e.g. "Create User"
 *  - subtitle       : Optional breadcrumb/subtitle string
 *  - backRoute      : Route to go back to on cancel
 *  - onBack         : Optional cancel callback (overrides backRoute)
 *  - onSubmit       : Form submit handler (receives event)
 *  - submitLabel    : Submit button label, default "Save"
 *  - loading        : Boolean — disables submit while in flight
 *  - error          : String error message
 *  - success        : String success message
 *  - children       : Form field sections
 */
export default function EntityFormPage({
  title,
  subtitle,
  backRoute,
  onBack,
  onSubmit,
  submitLabel = 'Save',
  loading = false,
  error,
  success,
  children,
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) { onBack(); return; }
    if (backRoute) navigate(backRoute);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <button
              type="button"
              className="btn btn-link p-0 text-muted text-decoration-none d-flex align-items-center gap-1 small"
              onClick={handleBack}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
              </svg>
              Back
            </button>
            {subtitle && (
              <>
                <span className="text-muted small">/</span>
                <span className="text-muted small">{subtitle}</span>
              </>
            )}
          </div>
          <h5 className="fw-bold text-dark mb-0">{title}</h5>
        </div>
      </div>

      {/* ── Floating Toast Alerts ── */}
      {(success || error) && (
        <div className={`position-fixed top-0 end-0 m-3 alert alert-${success ? 'success' : 'danger'} shadow-sm border-0 small d-flex align-items-center gap-2`} style={{ zIndex: 9999, maxWidth: '400px' }} role="alert">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            {success ? (
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            ) : (
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
            )}
          </svg>
          {success || error}
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={onSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {children}
        </div>

        {/* ── Sticky Footer ── */}
        <div
          className="bg-white border-top mt-4 d-flex justify-content-end gap-2"
          style={{ padding: '16px 0', position: 'sticky', bottom: 0 }}
        >
          <button
            type="button"
            className="btn btn-light border fw-medium"
            style={{ height: '36px', minWidth: '90px' }}
            onClick={handleBack}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary fw-medium d-flex align-items-center gap-2"
            style={{ height: '36px', minWidth: '120px' }}
            disabled={loading}
          >
            {loading && (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            )}
            {loading ? 'Saving...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
