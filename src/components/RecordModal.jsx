import { useState, useRef, useEffect } from 'react';

const FONTS = [
  { id: 'default', name: '默认', family: 'inherit' },
  { id: 'kaiti', name: '楷体', family: '"KaiTi", "STKaiti", "楷体", cursive' },
  { id: 'songti', name: '宋体', family: '"Songti SC", "SimSun", "宋体", serif' },
  { id: 'sans', name: '黑体', family: '"Noto Sans SC", sans-serif' },
  { id: 'zcool', name: '快乐体', family: '"ZCOOL KuaiLe", cursive' },
  { id: 'mashan', name: '马善政', family: '"Ma Shan Zheng", cursive' },
  { id: 'longcang', name: '龙藏', family: '"Long Cang", cursive' },
  { id: 'zhimang', name: '知网', family: '"Zhi Mang Xing", cursive' },
  { id: 'huiwen', name: '汇文正楷', family: '"JingNanFangKaoTi", cursive' },
];

export default function RecordModal({ record, allTags, tagColors, onSave, onClose }) {
  const [text, setText] = useState(record?.text || '');
  const [images, setImages] = useState(record?.images || []);
  const [audios, setAudios] = useState(record?.audios || []);
  const [attachments, setAttachments] = useState(record?.attachments || []);
  const [selectedTags, setSelectedTags] = useState(record?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [fontSize, setFontSize] = useState(3);
  const [fontFamily, setFontFamily] = useState('default');
  const [isWishlist, setIsWishlist] = useState(record?.isWishlist || false);
  const [showUrgency, setShowUrgency] = useState(!!record?.urgency);
  const [urgency, setUrgency] = useState(record?.urgency || 1);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const inlineImageInputRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleGlobalPaste = (e) => {
      const clipboardData = e.clipboardData || e.nativeEvent?.clipboardData;
      if (!clipboardData) return;
      
      const items = clipboardData.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type && item.type.startsWith('image/')) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const editor = editorRef.current;
              const isEditorFocused = editor && document.activeElement === editor;
              
              if (isEditorFocused) {
                const imgHtml = `<img src="${event.target.result}" style="max-width: 150px; height: auto; border-radius: 4px; margin: 4px; cursor: pointer; display: inline-block; vertical-align: middle;" />`;
                document.execCommand('insertHTML', false, imgHtml);
              } else {
                setImages(prev => [...prev, event.target.result]);
              }
            };
            reader.readAsDataURL(blob);
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handleGlobalPaste);
    return () => document.removeEventListener('paste', handleGlobalPaste);
  }, []);

  useEffect(() => {
    if (editorRef.current && record?.text) {
      editorRef.current.innerHTML = record.text;
    }
  }, []);

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    highlight: false
  });

  const updateActiveFormats = (preserveHighlight = false) => {
    setActiveFormats(prev => ({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      highlight: preserveHighlight ? prev.highlight : false
    }));
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleFontSize = (size) => {
    setFontSize(size);
    const sizes = ['1', '2', '3', '4'];
    execCommand('fontSize', sizes[size - 1]);
  };

  const handleFontFamily = (font) => {
    setFontFamily(font.id);
    const selectedFont = FONTS.find(f => f.id === font.id);
    execCommand('fontName', selectedFont.family);
  };

  const handleTextColor = (color) => {
    if (activeFormats.highlight) {
      execCommand('hiliteColor', color);
    } else {
      execCommand('foreColor', color);
    }
  };

  const handleHighlight = () => {
    const currentState = activeFormats.highlight;
    const newHighlightState = !currentState;
    
    if (newHighlightState) {
      execCommand('hiliteColor', '#FFE66D');
    } else {
      execCommand('hiliteColor', 'transparent');
    }
    setActiveFormats(prev => ({ ...prev, highlight: newHighlightState }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleInlineImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const imgHtml = `<img src="${event.target.result}" style="max-width: 150px; height: auto; border-radius: 4px; margin: 4px; cursor: pointer; display: inline-block; vertical-align: middle;" />`;
      execCommand('insertHTML', imgHtml);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const insertInlineImage = () => {
    inlineImageInputRef.current?.click();
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = (event) => {
          setAudios(prev => [...prev, event.target.result]);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('录音失败:', err);
      alert('无法访问麦克风，请确保已授予权限');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const removeAudio = (index) => {
    setAudios(prev => prev.filter((_, i) => i !== index));
  };

  const handlePaste = (e) => {
    const clipboardData = e.clipboardData || e.nativeEvent.clipboardData;
    if (!clipboardData) return;
    
    const items = clipboardData.items;
    if (!items) return;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type && item.type.startsWith('image/')) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setImages(prev => [...prev, event.target.result]);
          };
          reader.readAsDataURL(blob);
        }
        break;
      }
    }
  };

  const handleAttachmentUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileType = file.name.split('.').pop().toLowerCase();
        const fileIcon = {
          'pdf': '📄',
          'doc': '📝', 'docx': '📝',
          'xls': '📊', 'xlsx': '📊',
          'ppt': '📽️', 'pptx': '📽️',
          'txt': '📃',
          'epub': '📚',
          'zip': '📦', 'rar': '📦',
          'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️',
          'mp3': '🎵', 'wav': '🎵', 'mp4': '🎬', 'avi': '🎬'
        }[fileType] || '📎';
        
        setAttachments(prev => [...prev, {
          name: file.name,
          type: fileType,
          data: event.target.result,
          icon: fileIcon,
          size: file.size
        }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags(prev => [...prev, trimmedTag]);
    }
    setTagInput('');
  };

  const removeTag = (tag) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handleSave = () => {
    const editorText = editorRef.current?.innerHTML || '';
    const plainText = editorRef.current?.innerText || '';
    const hasInlineImage = editorText.includes('<img');
    if (!plainText.trim() && images.length === 0 && audios.length === 0 && attachments.length === 0 && !hasInlineImage) {
      alert('请至少添加一些内容');
      return;
    }
    onSave({
      id: record?.id || Date.now(),
      text: editorText,
      images,
      audios,
      attachments,
      tags: selectedTags,
      isWishlist,
      urgency: showUrgency ? urgency : 0,
      createdAt: record?.createdAt || Date.now(),
      updatedAt: Date.now()
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{record ? '编辑记录' : '添加记录'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>文字内容</label>
            <div className="editor-toolbar">
              <button type="button" title="加粗" onClick={() => { execCommand('bold'); updateActiveFormats(true); }} className={activeFormats.bold ? 'active' : ''}>B</button>
              <button type="button" title="斜体" onClick={() => { execCommand('italic'); updateActiveFormats(true); }} className={activeFormats.italic ? 'active' : ''} style={{ fontStyle: 'italic' }}>I</button>
              <button type="button" title="下划线" onClick={() => { execCommand('underline'); updateActiveFormats(true); }} className={activeFormats.underline ? 'active' : ''}>U</button>
              <button type="button" title="高亮" onClick={handleHighlight} className={activeFormats.highlight ? 'active' : ''}>🖍</button>
              <div className="toolbar-divider"></div>
              <input 
                type="color" 
                title="文字颜色" 
                onChange={(e) => handleTextColor(e.target.value)}
                className="color-picker"
              />
              <div className="toolbar-divider"></div>
              <button type="button" className={fontSize === 1 ? 'active' : ''} onClick={() => handleFontSize(1)} title="小字">A<sup style={{fontSize:10}}>12</sup></button>
              <button type="button" className={fontSize === 2 ? 'active' : ''} onClick={() => handleFontSize(2)} title="中字">A<sup style={{fontSize:10}}>14</sup></button>
              <button type="button" className={fontSize === 3 ? 'active' : ''} onClick={() => handleFontSize(3)} title="大字">A<sup style={{fontSize:10}}>18</sup></button>
              <button type="button" className={fontSize === 4 ? 'active' : ''} onClick={() => handleFontSize(4)} title="超大">A<sup style={{fontSize:10}}>24</sup></button>
              <div className="toolbar-divider"></div>
              <button type="button" title="有序列表 (1. 2. 3.)" onClick={() => execCommand('insertOrderedList')} style={{ width: '28px', height: '28px', fontWeight: 600 }}>1.</button>
              <button type="button" title="无序列表 (•)" onClick={() => execCommand('insertUnorderedList')} style={{ width: '28px', height: '28px', fontWeight: 600 }}>•</button>
              <button type="button" title="插入图片到文字中" onClick={insertInlineImage} style={{ width: '28px', height: '28px', fontSize: '16px' }}>🖼</button>
              <div className="toolbar-divider"></div>
              <select 
                className="font-select"
                value={fontFamily}
                onChange={(e) => {
                  const font = FONTS.find(f => f.id === e.target.value);
                  handleFontFamily(font);
                }}
              >
                {FONTS.map(font => (
                  <option key={font.id} value={font.id} style={{ fontFamily: font.family }}>
                    {font.name}
                  </option>
                ))}
              </select>
              <input
                ref={inlineImageInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleInlineImageUpload}
              />
            </div>
            <div
              ref={editorRef}
              className="editor-content"
              contentEditable
              placeholder="记录点什么... (可直接 Ctrl+V 粘贴图片，或点击 🖼 插入图片)"
              suppressContentEditableWarning
              onMouseUp={() => updateActiveFormats(true)}
              onKeyUp={() => updateActiveFormats(true)}
            ></div>
          </div>

          <div className="form-group">
            <label>图片</label>
            <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
              <div className="icon">📷</div>
              <p>点击上传图片</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
            {images.length > 0 && (
              <div className="preview-images">
                {images.map((img, idx) => (
                  <div key={idx} className="preview-item">
                    <img src={img} alt="" />
                    <button className="remove-btn" onClick={() => removeImage(idx)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>语音</label>
            <div className="audio-recorder">
              <button
                className={`record-btn ${isRecording ? 'recording' : 'stop'}`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? '⏹' : '🎤'}
              </button>
              <span className="audio-status">
                {isRecording ? `录音中 ${recordingTime}s` : '点击开始录音'}
              </span>
            </div>
            {audios.length > 0 && (
              <div className="audio-list">
                {audios.map((audio, idx) => (
                  <div key={idx} className="audio-item">
                    <span>🎵 语音 {idx + 1}</span>
                    <button
                      className="remove-btn"
                      onClick={() => removeAudio(idx)}
                      style={{ marginLeft: 'auto' }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>附件</label>
            <div className="upload-area" onClick={() => attachmentInputRef.current?.click()}>
              <div className="icon">📎</div>
              <p>点击上传附件 (PDF, Word, Excel, EPUB等)</p>
            </div>
            <input
              ref={attachmentInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.epub,.zip,.rar"
              multiple
              style={{ display: 'none' }}
              onChange={handleAttachmentUpload}
            />
            {attachments.length > 0 && (
              <div className="attachment-list" style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {attachments.map((file, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#f5f5f5', borderRadius: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{file.icon}</span>
                    <span style={{ flex: 1, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                    <button
                      onClick={() => removeAttachment(idx)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#888' }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className={`wishlist-toggle ${isWishlist ? 'checked' : ''}`}>
              <input 
                type="checkbox" 
                checked={isWishlist}
                onChange={(e) => {
                  setIsWishlist(e.target.checked);
                  if (e.target.checked && !showUrgency) {
                    setShowUrgency(true);
                    setUrgency(1);
                  }
                }}
              />
              <span>{isWishlist ? '★' : '☆'}</span>
              加入愿望单
            </label>
          </div>

          {showUrgency && (
            <div className="form-group">
              <label>紧急程度</label>
              <div className="urgency-selector">
                <button 
                  type="button"
                  className={`urgency-btn ${urgency === 1 ? 'active low' : ''}`}
                  onClick={() => setUrgency(1)}
                >
                  <span className="urgency-dot low"></span>
                  不紧急
                </button>
                <button 
                  type="button"
                  className={`urgency-btn ${urgency === 2 ? 'active medium' : ''}`}
                  onClick={() => setUrgency(2)}
                >
                  <span className="urgency-dot medium"></span>
                  有点急
                </button>
                <button 
                  type="button"
                  className={`urgency-btn ${urgency === 3 ? 'active high' : ''}`}
                  onClick={() => setUrgency(3)}
                >
                  <span className="urgency-dot high"></span>
                  非常急
                </button>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>标签</label>
            <div className="tag-input-area">
              <input
                className="tag-input"
                placeholder="输入标签名，按回车添加"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
            </div>
            
            {allTags && allTags.length > 0 && (
              <div className="tag-suggestions" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                {(() => {
                  const buildTree = (tags) => {
                    const tree = {};
                    tags.forEach(tag => {
                      const parts = tag.split('/');
                      let current = tree;
                      parts.forEach((part, idx) => {
                        if (!current[part]) current[part] = { _tags: [] };
                        if (idx === parts.length - 1) current[part]._tags.push(tag);
                        current = current[part];
                      });
                    });
                    return tree;
                  };
                  const renderTree = (node, level = 0) => {
                    return Object.entries(node).map(([key, value]) => {
                      if (key.startsWith('_')) return null;
                      const hasChildren = Object.keys(value).some(k => !k.startsWith('_'));
                      const marginLeft = level * 12;
                      return (
                        <div key={key + level} style={{ marginLeft }}>
                          <button
                            key={key}
                            className={`tag ${selectedTags.includes(value._tags[0]) ? 'active' : ''}`}
                            onClick={() => {
                              if (selectedTags.includes(value._tags[0])) {
                                removeTag(value._tags[0]);
                              } else {
                                addTag(value._tags[0]);
                              }
                            }}
                            style={{ 
                              fontSize: level === 0 ? '12px' : '11px', 
                              padding: '4px 10px',
                              marginBottom: '2px',
                              background: selectedTags.includes(value._tags[0]) ? 'var(--highlight)' : '#f0f0f0',
                              color: selectedTags.includes(value._tags[0]) ? 'white' : '#666',
                              border: 'none',
                              borderRadius: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            {level === 0 ? '📁' : '📄'} {key}
                          </button>
                          {hasChildren && renderTree(value, level + 1)}
                        </div>
                      );
                    });
                  };
                  return renderTree(buildTree(allTags));
                })()}
              </div>
            )}
            
            {selectedTags.length > 0 && (
              <div className="selected-tags">
                {selectedTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className={`selected-tag tag-color-${tagColors[tag] ?? Math.floor(Math.random() * 8)}`}
                  >
                    {tag}
                    <span className="remove" onClick={() => removeTag(tag)}>✕</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-cancel" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  );
}
