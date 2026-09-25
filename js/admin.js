
const adminModule = {
  init() {
    this.updateStats();
    this.renderAdminTrackList();
    this.renderAdminUserList();
  },

  switchTab(tabName) {
    document.querySelectorAll('#view-admin .sidebar-menu li').forEach(li => li.classList.remove('active'));
    event.currentTarget.classList.add('active');

    document.querySelectorAll('#view-admin .subview').forEach(sv => sv.classList.add('hidden'));
    document.getElementById(`admin-subview-${tabName}`).classList.remove('hidden');

    this.updateStats();
  },

  updateStats() {
    document.getElementById('stat-tracks').innerText = app.tracks.length;
    document.getElementById('stat-users').innerText = app.users.length;
    document.getElementById('stat-reviews').innerText = app.reviews.length;
  },

  handleAddTrack(e) {
    e.preventDefault();
    const newTrack = {
      id: 't_' + Date.now(),
      title: document.getElementById('track-title').value,
      artist: document.getElementById('track-artist').value,
      album: document.getElementById('track-album').value,
      genre: document.getElementById('track-genre').value,
      cover: document.getElementById('track-cover').value,
      audio: document.getElementById('track-audio').value
    };

    const tracks = app.tracks;
    tracks.push(newTrack);
    app.saveState('tracks', tracks);

    document.getElementById('add-track-form').reset();
    this.renderAdminTrackList();
    this.updateStats();
    alert('New track added to library!');
  },

  deleteTrack(trackId) {
    if (!confirm('Are you sure you want to delete this track?')) return;
    const tracks = app.tracks.filter(t => t.id !== trackId);
    app.saveState('tracks', tracks);
    this.renderAdminTrackList();
    this.updateStats();
  },

  renderAdminTrackList() {
    const container = document.getElementById('admin-track-list');
    container.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Artist</th>
            <th>Genre</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${app.tracks.map(t => `
            <tr>
              <td>${t.title}</td>
              <td>${t.artist}</td>
              <td>${t.genre}</td>
              <td><button class="btn btn-danger" onclick="adminModule.deleteTrack('${t.id}')">Delete</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  deleteUser(userId) {
    if (!confirm('Are you sure you want to remove this user?')) return;
    const users = app.users.filter(u => u.id !== userId);
    app.saveState('users', users);
    this.renderAdminUserList();
    this.updateStats();
  },

  renderAdminUserList() {
    const container = document.getElementById('admin-user-list');
    container.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${app.users.map(u => `
            <tr>
              <td>${u.name}</td>
              <td>${u.email}</td>
              <td>${u.role}</td>
              <td>
                ${u.role !== 'admin' ? `<button class="btn btn-danger" onclick="adminModule.deleteUser('${u.id}')">Delete</button>` : '<em>Protected</em>'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
};