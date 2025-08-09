import React from 'react';
import { useUiStore } from '../../store/uiStore';
import './Toaster.css';

export const Toaster: React.FC = () => {
  const { toasts, dismissToast } = useUiStore();
  
  if (toasts.length === 0) return null;
  
  return (
    <div className="toaster">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => dismissToast(toast.id)}
        >
          <div className="toast-icon">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'warning' && '⚠'}
            {toast.type === 'info' && 'ℹ'}
          </div>
          <div className="toast-message">{toast.message}</div>
          <button 
            className="toast-close"
            onClick={(e) => {
              e.stopPropagation();
              dismissToast(toast.id);
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
