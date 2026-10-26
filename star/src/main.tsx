import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './Root';
// The site's fonts, served from nagm.io itself: no third-party request before
// the first paint. Only the weights the design uses; each splits into unicode
// ranges, so an Arabic page never downloads the Latin files it doesn't need.
import '@fontsource/noto-kufi-arabic/500.css';
import '@fontsource/noto-kufi-arabic/700.css';
import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/500.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource/ibm-plex-sans-arabic/700.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
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
