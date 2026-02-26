export default function TagBar({ tags, tagHierarchy, parentTagList, activeTag, onTagClick }) {
  const getTagIndex = (tag) => {
    const hash = tag.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return hash % 8;
  };

  return (
    <div className="tag-bar">
      <button
        className={`tag tag-all ${activeTag === null ? 'active' : ''}`}
        onClick={() => onTagClick(null)}
        style={{
          borderColor: '#999',
          color: '#666',
          background: activeTag === null ? '#666' : 'transparent',
          color: activeTag === null ? 'white' : '#666'
        }}
      >
        全部
      </button>
      
      {parentTagList && parentTagList.map((parentTag, idx) => (
        <button
          key={parentTag}
          className={`tag tag-color-${getTagIndex(parentTag)} ${activeTag === parentTag ? 'active' : ''}`}
          onClick={() => onTagClick(parentTag)}
        >
          {parentTag}
        </button>
      ))}
    </div>
  );
}
