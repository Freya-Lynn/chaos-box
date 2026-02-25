import ThemeSwitcher from './ThemeSwitcher';

export default function Header({ 
  search, onSearchChange, onAddClick, 
  currentTheme, onThemeChange,
  showWishlist, onShowWishlistChange, wishlistCount,
  view, onViewChange
}) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">📦</div>
        <h1>乱七八糟记录盒</h1>
      </div>
      
      <div className="search-box">
        <input
          type="text"
          placeholder="搜索记录..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="header-right">
        <div className="tab-switch">
          <button 
            className={`tab-btn ${view === 'all' && !showWishlist ? 'active' : ''}`}
            onClick={() => {
              onViewChange('all');
              onShowWishlistChange(false);
            }}
          >
            全部
          </button>
          <button 
            className={`tab-btn ${showWishlist ? 'active' : ''}`}
            onClick={() => {
              onViewChange('all');
              onShowWishlistChange(true);
            }}
          >
            愿望单
            {wishlistCount > 0 && <span className="wishlist-badge">{wishlistCount}</span>}
          </button>
          <button 
            className={`tab-btn ${view === 'vault' ? 'active' : ''}`}
            onClick={() => onViewChange('vault')}
          >
            密码
          </button>
        </div>
        
        <ThemeSwitcher currentTheme={currentTheme} onThemeChange={onThemeChange} />
        
        {view === 'all' && (
          <button className="add-btn" onClick={onAddClick} title="添加记录">
            +
          </button>
        )}
      </div>
    </header>
  );
}
