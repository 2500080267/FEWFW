// Application Master Initialization & Global State
const app = {
  currentUser: null,
  tracks: [],
  playlists: [],
  reviews: [],
  users: [],

  init() {
    this.seedInitialData();
    this.loadStateFromStorage();
    this.bindEvents();
    this.checkSession();
  },

  seedInitialData() {
    if (!localStorage.getItem('bf_tracks')) {
      const defaultTracks = [
        {
          id: 't1',
          title: 'Midnight Lo-Fi Chill',
          artist: 'Acoustic Dreams',
          album: 'Night Vibes',
          genre: 'Lo-Fi',
          cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400',
          audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        },
        {
          id: 't2',
          title: 'Electronic Horizon',
          artist: 'Synthwave Pulse',
          album: 'Cyber Neon',
          genre: 'Electronic',
          cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
          audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
        },
        {
          id: 't3',
          title: 'Acoustic Sunburst',
          artist: 'Summer Echoes',
          album: 'Golden Hour',
          genre: 'Pop',
          cover: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400',
          audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
        }
      ];
      localStorage.setItem('bf_tracks', JSON.stringify(defaultTracks));
    }

    if (!localStorage.getItem('bf_users')) {
      const defaultUsers = [
        { id: 'u1', name: 'System Admin', email: 'admin@music.com', password: 'admin123', role: 'admin' },
        { id: 'u2', name: 'Demo User', email: 'user@music.com', password: 'user123', role: 'user' }
      ];
      localStorage.setItem('bf_users', JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem('bf_playlists')) {
      localStorage.setItem('bf_playlists', JSON.stringify([]));
    }

    if (!localStorage.getItem('bf_reviews')) {
      localStorage.setItem('bf_reviews', JSON.stringify([
        { id: 'r1', trackId: 't1', userName: 'Demo User', rating: 5, comment: 'Amazing relaxing track!' }
      ]));
    }
  },

  loadStateFromStorage() {
    this.tracks = JSON.parse(localStorage.getItem('bf_tracks')) || [];
    this.users = JSON.parse(localStorage.getItem('bf_users')) || [];
    this.playlists = JSON.parse(localStorage.getItem('bf_playlists')) || [];
    this.reviews = JSON.parse(localStorage.getItem('bf_reviews')) || [];
    this.currentUser = JSON.parse(localStorage.getItem('bf_session')) || null;
  },

  saveState(key, data) {
    localStorage.setItem(`bf_${key}`, JSON.stringify(data));
    this[key] = data;
  },

  bindEvents() {
    document.getElementById('close-auth').addEventListener('click', () => this.closeAuthModal());
    document.getElementById('switch-to-signup').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('login-form').classList.add('hidden');
      document.getElementById('signup-form').classList.remove('hidden');
    });
    document.getElementById('switch-to-login').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('signup-form').classList.add('hidden');
      document.getElementById('login-form').classList.remove('hidden');
    });
  },

  openAuthModal(mode = 'login') {
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('hidden');
    if (mode === 'login') {
      document.getElementById('login-form').classList.remove('hidden');
      document.getElementById('signup-form').classList.add('hidden');
    } else {
      document.getElementById('signup-form').classList.remove('hidden');
      document.getElementById('login-form').classList.add('hidden');
    }
  },

  closeAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
  },

  checkSession() {
    const navLinks = document.getElementById('nav-links');
    const authButtons = document.getElementById('auth-buttons');

    if (this.currentUser) {
      authButtons.innerHTML = `
        <span style="margin-right: 10px;">👋 ${this.currentUser.name} (${this.currentUser.role})</span>
        <button class="btn btn-secondary" onclick="auth.logout()">Logout</button>
      `;

      if (this.currentUser.role === 'admin') {
        this.navigate('admin');
        navLinks.innerHTML = `<a class="active">Admin Control Panel</a>`;
      } else {
        this.navigate('user');
        navLinks.innerHTML = `<a class="active">Music Player</a>`;
      }
    } else {
      this.navigate('landing');
      authButtons.innerHTML = `
        <button class="btn btn-secondary" onclick="app.openAuthModal('login')">Log In</button>
        <button class="btn btn-primary" onclick="app.openAuthModal('signup')">Sign Up</button>
      `;
      navLinks.innerHTML = ``;
    }
  },

  navigate(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.classList.remove('hidden');

    if (viewName === 'user') userModule.init();
    if (viewName === 'admin') adminModule.init();
  },

  playTrack(trackId) {
    const track = this.tracks.find(t => t.id === trackId);
    if (!track) return;

    const playerBar = document.getElementById('player-bar');
    const audio = document.getElementById('audio-element');
    
    document.getElementById('player-title').innerText = track.title;
    document.getElementById('player-artist').innerText = `${track.artist} • ${track.album}`;
    document.getElementById('player-img').src = track.cover;
    
    audio.src = track.audio;
    playerBar.classList.remove('hidden');
    audio.play();
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());