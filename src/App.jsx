import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import RecordModal from './components/RecordModal';

const STORAGE_KEY = 'chaos-box-records';
const TAG_COLORS_KEY = 'chaos-box-tag-colors';

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
    const savedRecords = localStorage.getItem(STORAGE_KEY);
    const savedTagColors = localStorage.getItem(TAG_COLORS_KEY);
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
    if (savedTagColors) {
      setTagColors(JSON.parse(savedTagColors));
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

  const handleAddClick = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  return (
    <div className="app-container">
      <Sidebar
        wishlistCount={wishlistCount}
        view={view}
        onViewChange={setView}
        showWishlist={showWishlist}
        onShowWishlistChange={setShowWishlist}
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
