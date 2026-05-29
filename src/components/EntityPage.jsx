import React, { useState } from 'react';

export default function EntityPage({
  title,
  addButtonLabel,
  onAddClick,
  table,
  form,
  isDrawerOpen,
  closeDrawer,
  drawerTitle = "Create"
}) {
  return (
    <div className="container-fluid p-0 h-100 d-flex flex-column position-relative">
      {/* Header Area */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0 text-dark">{title}</h4>
        
        <div className="d-flex gap-2 align-items-center">
          <div className="input-group input-group-sm border rounded bg-white">
            <span className="input-group-text bg-white border-0 text-muted">
              <i className="bi bi-search"></i>
            </span>
            <input 
              type="text" 
              className="form-control border-0 shadow-none" 
              placeholder="Search..." 
              style={{ width: '250px' }}
            />
          </div>
          
          <button className="btn btn-light border btn-sm text-secondary px-3">
            <i className="bi bi-funnel-fill me-1"></i> Filter
          </button>
          
          {addButtonLabel && onAddClick && (
            <button className="btn btn-primary btn-sm px-3 fw-medium" onClick={onAddClick}>
              <i className="bi bi-plus-lg me-1"></i> {addButtonLabel}
            </button>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="card border-0 shadow-sm flex-grow-1 overflow-hidden rounded-3">
        {table}
      </div>

      {/* Slide-out Drawer */}
      {isDrawerOpen && (
        <div className="offcanvas-backdrop fade show" style={{ zIndex: 1040 }} onClick={closeDrawer}></div>
      )}
      
      <div 
        className={`offcanvas offcanvas-end shadow-lg border-0 ${isDrawerOpen ? 'show' : ''}`} 
        tabIndex="-1" 
        style={{ 
          visibility: isDrawerOpen ? 'visible' : 'hidden', 
          width: '550px', 
          zIndex: 1045,
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        <div className="offcanvas-header border-bottom py-3">
          <h5 className="offcanvas-title fw-bold text-dark m-0">{drawerTitle}</h5>
          <button type="button" className="btn-close shadow-none" onClick={closeDrawer} aria-label="Close"></button>
        </div>
        <div className="offcanvas-body p-0 bg-light">
          {form}
        </div>
      </div>
    </div>
  );
}
