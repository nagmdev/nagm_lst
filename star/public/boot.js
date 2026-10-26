// Runs in <head>, before first paint. A file, not inline, so the Content
// Security Policy can refuse every inline script.

// The saved theme, so a dark-mode visitor never sees a white flash.
try {
  var t = localStorage.getItem('nagm_theme');
  if (t === 'dark' || (t !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
} catch (e) { /* storage blocked */ }

// Errors from browser extensions and console snippets (VM scripts) are not the page's.
window.addEventListener('error', function (e) {
  if (e.filename && e.filename.indexOf('VM') !== -1) { e.preventDefault(); return false; }
});
