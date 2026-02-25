import { useState, useRef, useEffect } from 'react';

const themes = [
  { id: 'dreamy', name: '梦幻甜品', dot: 'dreamy' },
  { id: 'candy', name: '糖果系', dot: 'candy' },
  { id: 'japanese', name: '和风', dot: 'japanese' },
  { id: 'mint', name: '薄荷', dot: 'mint' },
  { id: 'macaron', name: '马卡龙', dot: 'macaron' },
  { id: 'forest', name: '森林', dot: 'forest' },
  { id: 'ocean', name: '海洋', dot: 'ocean' },
  { id: 'cyber', name: '赛博朋克', dot: 'cyber' },
];

export default function ThemeSwitcher({ currentTheme, onThemeChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = themes.find(t => t.id === currentTheme) || themes[0];

  return (
    <div className="theme-switcher" ref={dropdownRef}>
      <button className="theme-btn" onClick={() => setOpen(!open)}>
        <span className={`theme-dot ${current.dot}`}></span>
        {current.name}
        <span style={{ fontSize: 10 }}>▼</span>
      </button>
      
      {open && (
        <div className="theme-dropdown">
          {themes.map(theme => (
            <button
              key={theme.id}
              className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
              onClick={() => {
                onThemeChange(theme.id);
                setOpen(false);
              }}
            >
              <span className={`theme-dot ${theme.dot}`}></span>
              {theme.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
