export default function TagBar({ tags, activeTag, onTagClick }) {
  return (
    <div className="tag-bar">
      <button
        className={`tag tag-all ${activeTag === null ? 'active' : ''}`}
        onClick={() => onTagClick(null)}
        style={{
          borderColor: '#999',
          color: '#666',
          background: '#eee'
        }}
      >
        全部
      </button>
      {tags.map((tag, index) => (
        <button
          key={tag}
          className={`tag tag-color-${index % 8} ${activeTag === tag ? 'active' : ''}`}
          onClick={() => onTagClick(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
