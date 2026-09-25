// User Module Logic (Playback, Playlists, Downloads, Ratings, Recs)
const userModule = {
  activeTrackForReview: null,

  init() {
    this.renderTracks(app.tracks);
    this.renderPlaylists();
    this.renderOfflineTracks();
    this.renderRecommendations();
  },

  switchTab(tabName) {
    document.querySelectorAll('#view-user .sidebar-menu li').forEach(li => li.classList.remove('active'));
    event.currentTarget.classList.add('active');

    document.querySelectorAll('#view-user .subview').forEach(sv => sv.classList.add('hidden'));
    document.getElementById(`subview-${tabName}`).classList.remove('hidden');

    if (tabName === 'offline') this.renderOfflineTracks();
    if (tabName === 'recommendations') this.renderRecommendations();
  },

  renderTracks(trackList) {
    const grid = document.getElementById('track-grid');
    grid.innerHTML = trackList.map(track => {
      const isDownloaded = this.isDownloaded(track.id);
      return `
        <div class="track-card">
          <img src="${track.cover}" alt="${track.title}">
          <h4>${track.title}</h4>
          <p>${track.artist}</p>
          <div class="card-actions">
            <button class="btn btn-primary" onclick="app.playTrack('${track.id}')">▶ Play</button>
            <button class="btn btn-secondary" onclick="userModule.openReviewModal('${track.id}')">⭐ Reviews</button>
            <button class="btn btn-secondary" onclick="userModule.toggleDownload('${track.id}')">
              ${isDownloaded ? '✅ Downloaded' : '⬇️ Offline Download'}
            </button>
            <select onchange="userModule.addToPlaylist('${track.id}', this.value)" class="playlist-dropdown">
              <option value="">+ Add to Playlist</option>
              ${app.playlists.filter(p => p.userId === app.currentUser.id).map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
          </div>
        </div>
      `;
    }).join('');
  },

  handleSearch() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const genre = document.getElementById('genre-filter').value;

    const filtered = app.tracks.filter(t => {
      const matchesQuery = t.title.toLowerCase().includes(query) ||
                           t.artist.toLowerCase().includes(query) ||
                           t.album.toLowerCase().includes(query);
      const matchesGenre = genre === 'all' || t.genre === genre;
      return matchesQuery && matchesGenre;
    });

    this.renderTracks(filtered);
  },

  createPlaylist() {
    const input = document.getElementById('new-playlist-name');
    const name = input.value.trim();
    if (!name) return alert('Enter a valid playlist name!');

    const playlists = app.playlists;
    playlists.push({
      id: 'pl_' + Date.now(),
      userId: app.currentUser.id,
      name: name,
      trackIds: []
    });

    app.saveState('playlists', playlists);
    input.value = '';
    this.renderPlaylists();
    this.renderTracks(app.tracks);
    alert('Playlist created!');
  },

  addToPlaylist(trackId, playlistId) {
    if (!playlistId) return;
    const playlists = app.playlists;
    const target = playlists.find(p => p.id === playlistId);
    if (target && !target.trackIds.includes(trackId)) {
      target.trackIds.push(trackId);
      app.saveState('playlists', playlists);
      alert('Track added to playlist!');
      this.renderPlaylists();
    }
  },

  renderPlaylists() {
    const container = document.getElementById('playlist-container');
    const userPlaylists = app.playlists.filter(p => p.userId === app.currentUser.id);

    if (userPlaylists.length === 0) {
      container.innerHTML = `<p style="color:var(--text-sub)">No playlists created yet.</p>`;
      return;
    }

    container.innerHTML = userPlaylists.map(pl => {
      const playlistTracks = app.tracks.filter(t => pl.trackIds.includes(t.id));
      return `
        <div style="background:var(--bg-card); padding:1rem; margin-top:1rem; border-radius:8px;">
          <h3>📁 ${pl.name} (${playlistTracks.length} tracks)</h3>
          <div class="grid-container" style="margin-top:0.5rem;">
            ${playlistTracks.map(t => `
              <div class="track-card">
                <h4>${t.title}</h4>
                <p>${t.artist}</p>
                <button class="btn btn-primary" onclick="app.playTrack('${t.id}')">▶ Play</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  },

  toggleDownload(trackId) {
    let offline = JSON.parse(localStorage.getItem(`bf_offline_${app.currentUser.id}`)) || [];
    if (offline.includes(trackId)) {
      offline = offline.filter(id => id !== trackId);
      alert('Track removed from offline downloads.');
    } else {
      offline.push(trackId);
      alert('Track saved for offline streaming!');
    }
    localStorage.setItem(`bf_offline_${app.currentUser.id}`, JSON.stringify(offline));
    this.renderTracks(app.tracks);
  },

  isDownloaded(trackId) {
    const offline = JSON.parse(localStorage.getItem(`bf_offline_${app.currentUser.id}`)) || [];
    return offline.includes(trackId);
  },

  renderOfflineTracks() {
    const offlineIds = JSON.parse(localStorage.getItem(`bf_offline_${app.currentUser.id}`)) || [];
    const tracks = app.tracks.filter(t => offlineIds.includes(t.id));
    const grid = document.getElementById('offline-grid');

    if (tracks.length === 0) {
      grid.innerHTML = `<p style="color:var(--text-sub)">No tracks downloaded yet.</p>`;
      return;
    }

    grid.innerHTML = tracks.map(t => `
      <div class="track-card">
        <img src="${t.cover}">
        <h4>${t.title}</h4>
        <p>${t.artist}</p>
        <button class="btn btn-primary" onclick="app.playTrack('${t.id}')">▶ Play Offline</button>
      </div>
    `).join('');
  },

  renderRecommendations() {
    const recGrid = document.getElementById('recommendations-grid');
    // Simple recommendation rule: returns tracks with rating >= 4
    const highRatedTrackIds = app.reviews.filter(r => r.rating >= 4).map(r => r.trackId);
    const recs = app.tracks.filter(t => highRatedTrackIds.includes(t.id) || t.genre === 'Lo-Fi');

    recGrid.innerHTML = recs.map(t => `
      <div class="track-card">
        <img src="${t.cover}">
        <h4>${t.title}</h4>
        <p>${t.artist} • <span style="color:var(--accent);">${t.genre}</span></p>
        <button class="btn btn-primary" onclick="app.playTrack('${t.id}')">▶ Play</button>
      </div>
    `).join('');
  },

  openReviewModal(trackId) {
    this.activeTrackForReview = trackId;
    const track = app.tracks.find(t => t.id === trackId);
    document.getElementById('review-track-title').innerText = `Reviews for "${track.title}"`;
    this.renderReviews(trackId);
    document.getElementById('review-modal').classList.remove('hidden');
  },

  closeReviewModal() {
    document.getElementById('review-modal').classList.add('hidden');
  },

  renderReviews(trackId) {
    const list = document.getElementById('reviews-list-container');
    const trackReviews = app.reviews.filter(r => r.trackId === trackId);

    if (trackReviews.length === 0) {
      list.innerHTML = `<p style="color:var(--text-sub);">No reviews yet. Be the first!</p>`;
      return;
    }

    list.innerHTML = trackReviews.map(r => `
      <div style="border-bottom: 1px solid #333; padding: 0.5rem 0;">
        <strong>${r.userName}</strong> - ${'⭐'.repeat(r.rating)}
        <p style="color:var(--text-sub); font-size:0.9rem;">${r.comment}</p>
      </div>
    `).join('');
  },

  submitReview(e) {
    e.preventDefault();
    const rating = parseInt(document.getElementById('review-rating').value);
    const comment = document.getElementById('review-comment').value;

    const reviews = app.reviews;
    reviews.push({
      id: 'r_' + Date.now(),
      trackId: this.activeTrackForReview,
      userName: app.currentUser.name,
      rating,
      comment
    });

    app.saveState('reviews', reviews);
    document.getElementById('review-comment').value = '';
    this.renderReviews(this.activeTrackForReview);
    alert('Review submitted!');
  }
};