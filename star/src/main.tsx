import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './Root';
import './landing.css';

// nagm.io: marketing landing + pre-auth flow (login/register/verify) that hands
// the session off to app.nagm.io. The old STAR app code is no longer imported.

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
          <h2>Something went wrong.</h2>
          <p>Please refresh the page to continue.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '10px 20px', backgroundColor: '#6D5BF5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

window.addEventListener('error', (event) => {
  if (event.filename && event.filename.includes('VM')) {
    event.preventDefault();
    return false;
  }
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.warn('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

const app = (
  <React.StrictMode>
    <ErrorBoundary>
      <Root />
    </ErrorBoundary>
  </React.StrictMode>
);

// Pages built ahead of time (scripts/prerender.mjs) say which address they
// were rendered for. Take over that HTML only on that address; anything else
// (the 404 page, sign-in) renders from scratch.
const container = document.getElementById('root')!;
const here = window.location.pathname.replace(/(.)\/+$/, '$1');
if (container.dataset.prerendered === here && container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, app);
} else {
  container.textContent = '';
  ReactDOM.createRoot(container).render(app);
}
