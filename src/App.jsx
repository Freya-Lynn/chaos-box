import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import RecordModal from './components/RecordModal';

const STORAGE_KEY = 'chaos-box-records';
const TAG_COLORS_KEY = 'chaos-box-tag-colors';
const VAULT_DATA_KEY = 'chaos-box-vault';
const VAULT_CONFIG_KEY = 'chaos-box-vault-config';

function App() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [tagColors, setTagColors] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [view, setView] = useState('all');

  const isWishStart = (text) => {
    const trimmed = text.replace(/<[^>]*>/g, '').trim();
    return trimmed.startsWith('我要') || trimmed.startsWith('我想');
  };

  useEffect(() => {
    try {
      const savedRecords = localStorage.getItem(STORAGE_KEY);
      const savedTagColors = localStorage.getItem(TAG_COLORS_KEY);
      if (savedRecords) {
        setRecords(JSON.parse(savedRecords));
      }
      if (savedTagColors) {
        setTagColors(JSON.parse(savedTagColors));
      }
    } catch (e) {
      console.error('Failed to load data:', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(TAG_COLORS_KEY, JSON.stringify(tagColors));
  }, [tagColors, isLoaded]);

  const allTags = [...new Set(records.flatMap(r => r.tags || []))];
  
  const getTagHierarchy = (tags) => {
    const root = {};
    const allPaths = [];
    
    tags.forEach(tag => {
      const parts = tag.split('/');
      allPaths.push({ full: tag, parts });
    });
    
    return { allPaths };
  };
  
  const { allPaths: tagAllPaths } = getTagHierarchy(allTags);

  const filteredRecords = records
    .filter(record => {
      const matchesSearch = !search ||
        (record.text && record.text.toLowerCase().includes(search.toLowerCase())) ||
        (record.tags && record.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));
      const matchesTag = !activeTag || (record.tags && record.tags.includes(activeTag));
      const matchesWishlist = !showWishlist || record.isWishlist;
      return matchesSearch && matchesTag && matchesWishlist;
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const wishlistCount = records.filter(r => r.isWishlist).length;

  const handleSaveRecord = (record) => {
    const autoWishlist = isWishStart(record.text);
    const finalRecord = {
      ...record,
      isWishlist: record.isWishlist ?? autoWishlist
    };
    
    if (editingRecord) {
      setRecords(prev => prev.map(r => r.id === finalRecord.id ? finalRecord : r));
    } else {
      setRecords(prev => [finalRecord, ...prev]);
    }
    
    if (record.tags) {
      const newTagColors = { ...tagColors };
      record.tags.forEach(tag => {
        if (!newTagColors[tag]) {
          newTagColors[tag] = Math.floor(Math.random() * 8);
        }
      });
      setTagColors(newTagColors);
    }
    
    setModalOpen(false);
    setEditingRecord(null);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const handleToggleWishlist = (id) => {
    setRecords(prev => prev.map(r => 
      r.id === id ? { ...r, isWishlist: !r.isWishlist } : r
    ));
  };

  const handleDelete = (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    setRecords(prev => prev.filter(r => r.id !== deleteConfirm));
    setDeleteConfirm(null);
  };

  const getTagColor = (tag) => {
    return tagColors[tag] ?? Math.floor(Math.random() * 8);
  };

  const handleEditTag = (oldTag, newTag) => {
    if (!newTag || newTag === oldTag) return;
    setRecords(prev => prev.map(r => ({
      ...r,
      tags: r.tags ? r.tags.map(t => t === oldTag ? newTag : t) : []
    })));
    if (tagColors[oldTag] !== undefined) {
      const newTagColors = { ...tagColors };
      newTagColors[newTag] = newTagColors[oldTag];
      delete newTagColors[oldTag];
      setTagColors(newTagColors);
    }
  };

  const handleDeleteTag = (tag) => {
    if (!confirm(`确定要删除标签 "${tag}" 吗？`)) return;
    setRecords(prev => prev.map(r => ({
      ...r,
      tags: r.tags ? r.tags.filter(t => t !== tag) : []
    })));
    const newTagColors = { ...tagColors };
    delete newTagColors[tag];
    setTagColors(newTagColors);
    if (activeTag === tag) {
      setActiveTag(null);
    }
  };

  const handleAddClick = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const handleExportData = () => {
    const data = {
      records: JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'),
      tagColors: JSON.parse(localStorage.getItem(TAG_COLORS_KEY) || '{}'),
      vaultData: localStorage.getItem(VAULT_DATA_KEY) || null,
      vaultConfig: localStorage.getItem(VAULT_CONFIG_KEY) || null,
      exportedAt: Date.now()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chaos-box-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.records) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.records));
          setRecords(data.records);
        }
        if (data.tagColors) {
          localStorage.setItem(TAG_COLORS_KEY, JSON.stringify(data.tagColors));
          setTagColors(data.tagColors);
        }
        if (data.vaultData) {
          localStorage.setItem(VAULT_DATA_KEY, data.vaultData);
        }
        if (data.vaultConfig) {
          localStorage.setItem(VAULT_CONFIG_KEY, data.vaultConfig);
        }
        alert('导入成功！请刷新页面。');
      } catch (err) {
        alert('导入失败，文件格式不正确。');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app-container">
      <Sidebar
        wishlistCount={wishlistCount}
        view={view}
        onViewChange={setView}
        showWishlist={showWishlist}
        onShowWishlistChange={setShowWishlist}
        onExportData={handleExportData}
        onImportData={handleImportData}
        allTags={allTags}
        activeTag={activeTag}
        onTagClick={setActiveTag}
        onEditTag={handleEditTag}
        onDeleteTag={handleDeleteTag}
      />
      
      <MainContent
        view={view}
        records={filteredRecords}
        search={search}
        onSearchChange={setSearch}
        activeTag={activeTag}
        onActiveTagChange={setActiveTag}
        allTags={allTags}
        showWishlist={showWishlist}
        onAddClick={handleAddClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        tagColors={tagColors}
        onToggleWishlist={handleToggleWishlist}
        getTagColor={getTagColor}
      />

      {modalOpen && (
        <RecordModal
          record={editingRecord}
          allTags={allTags}
          tagColors={tagColors}
          onSave={handleSaveRecord}
          onClose={() => {
            setModalOpen(false);
            setEditingRecord(null);
          }}
        />
      )}

      {deleteConfirm && (
        <div className="confirm-dialog">
          <div className="confirm-content">
            <h3>确认删除</h3>
            <p>确定要删除这条记录吗？</p>
            <div className="confirm-actions">
              <button className="btn btn-cancel" onClick={() => setDeleteConfirm(null)}>取消</button>
              <button className="btn btn-danger" onClick={confirmDelete}>删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
