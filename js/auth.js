// Global User State
let selectedPlan = 'pro';
let selectedPayMethod = 'wave';

// Parse URL params for pre-selection (e.g., ?mode=login or ?plan=basic)
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  const plan = urlParams.get('plan');

  if (mode === 'login') {
    switchAuthMode('login');
  }
  if (plan && ['basic', 'pro', 'enterprise'].includes(plan)) {
    const card = document.querySelector('.plan-option-card[data-plan="' + plan + '"]');
    if (card) selectPlanOption(plan, card);
  }

  // Password Strength Listener
  const pwdInput = document.getElementById('regPassword');
  if (pwdInput) {
    pwdInput.addEventListener('input', updatePasswordStrength);
  }
});

// Switch between Register & Login
function switchAuthMode(mode) {
  const regForm = document.getElementById('registerForm');
  const logForm = document.getElementById('loginForm');
  const tabReg = document.getElementById('tabRegisterBtn');
  const tabLog = document.getElementById('tabLoginBtn');
  const title = document.getElementById('authTitle');
  const subtitle = document.getElementById('authSubtitle');

  if (mode === 'login') {
    regForm.style.display = 'none';
    logForm.style.display = 'flex';
    tabReg.classList.remove('active');
    tabLog.classList.add('active');
    title.textContent = 'Connexion à votre Espace';
    subtitle.textContent = 'Accédez à votre tableau de bord VANDIA AI pour piloter vos ventes et agents.';
  } else {
    regForm.style.display = 'flex';
    logForm.style.display = 'none';
    tabReg.classList.add('active');
    tabLog.classList.remove('active');
    title.textContent = 'Créez votre Compte VANDIA';
    subtitle.textContent = 'Débloquez votre commercial IA WhatsApp 24/7 et activez votre tunnel de vente automatisé.';
  }
}

// Toggle Password Visibility
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fas fa-eye';
  }
}

// Password Strength Meter
function updatePasswordStrength() {
  const val = document.getElementById('regPassword').value;
  const b1 = document.getElementById('pwdBar1');
  const b2 = document.getElementById('pwdBar2');
  const b3 = document.getElementById('pwdBar3');
  const b4 = document.getElementById('pwdBar4');
  const label = document.getElementById('pwdStrengthLabel');

  let score = 0;
  if (val.length >= 6) score++;
  if (val.length >= 8 && /[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  [b1, b2, b3, b4].forEach(b => {
    b.style.background = 'rgba(255,255,255,0.1)';
  });

  if (val.length === 0) {
    label.textContent = 'Sécurité';
    label.style.color = 'var(--text-dim)';
    return;
  }

  if (score <= 1) {
    b1.style.background = '#f43f5e';
    label.textContent = 'Faible';
    label.style.color = '#f43f5e';
  } else if (score === 2) {
    b1.style.background = '#f59e0b';
    b2.style.background = '#f59e0b';
    label.textContent = 'Moyen';
    label.style.color = '#f59e0b';
  } else if (score === 3) {
    b1.style.background = '#06b6d4';
    b2.style.background = '#06b6d4';
    b3.style.background = '#06b6d4';
    label.textContent = 'Bon';
    label.style.color = '#06b6d4';
  } else {
    b1.style.background = '#25d366';
    b2.style.background = '#25d366';
    b3.style.background = '#25d366';
    b4.style.background = '#25d366';
    label.textContent = 'Excellent';
    label.style.color = '#25d366';
  }
}

// Plan Option Selection
function selectPlanOption(planKey, card) {
  selectedPlan = planKey;
  document.querySelectorAll('.plan-option-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
}

// Pay Option Selection
function selectPayOption(payKey, pill) {
  selectedPayMethod = payKey;
  document.querySelectorAll('.auth-pay-pill').forEach(p => p.classList.remove('selected'));
  pill.classList.add('selected');
}

// --- SUPABASE CONFIGURATION ---
const supabaseUrl = 'https://gpuulvcxdgqupxlpbfy.supabase.co';
const supabaseKey = 'sb_publishable_YdZRv-TikwulFFptUPGTWg_7BaaAXbs';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- SUBMIT INSCRIPTION ---
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const btn = document.getElementById('regSubmitBtn');
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Création en cours...</span>';
  btn.disabled = true;

  const fullName = document.getElementById('regFullName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const countryCode = document.getElementById('regCountryCode').value;
  const phone = document.getElementById('regPhone').value.trim();
  const fullPhone = countryCode + ' ' + phone;

  // Create Supabase User
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: fullName,
        phone: fullPhone,
        plan: selectedPlan,
        payment_method: selectedPayMethod
      }
    }
  });

  if (error) {
    alert("Erreur lors de l'inscription : " + error.message);
    btn.innerHTML = originalHTML;
    btn.disabled = false;
    return;
  }

  // Store in localStorage for dashboard UX fallback
  const userProfile = {
    name: fullName || 'Client VANDIA',
    email: email,
    phone: fullPhone,
    plan: selectedPlan,
    paymentMethod: selectedPayMethod,
    registeredAt: new Date().toISOString()
  };
  localStorage.setItem('vandia_user', JSON.stringify(userProfile));

  // Show Celebration & Redirect
  const overlay = document.getElementById('celebrationOverlay');
  document.getElementById('celebTitle').textContent = 'Félicitations ' + userProfile.name + ' ! 🎉';
  overlay.classList.add('active');

  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 2000);
});

// --- SUBMIT CONNEXION ---
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = document.getElementById('loginSubmitBtn');
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Connexion en cours...</span>';
  btn.disabled = true;

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  // Supabase Login
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    alert("Erreur de connexion : " + (error.message.includes('Invalid login') ? 'Email ou mot de passe incorrect' : error.message));
    btn.innerHTML = originalHTML;
    btn.disabled = false;
    return;
  }

  // Read metadata from DB
  const userMeta = data.user.user_metadata || {};
  const userName = userMeta.full_name || email.split('@')[0];
  
  const userProfile = {
    name: userName,
    email: email,
    plan: userMeta.plan || 'pro'
  };
  localStorage.setItem('vandia_user', JSON.stringify(userProfile));

  const overlay = document.getElementById('celebrationOverlay');
  document.getElementById('celebTitle').textContent = 'Ravi de vous revoir ' + userProfile.name + ' ! 👋';
  document.getElementById('celebText').textContent = 'Connexion sécurisée réussie... Chargement du tableau de bord.';
  overlay.classList.add('active');

  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1500);
});

// Social Auth Simulation
function simulateSocialAuth(provider) {
  const existing = localStorage.getItem('vandia_user');
  const userProfile = existing ? JSON.parse(existing) : {
    name: provider === 'Google' ? 'Client Google' : 'Client Apple',
    email: provider === 'Google' ? 'contact@google-user.com' : 'contact@apple-user.com',
    phone: '+225 07 88 99 00 11',
    plan: 'pro',
    provider: provider
  };
  localStorage.setItem('vandia_user', JSON.stringify(userProfile));

  const overlay = document.getElementById('celebrationOverlay');
  document.getElementById('celebTitle').textContent = 'Connexion avec ' + provider + ' Réussie ! 🚀';
  overlay.classList.add('active');

  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1400);
}

