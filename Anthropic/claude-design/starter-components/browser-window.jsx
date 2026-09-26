// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// Chrome.jsx — Simplified Chrome browser window (dark theme, macOS)
// No dependencies, no image assets. All inline styles + inline SVG.
// Exports (to window): ChromeWindow, ChromeTabBar, ChromeToolbar, ChromeTab, ChromeTrafficLights
//
// Usage — wrap your page content in <ChromeWindow> to get the tab bar + URL bar:
//
//   <ChromeWindow width={1100} height={680} url="acme.design/pricing">
//     ...your page content...
//   </ChromeWindow>
/* END USAGE */

const CHROME_C = {
  barBg: '#202124',
  tabBg: '#35363a',
  text: '#e8eaed',
  dim: '#9aa0a6',
  urlBg: '#282a2d',
};

function ChromeTrafficLights() {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '0 14px' }}>
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
    </div>
  );
}

// Single tab (active has curved scoops)
function ChromeTab({ title = 'New Tab', active = false }) {
  const curve = (flip) => (
    <svg width="8" height="10" viewBox="0 0 8 10"
      style={{ position: 'absolute', bottom: 0, [flip ? 'right' : 'left']: -8, transform: flip ? 'scaleX(-1)' : 'none' }}>
      <path d="M0 10C2 9 6 8 8 0V10H0Z" fill={CHROME_C.tabBg}/>
    </svg>
  );
  return (
    <div style={{
      position: 'relative', height: 34, alignSelf: 'flex-end',
      padding: '0 12px', display: 'flex', alignItems: 'center', gap: 8,
      background: active ? CHROME_C.tabBg : 'transparent',
      borderRadius: '8px 8px 0 0', minWidth: 120, maxWidth: 220,
      fontFamily: 'system-ui, sans-serif', fontSize: 12,
      color: active ? CHROME_C.text : CHROME_C.dim,
    }}>
      {active && curve(false)}
      {active && curve(true)}
      <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#5f6368', flexShrink: 0 }} />
      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
    </div>
  );
}

function ChromeTabBar({ tabs = [{ title: 'New Tab' }], activeIndex = 0 }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', height: 44,
      background: CHROME_C.barBg, paddingRight: 8,
    }}>
      <ChromeTrafficLights />
      <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', paddingLeft: 4, flex: 1 }}>
        {tabs.map((t, i) => <ChromeTab key={i} title={t.title} active={i === activeIndex} />)}
      </div>
    </div>
  );
}

function ChromeToolbar({ url = 'example.com' }) {
  const iconDot = (
    <div style={{
      width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: CHROME_C.dim, opacity: 0.4 }} />
    </div>
  );
  return (
    <div style={{
      height: 40, background: CHROME_C.tabBg,
      display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px',
    }}>
      {iconDot}
      {/* url bar */}
      <div style={{
        flex: 1, height: 30, borderRadius: 15, background: CHROME_C.urlBg,
        display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px',
        margin: '0 6px',
      }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: CHROME_C.dim, opacity: 0.4 }} />
        <span style={{
          flex: 1, color: CHROME_C.text, fontSize: 13,
          fontFamily: 'system-ui, sans-serif',
        }}>{url}</span>
      </div>
      {iconDot}
    </div>
  );
}

function ChromeWindow({
  tabs = [{ title: 'New Tab' }], activeIndex = 0, url = 'example.com',
  width = 900, height = 600, children,
}) {
  return (
    <div style={{
      width, height, borderRadius: 10, overflow: 'hidden',
      boxShadow: '0 24px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.1)',
      display: 'flex', flexDirection: 'column', background: CHROME_C.tabBg,
    }}>
      <ChromeTabBar tabs={tabs} activeIndex={activeIndex} />
      <ChromeToolbar url={url} />
      <div style={{ flex: 1, background: '#fff', overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
}

Object.assign(window, {
  ChromeWindow, ChromeTabBar, ChromeToolbar, ChromeTab, ChromeTrafficLights,
});
