/* ============================================================
   PROJECT DETAIL PAGE — project.js
   ============================================================ */

// ── CURSOR ────────────────────────────────────────────────────
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
});
function animateRing() {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll('a, button, .carousel-dot').forEach(el => {
    el.addEventListener('mouseenter', () => { cursorDot.classList.add('hovering'); cursorRing.classList.add('hovering'); });
    el.addEventListener('mouseleave', () => { cursorDot.classList.remove('hovering'); cursorRing.classList.remove('hovering'); });
});

// ── EXIT TRANSITION (back links) ──────────────────────────────
const exitOverlay = document.createElement('div');
exitOverlay.className = 'page-exit-overlay';
document.body.appendChild(exitOverlay);

function navigateOut(url) {
    exitOverlay.classList.add('active');
    setTimeout(() => { window.location.href = url; }, 480);
}

document.getElementById('navBack').addEventListener('click', e => {
    e.preventDefault();
    navigateOut('index.html');
});
document.getElementById('backToProjects').addEventListener('click', e => {
    e.preventDefault();
    navigateOut('index.html#projects');
});

// ── CAROUSEL ──────────────────────────────────────────────────
const track = document.getElementById('carouselTrack');
const dotsContainer = document.getElementById('carouselDots');
const progressFill = document.getElementById('carouselProgressFill');
const prevBtn = document.getElementById('carouselPrev');
const nextBtn = document.getElementById('carouselNext');
const slides = Array.from(track.querySelectorAll('.carousel-slide'));

let current = 0;
let autoTimer = null;
let progressRaf = null;
let progressStart = null;
const INTERVAL = 4500; // ms per slide

// Build dots
slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
});

function getDots() { return Array.from(dotsContainer.querySelectorAll('.carousel-dot')); }

function manageSlideMedia(index, action) {
    // Pause all videos first, then play active one if action === 'play'
    slides.forEach((slide, i) => {
        const video = slide.querySelector('video');
        if (!video) return;
        if (action === 'play' && i === index) {
            video.play().catch(() => { });
        } else {
            video.pause();
            if (i !== index) video.currentTime = 0;
        }
    });
}

function goTo(index, userInitiated = false) {
    // Pause previous video
    const prevSlide = slides[current];
    const prevVideo = prevSlide && prevSlide.querySelector('video');
    if (prevVideo) prevVideo.pause();

    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;

    // Update dots
    getDots().forEach((d, i) => d.classList.toggle('active', i === current));

    // Play current video if any
    manageSlideMedia(current, 'play');

    // Restart auto-timer
    clearAutoTimer();
    startAutoTimer();
}

// Auto-play with animated progress bar
function startAutoTimer() {
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';

    // Force reflow
    progressFill.getBoundingClientRect();

    progressFill.style.transition = `width ${INTERVAL}ms linear`;
    progressFill.style.width = '100%';

    autoTimer = setTimeout(() => {
        goTo(current + 1);
    }, INTERVAL);
}

function clearAutoTimer() {
    clearTimeout(autoTimer);
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
}

prevBtn.addEventListener('click', () => goTo(current - 1, true));
nextBtn.addEventListener('click', () => goTo(current + 1, true));

// Keyboard nav
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') goTo(current - 1, true);
    if (e.key === 'ArrowRight') goTo(current + 1, true);
});

// Touch/swipe
let touchStartX = 0;
track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1), true);
});

// Pause on hover
const carousel = document.getElementById('carousel');
carousel.addEventListener('mouseenter', clearAutoTimer);
carousel.addEventListener('mouseleave', startAutoTimer);

// Init
manageSlideMedia(0, 'play');
startAutoTimer();

// ── MAGNETIC BUTTONS ──────────────────────────────────────────
document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const r = Math.max(rect.width, rect.height) * 1.2;
        if (dist < r) btn.style.transform = `translate(${dx * 0.35 * (1 - dist / r)}px, ${dy * 0.35 * (1 - dist / r)}px)`;
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)';
        btn.style.transform = '';
        setTimeout(() => btn.style.transition = '', 500);
    });
});

// ── SCROLL REVEAL ─────────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal-up');
const ro = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); ro.unobserve(e.target); } });
}, { threshold: 0.12 });
revealEls.forEach(el => ro.observe(el));

// ── LOAD PROJECT DATA FROM URL PARAMS ─────────────────────────
// Usage: project.html?id=1  (maps to projects array in index)
// This lets the single template serve all 4 projects dynamically.
const projects = [
    {
        id: '01',
        title: 'GS Full Stack Developer Course Capstone Project',
        tags: ['HTML/CSS', 'JavaScript', 'Bootstrap', 'React', 'Git', 'Docker'],
        role: 'Full Stack Developer',
        timeline: '2026 — 2.5 months',
        status: 'Completed & Published',
        platform: 'Web App',
        link: 'https://silverguide.krenova.co/',
        linkLabel: 'View Website →',
        overview: `Digital acceleration frequently leaves senior citizens behind due to over-complicated user interfaces and rising concerns around online safety. The SilverGuide is a web-based portal engineered explicitly to bridge this gap for older adults. Originally built with vanilla technologies, the platform was fully migrated to a robust React architecture to support dynamic, state-driven features, instant user interactivity, secure identity verification, and granular administrative control over system data.`,
        overview2: [
            { type: 'subheader', text: 'Core Architecture & Technical Implementation' },
            { type: 'bullet', text: '**Component-Driven React Migration:** Refactored the entire codebase into an optimized React ecosystem. Leveraged modern hooks and state-management principles to ensure seamless UI re-rendering, fast view-state transitions, and highly reusable layout components.' },
            { type: 'bullet', text: '**Secure Authentication & User Identity:** Implemented a full user registration and login system with strict data validation. Users authenticate using their emails to unlock interactive features, backed by secure session states and password management functionality.' },
            { type: 'bullet', text: '**Interactive Engagement & Routing:** Engineered a dynamic content routing system. When a user selects an article from the main gallery, they are routed to a dedicated Article View page. Authenticated users can interact seamlessly with the content via live comment threads and instantaneous like triggers.' },
            { type: 'bullet', text: '**Contextual AI Chatbot Integration:** Embedded an interactive AI chatbot companion directly within the individual article view page, providing users with a real-time conversational interface to ask questions and clarify concepts within the article text.' },
            { type: 'bullet', text: '**Granular Admin Dashboard:** Designed and programmed an executive analytics and content control panel featuring three key views — User Analytics (platform-wide counts of users, likes, and comments), User Directory (per-user metrics with administrative controls), and Content Lifecycle Management (a master article panel for editing, deleting, or toggling publication state across Published, Draft, and Archived statuses).' },
            { type: 'bullet', text: '**Accessibility & Crisis Controls:** Integrated a persistent, low-latency emergency Panic Button alongside flexible internationalization (i18n) multi-language toggles and global CSS root overrides for senior-friendly font-scaling and colour contrast.' },
            { type: 'subheader', text: 'Engineering Mindset & Agile Collaboration' },
            { type: 'paragraph', text: 'This project represents a complete product development cycle. The migration from vanilla JavaScript to React required strategic refactoring of logic layers, state management, and DOM handling.' },
            { type: 'paragraph', text: 'Developed inside an agile, team-driven environment, the project highlights rigorous version control discipline (Git/GitHub) to sync database schemas, resolve merge conflicts, and deploy seamless updates across code repositories.' },
        ],
        challenge: [
            'Navigating the early stages of the capstone project presented both technical and collaborative hurdles.',
            'There was a critical misalignment regarding the product\'s value proposition. The team proposed a generic resource portal, which I opposed on the grounds that it duplicated existing official platforms like ScamShield without providing unique utility. I pushed for deeper architectural complexity — a position that initially created friction with teammates and my mentor.',
            'On a personal level, the sheer volume of full-stack concepts was intensely overwhelming. This led to imposter syndrome and an over-reliance on AI pairing tools that made me question my core engineering competency.',
            'Compounding this, severe interpersonal friction within the team disrupted collaboration. Resolving it required compartmentalising personal frustrations, setting aside my ego, and adopting a professional stakeholder mindset — prioritising collective delivery over interpersonal conflict.',
        ],
        outcome: [
            'Ultimately, the project was a resounding success — and a pivotal turning point in my growth as an engineer and collaborator.',
            'By maintaining focus on the product\'s architecture, the team successfully executed a full migration from vanilla JavaScript to React, introducing dynamic multi-user role authentication, an interactive AI chatbot, and an enterprise-grade administrative dashboard.',
            'Overcoming the technical learning curve fundamentally transformed my relationship with AI. I transitioned from using it as a structural crutch to leveraging it as an accelerator for rapid prototyping and debugging — which in turn solidified my actual problem-solving capabilities.',
            'Most importantly, navigating the intense team dynamics served as a masterclass in professional resilience. I proved that I could align stakeholders, defuse internal friction, and protect the delivery of a high-stakes technical product under pressure — skills directly transferable to any engineering team.',
        ],
    },
    {
        id: '02',
        title: 'Placeholder for technical project',
        tags: ['Placeholder 1', 'Placeholder 2'],
        role: 'Placeholder',
        timeline: '2024 — 4 weeks',
        status: 'In Progress',
        platform: 'Web App',
        link: '#',
        linkLabel: 'View Project →',
        overview: `Portfolio currently under construction!`,
        overview2: `Coming soon...`,
        challenge: `Placeholder.`,
        outcome: `Placeholder`,
    },
    {
        id: '03',
        title: 'AI Disaster Movie Trailer',
        tags: ['Stable Diffusion WebUI', 'Runway Gen-2', 'Adobe Premiere Pro', 'ElevenLabs', 'Adobe Audition'],
        role: 'Creative Director & Editor',
        timeline: '2023 — 3 weeks',
        status: 'Completed & Published',
        platform: 'YouTube',
        link: 'https://youtu.be/28inCzQJPNM',
        linkLabel: 'Watch on YouTube →',
        overview: `An early experiment in AI-assisted creative direction — conceived, sourced, edited and audio-synced before generative AI tooling reached mainstream polish. The project involved directing Stable Diffusion to produce consistent cinematic frames, cutting them in Adobe Premiere Pro to a disaster-movie pacing, and layering a custom audio mix in Adobe Audition to sell the genre tone.`,
        overview2: `Working with early-stage tools meant solving problems that had no documentation. Prompt-to-frame consistency, temporal coherence between shots, and tone-matching audio to AI-generated visuals were all challenges navigated from first principles.`,
        challenge: `Early Stable Diffusion models had no concept of scene continuity. Getting two consecutive frames to feel like they belonged to the same film — same lighting, same character, same world — required iterative prompt engineering and significant manual curation. The editing challenge was then to construct a coherent narrative arc from inherently discontinuous frames.`,
        outcome: `The trailer landed as a proof-of-concept for AI-assisted filmmaking — demonstrating that with creative direction and editing craft, early generative tools could produce results that read as intentional rather than accidental.`,
    },
    {
        id: '04',
        title: 'My first children\'s storybook',
        tags: ['Stable Diffusion WebUI', 'Adobe Photoshop'],
        role: 'Creative Director & Illustrator',
        timeline: '2024 — 5 weeks',
        status: 'Completed & Published',
        platform: 'Amazon Kindle',
        link: 'https://www.amazon.com/Max-Borin-Friendship-Adventure-illustrated-ebook/dp/B0C9SNRFG6',
        linkLabel: 'View Project →',
        overview: `An interactive children's storybook created using AI-generated illustrations and traditional storytelling techniques. The project explores the intersection of technology and creativity in children's literature.`,
        overview2: `The storybook features a blend of AI-assisted art generation and manual illustration, creating a unique visual experience that engages young readers while showcasing the potential of AI in creative industries.`,
        challenge: `Balancing the use of AI-generated content with the need for artistic control and narrative coherence required careful curation and editing to ensure the final product met both creative and commercial goals.`,
        outcome: `A successful proof-of-concept for using AI in children's book creation, demonstrating how technology can enhance rather than replace traditional storytelling methods.`,
    },
    {
        id: '05',
        title: 'Much more coming soon...',
        tags: ['Placeholder 1', 'Placeholder 2'],
        role: 'Placeholder',
        timeline: 'Placeholder',
        status: 'Placeholder',
        platform: 'Placeholder',
        link: 'Placeholder',
        linkLabel: 'View Project →',
        overview: `Placeholder.`,
        overview2: `Placeholder.`,
        challenge: `Placeholder.`,
        outcome: `Placeholder.`,
    },
];

const params = new URLSearchParams(window.location.search);
const projectIdx = parseInt(params.get('id') || '0', 10);
const data = projects[projectIdx] || projects[0];

// Populate
document.title = `${data.title} — Kelvin`;
document.getElementById('navProjectId').textContent = `PROJECT / ${data.id}`;
document.getElementById('ptbNum').textContent = data.id;
document.getElementById('ptbTitle').textContent = data.title;
document.getElementById('detailRole').textContent = data.role;
document.getElementById('detailTimeline').textContent = data.timeline;
document.getElementById('detailStatus').textContent = data.status;
document.getElementById('detailPlatform').textContent = data.platform;
document.getElementById('projectOverview').textContent = data.overview;

// ── Render overview2: supports plain string OR typed object array ──
const overview2Element = document.querySelectorAll('.ps-body')[0].querySelectorAll('p')[1];
if (overview2Element) {
    if (Array.isArray(data.overview2)) {
        // Typed object array: each item has { type, text }
        const fragment = document.createDocumentFragment();
        data.overview2.forEach(item => {
            const isTyped = typeof item === 'object' && item.type;
            const type = isTyped ? item.type : 'bullet';
            const text = isTyped ? item.text : item;

            if (type === 'subheader') {
                const h = document.createElement('h4');
                h.textContent = text;
                h.style.cssText = 'font-size:1rem;font-weight:700;color:var(--text);margin:1.75rem 0 0.6rem;letter-spacing:0.01em;';
                fragment.appendChild(h);
            } else if (type === 'paragraph') {
                const p = document.createElement('p');
                p.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                p.style.cssText = 'color:var(--text-dim);font-size:1rem;line-height:1.8;margin-bottom:0.25rem;';
                fragment.appendChild(p);
            } else {
                // bullet (default)
                const li = document.createElement('li');
                li.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                li.style.cssText = 'color:var(--text-dim);font-size:1rem;line-height:1.8;';
                // Wrap in ul only if prev sibling isn't already a ul
                const last = fragment.lastChild;
                if (last && last.tagName === 'UL') {
                    last.appendChild(li);
                } else {
                    const ul = document.createElement('ul');
                    ul.style.cssText = 'padding-left:1.25rem;display:flex;flex-direction:column;gap:0.75rem;margin-bottom:0.25rem;';
                    ul.appendChild(li);
                    fragment.appendChild(ul);
                }
            }
        });
        overview2Element.replaceWith(fragment);
    } else {
        overview2Element.textContent = data.overview2;
    }
}

// ── Render challenge: supports plain string OR paragraph array ──
function renderParagraphs(elementId, data) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (Array.isArray(data)) {
        const fragment = document.createDocumentFragment();
        data.forEach((text, i) => {
            const p = document.createElement('p');
            p.textContent = text;
            p.style.cssText = 'color:var(--text-dim);font-size:1rem;line-height:1.8;' + (i > 0 ? 'margin-top:1rem;' : '');
            fragment.appendChild(p);
        });
        el.replaceWith(fragment);
    } else {
        el.textContent = data;
    }
}

renderParagraphs('projectChallenge', data.challenge);
renderParagraphs('projectOutcome', data.outcome);

const linkEl = document.getElementById('projectLink');
linkEl.href = data.link;
linkEl.textContent = data.linkLabel;

// Tags
const tagsEl = document.getElementById('ptbTags');
tagsEl.innerHTML = data.tags.map(t => `<span>${t}</span>`).join('');

// Prev / Next
const prevIdx = (projectIdx - 1 + projects.length) % projects.length;
const nextIdx = (projectIdx + 1) % projects.length;
document.getElementById('prevProject').href = `project.html?id=${prevIdx}`;
document.getElementById('nextProject').href = `project.html?id=${nextIdx}`;

// Slide gradients per project
const gradients = [
    ['#ff6b35', '#f7c59f'], ['#667eea', '#764ba2'],
    ['#4facfe', '#00f2fe'], ['#43e97b', '#38f9d7'],
];
slides.forEach((slide, i) => {
    const [g1, g2] = gradients[projectIdx] || gradients[0];
    slide.style.setProperty('--slide-color', `linear-gradient(135deg, ${g1}, ${g2})`);
    // Adjust lightness per slide so they're visually distinct
    const brightness = 0.7 + i * 0.1;
    slide.style.filter = `brightness(${brightness})`;
});
