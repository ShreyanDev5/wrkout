export const ThemeScript = () => {
  const script = `
    (function() {
      function getInitialColorMode() {
        const persistedColorPreference = window.localStorage.getItem('color-mode');
        const hasPersistedPreference = typeof persistedColorPreference === 'string';

        if (hasPersistedPreference) {
          return persistedColorPreference;
        }

        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const hasMediaQueryPreference = typeof mql.matches === 'boolean';

        if (hasMediaQueryPreference) {
          return mql.matches ? 'dark' : 'light';
        }

        return 'dark';
      }

      const colorMode = getInitialColorMode();
      const root = document.documentElement;
      root.style.setProperty('--initial-color-mode', colorMode);

      if (colorMode === 'dark') {
        root.classList.add('dark');
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}; 