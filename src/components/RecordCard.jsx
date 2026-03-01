import { useState } from 'react';

export default function RecordCard({ record, onEdit, onDelete, tagColors, onToggleWishlist }) {
  const [playing, setPlaying] = useState(null);
  const [audioElements, setAudioElements] = useState({});
  const [enlargedImage, setEnlargedImage] = useState(null);

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

  const handleCardClick = (e) => {
    const target = e.target;
    if (target.tagName === 'IMG') {
      setEnlargedImage(target.src);
      return;
    }
    onEdit(record);
  };

  return (
    <>
      <div className={`record-card ${record.isWishlist ? 'wishlist-card' : ''} ${record.urgency ? `urgency-${record.urgency}` : ''}`} onClick={handleCardClick}>
        <div className="record-content">
          {record.isWishlist && record.urgency > 0 && (
            <div className={`urgency-indicator urgency-${record.urgency}`}>
              {record.urgency === 1 && '🟢 不紧急'}
              {record.urgency === 2 && '🟡 有点急'}
              {record.urgency === 3 && '🔴 非常急'}
            </div>
          )}
          
          {record.text && (
            <div 
              className="record-text" 
              dangerouslySetInnerHTML={{ __html: record.text }}
            ></div>
          )}

          {record.images && record.images.length > 0 && (
            <div 
              className={`record-images ${record.images.length === 1 ? 'single' : 'multiple'}`}
            >
              {record.images.map((img, idx) => (
                <img 
                  key={idx} 
                  src={img} 
                  alt=""
                />
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

          {record.attachments && record.attachments.length > 0 && (
            <div className="record-attachments" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
              {record.attachments.map((file, idx) => (
                <a
                  key={idx}
                  href={file.data}
                  download={file.name}
                  onClick={(e) => e.stopPropagation()}
                  style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: '8px', background: '#f5f5f5', borderRadius: '8px', textDecoration: 'none', color: '#333' }}
                >
                  <span style={{ fontSize: '16px' }}>{file.icon}</span>
                  <span style={{ flex: 1, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                </a>
              ))}
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

      {enlargedImage && (
        <div 
          className="image-viewer-overlay"
          onClick={() => setEnlargedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'pointer'
          }}
        >
          <img 
            src={enlargedImage} 
            alt=""
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
          <button
            onClick={() => setEnlargedImage(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
