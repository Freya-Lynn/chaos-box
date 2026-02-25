import { useState, useEffect } from 'react';

const VAULT_DATA_KEY = 'chaos-box-vault';
const VAULT_CONFIG_KEY = 'chaos-box-vault-config';

const DEFAULT_QUESTIONS = [
  '我的生日是多少？',
  '第一只宠物叫什么？',
  '我最爱的颜色是什么？',
  '我出生的城市是？',
  '我最喜欢的食物是？'
];

function encrypt(text, password) {
  const key = password.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return btoa(unescape(encodeURIComponent(text + '|' + key)));
}

function decrypt(text, password) {
  try {
    const key = password.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const decoded = decodeURIComponent(escape(atob(text)));
    const [content, originalKey] = decoded.split('|');
    return parseInt(originalKey) === key ? content : null;
  } catch {
    return null;
  }
}

export default function PasswordVault() {
  const [isSetup, setIsSetup] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [entries, setEntries] = useState([]);
  const [showPassword, setShowPassword] = useState({});
  const [editingEntry, setEditingEntry] = useState(null);
  const [showSetupForm, setShowSetupForm] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetAnswer, setResetAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    const config = localStorage.getItem(VAULT_CONFIG_KEY);
    if (config) {
      setIsSetup(true);
    }
    const data = localStorage.getItem(VAULT_DATA_KEY);
    if (data) {
      const decrypted = decrypt(data, password);
      if (decrypted) {
        setEntries(JSON.parse(decrypted));
      }
    }
  }, []);

  const handleSetup = () => {
    if (password !== confirmPassword) {
      alert('两次密码不一致');
      return;
    }
    if (password.length < 4) {
      alert('密码至少4位');
      return;
    }
    if (!securityQuestion || !securityAnswer) {
      alert('请设置安全问题');
      return;
    }
    const config = {
      question: securityQuestion === 'custom' ? customQuestion : securityQuestion,
      answer: securityAnswer
    };
    localStorage.setItem(VAULT_CONFIG_KEY, JSON.stringify(config));
    setIsSetup(true);
    setPassword('');
    setConfirmPassword('');
    setShowSetupForm(false);
  };

  const handleUnlock = () => {
    const config = JSON.parse(localStorage.getItem(VAULT_CONFIG_KEY));
    const data = localStorage.getItem(VAULT_DATA_KEY);
    
    if (data) {
      const decrypted = decrypt(data, password);
      if (decrypted) {
        setEntries(JSON.parse(decrypted));
        setIsUnlocked(true);
      } else {
        alert('密码错误');
      }
    } else {
      setIsUnlocked(true);
    }
  };

  const handleReset = () => {
    const config = JSON.parse(localStorage.getItem(VAULT_CONFIG_KEY));
    if (resetAnswer !== config.answer) {
      alert('答案错误');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert('两次密码不一致');
      return;
    }
    if (newPassword.length < 4) {
      alert('密码至少4位');
      return;
    }
    const oldData = localStorage.getItem(VAULT_DATA_KEY);
    if (oldData) {
      const decrypted = decrypt(oldData, '');
      if (decrypted) {
        const newEncrypted = encrypt(decrypted, newPassword);
        localStorage.setItem(VAULT_DATA_KEY, newEncrypted);
      }
    }
    setPassword(newPassword);
    setResetMode(false);
    alert('密码已重置，请用新密码解锁');
  };

  const saveEntries = (newEntries) => {
    setEntries(newEntries);
    const encrypted = encrypt(JSON.stringify(newEntries), password);
    localStorage.setItem(VAULT_DATA_KEY, encrypted);
  };

  const handleAddEntry = (entry) => {
    saveEntries([...entries, { ...entry, id: Date.now() }]);
    setEditingEntry(null);
  };

  const handleUpdateEntry = (entry) => {
    saveEntries(entries.map(e => e.id === entry.id ? entry : e));
    setEditingEntry(null);
  };

  const handleDeleteEntry = (id) => {
    if (confirm('确定删除？')) {
      saveEntries(entries.filter(e => e.id !== id));
    }
  };

  if (!isSetup) {
    return (
      <div className="vault-setup">
        <div className="vault-icon">🔐</div>
        <h2>设置密码隔间</h2>
        <p>创建一个密码来保护你的隐私</p>
        
        <div className="vault-form">
          <input
            type="password"
            placeholder="设置密码（至少4位）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="确认密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <select value={securityQuestion} onChange={(e) => setSecurityQuestion(e.target.value)}>
            <option value="">选择安全问题</option>
            {DEFAULT_QUESTIONS.map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
            <option value="custom">自定义问题</option>
          </select>
          {securityQuestion === 'custom' && (
            <input
              type="text"
              placeholder="输入你的安全问题"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
            />
          )}
          <input
            type="text"
            placeholder="安全问题答案"
            value={securityAnswer}
            onChange={(e) => setSecurityAnswer(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleSetup}>
            创建密码隔间
          </button>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="vault-unlock">
        <div className="vault-icon">🔐</div>
        <h2>密码隔间</h2>
        
        {resetMode ? (
          <div className="vault-form">
            <p className="vault-hint">请回答安全问题来重置密码</p>
            <input
              type="text"
              placeholder="安全问题答案"
              value={resetAnswer}
              onChange={(e) => setResetAnswer(e.target.value)}
            />
            <input
              type="password"
              placeholder="新密码"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="确认新密码"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleReset}>
              重置密码
            </button>
            <button className="btn btn-cancel" onClick={() => setResetMode(false)}>
              返回
            </button>
          </div>
        ) : (
          <div className="vault-form">
            <input
              type="password"
              placeholder="输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleUnlock}>
              解锁
            </button>
            <button className="btn btn-cancel" onClick={() => setResetMode(true)}>
              忘记密码？
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="vault-container">
      <div className="vault-header">
        <h2>🔐 密码隔间</h2>
        <button className="btn btn-primary" onClick={() => setEditingEntry({})}>
          + 添加密码
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔐</div>
          <h3>还没有密码</h3>
          <p>点击上方按钮添加网站密码</p>
        </div>
      ) : (
        <div className="vault-grid">
          {entries.map(entry => (
            <div key={entry.id} className="vault-card">
              <h3>{entry.site}</h3>
              <div className="vault-field">
                <span>用户名：</span>
                <span>{entry.username}</span>
              </div>
              <div className="vault-field">
                <span>密码：</span>
                <span>
                  {showPassword[entry.id] ? entry.password : '••••••••'}
                </span>
                <button 
                  className="vault-toggle"
                  onClick={() => setShowPassword(p => ({...p, [entry.id]: !p[entry.id]}))}
                >
                  {showPassword[entry.id] ? '👁' : '👁‍🗨'}
                </button>
              </div>
              {entry.note && (
                <div className="vault-note">{entry.note}</div>
              )}
              <div className="vault-actions">
                <button onClick={() => setEditingEntry(entry)}>✏️</button>
                <button onClick={() => handleDeleteEntry(entry.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingEntry !== null && (
        <div className="modal-overlay" onClick={() => setEditingEntry(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEntry.id ? '编辑密码' : '添加密码'}</h2>
              <button className="close-btn" onClick={() => setEditingEntry(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>网站/应用名称</label>
                <input
                  type="text"
                  value={editingEntry.site || ''}
                  onChange={e => setEditingEntry({...editingEntry, site: e.target.value})}
                  placeholder="如：淘宝、微信"
                />
              </div>
              <div className="form-group">
                <label>用户名/邮箱</label>
                <input
                  type="text"
                  value={editingEntry.username || ''}
                  onChange={e => setEditingEntry({...editingEntry, username: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>密码</label>
                <input
                  type="password"
                  value={editingEntry.password || ''}
                  onChange={e => setEditingEntry({...editingEntry, password: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>备注（可选）</label>
                <textarea
                  value={editingEntry.note || ''}
                  onChange={e => setEditingEntry({...editingEntry, note: e.target.value})}
                  placeholder="其他信息..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setEditingEntry(null)}>取消</button>
              <button 
                className="btn btn-primary" 
                onClick={() => editingEntry.id ? handleUpdateEntry(editingEntry) : handleAddEntry(editingEntry)}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
