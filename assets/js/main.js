// Babatunde Victoria Inioluwa — shared site behavior
(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('.site-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    nav.querySelectorAll('.nav-link:not(.nav-dropdown-trigger), .nav-cta, .nav-dropdown-link').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // The name under the hero photo drop-bounces in once, then switches to
  // a gentle continuous float instead of sitting static afterward.
  document.querySelectorAll('.hero-photo-name').forEach(function (el) {
    el.addEventListener('animationend', function (e) {
      if (e.animationName === 'nameDrop') {
        el.classList.add('is-floating');
      }
    });
  });

  // Discord has no public profile URL, so the footer link copies the
  // username to the clipboard instead and gives brief visual feedback.
  document.querySelectorAll('[data-discord-copy]').forEach(function (btn) {
    var label = btn.querySelector('[data-discord-label]');
    var original = label ? label.textContent : '';
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-discord-copy');
      var showCopied = function () {
        btn.setAttribute('data-copied', 'true');
        if (label) label.textContent = 'Copied!';
        setTimeout(function () {
          btn.removeAttribute('data-copied');
          if (label) label.textContent = original;
        }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(showCopied).catch(showCopied);
      } else {
        showCopied();
      }
    });
  });

  document.querySelectorAll('.nav-dropdown-wrap').forEach(function (wrap) {
    var trigger = wrap.querySelector('[data-dropdown-trigger]');
    if (!trigger) return;
    trigger.addEventListener('click', function () {
      var isOpen = wrap.classList.toggle('dropdown-open');
      trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.nav-dropdown-wrap.dropdown-open').forEach(function (wrap) {
      if (!wrap.contains(e.target)) {
        wrap.classList.remove('dropdown-open');
        var trigger = wrap.querySelector('[data-dropdown-trigger]');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-dropdown-wrap.dropdown-open').forEach(function (wrap) {
        wrap.classList.remove('dropdown-open');
        var trigger = wrap.querySelector('[data-dropdown-trigger]');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });
    }
  });

  var themeToggle = document.querySelector('[data-theme-toggle]');
  if (themeToggle) {
    var updateThemeLabel = function () {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    };
    updateThemeLabel();
    themeToggle.addEventListener('click', function () {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        try { localStorage.setItem('theme', 'dark'); } catch (e) {}
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        try { localStorage.setItem('theme', 'light'); } catch (e) {}
      }
      updateThemeLabel();
    });
  }

  // "What we do" cards zoom in briefly on click before navigating, so the
  // click itself feels tactile instead of an instant jump to the next page.
  document.querySelectorAll('.svc-card').forEach(function (card) {
    var wrap = card.closest('.svc-card-wrap') || card;
    card.addEventListener('click', function (e) {
      if (wrap.dataset.zooming === 'true') return;
      e.preventDefault();
      wrap.dataset.zooming = 'true';
      wrap.classList.add('card-zoom');
      var href = card.getAttribute('href');
      setTimeout(function () {
        window.location.href = href;
      }, 220);
    });
  });

  document.querySelectorAll('.faq-item').forEach(function (item) {
    var question = item.querySelector('.faq-question');
    var symbol = item.querySelector('.faq-symbol');
    if (!question) return;
    question.addEventListener('click', function () {
      var open = item.getAttribute('data-open') === 'true';
      item.setAttribute('data-open', open ? 'false' : 'true');
      question.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (symbol) symbol.textContent = open ? '+' : '−';
    });
  });

  function openServiceCard(card) {
    var trigger = card.querySelector('.svc-trigger');
    var symbol = card.querySelector('.svc-toggle-symbol');
    card.setAttribute('data-open', 'true');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (symbol) symbol.textContent = '−';
  }

  document.querySelectorAll('.svc-card-full').forEach(function (card) {
    var trigger = card.querySelector('.svc-trigger');
    var symbol = card.querySelector('.svc-toggle-symbol');
    if (!trigger) return;
    trigger.addEventListener('click', function () {
      var open = card.getAttribute('data-open') === 'true';
      card.setAttribute('data-open', open ? 'false' : 'true');
      trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (symbol) symbol.textContent = open ? '+' : '−';
    });
  });

  if (location.hash) {
    var targetCard = document.querySelector('.svc-card-full' + location.hash);
    if (targetCard) {
      openServiceCard(targetCard);
      targetCard.classList.add('in-view');
      window.addEventListener('load', function () {
        targetCard.scrollIntoView({ block: 'center' });
      });
    }

    // "See example" links on the Home page's service cards deep-link
    // here, so scroll to and briefly highlight the matching case study.
    var targetCase = document.querySelector('.case-card' + location.hash);
    if (targetCase) {
      targetCase.classList.add('in-view', 'case-highlight');
      window.addEventListener('load', function () {
        targetCase.scrollIntoView({ block: 'center' });
      });
    }
  }

  // Stat numbers (e.g. "2.5X", "+180%", "40+") count up from 0 the first
  // time they scroll into view, instead of just appearing.
  var counters = document.querySelectorAll('.result-number, .stat-number');
  counters.forEach(function (el) {
    var m = el.textContent.trim().match(/^([+-]?)(\d+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    el.dataset.countPrefix = m[1];
    el.dataset.countTarget = m[2];
    el.dataset.countSuffix = m[3];
    el.dataset.countDecimals = (m[2].split('.')[1] || '').length;
    el.textContent = m[1] + (0).toFixed(el.dataset.countDecimals) + m[3];
  });

  function animateCount(el) {
    if (!el.dataset.countTarget || el.dataset.counted === 'true') return;
    el.dataset.counted = 'true';
    var target = parseFloat(el.dataset.countTarget);
    var decimals = parseInt(el.dataset.countDecimals, 10);
    var prefix = el.dataset.countPrefix;
    var suffix = el.dataset.countSuffix;
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var revealEls = document.querySelectorAll('.reveal-up, .reveal-flip');
  if (revealEls.length) {
    var siblingIndex = new Map();
    revealEls.forEach(function (el) {
      var parent = el.parentElement;
      var i = siblingIndex.get(parent) || 0;
      el.style.transitionDelay = Math.min(i * 0.04, 0.24) + 's';
      siblingIndex.set(parent, i + 1);
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
              if (entry.target.matches('.result-number, .stat-number')) {
                animateCount(entry.target);
              }
              entry.target.querySelectorAll('.result-number, .stat-number').forEach(animateCount);
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('in-view'); });
      counters.forEach(animateCount);
    }
  } else {
    counters.forEach(animateCount);
  }

  // Portfolio case cards flip in place (3D, Y-axis) to reveal more detail
  // on the back. The small expand button on the image is a separate
  // target that opens the full screenshot in a lightbox instead, so the
  // two interactions never fight over the same click.
  document.querySelectorAll('.case-card').forEach(function (card) {
    function toggleFlip() {
      card.classList.toggle('is-flipped');
    }
    card.addEventListener('click', function (e) {
      if (e.target.closest('[data-lightbox-trigger]')) return;
      if (e.target.closest('a')) return;
      toggleFlip();
    });
    card.addEventListener('keydown', function (e) {
      if (e.target !== card) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFlip();
      }
    });
  });

  var lightbox = document.querySelector('[data-lightbox-overlay]');
  var lightboxImg = document.querySelector('[data-lightbox-img]');
  var lightboxClose = document.querySelector('[data-lightbox-close]');
  if (lightbox && lightboxImg) {
    document.querySelectorAll('[data-lightbox-trigger]').forEach(function (btn) {
      var img = btn.parentElement.querySelector('.case-image-fg') || btn.parentElement.querySelector('img');
      if (!img) return;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.hidden = false;
      });
    });
    var closeLightbox = function () {
      lightbox.hidden = true;
      lightboxImg.src = '';
    };
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
  }

  var form = document.querySelector('[data-contact-form]');
  if (form) {
    var successEl = document.querySelector('[data-contact-success]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString(),
      })
        .then(function () {
          form.hidden = true;
          if (successEl) successEl.hidden = false;
        })
        .catch(function () {
          // Fall back to a normal form submission (Netlify redirect) if the
          // AJAX POST fails for any reason.
          form.submit();
        });
    });
  }
})();
