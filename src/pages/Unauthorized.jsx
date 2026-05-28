import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="container text-center py-5">
      <div className="card shadow-sm p-5 mx-auto" style={{ maxWidth: '500px', marginTop: '10vh' }}>
        <div className="text-danger mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-shield-slash-fill" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M1.093 3.093c-.465.42-.75.882-.892 1.356-.141.467-.201 1.002-.201 1.551 0 3.396 1.855 6.906 7.785 9.07a1 1 0 0 0 .61 0c2.24-.817 4.11-2.28 5.252-4.103l-1.41-1.41c-.812 1.258-2.146 2.37-3.842 3.003-5.247-1.92-6.398-4.945-6.398-6.56 0-.325.033-.64.1-.934L1.093 3.093zm1.618 1.618 11.238 11.238.707-.707L13.418 13.9c1.69-1.933 2.582-4.475 2.582-7.899 0-.55-.06-1.084-.201-1.551-.143-.474-.427-.936-.892-1.356C13.487 1.889 11.085.992 9.01.597a2 2 0 0 0-2.02 0c-1.397.268-3.08.826-4.279 1.678L2.71 2.274l-.707.707.708.708v.022zM8 5.5v3h.5L8 5.5z"/>
          </svg>
        </div>
        <h2 className="card-title text-danger mb-3">Access Denied</h2>
        <p className="card-text text-muted mb-4">
          You do not have the required permissions or active modules enabled to access this section of the portal.
        </p>
        <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
          <button 
            onClick={() => navigate('/')} 
            className="btn btn-primary px-4 py-2"
          >
            Go to Dashboard
          </button>
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-outline-secondary px-4 py-2"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
