
const auth = {
  init() {
    document.getElementById('login-form').addEventListener('submit', (e) => this.login(e));
    document.getElementById('signup-form').addEventListener('submit', (e) => this.signup(e));
  },

  login(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;

    const users = JSON.parse(localStorage.getItem('bf_users')) || [];
    const found = users.find(u => u.email === email && u.password === pass);

    if (found) {
      localStorage.setItem('bf_session', JSON.stringify(found));
      app.currentUser = found;
      app.closeAuthModal();
      app.checkSession();
      alert(`Welcome back, ${found.name}!`);
    } else {
      alert('Invalid email or password.');
    }
  },

  signup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const pass = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;

    const users = JSON.parse(localStorage.getItem('bf_users')) || [];
    if (users.some(u => u.email === email)) {
      alert('Account with this email already exists!');
      return;
    }

    const newUser = { id: 'u_' + Date.now(), name, email, password: pass, role };
    users.push(newUser);
    app.saveState('users', users);

    localStorage.setItem('bf_session', JSON.stringify(newUser));
    app.currentUser = newUser;
    app.closeAuthModal();
    app.checkSession();
    alert('Account created successfully!');
  },

  logout() {
    localStorage.removeItem('bf_session');
    app.currentUser = null;
    app.checkSession();
    document.getElementById('player-bar').classList.add('hidden');
  }
};

document.addEventListener('DOMContentLoaded', () => auth.init());