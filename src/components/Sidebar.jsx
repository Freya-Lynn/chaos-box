import { useState, useEffect } from 'react';

const colorSchemes = [
  { name: 'Berry', bg: '#faeee7', sidebar: '#ffc6c7', highlight: '#ff8ba7', secondary: '#ffc6c7', tertiary: '#c3f0ca', text: '#33272a', wishlistBg: '#fff0f3', wishlistShadow: 'rgba(255, 139, 167, 0.3)', tagColors: ['#ff8ba7', '#ffc6c7', '#c3f0ca', '#ff6b8a', '#ffb6c1', '#ff雀', '#e91e63', '#ff9800'] },
  { name: 'Lemon', bg: '#fff9db', sidebar: '#e3f6f5', highlight: '#ffd803', secondary: '#e3f6f5', tertiary: '#bae8e8', text: '#272343', wishlistBg: '#fffde7', wishlistShadow: 'rgba(255, 216, 3, 0.3)', tagColors: ['#ffd803', '#ffe44d', '#bae8e8', '#f0c419', '#d4a500', '#ffb300', '#ffc107', '#ff9800'] },
  { name: 'Ocean', bg: '#e3f2fd', sidebar: '#a0c4de', highlight: '#3da9fc', secondary: '#90b4ce', tertiary: '#ef4565', text: '#094067', wishlistBg: '#e3f2fd', wishlistShadow: 'rgba(61, 169, 252, 0.3)', tagColors: ['#3da9fc', '#90b4ce', '#ef4565', '#5cacee', '#1e88e5', '#00acc1', '#26c6da', '#00bcd4'] },
  { name: 'Forest', bg: '#e8f5e9', sidebar: '#b2dfdb', highlight: '#4db6ac', secondary: '#80cbc4', tertiary: '#66bb6a', text: '#1b5e20', wishlistBg: '#e0f2f1', wishlistShadow: 'rgba(77, 182, 172, 0.3)', tagColors: ['#4db6ac', '#80cbc4', '#66bb6a', '#26a69a', '#00897b', '#00796b', '#009688', '#4caf50'] },
  { name: 'Lavender', bg: '#f3f0ff', sidebar: '#e8e0ff', highlight: '#a78bfa', secondary: '#ddd6fe', tertiary: '#fde68a', text: '#33272a', wishlistBg: '#f3f0ff', wishlistShadow: 'rgba(167, 139, 250, 0.3)', tagColors: ['#a78bfa', '#c4b5fd', '#fde68a', '#8b5cf6', '#7c3aed', '#6d28d9', '#9333ea', '#8e44ad'] },
];

export default function Sidebar({ 
  wishlistCount, view, onViewChange,
  showWishlist, onShowWishlistChange,
  onExportData, onImportData,
  allTags, activeTag, onTagClick,
  onEditTag, onDeleteTag
}) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('chaos-box-theme-mode') === 'dark';
  });
  const [editingTag, setEditingTag] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [currentScheme, setCurrentScheme] = useState(() => {
    const saved = localStorage.getItem('chaos-box-color-scheme');
    const parsed = parseInt(saved || '0', 10);
    return isNaN(parsed) ? 0 : parsed;
  });

  const buildTree = (tags) => {
    const tree = {};
    tags.forEach(tag => {
      const parts = tag.split('/');
      let current = tree;
      parts.forEach((part, idx) => {
        if (!current[part]) {
          current[part] = { _tags: [], _level: idx };
        }
        if (idx === parts.length - 1) {
          current[part]._tags.push(tag);
        }
        current = current[part];
      });
    });
    return tree;
  };

  const renderTree = (node, level = 0) => {
    return Object.entries(node).map(([key, value]) => {
      if (key.startsWith('_')) return null;
      
      const hasChildren = Object.keys(value).some(k => !k.startsWith('_'));
      const marginLeft = level * 20;
      const fontSize = level === 0 ? 13 : Math.max(11, 13 - level);
      
      return (
        <div key={key + level}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <button
              onClick={() => onTagClick && onTagClick(value._tags?.[0] || key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flex: 1,
                padding: '8px 10px',
                borderRadius: '8px',
                fontSize: fontSize,
                fontWeight: level === 0 ? 600 : 400,
                background: activeTag === (value._tags?.[0] || key) ? 'var(--highlight)' : 'transparent',
                color: activeTag === (value._tags?.[0] || key) ? 'white' : '#444',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                marginLeft
              }}
            >
              {level === 0 ? '📁 ' : '📄 '}
              {key}
            </button>
          </div>
          {hasChildren && renderTree(value, level + 1)}
        </div>
      );
    });
  };

  const tree = buildTree(allTags || []);

  useEffect(() => {
    const scheme = colorSchemes[currentScheme];
    const root = document.documentElement;
    if (scheme) {
      root.style.setProperty('--bg-page', scheme.bg);
      root.style.setProperty('--sidebar-bg', scheme.sidebar);
      root.style.setProperty('--highlight', scheme.highlight);
      root.style.setProperty('--secondary', scheme.secondary);
      root.style.setProperty('--tertiary', scheme.tertiary);
      root.style.setProperty('--text-primary', scheme.text);
      root.style.setProperty('--text-secondary', scheme.text);
      root.style.setProperty('--text-main', scheme.text);
      root.style.setProperty('--card-wishlist-bg', scheme.wishlistBg);
      root.style.setProperty('--card-wishlist-shadow', scheme.wishlistShadow);
      if (scheme.tagColors) {
        scheme.tagColors.forEach((color, i) => {
          root.style.setProperty(`--tag-color-${i}`, color);
        });
      }
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

      {allTags && allTags.length > 0 && view !== 'vault' && (
        <div style={{ padding: '12px', overflow: 'auto', flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#888', marginBottom: '8px', padding: '0 4px' }}>
            标签
          </div>
          {renderTree(tree)}
        </div>
      )}
      
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
        
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            onClick={onExportData}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              border: '2px solid #888',
              background: 'transparent',
              color: '#666',
              cursor: 'pointer'
            }}
          >
            📤 导出
          </button>
          <label
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              border: '2px solid #888',
              background: 'transparent',
              color: '#666',
              cursor: 'pointer',
              textAlign: 'center',
              display: 'block'
            }}
          >
            📥 导入
            <input
              type="file"
              accept=".json"
              onChange={onImportData}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>
    </aside>
  );
}
