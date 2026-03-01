export default function TagBar({ tags, activeTag, onTagClick }) {
  const getTagIndex = (tag) => {
    const hash = tag.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return hash % 8;
  };

  const topLevelTags = tags ? tags.filter(t => !t.includes('/')) : [];

  return (
    <div className="tag-bar">
      <button
        className={`tag tag-all ${activeTag === null ? 'active' : ''}`}
        onClick={() => onTagClick(null)}
        style={{
          borderColor: '#999',
          background: activeTag === null ? '#666' : 'transparent',
          color: activeTag === null ? 'white' : '#666'
        }}
      >
        全部
      </button>
      
      {topLevelTags.map((tag) => (
        <button
          key={tag}
          className={`tag tag-color-${getTagIndex(tag)} ${activeTag === tag ? 'active' : ''}`}
          onClick={() => onTagClick(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
