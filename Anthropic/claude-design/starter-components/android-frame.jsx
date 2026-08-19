// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// Android.jsx — Simplified Android (Material 3) device frame
// Status bar + top app bar + content + gesture nav + keyboard.
// Based on Figma M3 spec. No dependencies, no image assets.
// Exports (to window): AndroidDevice, AndroidStatusBar, AndroidAppBar, AndroidListItem, AndroidNavBar, AndroidKeyboard
//
// Usage — wrap your screen content in <AndroidDevice> to get the bezel, status
// bar and gesture nav (props: title, large, keyboard, dark):
//
//   <AndroidDevice title="Inbox" large>
//     ...your screen content...
//   </AndroidDevice>
//   <AndroidDevice title="Compose" keyboard>…</AndroidDevice>
/* END USAGE */

const MD_C = {
  surface: '#f4fbf8',
  surfaceVariant: '#dae5e1',
  inverseOnSurface: '#ecf2ef',
  secondaryContainer: '#cde8e1',
  primaryFixedDim: '#83d5c6',
  onSurface: '#171d1b',
  onSurfaceVar: '#49454f',
  onPrimaryContainer: '#00201c',
  primary: '#006a60',
  frameBorder: 'rgba(116,119,117,0.5)',
};

// ─────────────────────────────────────────────────────────────
// Status bar (time left, wifi/cell/battery right)
// ─────────────────────────────────────────────────────────────
function AndroidStatusBar({ dark = false }) {
  const c = dark ? '#fff' : MD_C.onSurface;
  return (
    <div style={{
      height: 40, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 16px',
      position: 'relative',
      fontFamily: 'Roboto, system-ui, sans-serif',
    }}>
      {/* time left */}
      <div style={{ width: 128, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 400, letterSpacing: 0.25, lineHeight: '20px', color: c }}>9:30</span>
      </div>
      {/* camera punch-hole (center) */}
      <div style={{
        position: 'absolute', left: '50%', top: 8, transform: 'translateX(-50%)',
        width: 24, height: 24, borderRadius: 100, background: '#2e2e2e',
      }} />
      {/* status icons right */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', paddingRight: 2 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" style={{ marginRight: -2 }}>
            <path d="M8 13.3L.67 5.97a10.37 10.37 0 0114.66 0L8 13.3z" fill={c}/>
          </svg>
          <svg width="16" height="16" viewBox="0 0 16 16" style={{ marginRight: -2 }}>
            <path d="M14.67 14.67V1.33L1.33 14.67h13.34z" fill={c}/>
          </svg>
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16">
          <rect x="3.75" y="2" width="8.5" height="13" rx="1.5" fill={c}/>
          <rect x="5.5" y="0.9" width="5" height="2" rx="0.5" fill={c}/>
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Top app bar (Material 3 small/medium)
// ─────────────────────────────────────────────────────────────
function AndroidAppBar({ title = 'Title', large = false }) {
  const iconDot = (
    <div style={{
      width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: MD_C.onSurfaceVar, opacity: 0.3 }} />
    </div>
  );
  return (
    <div style={{ background: MD_C.surface, padding: '4px 4px 0' }}>
      <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 4 }}>
        {iconDot}
        {!large && (
          <span style={{
            flex: 1, fontSize: 22, fontWeight: 400, color: MD_C.onSurface,
            fontFamily: 'Roboto, system-ui, sans-serif',
          }}>{title}</span>
        )}
        {large && <div style={{ flex: 1 }} />}
        {iconDot}
      </div>
      {large && (
        <div style={{
          padding: '16px 16px 20px',
          fontSize: 28, fontWeight: 400, color: MD_C.onSurface,
          fontFamily: 'Roboto, system-ui, sans-serif',
        }}>{title}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// List item (Material 3)
// ─────────────────────────────────────────────────────────────
function AndroidListItem({ headline, supporting, leading }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '12px 16px', minHeight: 56, boxSizing: 'border-box',
      fontFamily: 'Roboto, system-ui, sans-serif',
    }}>
      {leading && (
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: MD_C.primary, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 500, flexShrink: 0,
        }}>{leading}</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, color: MD_C.onSurface, lineHeight: '24px' }}>{headline}</div>
        {supporting && (
          <div style={{ fontSize: 14, color: MD_C.onSurfaceVar, lineHeight: '20px' }}>{supporting}</div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Gesture nav bar (pill)
// ─────────────────────────────────────────────────────────────
function AndroidNavBar({ dark = false }) {
  return (
    <div style={{
      height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 108, height: 4, borderRadius: 2,
        background: dark ? '#fff' : MD_C.onSurface, opacity: 0.4,
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Device frame — wraps everything
// ─────────────────────────────────────────────────────────────
function AndroidDevice({
  children, width = 412, height = 892, dark = false,
  title, large = false, keyboard = false,
}) {
  return (
    <div style={{
      width, height, borderRadius: 18, overflow: 'hidden',
      background: dark ? '#1d1b20' : MD_C.surface,
      border: `8px solid ${MD_C.frameBorder}`,
      boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
      display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
    }}>
      <AndroidStatusBar dark={dark} />
      {title !== undefined && <AndroidAppBar title={title} large={large} />}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
      {keyboard && <AndroidKeyboard />}
      <AndroidNavBar dark={dark} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Keyboard — Gboard (Material 3)
// ─────────────────────────────────────────────────────────────
function AndroidKeyboard() {
  let _k = 0;
  const key = (l, { flex = 1, bg = MD_C.surface, r = 6, minW, fs = 21 } = {}) => (
    <div key={_k++} style={{
      height: 46, borderRadius: r, flex, minWidth: minW,
      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Roboto, system-ui', fontSize: fs,
      color: MD_C.onPrimaryContainer,
    }}>{l}</div>
  );
  const row = (keys, style = {}) => (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', ...style }}>
      {keys.map(l => key(l))}
    </div>
  );
  return (
    <div style={{
      background: MD_C.inverseOnSurface, padding: '0 8px 8px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      {/* navbar spacer (icons omitted) */}
      <div style={{ height: 44 }} />
      {/* key rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {row(['q','w','e','r','t','y','u','i','o','p'])}
        {row(['a','s','d','f','g','h','j','k','l'], { padding: '0 20px' })}
        <div style={{ display: 'flex', gap: 6 }}>
          {key('', { bg: MD_C.surfaceVariant })}
          <div style={{ display: 'flex', gap: 6, flex: 7, minWidth: 274 }}>
            {['z','x','c','v','b','n','m'].map(l => key(l))}
          </div>
          {key('', { bg: MD_C.surfaceVariant })}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {key('?123', { bg: MD_C.secondaryContainer, r: 100, minW: 58, fs: 14 })}
          {key(',', { bg: MD_C.surfaceVariant })}
          {key('', { flex: 3, minW: 154 })}
          {key('.', { bg: MD_C.surfaceVariant })}
          {key('', { bg: MD_C.primaryFixedDim, r: 100, minW: 58 })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  AndroidDevice, AndroidStatusBar, AndroidAppBar, AndroidListItem, AndroidNavBar, AndroidKeyboard,
});
