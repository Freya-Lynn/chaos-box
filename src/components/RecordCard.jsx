import { useState } from 'react';

export default function RecordCard({ record, onEdit, onDelete, tagColors, onToggleWishlist }) {
  const [playing, setPlaying] = useState(null);
  const [audioElements, setAudioElements] = useState({});

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePlayAudio = (audioData, index) => {
    if (audioElements[index]) {
      audioElements[index].pause();
      audioElements[index] = null;
      setPlaying(null);
    } else {
      const audio = new Audio(audioData);
      audio.onended = () => setPlaying(null);
      audio.play();
      setPlaying(index);
      setAudioElements(prev => ({ ...prev, [index]: audio }));
    }
  };

  const getTagClass = (tag) => {
    const colorIndex = tagColors[tag] ?? Math.floor(Math.random() * 8);
    return `tag-color-${colorIndex}`;
  };

  return (
    <div className={`record-card ${record.isWishlist ? 'wishlist-card' : ''} ${record.urgency ? `urgency-${record.urgency}` : ''}`} onClick={() => onEdit(record)}>
      <div className="record-content">
        {record.isWishlist && record.urgency > 0 && (
          <div className={`urgency-indicator urgency-${record.urgency}`}>
            {record.urgency === 1 && '🟢 不紧急'}
            {record.urgency === 2 && '🟡 有点急'}
            {record.urgency === 3 && '🔴 非常急'}
          </div>
        )}
        
        {record.text && (
          <div className="record-text" dangerouslySetInnerHTML={{ __html: record.text }}></div>
        )}

        {record.images && record.images.length > 0 && (
          <div className={`record-images ${record.images.length === 1 ? 'single' : 'multiple'}`}>
            {record.images.map((img, idx) => (
              <img key={idx} src={img} alt="" />
            ))}
          </div>
        )}

        {record.audios && record.audios.length > 0 && (
          <div className="record-audio">
            <button
              className="play-btn"
              onClick={(e) => {
                e.stopPropagation();
                handlePlayAudio(record.audios[0], 0);
              }}
            >
              {playing === 0 ? '⏸' : '▶'}
            </button>
            <span className="audio-duration">语音消息</span>
          </div>
        )}

        {record.tags && record.tags.length > 0 && (
          <div className="record-tags">
            {record.tags.map((tag, idx) => (
              <span key={idx} className={`tag ${getTagClass(tag)}`}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="record-footer">
          <span className="record-time">{formatTime(record.createdAt)}</span>
          <div className="record-actions" onClick={(e) => e.stopPropagation()}>
            <button 
              className={`action-btn ${record.isWishlist ? 'active' : ''}`}
              onClick={() => onToggleWishlist(record.id)}
              title={record.isWishlist ? '从愿望单移除' : '加入愿望单'}
            >
              {record.isWishlist ? '★' : '☆'}
            </button>
            <button className="action-btn" onClick={() => onEdit(record)}>✏</button>
            <button className="action-btn delete" onClick={() => onDelete(record.id)}>✕</button>
          </div>
        </div>
      </div>
    </div>
  );
}
