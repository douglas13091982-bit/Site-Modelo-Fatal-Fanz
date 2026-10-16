/* ============================================================
   Fatal Fans — Camada de dados compartilhada (localStorage)
   Usada por: index.html, subir-conteudo.html e admin.html
   Em produção, substitua estas funções por chamadas à API do
   servidor (fetch/axios) mantendo a mesma interface.
   ============================================================ */

const FF = (() => {
  const KEYS = {
    uploads: 'ff_uploads',      // conteúdo enviado pelas criadoras
    users: 'ff_users',          // contas de criadoras cadastradas
    reports: 'ff_reports',      // denúncias
    settings: 'ff_settings',    // configurações do painel
    session: 'ff_session'       // sessão ativa (login)
  };

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch (e) { return []; }
  }

  function write(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ---------- Uploads (fotos/vídeos das criadoras) ---------- */
  function getUploads() { return read(KEYS.uploads); }

  function addUpload(item) {
    const uploads = getUploads();
    item.id = uid();
    item.createdAt = new Date().toISOString();
    item.status = item.status || 'pendente'; // pendente | aprovado | recusado
    item.views = item.views || 0;
    item.likes = item.likes || 0;
    uploads.unshift(item);
    write(KEYS.uploads, uploads);
    return item;
  }

  function updateUpload(id, patch) {
    const uploads = getUploads();
    const i = uploads.findIndex(u => u.id === id);
    if (i >= 0) {
      uploads[i] = Object.assign({}, uploads[i], patch);
      write(KEYS.uploads, uploads);
      return uploads[i];
    }
    return null;
  }

  function deleteUpload(id) {
    write(KEYS.uploads, getUploads().filter(u => u.id !== id));
  }

  /* ---------- Contas de criadoras ---------- */
  function getUsers() { return read(KEYS.users); }

  function addUser(user) {
    user.id = uid();
    user.createdAt = new Date().toISOString();
    user.blocked = false;
    const users = getUsers();
    users.unshift(user);
    write(KEYS.users, users);
    return user;
  }

  function updateUser(id, patch) {
    const users = getUsers();
    const i = users.findIndex(u => u.id === id);
    if (i >= 0) {
      users[i] = Object.assign({}, users[i], patch);
      write(KEYS.users, users);
      return users[i];
    }
    return null;
  }

  function deleteUser(id) {
    write(KEYS.users, getUsers().filter(u => u.id !== id));
  }

  /* ---------- Denúncias ---------- */
  function getReports() { return read(KEYS.reports); }

  function addReport(report) {
    report.id = uid();
    report.createdAt = new Date().toISOString();
    report.resolved = false;
    const reports = getReports();
    reports.unshift(report);
    write(KEYS.reports, reports);
    return report;
  }

  function resolveReport(id) {
    const reports = getReports();
    const r = reports.find(x => x.id === id);
    if (r) { r.resolved = true; write(KEYS.reports, reports); }
    return r;
  }

  /* ---------- Configurações ---------- */
  const defaultSettings = {
    siteName: 'Fatal Fans',
    maintenance: false,
    autoApprove: false,
    maxUploadMB: 100,
    allowVideos: true,
    allowPhotos: true,
    adminPassword: 'admin123' // em produção: autenticação no servidor!
  };

  function getSettings() {
    return Object.assign({}, defaultSettings, JSON.parse(localStorage.getItem(KEYS.settings) || '{}'));
  }

  function saveSettings(patch) {
    const s = Object.assign(getSettings(), patch);
    localStorage.setItem(KEYS.settings, JSON.stringify(s));
    return s;
  }

  /* ---------- Sessão ---------- */
  function getSession() {
    try { return JSON.parse(localStorage.getItem(KEYS.session)); }
    catch (e) { return null; }
  }

  function setSession(s) {
    if (s) localStorage.setItem(KEYS.session, JSON.stringify(s));
    else localStorage.removeItem(KEYS.session);
  }

  /* ---------- Estatísticas para o dashboard ---------- */
  function getStats() {
    const uploads = getUploads();
    const users = getUsers();
    const reports = getReports();
    const totalViews = uploads.reduce((a, u) => a + (u.views || 0), 0);
    const totalLikes = uploads.reduce((a, u) => a + (u.likes || 0), 0);
    return {
      uploads: uploads.length,
      photos: uploads.filter(u => u.type === 'foto').length,
      videos: uploads.filter(u => u.type === 'video').length,
      pending: uploads.filter(u => u.status === 'pendente').length,
      approved: uploads.filter(u => u.status === 'aprovado').length,
      rejected: uploads.filter(u => u.status === 'recusado').length,
      users: users.length,
      blockedUsers: users.filter(u => u.blocked).length,
      openReports: reports.filter(r => !r.resolved).length,
      totalViews,
      totalLikes
    };
  }

  /* ---------- Utilidades ---------- */
  function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return '—';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
    return bytes.toFixed(i ? 1 : 0) + ' ' + units[i];
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  return {
    getUploads, addUpload, updateUpload, deleteUpload,
    getUsers, addUser, updateUser, deleteUser,
    getReports, addReport, resolveReport,
    getSettings, saveSettings,
    getSession, setSession,
    getStats, formatBytes, formatDate, escapeHtml, uid
  };
})();
