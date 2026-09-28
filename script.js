const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

if (hasGsap && !reduceMotion) {
  root.classList.add('js');
gsap.registerPlugin(ScrollTrigger);

const revealItems = document.querySelectorAll('[data-reveal]');

revealItems.forEach((item) => {
  const direction = item.dataset.reveal;
  const delay = Number(item.dataset.delay || 0);
  const startState = {
    opacity: 0,
    x: 0,
    y: direction === 'up' ? 28 : 0,
    scale: direction === 'scale' ? 0.97 : 1
  };

  gsap.set(item, startState);
  gsap.to(item, {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    duration: 0.9,
    delay,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: item,
      start: 'top 88%',
      once: true,
      onEnter: () => item.classList.add('is-visible')
    }
  });
});

gsap.from('.brand', {
  opacity: 0,
  y: -12,
  duration: 0.7,
  ease: 'power2.out'
});

gsap.from('.nav-link, .nav-actions', {
  opacity: 0,
  y: -8,
  duration: 0.65,
  stagger: 0.06,
  delay: 0.15,
  ease: 'power2.out'
});

gsap.timeline({ defaults: { ease: 'power3.out' } })
  .from('.hero-image-frame', { clipPath: 'inset(0 0 100% 0)', duration: 1.35 }, 0.2)
  .from('.image-caption', { opacity: 0, y: 12, duration: 0.65 }, 1.05)
  .from('[data-float="patient"]', { opacity: 0, x: -22, y: 18, duration: 0.8 }, 1.1)
  .from('[data-float="alert"]', { opacity: 0, x: 22, y: -10, duration: 0.8 }, 1.28);

gsap.to('[data-float="patient"]', {
  y: -10,
  rotation: -1.3,
  duration: 3.2,
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut'
});

gsap.to('[data-float="alert"]', {
  y: 10,
  rotation: 1.1,
  duration: 3.8,
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut'
});

gsap.to('.radar-sweep', {
  rotation: 360,
  duration: 8,
  repeat: -1,
  ease: 'none',
  transformOrigin: '50% 50%'
});

gsap.to('.pulse-graphic span:nth-child(4)', {
  scaleY: 1.45,
  transformOrigin: '50% 100%',
  duration: 1.1,
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut'
});

gsap.to('.mini-dash-chart i:nth-child(11)', {
  scaleY: 1.18,
  transformOrigin: '50% 100%',
  duration: 1.3,
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut'
});

gsap.to('.cta-orbit-core', {
  rotation: 360,
  duration: 12,
  repeat: -1,
  ease: 'none'
});

gsap.to('.cta-orbit-core i', {
  rotation: -360,
  duration: 12,
  repeat: -1,
  ease: 'none'
});

const counters = document.querySelectorAll('.counter');

counters.forEach((counter) => {
  const target = Number(counter.dataset.target);
  counter.textContent = '0';
  const value = { value: 0 };

  ScrollTrigger.create({
    trigger: counter,
    start: 'top 88%',
    once: true,
    onEnter: () => {
      gsap.to(value, {
        value: target,
        duration: 1.7,
        ease: 'power2.out',
        onUpdate: () => {
          counter.textContent = value.value % 1 === 0 ? value.value.toFixed(0) : value.value.toFixed(1);
        }
      });
    }
  });
});

const heroVisual = document.querySelector('.hero-visual');

if (heroVisual && window.matchMedia('(pointer: fine)').matches) {
  heroVisual.addEventListener('mousemove', (event) => {
    const bounds = heroVisual.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    gsap.to('.hero-image-frame', {
      x: x * 8,
      y: y * 8,
      duration: 1.1,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  });

  heroVisual.addEventListener('mouseleave', () => {
    gsap.to('.hero-image-frame', {
      x: 0,
      y: 0,
      duration: 1.2,
      ease: 'elastic.out(1, 0.45)'
    });
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    const collapseElement = document.querySelector('#mainNav');
    if (collapseElement && collapseElement.classList.contains('show')) {
      const toggle = document.querySelector('.menu-button');
      bootstrap.Collapse.getOrCreateInstance(collapseElement).hide();
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
      }
    }
  });
});

window.addEventListener('load', () => {
  ScrollTrigger.refresh();
});
}

const authForms = document.querySelectorAll('[data-auth-form]');

const storeDashboard = (slug) => {
  try {
    window.sessionStorage.setItem('clarityDashboard', slug);
  } catch (error) {
    return;
  }
};

const storeUserEmail = (email) => {
  try {
    window.sessionStorage.setItem('clarityUserEmail', email);
  } catch (error) {
    return;
  }
};

const preselectedDashboard = new URLSearchParams(window.location.search).get('dashboard');
if (preselectedDashboard) {
  const preselectedInput = document.querySelector(`[data-dashboard-picker] input[value="${preselectedDashboard}"]`);
  if (preselectedInput) {
    preselectedInput.checked = true;
  }
}

document.querySelectorAll('[data-dashboard-picker]').forEach((picker) => {
  const form = picker.closest('[data-auth-form]');
  const hint = picker.querySelector('[data-dashboard-hint]');
  const options = Array.from(picker.querySelectorAll('[data-dashboard-target]'));
  const isSignup = form?.dataset.authMode === 'signup';
  const hintPrefix = form?.dataset.dashboardHintPrefix || 'You will land on ';

  const applyDashboard = (option) => {
    if (!option) {
      return;
    }

    if (hint) {
      hint.textContent = `${hintPrefix}${option.dataset.dashboardDestination}.`;
    }

    if (!form) {
      return;
    }

    if (isSignup) {
      form.dataset.authRedirect = `signin.html?signup=success&dashboard=${encodeURIComponent(option.value)}`;
      form.dataset.authMessage = 'Account created. Next step: sign in.';
      return;
    }

    form.dataset.authRedirect = `${option.dataset.dashboardTarget}?welcome=1`;
    form.dataset.authMessage = `Signed in. Opening ${option.dataset.dashboardDestination}...`;
  };

  options.forEach((option) => {
    option.addEventListener('change', () => {
      if (option.checked) {
        applyDashboard(option);
      }
    });
  });

  applyDashboard(options.find((option) => option.checked) || options[0]);
});

authForms.forEach((form) => {
  const message = form.querySelector('[data-form-message]');
  const password = form.querySelector('[data-password]');
  const confirmPassword = form.querySelector('[data-confirm-password]');
  const passwordToggle = form.querySelector('[data-password-toggle]');

  if (password && passwordToggle) {
    passwordToggle.addEventListener('click', () => {
      const passwordIsVisible = password.type === 'text';
      password.type = passwordIsVisible ? 'password' : 'text';
      passwordToggle.setAttribute('aria-pressed', String(!passwordIsVisible));
      passwordToggle.setAttribute('aria-label', passwordIsVisible ? 'Show password' : 'Hide password');
      passwordToggle.querySelector('i').className = passwordIsVisible ? 'bi bi-eye' : 'bi bi-eye-slash';
    });
  }

  if (password && confirmPassword) {
    const validatePasswords = () => {
      confirmPassword.setCustomValidity(confirmPassword.value && confirmPassword.value !== password.value ? 'Passwords do not match.' : '');
    };

    password.addEventListener('input', validatePasswords);
    confirmPassword.addEventListener('input', validatePasswords);
  }

  form.addEventListener('submit', (event) => {
    if (confirmPassword && confirmPassword.value !== password.value) {
      event.preventDefault();
      confirmPassword.setCustomValidity('Passwords do not match.');
      confirmPassword.reportValidity();
      return;
    }

    event.preventDefault();

    const chosenDashboard = form.querySelector('[data-dashboard-picker] input:checked');
    if (chosenDashboard) {
      storeDashboard(chosenDashboard.value);
    }

    const emailField = form.querySelector('input[name="email"]');
    if (emailField?.value.trim()) {
      storeUserEmail(emailField.value.trim());
    }

    if (message) {
      message.textContent = form.dataset.authMessage;
      message.classList.add('is-visible');
    }

    const redirect = form.dataset.authRedirect;
    if (redirect) {
      form.dataset.authRedirect = '';
      window.setTimeout(() => {
        window.location.href = redirect;
      }, 700);
    }
  });
});

const signupSuccess = new URLSearchParams(window.location.search).get('signup');
if (signupSuccess === 'success') {
  const signinForm = document.querySelector('[data-auth-mode="signin"]');
  const signinMessage = signinForm?.querySelector('[data-form-message]');

  if (signinMessage) {
    signinMessage.textContent = 'Your account setup is complete. Sign in to continue.';
    signinMessage.classList.add('is-visible');
  }
}

const signedOut = new URLSearchParams(window.location.search).get('loggedout');
if (signedOut === '1') {
  const signedOutForm = document.querySelector('[data-auth-mode="signin"]');
  const signedOutMessage = signedOutForm?.querySelector('[data-form-message]');

  if (signedOutMessage) {
    signedOutMessage.textContent = 'You have been signed out. Sign in again to reach your workspace.';
    signedOutMessage.classList.add('is-visible');
  }
}

document.querySelectorAll('[data-back-to-page]').forEach((button) => {
  if (window.history.length > 1) {
    button.addEventListener('click', () => window.history.back());
  } else {
    button.hidden = true;
  }
});

