import TagBar from './TagBar';
import RecordCard from './RecordCard';
import PasswordVault from './PasswordVault';

export default function MainContent({
  view,
  records,
  search,
  onSearchChange,
  activeTag,
  onActiveTagChange,
  allTags,
  tagHierarchy,
  parentTagList,
  showWishlist,
  onAddClick,
  onEdit,
  onDelete,
  tagColors,
  onToggleWishlist,
  getTagColor
}) {
  return (
    <main className="main-content">
      <header className="main-header">
        <div className="main-header-left">
          <h2 className="page-title">
            {view === 'vault' ? '🔐 密码本' : (showWishlist ? '✨ 愿望单' : '📋 全部记录')}
          </h2>
        </div>
        
        <div className="main-header-right">
          {view !== 'vault' && (
            <>
              <div className="global-search-box">
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="搜索..."
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
                {search && (
                  <span className="clear-search" onClick={() => onSearchChange('')}>×</span>
                )}
              </div>
              
              <button className="add-btn" onClick={onAddClick} title="添加记录">
                +
              </button>
            </>
          )}
        </div>
      </header>

      {view !== 'vault' && allTags.length > 0 && (
        <TagBar
          tags={allTags}
          tagHierarchy={tagHierarchy}
          parentTagList={parentTagList}
          activeTag={activeTag}
          onTagClick={onActiveTagChange}
        />
      )}

      <div className="records-area">
        {view === 'vault' ? (
          <PasswordVault />
        ) : records.length > 0 ? (
          <div className="records-grid">
            {records.map(record => (
              <RecordCard
                key={record.id}
                record={record}
                onEdit={onEdit}
                onDelete={onDelete}
                tagColors={tagColors}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="icon">{showWishlist ? '✨' : '📦'}</div>
            <h3>{showWishlist ? '愿望单为空' : '空空如也'}</h3>
            <p>{showWishlist ? '点击 + 添加你的愿望吧！' : '点击 + 按钮添加第一条记录吧！'}</p>
          </div>
        )}
      </div>
    </main>
  );
}
