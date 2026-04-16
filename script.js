const email = document.getElementById('email');
const passwordField = document.getElementById('passwordField');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');
const emailCheck = document.getElementById('emailCheck');
const toast = document.getElementById('toast');
const helpBtn = document.getElementById('helpBtn');
const logoWrap = document.querySelector('.logo-wrap');

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const updateAuthState = () => {
  const valid = isValidEmail(email.value);
  emailCheck.classList.toggle('visible', valid);
  passwordField.classList.toggle('visible', valid);
  const canSubmit = valid && passwordInput.value.trim().length > 0;
  submitBtn.disabled = !canSubmit;
};

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1700);
};

email.addEventListener('input', updateAuthState);
passwordInput.addEventListener('input', updateAuthState);

document.getElementById('authForm').addEventListener('submit', (event) => {
  event.preventDefault();
  sessionStorage.setItem('clipsource_login_email', email.value.trim());
  sessionStorage.setItem('clipsource_login_password', passwordInput.value.trim());
  window.location.href = 'verification.html';
});

helpBtn.addEventListener('click', () => showToast('Need help? contact support.'));

if (logoWrap) {
  logoWrap.style.cursor = 'pointer';
  logoWrap.addEventListener('click', () => {
    window.location.href = 'screeningroom.html';
  });
}

updateAuthState();
