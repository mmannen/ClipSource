const otpInputs = document.querySelectorAll('.otp-input');
const verificationForm = document.getElementById('verificationForm');
const toast = document.getElementById('toast');
const helpBtn = document.getElementById('helpBtn');
const logoWrap = document.querySelector('.logo-wrap');
const emailHighlight = document.querySelector('.email-highlight');

// Back button navigation
const backBtn = document.getElementById('backBtn');
if (backBtn) {
  backBtn.addEventListener('click', (e) => {
    window.location.href = 'index.html';
  });
}

const showToast = (msg) => {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1700);
};

const savedEmail = sessionStorage.getItem('clipsource_login_email');
if (emailHighlight && savedEmail) {
  emailHighlight.textContent = savedEmail;
}

// Handle digit input and auto-advance
otpInputs.forEach((input, index) => {
  input.addEventListener('input', (e) => {
    const value = e.target.value;
    
    // Only allow digits
    if (!/^\d*$/.test(value)) {
      input.value = '';
      return;
    }
    
    // Extract last digit if multiple chars entered
    if (value.length > 1) {
      input.value = value.slice(-1);
    }
    
    // Auto-advance to next input
    if (value.length === 1 && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
    
    // Check if all 4 digits are filled - auto-submit
    if (index === 3 && value.length === 1) {
      const allFilled = Array.from(otpInputs).every(inp => inp.value.length === 1);
      if (allFilled) {
        setTimeout(() => verifyCode(), 300);
      }
    }
  });

  // Handle backspace navigation
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      if (input.value.length === 0 && index > 0) {
        e.preventDefault();
        otpInputs[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      otpInputs[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < otpInputs.length - 1) {
      e.preventDefault();
      otpInputs[index + 1].focus();
    }
  });

  // Prevent non-numeric input
  input.addEventListener('keypress', (e) => {
    if (!/\d/.test(e.key)) {
      e.preventDefault();
    }
  });

  // Focus all text on focus
  input.addEventListener('focus', () => {
    input.select();
  });
});

// Verify code function
const verifyCode = () => {
  const code = Array.from(otpInputs).map(input => input.value).join('');
  
  if (code.length !== 4) {
    return;
  }

  window.location.href = 'screeningroom.html';
};

// Resend button
const resendBtn = document.getElementById('resendBtn');
if (resendBtn) {
  resendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // Clear OTP inputs
    otpInputs.forEach(input => input.value = '');
    otpInputs[0].focus();
    showToast('Code resent to your email');
  });
}

// Help button
helpBtn.addEventListener('click', () => showToast('Need help? contact support.'));

if (logoWrap) {
  logoWrap.style.cursor = 'pointer';
  logoWrap.addEventListener('click', () => {
    window.location.href = 'screeningroom.html';
  });
}

// Initialize - focus first input
otpInputs[0].focus();
