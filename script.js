/* ============================================================
   KELVIN PORTFOLIO — script.js
   ============================================================ */

// ── PAGE ENTRY (fade in from black when returning from project page) ──
const entryOverlay = document.getElementById('pageEntryOverlay');
if (entryOverlay) {
    requestAnimationFrame(() => {
        setTimeout(() => entryOverlay.classList.add('done'), 50);
    });
}

// ── CUSTOM CURSOR ─────────────────────────────────────────────
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
});
(function animateRing() {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
})();

document.querySelectorAll('a, button, .project-card, .skill-item, .about-card, .dd-link').forEach(el => {
    el.addEventListener('mouseenter', () => { cursorDot.classList.add('is-hovering'); cursorRing.classList.add('is-hovering'); });
    el.addEventListener('mouseleave', () => { cursorDot.classList.remove('is-hovering'); cursorRing.classList.remove('is-hovering'); });
});

// ── TYPEWRITER HERO NAME ──────────────────────────────────────
const heroName = document.getElementById('heroName');
const FULL_NAME = 'KELVIN';
let charIdx = 0;

function typeChar() {
    if (!heroName) return;
    if (charIdx === 0) {
        heroName.classList.add('typed');
        heroName.textContent = '';
        const blinkStyle = document.createElement('style');
        blinkStyle.textContent = '@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }';
        document.head.appendChild(blinkStyle);
        const cur = document.createElement('span');
        cur.id = 'typeCursor';
        cur.style.cssText = 'display:inline-block;width:4px;height:0.85em;background:var(--amber);margin-left:4px;vertical-align:middle;animation:blink 0.7s step-end infinite;';
        heroName.appendChild(cur);
    }
    const cur = document.getElementById('typeCursor');
    if (charIdx < FULL_NAME.length) {
        heroName.insertBefore(document.createTextNode(FULL_NAME[charIdx]), cur);
        charIdx++;
        setTimeout(typeChar, 100 + Math.random() * 60);
    } else {
        setTimeout(() => {
            if (cur) { cur.style.transition = 'opacity 0.5s'; cur.style.opacity = '0'; setTimeout(() => cur && cur.remove(), 500); }
        }, 1200);
    }
}
window.addEventListener('load', () => setTimeout(typeChar, 400));

// ── NAVBAR SCROLL STATE ───────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── NAV MORPHING PROGRESS BAR ─────────────────────────────────
const navLinks      = document.getElementById('navLinks');
const progressPill  = document.getElementById('navProgressPill');
const nppLabel      = document.getElementById('nppLabel');
const nppFill       = document.getElementById('nppFill');
const nppPct        = document.getElementById('nppPct');
const navHeight     = 64; // approx navbar height px

// Sections tracked by the nav (not manifesto — it fades in/out)
const trackedSections = ['about', 'projects', 'roadmap', 'contact'];
const fadeSections    = ['home', 'manifesto']; // no nav item — pill fades in/out only

let activeSectionId = null;

function updateNavPill() {
    const scrollY = window.scrollY;
    const winH    = window.innerHeight;
    let found     = null;

    // Determine which section the viewport center is in
    [...trackedSections, ...fadeSections].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const top    = el.offsetTop - navHeight;
        const bottom = top + el.offsetHeight;
        if (scrollY + winH * 0.35 >= top && scrollY + winH * 0.35 < bottom) found = id;
    });

    if (found === activeSectionId) {
        // Just update fill %
        if (found) updateFill(found);
        return;
    }

    activeSectionId = found;

    if (!found || fadeSections.includes(found) && found === 'home') {
        // Above all sections or on home — show nav links, hide pill
        showLinks();
        return;
    }

    if (fadeSections.includes(found)) {
        // manifesto: hide links, show pill faded (no label slide needed)
        hideLinksFade();
        nppLabel.textContent = found.toUpperCase();
        updateFill(found);
        progressPill.classList.add('visible');
        return;
    }

    // Tracked section: slide links out, morph pill in
    hideLinksSlide();
    nppLabel.textContent = found.toUpperCase();
    updateFill(found);
    progressPill.classList.add('visible');

    // Highlight dropdown link
    document.querySelectorAll('.dd-link').forEach(a => {
        a.classList.toggle('active', a.dataset.section === found);
    });
    document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.toggle('active', a.dataset.section === found);
    });
}

function updateFill(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const scrollY  = window.scrollY;
    const top      = el.offsetTop - navHeight;
    const height   = el.offsetHeight;
    const progress = Math.max(0, Math.min(100, ((scrollY - top) / (height - window.innerHeight * 0.5)) * 100));
    nppFill.style.width = progress + '%';
    nppPct.textContent  = Math.round(progress) + '%';
}

function showLinks() {
    navLinks.classList.remove('hidden');
    progressPill.classList.remove('visible');
    document.querySelectorAll('.dd-link').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
}

function hideLinksSlide() {
    navLinks.classList.add('hidden');
}

function hideLinksFade() {
    navLinks.classList.add('hidden');
}

window.addEventListener('scroll', updateNavPill, { passive: true });
updateNavPill();

// ── SCAN LINE ON SECTION ENTER ────────────────────────────────
const scanLine     = document.getElementById('scanLine') || (() => { const d = document.createElement('div'); d.id = 'scanLine'; d.className = 'scan-line'; document.body.appendChild(d); return d; })();
const scanTriggers = document.querySelectorAll('.scan-trigger');

function fireScanLine() {
    scanLine.style.top = '0';
    scanLine.classList.add('active');
    const start    = performance.now();
    const duration = 450;
    function step(now) {
        const pct = Math.min((now - start) / duration, 1);
        scanLine.style.top = (pct * 100) + 'vh';
        if (pct < 1) requestAnimationFrame(step);
        else scanLine.classList.remove('active');
    }
    requestAnimationFrame(step);
}

new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) fireScanLine(); });
}, { threshold: 0.1 }).observe(document.querySelector('.scan-trigger') || document.body);

scanTriggers.forEach(el => {
    new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) fireScanLine(); });
    }, { threshold: 0.15 }).observe(el);
});

// ── MAGNETIC BUTTONS ──────────────────────────────────────────
function initMagnetic() {
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const r  = btn.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width  / 2);
            const dy = e.clientY - (r.top  + r.height / 2);
            const d  = Math.sqrt(dx*dx + dy*dy);
            const radius = Math.max(r.width, r.height) * 1.2;
            if (d < radius) btn.style.transform = `translate(${dx * 0.32 * (1 - d/radius)}px, ${dy * 0.32 * (1 - d/radius)}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transition = 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)';
            btn.style.transform  = '';
            setTimeout(() => btn.style.transition = '', 500);
        });
    });
}
initMagnetic();

// ── TUNNEL TRANSITION TO PROJECT PAGE ────────────────────────
const tunnelOverlay = document.getElementById('tunnelExitOverlay');

document.querySelectorAll('.tunnel-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const href = link.getAttribute('href');

        // Trigger tunnel animation
        tunnelOverlay.classList.add('active');
        // Small delay so CSS transition kicks in before animate class
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                tunnelOverlay.classList.add('animate');
            });
        });

        // Navigate after animation completes
        setTimeout(() => {
            window.location.href = href;
        }, 850);
    });
});

// Also make whole project card clickable
document.querySelectorAll('.project-card[data-project-id]').forEach(card => {
    card.style.cursor = 'none';
    card.addEventListener('click', e => {
        if (e.target.closest('.project-link')) return; // handled above
        const id   = card.dataset.projectId;
        const href = `project.html?id=${id}`;
        tunnelOverlay.classList.add('active');
        requestAnimationFrame(() => requestAnimationFrame(() => tunnelOverlay.classList.add('animate')));
        setTimeout(() => window.location.href = href, 850);
    });
});

// ── TEXT SCRAMBLE ─────────────────────────────────────────────
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&';
function scramble(el) {
    const orig = el.dataset.orig || el.textContent;
    el.dataset.orig = orig;
    let iter = 0; const total = orig.length * 2;
    (function step() {
        el.textContent = orig.split('').map((c, i) => {
            if (c === ' ') return ' ';
            if (i < iter / 2) return orig[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('');
        if (++iter <= total) requestAnimationFrame(() => setTimeout(step, 28));
        else el.textContent = orig;
    })();
}
document.querySelectorAll('.project-card').forEach(card => {
    const title = card.querySelector('.scramble-title');
    if (title) card.addEventListener('mouseenter', () => scramble(title));
});

// ── MANIFESTO FRAME SCRUBBER ──────────────────────────────────
// Frames: ./img/manifesto_frames/cleaned_frame_000001.jpg → cleaned_frame_000110.jpg
// Forward scroll = characters turn toward viewer
// Backward scroll = characters turn away

(function initManifestoScrubber() {
    const canvas  = document.getElementById('manifestoCanvas');
    if (!canvas) return;
    const ctx     = canvas.getContext('2d');
    const section = document.getElementById('manifesto');
    const TOTAL   = 55;   // number of frames in manifesto sequence (adjust if you add/remove frames)
    const FOLDER  = './img/manifesto_frames/';
    const EXT     = 'jpg'; 
    const PAD     = 6;

    const frames   = new Array(TOTAL).fill(null);
    const loaded   = new Array(TOTAL).fill(false);
    let firstReady = false;
    let currentIdx = 0;

    function pad(n) { return String(n).padStart(PAD, '0'); }

    function draw(img) {
        if (!img) return;
        const cw = canvas.width, ch = canvas.height;
        const iw = img.naturalWidth, ih = img.naturalHeight;
        const scale = Math.max(cw / iw, ch / ih);
        const sw = iw * scale, sh = ih * scale;
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, (cw - sw) / 2, (ch - sh) / 2, sw, sh);
    }

    function resize() {
    // Force the canvas internal resolution to strictly match the viewport window size
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    renderFrame();
}

    function nearestLoaded(target) {
        if (loaded[target]) return target;
        for (let offset = 1; offset < TOTAL; offset++) {
            if (target - offset >= 0    && loaded[target - offset]) return target - offset;
            if (target + offset < TOTAL && loaded[target + offset]) return target + offset;
        }
        return -1;
    }

    function renderFrame() {
        const best = nearestLoaded(currentIdx);
        if (best >= 0) draw(frames[best]);
    }

    function onScroll() {
        if (!firstReady) return;
        const rect     = section.getBoundingClientRect();
        const winH     = window.innerHeight;
        
        // Safety check: ensure denominator can never be 0 or negative
        const scrollableDist = rect.height - winH;
        if (scrollableDist <= 0) return;

        const progress = Math.max(0, Math.min(1, -rect.top / scrollableDist));
        const idx      = Math.min(TOTAL - 1, Math.floor(progress * (TOTAL - 1)));
        
        if (idx !== currentIdx) {
            currentIdx = idx;
            renderFrame();
        }
    }

    function loadFrame(n) {
        const img = new Image();
        // Verify this matches your filename pattern exactly!
        img.src = `${FOLDER}cleaned_frame_${pad(n)}.${EXT}`;
        img.onload = () => {
            frames[n - 1]  = img;
            loaded[n - 1]  = true;
            if (n === 1 && !firstReady) {
                firstReady = true;
                resize();
            }
            if (nearestLoaded(currentIdx) === n - 1) renderFrame();
        };
    }

    // Load sequential frame sequence
    loadFrame(1);
    for (let i = 2; i <= TOTAL; i++) loadFrame(i);

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    resize();
})();



// ── SCROLL REVEAL ─────────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal-up, .reveal-left');
new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); } });
}, { threshold: 0.12 }).observe(document.body);

const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); revObs.unobserve(e.target); } });
}, { threshold: 0.12 });
revealEls.forEach(el => revObs.observe(el));

// ── SPLIT REVEAL HEADINGS ─────────────────────────────────────
document.querySelectorAll('.split-reveal').forEach(el => {
    el.innerHTML = el.innerHTML.split('<br>')
        .map(line => `<span style="display:block;overflow:hidden"><span class="line-inner">${line}</span></span>`)
        .join('');
});
new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.querySelectorAll('.line-inner').forEach((line, i) => {
                line.style.transitionDelay = (i * 0.12) + 's';
                line.style.transform = 'translateY(0)';
            });
        }
    });
}, { threshold: 0.2 }).observe(document.body);

const splitObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.querySelectorAll('.line-inner').forEach((line, i) => {
                line.style.transitionDelay = (i * 0.12) + 's';
                line.style.transform = 'translateY(0)';
            });
            splitObs.unobserve(e.target);
        }
    });
}, { threshold: 0.2 });
document.querySelectorAll('.split-reveal').forEach(el => splitObs.observe(el));

// ── SMOOTH SCROLL ─────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
        const href   = this.getAttribute('href');
        const target = href.length > 1 && document.querySelector(href);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
});

// ── CONTACT FORM ──────────────────────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = this.querySelector('button[type="submit"]');
        const orig = btn.textContent;
        btn.textContent = 'Message Sent ✓';
        btn.style.background = '#4ade80';
        btn.style.color = '#0a0b0e';
        this.reset();
        setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.style.color = ''; }, 3500);
    });
}
