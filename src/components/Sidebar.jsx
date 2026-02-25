import { useState, useEffect } from 'react';

const colorSchemes = [
  { name: 'Berry', bg: '#faeee7', sidebar: '#ffc6c7', highlight: '#ff8ba7', secondary: '#ffc6c7', tertiary: '#c3f0ca', text: '#33272a' },
  { name: 'Lemon', bg: '#fff9db', sidebar: '#e3f6f5', highlight: '#ffd803', secondary: '#e3f6f5', tertiary: '#bae8e8', text: '#272343' },
  { name: 'Ocean', bg: '#e3f2fd', sidebar: '#a0c4de', highlight: '#3da9fc', secondary: '#90b4ce', tertiary: '#ef4565', text: '#094067' },
  { name: 'Forest', bg: '#e8e4e6', sidebar: '#b8ddd3', highlight: '#abd1c6', secondary: '#abd1c6', tertiary: '#e16162', text: '#001e1d' },
  { name: 'Lavender', bg: '#f3f0ff', sidebar: '#e8e0ff', highlight: '#a78bfa', secondary: '#ddd6fe', tertiary: '#fde68a', text: '#33272a' },
];

export default function Sidebar({ 
  wishlistCount, view, onViewChange,
  showWishlist, onShowWishlistChange
}) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('chaos-box-theme-mode') === 'dark';
  });
  const [currentScheme, setCurrentScheme] = useState(() => {
    return parseInt(localStorage.getItem('chaos-box-color-scheme') || '0');
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('chaos-box-theme-mode', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const scheme = colorSchemes[currentScheme];
    const root = document.documentElement;
    if (scheme && !isDark) {
      root.style.setProperty('--bg-page', scheme.bg);
      root.style.setProperty('--sidebar-bg', scheme.sidebar);
      root.style.setProperty('--highlight', scheme.highlight);
      root.style.setProperty('--secondary', scheme.secondary);
      root.style.setProperty('--tertiary', scheme.tertiary);
      root.style.setProperty('--text-primary', scheme.text);
      root.style.setProperty('--text-secondary', scheme.text);
      root.style.setProperty('--text-main', scheme.text);
    }
    localStorage.setItem('chaos-box-color-scheme', currentScheme);
  }, [currentScheme, isDark]);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <div className="page-icon">📦</div>
          <h1 className="page-title">乱七八糟</h1>
        </div>
      </div>
      
      <nav className="sidebar-nav" style={{ flex: 1, padding: '12px', overflow: 'auto' }}>
        <button 
          className={`nav-item ${view === 'all' && !showWishlist ? 'active' : ''}`}
          onClick={() => {
            onViewChange('all');
            onShowWishlistChange(false);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '12px 14px',
            borderRadius: '10px',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: 600,
            background: view === 'all' && !showWishlist ? 'var(--highlight)' : 'transparent',
            color: view === 'all' && !showWishlist ? 'white' : '#444',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '16px' }}>📋</span>
          全部记录
        </button>
        
        <button 
          className={`nav-item ${showWishlist ? 'active' : ''}`}
          onClick={() => {
            onViewChange('all');
            onShowWishlistChange(!showWishlist);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '12px 14px',
            borderRadius: '10px',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: 600,
            background: showWishlist ? 'var(--highlight)' : 'transparent',
            color: showWishlist ? 'white' : '#444',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '16px' }}>✨</span>
          愿望单
          {wishlistCount > 0 && (
            <span style={{
              marginLeft: 'auto',
              background: showWishlist ? 'white' : 'var(--highlight)',
              color: showWishlist ? 'var(--highlight)' : 'white',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '12px'
            }}>
              {wishlistCount}
            </span>
          )}
        </button>
        
        <button 
          className={`nav-item ${view === 'vault' ? 'active' : ''}`}
          onClick={() => {
            onViewChange('vault');
            onShowWishlistChange(false);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '12px 14px',
            borderRadius: '10px',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: 600,
            background: view === 'vault' ? 'var(--highlight)' : 'transparent',
            color: view === 'vault' ? 'white' : '#444',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '16px' }}>🔐</span>
          密码本
        </button>
      </nav>
      
      <div style={{ padding: '12px', borderTop: '2px solid var(--border-main)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button 
          onClick={() => setIsDark(!isDark)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            background: isDark ? '#333' : 'transparent',
            border: '2px solid #888',
            color: isDark ? '#fff' : '#222',
            boxShadow: isDark ? '0 0 8px rgba(0,0,0,0.3)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          {isDark ? '☀️ 明亮模式' : '🌙 暗黑模式'}
        </button>
        
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#666', marginBottom: '8px', padding: '0 4px' }}>
            配色
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {colorSchemes.map((scheme, index) => (
              <div
                key={index}
                onClick={() => setCurrentScheme(index)}
                title={scheme.name}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: scheme.highlight,
                  border: currentScheme === index ? '3px solid white' : '3px solid rgba(0,0,0,0.15)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  transform: currentScheme === index ? 'scale(1.15)' : 'scale(1)',
                  boxShadow: currentScheme === index ? '0 0 10px ' + scheme.highlight : '0 2px 4px rgba(0,0,0,0.2)'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
