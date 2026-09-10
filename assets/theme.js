/* =====================================================================
 *  theme.js — Auto / Light / Dark / Flashlight mode controller
 *  Floating bottom-right widget. No persistence (resets each session).
 *  Default mode: "auto" — follows prefers-color-scheme.
 * ===================================================================== */
(function () {
  'use strict';

  /* ---------- Injected styles ---------- */
  var css = `
    :root {
      --tt-panel-bg: #ffffff;
      --tt-panel-border: rgba(0,0,0,0.1);
      --tt-panel-text: #0f1117;
      --tt-panel-muted: #5a5f72;
      --tt-btn-bg: #f1f3f9;
      --tt-btn-bg-hover: #e4e7f0;
      --tt-btn-active-bg: #1a4fdb;
      --tt-btn-active-text: #ffffff;
      --tt-shadow: 0 8px 28px rgba(15,17,23,0.18), 0 2px 8px rgba(15,17,23,0.08);
    }

    /* ---- Dark theme overrides (also used as base for Flashlight) ---- */
    html[data-theme="dark"] {
      --bg:       #0f1117;
      --bg2:      #181b25;
      --bg3:      #232735;
      --border:   rgba(255,255,255,0.10);
      --accent:   #5a8cff;
      --accent2:  #7aa1ff;
      --blue:     #5a8cff;
      --text:     #f0f2f8;
      --muted:    #a0a6b8;
      --card:     #181b25;

      --tt-panel-bg: #1c2030;
      --tt-panel-border: rgba(255,255,255,0.12);
      --tt-panel-text: #f0f2f8;
      --tt-panel-muted: #a0a6b8;
      --tt-btn-bg: #2a3045;
      --tt-btn-bg-hover: #353c55;
      --tt-btn-active-bg: #5a8cff;
      --tt-btn-active-text: #0f1117;
    }

    /* Targeted dark overrides for hardcoded colors in the site CSS */
    html[data-theme="dark"] nav {
      background: rgba(20,23,32,0.9) !important;
      border-bottom-color: rgba(255,255,255,0.08) !important;
    }
    html[data-theme="dark"] .nav-logo { color: var(--text) !important; }
    html[data-theme="dark"] [style*="background: #fff"],
    html[data-theme="dark"] [style*="background:#fff"],
    html[data-theme="dark"] [style*="background: #ffffff"] {
      background: var(--card) !important;
    }
    html[data-theme="dark"] [style*="background: #f7f8fc"],
    html[data-theme="dark"] [style*="background:#f7f8fc"] {
      background: var(--bg2) !important;
    }

    /* Sections written as background:var(--text) to be intentionally
       dark in light mode would flip light in dark mode (since --text inverts).
       Force them to stay dark so their white text remains readable. */
    html[data-theme="dark"] .apply-section,
    html[data-theme="dark"] .philosophy-section,
    html[data-theme="dark"] .cta-section,
    html[data-theme="dark"] footer {
      background: #07090f !important;
      color: rgba(255,255,255,0.85) !important;
    }
    html[data-theme="dark"] .apply-section .section-title,
    html[data-theme="dark"] .philosophy-section .section-title,
    html[data-theme="dark"] .cta-section .section-title {
      color: #ffffff !important;
    }
    html[data-theme="dark"] .apply-section p,
    html[data-theme="dark"] .philosophy-section p,
    html[data-theme="dark"] .cta-section p,
    html[data-theme="dark"] footer p {
      color: rgba(255,255,255,0.7) !important;
    }

    /* Matrix variant — keep the inverted sections in the matrix palette */
    html[data-theme="matrix"] .apply-section,
    html[data-theme="matrix"] .philosophy-section,
    html[data-theme="matrix"] .cta-section,
    html[data-theme="matrix"] footer {
      background: #000 !important;
      color: #00ff66 !important;
    }
    html[data-theme="matrix"] .apply-section .section-title,
    html[data-theme="matrix"] .philosophy-section .section-title,
    html[data-theme="matrix"] .cta-section .section-title {
      color: #00ff66 !important;
    }
    html[data-theme="matrix"] .apply-section p,
    html[data-theme="matrix"] .philosophy-section p,
    html[data-theme="matrix"] .cta-section p,
    html[data-theme="matrix"] footer p {
      color: rgba(0,255,102,0.7) !important;
    }

    /* ============= MATRIX THEME ============= */
    html[data-theme="matrix"] {
      --bg:       #000000;
      --bg2:      #001a0a;
      --bg3:      #002510;
      --border:   rgba(0, 255, 102, 0.18);
      --accent:   #00ff66;
      --accent2:  #00cc52;
      --blue:     #00ff66;
      --text:     #00ff66;
      --muted:    #00aa44;
      --card:     #0a1a0a;

      --tt-panel-bg: #0a1a0a;
      --tt-panel-border: rgba(0, 255, 102, 0.35);
      --tt-panel-text: #00ff66;
      --tt-panel-muted: #00aa44;
      --tt-btn-bg: #0a2a12;
      --tt-btn-bg-hover: #0f3a1c;
      --tt-btn-active-bg: #00ff66;
      --tt-btn-active-text: #000000;
    }
    html[data-theme="matrix"] body {
      font-family: 'Courier New', 'Monaco', monospace !important;
      letter-spacing: 0.02em;
    }
    html[data-theme="matrix"] nav {
      background: rgba(0, 0, 0, 0.92) !important;
      border-bottom-color: rgba(0, 255, 102, 0.25) !important;
    }
    html[data-theme="matrix"] .nav-logo { color: #00ff66 !important; }
    html[data-theme="matrix"] .nav-logo span { color: #00ff66 !important; }
    html[data-theme="matrix"] [style*="background: #fff"],
    html[data-theme="matrix"] [style*="background:#fff"],
    html[data-theme="matrix"] [style*="background: #ffffff"] {
      background: #001a0a !important;
      color: #00ff66 !important;
    }
    html[data-theme="matrix"] [style*="background: #f7f8fc"],
    html[data-theme="matrix"] [style*="background:#f7f8fc"],
    html[data-theme="matrix"] [style*="background: #0f1a3d"] {
      background: #001a0a !important;
      color: #00ff66 !important;
    }
    html[data-theme="matrix"] img {
      filter: hue-rotate(80deg) saturate(0.6) brightness(0.85);
    }

    /* Recolor the hardcoded blue (rgba(26,79,219,...)) accents to green */
    html[data-theme="matrix"] .hero::before,
    html[data-theme="matrix"] [class*="hero"]::before {
      background: radial-gradient(ellipse 80% 60% at 50% -10%,
        rgba(0, 255, 102, 0.10) 0%, transparent 70%) !important;
    }
    html[data-theme="matrix"] .hero-eyebrow,
    html[data-theme="matrix"] .hero-label,
    html[data-theme="matrix"] .section-label,
    html[data-theme="matrix"] [class*="eyebrow"],
    html[data-theme="matrix"] [class*="-label"] {
      background: rgba(0, 255, 102, 0.10) !important;
      border-color: rgba(0, 255, 102, 0.35) !important;
      color: #00ff66 !important;
      text-shadow: 0 0 4px rgba(0, 255, 102, 0.45);
    }
    html[data-theme="matrix"] .hero-eyebrow::before,
    html[data-theme="matrix"] [class*="eyebrow"]::before,
    html[data-theme="matrix"] [class*="-label"]::before {
      background: #00ff66 !important;
      box-shadow: 0 0 6px rgba(0, 255, 102, 0.7);
    }
    /* Existing CTAs that hardcode blue gradients/shadows */
    html[data-theme="matrix"] .nav-cta:not([data-flashlight-trigger]) {
      background: #00ff66 !important;
      color: #000 !important;
      box-shadow: 0 0 12px rgba(0, 255, 102, 0.4) !important;
    }
    /* Hero/section radial-gradient accent overlays elsewhere on the page */
    html[data-theme="matrix"] [class*="hero"] {
      background-image: none !important;
    }

    /* Falling-character canvas rain */
    .tt-matrix-rain {
      position: fixed;
      inset: 0;
      z-index: 9990;
      pointer-events: none;
      opacity: 0;
      transition: opacity .5s ease;
      mix-blend-mode: screen;
    }
    html[data-theme="matrix"] .tt-matrix-rain { opacity: 0.22; }


    /* Smooth color transitions when switching modes */
    html[data-theme] body,
    html[data-theme] nav,
    html[data-theme] section,
    html[data-theme] .card,
    html[data-theme] footer {
      transition: background-color .25s ease, color .25s ease, border-color .25s ease;
    }

    /* ---- Flashlight overlay (CSS vars --tt-x/y/r come from documentElement) ---- */
    .tt-flashlight {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 9998;
      background: #000;
      opacity: 0;
      transition: opacity .25s ease;
      -webkit-mask: radial-gradient(circle at var(--tt-x, 50vw) var(--tt-y, 50vh),
        transparent 0px,
        transparent calc(var(--tt-r, 300px) - 60px),
        rgba(0,0,0,0.85) calc(var(--tt-r, 300px) - 10px),
        #000 var(--tt-r, 300px));
              mask: radial-gradient(circle at var(--tt-x, 50vw) var(--tt-y, 50vh),
        transparent 0px,
        transparent calc(var(--tt-r, 300px) - 60px),
        rgba(0,0,0,0.85) calc(var(--tt-r, 300px) - 10px),
        #000 var(--tt-r, 300px));
    }
    html[data-theme="flashlight"] .tt-flashlight { opacity: 1; }
    html[data-theme="flashlight"] body { background: #ffffff; }

    /* Faint glow ring at the beam edge */
    .tt-flashlight-glow {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 9997;
      opacity: 0;
      transition: opacity .25s ease;
      background: radial-gradient(circle at var(--tt-x, 50vw) var(--tt-y, 50vh),
        rgba(255,240,180,0.18) 0px,
        rgba(255,220,120,0.08) calc(var(--tt-r, 300px) * 0.5),
        transparent var(--tt-r, 300px));
    }
    html[data-theme="flashlight"] .tt-flashlight-glow { opacity: 1; }

    /* ---- Control widget ---- */
    .tt-widget {
      position: fixed;
      right: 20px;
      bottom: 20px;
      z-index: 10000;
      font-family: 'Inter', system-ui, sans-serif;
      color: var(--tt-panel-text);
      user-select: none;
    }
    .tt-toggle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--tt-panel-bg);
      border: 1px solid var(--tt-panel-border);
      box-shadow: var(--tt-shadow);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform .15s ease, box-shadow .2s ease;
      color: var(--tt-panel-text);
    }
    .tt-toggle:hover { transform: translateY(-2px); }
    .tt-toggle svg { width: 22px; height: 22px; }

    /* Exit-flashlight pill — only visible in flashlight mode */
    .tt-exit-flashlight {
      position: absolute;
      right: 0;
      bottom: 60px;
      display: none;
      align-items: center;
      gap: 8px;
      padding: 11px 18px 11px 14px;
      background: #fff7d6;
      color: #1a1408;
      border: 1px solid rgba(255,210,80,0.6);
      border-radius: 999px;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.01em;
      cursor: pointer;
      white-space: nowrap;
      box-shadow:
        0 0 0 4px rgba(255,220,120,0.18),
        0 0 24px rgba(255,210,80,0.45),
        0 6px 18px rgba(0,0,0,0.35);
      transition: transform .15s ease, box-shadow .2s ease, background .15s ease;
      z-index: 1;
    }
    .tt-exit-flashlight:hover {
      background: #ffeea3;
      transform: translateY(-1px);
      box-shadow:
        0 0 0 4px rgba(255,220,120,0.28),
        0 0 32px rgba(255,210,80,0.6),
        0 8px 22px rgba(0,0,0,0.4);
    }
    .tt-exit-flashlight svg { width: 16px; height: 16px; }
    .tt-widget.effect-on .tt-exit-flashlight { display: inline-flex; }
    /* When an effect is on, push the panel up so the exit pill takes that slot */
    .tt-widget.effect-on .tt-panel { bottom: 112px; }

    .tt-panel {
      position: absolute;
      right: 0;
      bottom: 60px;
      width: 220px;
      background: var(--tt-panel-bg);
      border: 1px solid var(--tt-panel-border);
      border-radius: 14px;
      box-shadow: var(--tt-shadow);
      padding: 14px;
      opacity: 0;
      transform: translateY(8px) scale(0.96);
      pointer-events: none;
      transition: opacity .18s ease, transform .18s ease;
    }
    .tt-widget.open .tt-panel {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    /* When opened from the nav trigger, anchor the panel under the nav (top-right) */
    .tt-widget.from-nav .tt-panel {
      position: fixed;
      top: 80px;
      right: 20px;
      bottom: auto;
      left: auto;
      transform-origin: top right;
      transform: translateY(-8px) scale(0.96);
    }
    .tt-widget.from-nav.open .tt-panel {
      transform: translateY(0) scale(1);
    }
    /* When panel is from-nav AND an effect is on, ignore the bottom: 112px gear rule */
    .tt-widget.from-nav.effect-on .tt-panel { bottom: auto; }
    @media (max-width: 560px) {
      .tt-widget.from-nav .tt-panel { right: 14px; top: 70px; }
    }
    .tt-panel-title {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--tt-panel-muted);
      margin-bottom: 10px;
    }
    .tt-mode-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-bottom: 4px;
    }
    .tt-mode-btn {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 8px 10px;
      background: var(--tt-btn-bg);
      border: none;
      border-radius: 9px;
      color: var(--tt-panel-text);
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: background .15s ease;
      font-family: inherit;
    }
    .tt-mode-btn:hover { background: var(--tt-btn-bg-hover); }
    .tt-mode-btn.active {
      background: var(--tt-btn-active-bg);
      color: var(--tt-btn-active-text);
    }
    .tt-mode-btn.full-width { grid-column: 1 / -1; justify-content: center; }
    .tt-mode-btn svg { width: 14px; height: 14px; flex-shrink: 0; }

    .tt-slider-wrap {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--tt-panel-border);
      display: none;
    }
    .tt-widget.effect-on .tt-slider-wrap { display: block; }
    .tt-slider-label {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      color: var(--tt-panel-muted);
      margin-bottom: 6px;
      font-weight: 600;
    }
    .tt-slider {
      width: 100%;
      -webkit-appearance: none;
      appearance: none;
      height: 4px;
      border-radius: 999px;
      background: var(--tt-btn-bg);
      outline: none;
    }
    .tt-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px; height: 16px;
      border-radius: 50%;
      background: var(--tt-btn-active-bg);
      cursor: pointer;
      border: 2px solid var(--tt-panel-bg);
      box-shadow: 0 1px 4px rgba(0,0,0,0.25);
    }
    .tt-slider::-moz-range-thumb {
      width: 16px; height: 16px;
      border-radius: 50%;
      background: var(--tt-btn-active-bg);
      cursor: pointer;
      border: 2px solid var(--tt-panel-bg);
    }

    @media (max-width: 520px) {
      .tt-widget { right: 14px; bottom: 14px; }
      .tt-panel { width: 200px; }
    }

    /* ===== "Try Flashlight Mode" nav button =====
       Light-mode default: airy cream pill, dark navy text, warm amber accents.
       Dark-mode variant overrides further down with a navy gradient. */
    a.nav-cta[data-flashlight-trigger] {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 9px;
      padding: 9px 18px 9px 14px;
      background: linear-gradient(180deg, #ffffff 0%, #fffbef 100%);
      color: #14213d;
      border: 1.25px solid rgba(214, 158, 32, 0.55);
      border-radius: 999px;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.01em;
      text-decoration: none;
      text-transform: none;
      overflow: hidden;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.9),
        0 1px 2px rgba(15, 26, 61, 0.05),
        0 0 0 0 rgba(241, 178, 38, 0);
      /* opacity starts at 0 (FOUC guard in each page <head>) and is
         revealed to 1 here once theme.js's stylesheet lands — kills the
         blue flash of the un-themed .nav-cta base style on page load. */
      opacity: 1;
      /* Cursor-reactive glow — strength driven by --tt-prox (0–1), set
         by the proximity script further down. 0 = no glow, costs nothing. */
      filter: drop-shadow(0 0 calc(15px * var(--tt-prox, 0)) rgba(255, 193, 64, calc(0.6 * var(--tt-prox, 0))));
      transition:
        transform .18s ease,
        box-shadow .25s ease,
        border-color .25s ease,
        background .25s ease,
        color .25s ease,
        filter .22s ease,
        opacity .45s ease;
    }

    /* Inner sweeping highlight — soft amber beam. Sweeps on a slow idle
       loop (see @keyframes tt-beam-sweep) to keep the button quietly alive. */
    a.nav-cta[data-flashlight-trigger]::before {
      content: '';
      position: absolute;
      top: 0; bottom: 0;
      left: -45%;
      width: 38%;
      background: linear-gradient(
        100deg,
        transparent 0%,
        rgba(255, 200, 80, 0.32) 50%,
        transparent 100%
      );
      transform: skewX(-18deg);
      pointer-events: none;
      animation: tt-beam-sweep 11s ease-in-out infinite;
    }

    /* Idle attention loop: a soft beam glides across roughly every 11s,
       then rests off-screen. The sweep itself stays ~0.8s — only the gap
       between passes was lengthened. Disabled for reduced-motion below. */
    @keyframes tt-beam-sweep {
      0%     { left: -45%; }
      4%     { left: -45%; }
      11.5%  { left: 125%; }
      100%   { left: 125%; }
    }
    @media (prefers-reduced-motion: reduce) {
      a.nav-cta[data-flashlight-trigger]::before { animation: none; left: -45%; }
    }

    a.nav-cta[data-flashlight-trigger]:hover {
      transform: translateY(-1px);
      background: linear-gradient(180deg, #fffdf3 0%, #fff3ce 100%);
      border-color: rgba(214, 158, 32, 0.9);
      color: #0f1a3d;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,1),
        0 0 0 3px rgba(255, 200, 80, 0.22),
        0 6px 18px rgba(214, 158, 32, 0.18);
    }
    a.nav-cta[data-flashlight-trigger]:active { transform: translateY(0); }
    /* Keyboard focus ring — theme-matched (currentColor), never the
       browser-default blue outline. */
    a.nav-cta[data-flashlight-trigger]:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }

    a.nav-cta[data-flashlight-trigger] .tt-trigger-icon {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      color: #e8a317;
      filter: drop-shadow(0 0 3px rgba(255, 195, 70, 0.55));
    }
    a.nav-cta[data-flashlight-trigger]:hover .tt-trigger-icon {
      color: #d68b00;
      filter: drop-shadow(0 0 5px rgba(255, 180, 50, 0.8));
    }
    a.nav-cta[data-flashlight-trigger] .tt-trigger-icon svg {
      width: 100%;
      height: 100%;
      stroke-width: 2.2;
    }
    a.nav-cta[data-flashlight-trigger] .tt-trigger-label { position: relative; }

    /* Open state — pinned amber ring while panel is open */
    a.nav-cta[data-flashlight-trigger][aria-expanded="true"] {
      border-color: rgba(214, 158, 32, 1);
      background: linear-gradient(180deg, #fffdf3 0%, #ffeeb5 100%);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,1),
        0 0 0 3px rgba(255, 200, 80, 0.32),
        0 6px 18px rgba(214, 158, 32, 0.22);
    }

    /* ----- Dark theme variant — moody navy with cream-gold text ----- */
    html[data-theme="dark"] a.nav-cta[data-flashlight-trigger],
    html[data-theme="flashlight"] a.nav-cta[data-flashlight-trigger] {
      background: linear-gradient(135deg, #0f1a3d 0%, #1a2a55 55%, #0f1a3d 100%);
      border-color: rgba(255, 210, 80, 0.4);
      color: #fff7d6;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.08),
        0 4px 14px rgba(0, 0, 0, 0.32);
    }
    html[data-theme="dark"] a.nav-cta[data-flashlight-trigger] .tt-trigger-label,
    html[data-theme="flashlight"] a.nav-cta[data-flashlight-trigger] .tt-trigger-label {
      background: linear-gradient(180deg, #fff8dc 0%, #ffe9a8 100%);
      -webkit-background-clip: text;
              background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
    }
    html[data-theme="dark"] a.nav-cta[data-flashlight-trigger] .tt-trigger-icon,
    html[data-theme="flashlight"] a.nav-cta[data-flashlight-trigger] .tt-trigger-icon {
      color: #ffd54a;
      filter: drop-shadow(0 0 4px rgba(255, 210, 80, 0.65))
              drop-shadow(0 0 8px rgba(255, 180, 60, 0.4));
    }
    html[data-theme="dark"] a.nav-cta[data-flashlight-trigger]:hover,
    html[data-theme="flashlight"] a.nav-cta[data-flashlight-trigger]:hover {
      background: linear-gradient(135deg, #142150 0%, #233675 55%, #142150 100%);
      border-color: rgba(255, 210, 80, 0.75);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.12),
        0 0 0 3px rgba(255, 210, 80, 0.18),
        0 8px 22px rgba(0, 0, 0, 0.45),
        0 0 24px rgba(255, 210, 80, 0.25);
    }

    /* ----- Matrix theme variant — green-on-black ----- */
    html[data-theme="matrix"] a.nav-cta[data-flashlight-trigger] {
      background: linear-gradient(135deg, #000000 0%, #001a0a 55%, #000000 100%);
      border-color: rgba(0, 255, 102, 0.55);
      color: #00ff66;
      font-family: 'Courier New', 'Monaco', monospace !important;
      letter-spacing: 0.04em;
      /* Cursor-reactive glow recoloured green to match the Matrix theme. */
      filter: drop-shadow(0 0 calc(15px * var(--tt-prox, 0)) rgba(0, 255, 102, calc(0.6 * var(--tt-prox, 0))));
      box-shadow:
        inset 0 1px 0 rgba(0, 255, 102, 0.08),
        0 0 0 0 rgba(0, 255, 102, 0),
        0 4px 14px rgba(0, 0, 0, 0.5),
        0 0 12px rgba(0, 255, 102, 0.18);
    }
    html[data-theme="matrix"] a.nav-cta[data-flashlight-trigger]::before {
      background: linear-gradient(
        100deg,
        transparent 0%,
        rgba(120, 255, 170, 0.35) 50%,
        transparent 100%
      );
    }
    html[data-theme="matrix"] a.nav-cta[data-flashlight-trigger] .tt-trigger-label {
      background: none;
      -webkit-text-fill-color: #00ff66;
      color: #00ff66;
      text-shadow: 0 0 6px rgba(0, 255, 102, 0.55);
    }
    html[data-theme="matrix"] a.nav-cta[data-flashlight-trigger] .tt-trigger-icon {
      color: #00ff66;
      filter: drop-shadow(0 0 4px rgba(0, 255, 102, 0.85))
              drop-shadow(0 0 8px rgba(0, 255, 102, 0.55));
    }
    html[data-theme="matrix"] a.nav-cta[data-flashlight-trigger]:hover {
      background: linear-gradient(135deg, #001a0a 0%, #002a14 55%, #001a0a 100%);
      border-color: rgba(0, 255, 102, 0.9);
      box-shadow:
        inset 0 1px 0 rgba(0, 255, 102, 0.15),
        0 0 0 3px rgba(0, 255, 102, 0.2),
        0 8px 22px rgba(0, 0, 0, 0.6),
        0 0 28px rgba(0, 255, 102, 0.45);
    }
    html[data-theme="matrix"] a.nav-cta[data-flashlight-trigger][aria-expanded="true"] {
      border-color: rgba(0, 255, 102, 1);
      box-shadow:
        inset 0 1px 0 rgba(0, 255, 102, 0.18),
        0 0 0 3px rgba(0, 255, 102, 0.32),
        0 0 32px rgba(0, 255, 102, 0.55);
    }

    @media (max-width: 560px) {
      a.nav-cta[data-flashlight-trigger] {
        padding: 9px 12px;
        gap: 0;
      }
      a.nav-cta[data-flashlight-trigger] .tt-trigger-label { display: none; }
      a.nav-cta[data-flashlight-trigger] .tt-trigger-icon { width: 18px; height: 18px; }
    }
  `;

  var style = document.createElement('style');
  style.id = 'tt-styles';
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- Icons ---------- */
  var ICONS = {
    auto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M12 3a9 9 0 010 18z" fill="currentColor"/></svg>',
    light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
    dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>',
    matrix: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 7 2 12 6 17"/><polyline points="18 7 22 12 18 17"/><line x1="14" y1="5" x2="10" y2="19"/></svg>',
    flashlight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2h6l-1 4H10z"/><path d="M8 6h8v3l-2 2v9H10v-9L8 9z"/><path d="M12 13v3"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>'
  };

  /* ---------- Widget DOM ---------- */
  var widget = document.createElement('div');
  widget.className = 'tt-widget';
  widget.innerHTML = `
    <div class="tt-panel" role="dialog" aria-label="Display settings">
      <div class="tt-panel-title">Theme</div>
      <div class="tt-mode-grid">
        <button class="tt-mode-btn" data-mode="auto" type="button">${ICONS.auto}Auto</button>
        <button class="tt-mode-btn" data-mode="light" type="button">${ICONS.light}Light</button>
        <button class="tt-mode-btn" data-mode="dark" type="button">${ICONS.dark}Dark</button>
        <button class="tt-mode-btn" data-mode="matrix" type="button">${ICONS.matrix}Matrix</button>
      </div>
      <div class="tt-panel-title" style="margin-top: 14px;">Effects</div>
      <div class="tt-mode-grid">
        <button class="tt-mode-btn full-width" data-mode="flashlight" type="button">${ICONS.flashlight}Flashlight</button>
      </div>
      <div class="tt-slider-wrap">
        <div class="tt-slider-label">
          <span class="tt-slider-name">Beam size</span>
          <span class="tt-beam-val">300px</span>
        </div>
        <input type="range" class="tt-slider" min="250" max="600" value="300" step="10" aria-label="Effect size">
      </div>
    </div>
    <button class="tt-exit-flashlight" type="button" aria-label="Turn off effect">
      <span class="tt-exit-icon">${ICONS.flashlight}</span><span class="tt-exit-label">Turn Flashlight Mode OFF</span>
    </button>
    <button class="tt-toggle" type="button" aria-label="Display settings" aria-haspopup="dialog">
      ${ICONS.gear}
    </button>
  `;

  /* Effect overlays (separate from widget so they sit behind it) */
  var glow = document.createElement('div');
  glow.className = 'tt-flashlight-glow';
  var overlay = document.createElement('div');
  overlay.className = 'tt-flashlight';

  var matrixCanvas = document.createElement('canvas');
  matrixCanvas.className = 'tt-matrix-rain';

  function mount() {
    document.body.appendChild(matrixCanvas);
    document.body.appendChild(glow);
    document.body.appendChild(overlay);
    document.body.appendChild(widget);
  }
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);

  /* ---------- Behavior ---------- */
  var html = document.documentElement;
  var currentMode = 'auto';
  var lastNonEffectMode = 'auto';
  var beamRadius = 300;
  var mq = window.matchMedia('(prefers-color-scheme: dark)');

  /* Persistence — sessionStorage so choice carries across page navigations
     within the same tab but resets on tab close. */
  var STORE = (function () {
    try {
      var t = '__tt_test__';
      window.sessionStorage.setItem(t, '1');
      window.sessionStorage.removeItem(t);
      return window.sessionStorage;
    } catch (_) { return null; }
  })();
  function storeGet(k)    { return STORE ? STORE.getItem(k) : null; }
  function storeSet(k,v)  { if (STORE) try { STORE.setItem(k, v); } catch (_) {} }
  function storeRemove(k) { if (STORE) try { STORE.removeItem(k); } catch (_) {} }

  var EFFECTS = { flashlight: 1 };
  function isEffectMode(m) { return !!EFFECTS[m || currentMode]; }

  var EXIT_LABELS = {
    flashlight: 'Turn Flashlight Mode OFF'
  };
  var EFFECT_SLIDER_LABELS = {
    flashlight: 'Beam size'
  };

  function applyMode(mode) {
    if (!isEffectMode(mode)) lastNonEffectMode = mode;
    currentMode = mode;
    // Auto = absence of preference. Don't persist it; let each page load
    // re-check the OS via matchMedia. Only persist explicit picks.
    if (mode === 'auto') storeRemove('tt-mode');
    else                 storeSet('tt-mode', mode);
    storeSet('tt-last-non-effect', lastNonEffectMode);
    var effective;
    if (mode === 'auto') effective = mq.matches ? 'dark' : 'light';
    else                 effective = mode;

    if (effective === 'light') html.removeAttribute('data-theme');
    else                       html.setAttribute('data-theme', effective);

    // Active button highlight
    widget.querySelectorAll('.tt-mode-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.mode === mode);
    });
    var onEffect = isEffectMode(mode);
    widget.classList.toggle('effect-on', onEffect);

    // Update exit pill icon + label + slider label for the active effect
    if (onEffect) {
      var exitIcon = widget.querySelector('.tt-exit-icon');
      var exitLabel = widget.querySelector('.tt-exit-label');
      if (exitIcon) exitIcon.innerHTML = ICONS[mode];
      if (exitLabel) exitLabel.textContent = EXIT_LABELS[mode];
      var sliderName = widget.querySelector('.tt-slider-name');
      if (sliderName) sliderName.textContent = EFFECT_SLIDER_LABELS[mode];
    }

    // Matrix rain on/off
    if (mode === 'matrix') startMatrixRain();
    else                   stopMatrixRain();
  }

  function setBeam(r) {
    beamRadius = r;
    document.documentElement.style.setProperty('--tt-r', r + 'px');
    var label = widget.querySelector('.tt-beam-val');
    if (label) label.textContent = r + 'px';
    storeSet('tt-beam', String(r));
  }

  /* Beam position — desktop: follow mouse in real time
     Mobile: tap-to-move with smooth animated transition */
  var beamX = window.innerWidth / 2, beamY = window.innerHeight / 2;
  var rafId = null;

  function paintBeam() {
    var d = document.documentElement.style;
    d.setProperty('--tt-x', beamX + 'px');
    d.setProperty('--tt-y', beamY + 'px');
  }

  /* Desktop mouse tracking — instant, rAF-throttled */
  function onMouseMove(e) {
    beamX = e.clientX; beamY = e.clientY;
    if (rafId) return;
    rafId = requestAnimationFrame(function () {
      rafId = null;
      if (!isEffectMode()) return;
      paintBeam();
    });
  }
  window.addEventListener('mousemove', onMouseMove, { passive: true });

  /* Touch: tap-to-move with smooth animation */
  var animStart = 0, animFrom = { x: beamX, y: beamY }, animTo = { x: beamX, y: beamY }, animDuration = 380;
  var animRaf = null;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function tickAnim(now) {
    var t = Math.min(1, (now - animStart) / animDuration);
    var k = easeOutCubic(t);
    beamX = animFrom.x + (animTo.x - animFrom.x) * k;
    beamY = animFrom.y + (animTo.y - animFrom.y) * k;
    if (isEffectMode()) paintBeam();
    if (t < 1) animRaf = requestAnimationFrame(tickAnim);
    else      animRaf = null;
  }

  function animateBeamTo(x, y) {
    animFrom.x = beamX; animFrom.y = beamY;
    animTo.x = x;       animTo.y = y;
    animStart = performance.now();
    if (!animRaf) animRaf = requestAnimationFrame(tickAnim);
  }

  /* Tap detection: track touchstart position; on touchend, if movement
     was small (<10px), treat as a tap and animate beam there. Larger
     movement is a scroll/drag and is ignored so the page can scroll. */
  var touchStartX = 0, touchStartY = 0, touchOnWidget = false;
  document.addEventListener('touchstart', function (e) {
    if (!e.changedTouches || !e.changedTouches[0]) return;
    var t = e.changedTouches[0];
    touchStartX = t.clientX; touchStartY = t.clientY;
    touchOnWidget = widget.contains(e.target);
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    if (!isEffectMode()) return;
    if (touchOnWidget) return;
    if (!e.changedTouches || !e.changedTouches[0]) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - touchStartX, dy = t.clientY - touchStartY;
    if (Math.sqrt(dx * dx + dy * dy) > 10) return; // it was a scroll
    animateBeamTo(t.clientX, t.clientY);
  }, { passive: true });

  /* Wiring */
  var toggleBtn = widget.querySelector('.tt-toggle');
  toggleBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    // Opening from the gear → anchor at bottom-right (clear the nav-anchored class)
    widget.classList.remove('from-nav');
    widget.classList.toggle('open');
  });
  document.addEventListener('click', function (e) {
    var isTrigger = e.target.closest && e.target.closest('[data-flashlight-trigger]');
    if (isTrigger) return; // trigger handler manages its own open state
    if (!widget.contains(e.target)) {
      widget.classList.remove('open');
      widget.classList.remove('from-nav');
    }
  });

  widget.querySelectorAll('.tt-mode-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { applyMode(btn.dataset.mode); });
  });

  var slider = widget.querySelector('.tt-slider');
  slider.addEventListener('input', function () { setBeam(parseInt(slider.value, 10)); });

  var exitBtn = widget.querySelector('.tt-exit-flashlight');
  exitBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    applyMode(isEffectMode(lastNonEffectMode) ? 'auto' : lastNonEffectMode);
    widget.classList.remove('open');
  });

  /* ---- Auto-inject a Try Flashlight Mode trigger into any <nav> that
     doesn't already have one. Lets future pages get the button just by
     including this script — no per-page HTML edit needed. ---- */
  function autoInjectNavTriggers() {
    var navs = document.querySelectorAll('nav');
    navs.forEach(function (nav) {
      if (nav.querySelector('[data-flashlight-trigger]')) return; // already has one
      var trigger = document.createElement('a');
      trigger.href = '#';
      trigger.className = 'nav-cta';
      trigger.setAttribute('data-flashlight-trigger', '');
      trigger.style.marginRight = '10px';
      trigger.textContent = 'Try Flashlight Mode';
      var existingCta = nav.querySelector('.nav-cta');
      if (existingCta && existingCta.parentNode) {
        existingCta.parentNode.insertBefore(trigger, existingCta);
      } else {
        nav.appendChild(trigger);
      }
    });
  }

  /* ---- Nav trigger button(s): repurposes the existing "Mystery Button"
     CTA into a "Try Flashlight Mode" panel-opener. Same toggle as gear. ---- */
  function wireNavTriggers() {
    autoInjectNavTriggers();
    var triggers = document.querySelectorAll('[data-flashlight-trigger]');
    triggers.forEach(function (t) {
      if (t.dataset.ttWired === '1') return;
      t.dataset.ttWired = '1';
      // Replace plain text with icon + labeled span
      var label = (t.textContent || 'Try Flashlight Mode').trim();
      t.innerHTML = '<span class="tt-trigger-icon">' + ICONS.flashlight + '</span>'
                  + '<span class="tt-trigger-label">' + label + '</span>';
      t.setAttribute('aria-expanded', 'false');
      t.setAttribute('aria-haspopup', 'dialog');
      t.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        // Opening from the nav → anchor the panel under the nav
        var willOpen = !widget.classList.contains('open') || !widget.classList.contains('from-nav');
        widget.classList.toggle('from-nav', willOpen);
        widget.classList.toggle('open', willOpen);
        t.setAttribute('aria-expanded', widget.classList.contains('open') ? 'true' : 'false');
      });
    });
  }

  // Keep aria-expanded in sync if the panel is closed by clicking outside.
  var openObserver = new MutationObserver(function () {
    var isOpen = widget.classList.contains('open');
    document.querySelectorAll('[data-flashlight-trigger]').forEach(function (t) {
      t.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });
  openObserver.observe(widget, { attributes: true, attributeFilter: ['class'] });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireNavTriggers);
  } else {
    wireNavTriggers();
  }

  /* ---- Cursor-reactive glow: the Try Flashlight Mode trigger's amber
     halo strengthens as the pointer approaches and settles back as it
     leaves. Writes the --tt-prox custom property (0–1), which the CSS
     `filter: drop-shadow()` on the trigger reads. Pointer-driven, so it
     stays on even for reduced-motion users; the idle beam does not. ---- */
  (function () {
    var RADIUS = 150;            // px out from the button edge where glow begins
    var px = -99999, py = -99999, queued = false;

    function paint() {
      queued = false;
      var triggers = document.querySelectorAll('[data-flashlight-trigger]');
      for (var i = 0; i < triggers.length; i++) {
        var t = triggers[i], r = t.getBoundingClientRect();
        if (!r.width) { t.style.setProperty('--tt-prox', '0'); continue; }
        // distance from the pointer to the nearest point of the button rect
        var dx = Math.max(r.left - px, 0, px - r.right);
        var dy = Math.max(r.top - py, 0, py - r.bottom);
        var d = Math.sqrt(dx * dx + dy * dy);
        var p = Math.max(0, Math.min(1, 1 - d / RADIUS));
        // square it so the glow stays faint until the pointer is genuinely close
        t.style.setProperty('--tt-prox', (p * p).toFixed(3));
      }
    }
    function schedule() {
      if (!queued) { queued = true; requestAnimationFrame(paint); }
    }
    function onMove(e) {
      if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      px = e.clientX; py = e.clientY;
      schedule();
    }
    function reset() {
      px = py = -99999;
      document.querySelectorAll('[data-flashlight-trigger]').forEach(function (t) {
        t.style.setProperty('--tt-prox', '0');
      });
    }
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset);
    window.addEventListener('scroll', function () {
      if (px > -99999) schedule();
    }, { passive: true });
  })();

  /* ---- Keep Auto in sync with the OS appearance ----
     The matchMedia 'change' event is the primary signal, but it is NOT
     reliable on macOS when System Settings > Appearance is set to "Auto"
     (the scheduled day/night switch): Chrome in particular often fails to
     fire 'change' for that scheduled flip, so a tab left open across the
     switch never finds out the OS went dark. To cover that, we also
     re-check whenever the tab is re-shown, the window is refocused, the
     page is restored from the bfcache, and on a slow interval. */
  function syncAuto() {
    if (currentMode !== 'auto') return;
    var osWantsDark = mq.matches;
    var pageIsDark  = html.getAttribute('data-theme') === 'dark';
    if (osWantsDark !== pageIsDark) applyMode('auto');
  }
  if (mq.addEventListener)  mq.addEventListener('change', syncAuto);
  else if (mq.addListener)  mq.addListener(syncAuto);             // legacy Safari
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') syncAuto();
  });
  window.addEventListener('focus', syncAuto);                     // window refocus
  window.addEventListener('pageshow', syncAuto);                  // bfcache restore
  setInterval(syncAuto, 60000);                                   // safety net for a tab left open across the OS switch

  /* ---- Matrix rain canvas animation ---- */
  var rainIntervalId = null, rainResizeBound = null, rainCtx = null;
  var rainDrops = null, rainFontSize = 16;
  var RAIN_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$&%#@*+=<>/';

  function sizeMatrixCanvas() {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    var cols = Math.floor(matrixCanvas.width / rainFontSize);
    rainDrops = new Array(cols).fill(0).map(function () {
      return Math.floor(Math.random() * (matrixCanvas.height / rainFontSize));
    });
  }

  function startMatrixRain() {
    if (rainIntervalId) return;
    sizeMatrixCanvas();
    rainCtx = matrixCanvas.getContext('2d');
    rainResizeBound = function () { sizeMatrixCanvas(); };
    window.addEventListener('resize', rainResizeBound);

    rainIntervalId = setInterval(function () {
      // Fade previous frame for trailing effect
      rainCtx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      rainCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
      rainCtx.font = rainFontSize + 'px monospace';
      for (var i = 0; i < rainDrops.length; i++) {
        var ch = RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)];
        var x = i * rainFontSize;
        var y = rainDrops[i] * rainFontSize;
        // Brighter "head" character
        rainCtx.fillStyle = '#b8ffd0';
        rainCtx.fillText(ch, x, y);
        // Trail
        rainCtx.fillStyle = '#00ff66';
        if (y > rainFontSize) rainCtx.fillText(ch, x, y - rainFontSize);

        if (y > matrixCanvas.height && Math.random() > 0.975) rainDrops[i] = 0;
        rainDrops[i]++;
      }
    }, 55);
  }

  function stopMatrixRain() {
    if (rainIntervalId) { clearInterval(rainIntervalId); rainIntervalId = null; }
    if (rainResizeBound) { window.removeEventListener('resize', rainResizeBound); rainResizeBound = null; }
    if (rainCtx) {
      rainCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
      rainCtx = null;
    }
  }

  /* Init — restore from sessionStorage if present, else defaults. */
  var savedBeam = parseInt(storeGet('tt-beam') || '', 10);
  if (savedBeam && savedBeam >= 250 && savedBeam <= 600) {
    beamRadius = savedBeam;
    var slider = widget.querySelector('.tt-slider');
    if (slider) slider.value = String(savedBeam);
  }
  setBeam(beamRadius);

  var savedLast = storeGet('tt-last-non-effect');
  if (savedLast && !isEffectMode(savedLast)) lastNonEffectMode = savedLast;

  var savedMode = storeGet('tt-mode');
  var VALID = { auto:1, light:1, dark:1, matrix:1, flashlight:1 };
  applyMode(savedMode && VALID[savedMode] ? savedMode : 'auto');
})();
