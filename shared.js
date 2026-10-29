// CausalAlpha Shared JS: nav, data loading, chart utils

// --- ESCAPING ---
// Every data field interpolated into innerHTML goes through esc(). Data files
// (CSV/JSON/Markdown) include LLM-written text, so they are untrusted.
function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Visible, announced failure for any data load (never a silent catch).
function loadError(el, what, err) {
  if (!el) return;
  el.innerHTML = '<div class="callout fail load-error" role="alert"><strong>' + esc(what) + ' unavailable</strong>' +
    '<p>Could not load ' + esc(what) + ' (' + esc(err && err.message || err) + '). Nothing is shown rather than stale data.</p></div>';
}

// --- NAV ---
const NAV_PAGES = [
  { id: 'overview',   label: 'Overview',   href: 'index.html' },
  { id: 'backtest',   label: 'Backtest',   href: 'backtest.html' },
  { id: 'live',       label: 'Live',       href: 'live.html' },
  { id: 'herd',       label: 'AI Herd',    href: 'herd.html' },
  { id: 'simulator',  label: 'Simulator',  href: 'simulator.html' },
  { id: 'research',   label: 'Research',   href: 'research.html' },
  { id: 'status',     label: 'Status',     href: 'status.html' },
  { id: 'news',       label: 'Updates',    href: 'news.html' },
];

function renderNav(activePage) {
  const links = NAV_PAGES.map(p =>
    `<a href="${p.href}" class="${p.id === activePage ? 'active' : ''}">${p.label}</a>`
  ).join('');
  const html = `<header id="site-header"><div class="container">
    <a class="wordmark" href="index.html">CausalAlpha</a>
    <nav class="site-nav">${links}</nav>
  </div></header>`;
  document.body.insertAdjacentHTML('afterbegin', html);
}

// --- DATA LOADING ---
async function parseCSV(path) {
  return new Promise((resolve, reject) => {
    Papa.parse(path, {
      download: true, header: true, skipEmptyLines: true,
      complete: r => resolve(r.data),
      error: reject
    });
  });
}

async function loadJSON(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`Failed to load ${path}: ${r.status}`);
  return r.json();
}

async function loadMarkdown(path) {
  const r = await fetch(path);
  if (!r.ok) return null;
  return r.text();
}

// --- HEADLINE (single source: headline.json, built by gen_headline.py) ---
const HEADLINE_URL = 'headline.json';

async function loadHeadline() {
  const h = await loadJSON(HEADLINE_URL);
  const need = ['period', 'strategy', 'bh', 'matched_mix', 'approaches', 'dsr', 'spa_p', 'edge'];
  const missing = need.filter(k => h[k] == null);
  if (missing.length) throw new Error('headline.json missing ' + missing.join(', '));
  if (!Array.isArray(h.approaches) || !h.approaches.length) throw new Error('headline.json has no approaches');
  return h;
}

// Signed number with a true minus sign (U+2212).
function fmtSigned(v, d = 1, suffix = '') {
  const n = Number(v);
  if (!isFinite(n)) return 'n/a';
  return (n < 0 ? '−' : '') + Math.abs(n).toFixed(d) + suffix;
}

function fmtMonthYear(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}
function fmtDayMonthYear(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function headlineBasis(h) {
  return h.basis + ' · ' + fmtMonthYear(h.period.start) + ' to ' + fmtDayMonthYear(h.period.end);
}

// Plain-English verdict, derived from the numbers rather than asserted.
function headlineVerdict(h) {
  const best = h.approaches.reduce((a, b) => (b.sharpe > a.sharpe ? b : a));
  if (!h.edge && best.sharpe < h.bh.sharpe) {
    return 'No timing rule, causal-discovery filter or reinforcement-learning agent beat buy-and-hold after costs.';
  }
  return 'At least one approach passed the pre-registered test; see the statistics below.';
}

function headlineEvidence(h) {
  const mixSmaller = h.matched_mix.maxdd > h.strategy.maxdd;
  return 'VIX_GATE was invested ' + h.strategy.exposure + '% of the time' +
    (mixSmaller ? ', and a fixed ' + h.matched_mix.exposure + '% index mix had a smaller worst fall (' +
      fmtSigned(h.matched_mix.maxdd, 1, '%') + ' against ' + fmtSigned(h.strategy.maxdd, 1, '%') +
      '), so its smaller drawdowns came from holding less, not from timing. ' : '. ') +
    'Deflated Sharpe ratio ' + fmtSigned(h.dsr, 2) + ' after ' + h.dsr_trials.toLocaleString('en-GB') +
    ' strategy variants; Hansen’s SPA test p = ' + fmtSigned(h.spa_p, 2) + '. ' +
    (h.edge ? '' : 'There is no statistical evidence of an edge.');
}

// One-line summary above the approaches table (kept under its old name: pages call it).
function headlineRegimes(h) {
  const beat = h.approaches.filter(a => a.sharpe > h.bh.sharpe).length;
  return h.approaches.length + ' approaches on the same sectors, data, timing and costs; ' +
    (beat === 0 ? 'none' : beat) + ' beat buy-and-hold. Causal links that survived a rank-based test: ' +
    h.pcmci_links_robust + ' of ' + h.pcmci_links_parcorr + '.';
}

// [{label, value, sub, cls}] for the three headline numbers.
function headlineCells(h) {
  return [
    { label: 'Sharpe ratio, above cash', value: fmtSigned(h.strategy.sharpe, 2),
      sub: 'Buy and hold: ' + fmtSigned(h.bh.sharpe, 2), cls: h.strategy.sharpe < h.bh.sharpe ? 'red' : 'green' },
    { label: 'Worst fall', value: fmtSigned(h.strategy.maxdd, 1, '%'),
      sub: 'Buy and hold: ' + fmtSigned(h.bh.maxdd, 1, '%'), cls: 'amber' },
    { label: 'Time invested', value: h.strategy.exposure + '%',
      sub: 'Buy and hold: ' + h.bh.exposure + '%', cls: 'amber' },
  ];
}

// Approaches table (kept under its old name: pages call it). Buy-and-hold first.
function headlineRegimeTable(h) {
  const row = (label, s, isBench) =>
    '<tr' + (isBench ? ' class="bench"' : '') + '><td>' + esc(label) + '</td>' +
    '<td class="' + (isBench ? '' : (s.sharpe > h.bh.sharpe ? 'pos' : 'neg')) + '">' + fmtSigned(s.sharpe, 2) + '</td>' +
    '<td>' + fmtSigned(s.maxdd, 1, '%') + '</td><td>' + s.exposure + '%</td></tr>';
  const rows = row('Buy and hold', h.bh, true) + h.approaches.map(a => row(a.label, a, false)).join('');
  return '<table class="data-table regime-table"><thead><tr><th>Approach</th>' +
    '<th>Sharpe ratio, above cash</th><th>Worst fall</th><th>Time invested</th></tr></thead><tbody>' + rows + '</tbody></table>';
}

// Visible failure instead of silently showing stale or invented numbers.
function headlineError(el, err) {
  if (!el) return;
  el.innerHTML = '<div class="callout fail headline-error" role="alert"><strong>Headline figures unavailable</strong>' +
    '<p>Could not load headline.json (' + esc(err && err.message || err) + '). No figures are shown rather than outdated ones.</p></div>';
}

// --- LIVE REGIME BADGE (data/live/latest_signal.json: {date, regime, vix_signal, summary}) ---
async function loadLatestSignal() {
  const s = await loadJSON('data/live/latest_signal.json');
  if (!s || !s.date || !s.regime) throw new Error('latest_signal.json missing date or regime');
  return s;
}

// --- MATH UTILS ---
function dailyReturns(navArr) {
  const ret = [];
  for (let i = 1; i < navArr.length; i++) {
    ret.push((navArr[i] - navArr[i-1]) / navArr[i-1]);
  }
  return ret;
}

// annFactor: periods per year. Daily returns -> 252, weekly -> 52. No default:
// a wrong default silently mis-annualised daily data by sqrt(52/252).
function calcSharpe(returns, annFactor) {
  if (!annFactor) throw new Error('calcSharpe: annFactor required (252 daily, 52 weekly)');
  if (returns.length < 2) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / (returns.length - 1);
  const std = Math.sqrt(variance);
  if (std === 0) return 0;
  return (mean / std) * Math.sqrt(annFactor);
}

function calcMaxDD(navArr) {
  let peak = navArr[0], maxDD = 0;
  for (const v of navArr) {
    if (v > peak) peak = v;
    const dd = (v - peak) / peak;
    if (dd < maxDD) maxDD = dd;
  }
  return maxDD;
}

function calcCAGR(navArr, years) {
  if (!years || years <= 0 || navArr.length < 2) return 0;
  return Math.pow(navArr[navArr.length - 1] / navArr[0], 1 / years) - 1;
}

function normalizeTo1(arr) {
  const base = arr[0];
  return arr.map(v => v / base);
}

function calcYears(dates) {
  if (!dates || dates.length < 2) return 1;
  const a = new Date(dates[0]), b = new Date(dates[dates.length - 1]);
  return (b - a) / (365.25 * 24 * 3600 * 1000);
}

// --- FORMATTERS ---
function fmtPct(v, d = 1) {
  if (v == null || isNaN(v)) return 'n/a';
  return (v * 100).toFixed(d) + '%';
}

function fmtPctRaw(v, d = 1) {
  if (v == null || isNaN(v)) return 'n/a';
  const pct = parseFloat(v) * 100;
  return (pct >= 0 ? '+' : '') + pct.toFixed(d) + '%';
}

function fmtSharpe(v) {
  if (v == null || isNaN(v)) return 'n/a';
  return parseFloat(v).toFixed(2);
}

function fmtNum(v, d = 2) {
  if (v == null || isNaN(v)) return 'n/a';
  return parseFloat(v).toFixed(d);
}

function fmtDate(d) {
  if (!d) return 'n/a';
  return String(d).slice(0, 10);
}

function fmtINR(lakhs) {
  return '₹' + lakhs + 'L';
}

// --- CHART.JS DEFAULTS ---
function chartDefaults() {
  return {
    responsive: true,
    maintainAspectRatio: true,
    animation: { duration: 400 },
    plugins: {
      legend: {
        labels: {
          font: { family: "'IBM Plex Mono', monospace", size: 10 },
          color: '#6B6760',
          boxWidth: 12,
          padding: 16,
        }
      },
      tooltip: {
        backgroundColor: '#0D0D0B',
        titleFont: { family: "'IBM Plex Mono', monospace", size: 10 },
        bodyFont: { family: "'IBM Plex Mono', monospace", size: 10 },
        padding: 10,
        cornerRadius: 2,
      }
    },
    scales: {
      x: {
        grid: { color: '#C8C4BC', lineWidth: 0.5 },
        ticks: { font: { family: "'IBM Plex Mono', monospace", size: 9 }, color: '#6B6760', maxRotation: 0, maxTicksLimit: 8 },
        border: { color: '#C8C4BC' }
      },
      y: {
        grid: { color: '#C8C4BC', lineWidth: 0.5 },
        ticks: { font: { family: "'IBM Plex Mono', monospace", size: 9 }, color: '#6B6760' },
        border: { color: '#C8C4BC' }
      }
    }
  };
}

function buildLineChart(canvasId, labels, datasets) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  const defaults = chartDefaults();
  return new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      ...defaults,
      elements: { point: { radius: 0, hitRadius: 8 }, line: { tension: 0.2 } },
    }
  });
}

function buildBarChart(canvasId, labels, values, colors) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  const defaults = chartDefaults();
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: colors || '#B8760A', borderWidth: 0 }]
    },
    options: { ...defaults, plugins: { ...defaults.plugins, legend: { display: false } } }
  });
}

function buildHBarChart(canvasId, labels, values, colors) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  const defaults = chartDefaults();
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: colors || '#B8760A', borderWidth: 0 }]
    },
    options: {
      ...defaults,
      indexAxis: 'y',
      plugins: { ...defaults.plugins, legend: { display: false } }
    }
  });
}

function lineDataset(label, data, color, opts = {}) {
  return {
    label, data,
    borderColor: color,
    backgroundColor: color + '15',
    borderWidth: opts.width || 1.5,
    fill: opts.fill || false,
    pointRadius: 0,
    tension: 0.15,
    ...opts
  };
}

// --- TABS ---
function initTabs(containerSelector) {
  const container = document.querySelector(containerSelector) || document;
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = container.querySelector(`.tab-panel[data-tab="${tab}"]`);
      if (panel) panel.classList.add('active');
    });
  });
}

// --- SORTABLE TABLE ---
function initSortableTable(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;
  let sortCol = null, sortDir = 1;
  table.querySelectorAll('th[data-sort]').forEach(th => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (sortCol === col) sortDir *= -1; else { sortCol = col; sortDir = 1; }
      table.querySelectorAll('th').forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
      th.classList.add(sortDir === 1 ? 'sort-asc' : 'sort-desc');
      const tbody = table.querySelector('tbody');
      const rows = Array.from(tbody.querySelectorAll('tr'));
      rows.sort((a, b) => {
        const av = a.querySelector(`td[data-col="${col}"]`)?.dataset.val ?? '';
        const bv = b.querySelector(`td[data-col="${col}"]`)?.dataset.val ?? '';
        const an = parseFloat(av), bn = parseFloat(bv);
        if (!isNaN(an) && !isNaN(bn)) return (an - bn) * sortDir;
        return av.localeCompare(bv) * sortDir;
      });
      rows.forEach(r => tbody.appendChild(r));
    });
  });
}

// --- SCROLL REVEALS ---
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// --- MARKDOWN RENDERER (simple) ---
// The source is escaped first, so any HTML in the report renders as text;
// the formatting regexes below then only ever emit their own tags.
function renderMarkdown(md) {
  return esc(md)
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^\| .+ \|$/gm, match => {
      if (match.includes('---')) return '';
      const cells = match.split('|').map(c => c.trim()).filter(Boolean);
      return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
    })
    .replace(/(<tr>.*<\/tr>\s*)+/gs, match => `<table class="data-table"><tbody>${match}</tbody></table>`)
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\s*)+/gs, match => `<ul>${match}</ul>`)
    .replace(/^(?!<[htu]|<li|<\/|<ta).+$/gm, match => match.trim() ? `<p>${match}</p>` : '')
    .replace(/\n{2,}/g, '');
}

// Straddle failed out-of-sample and is frozen: say so wherever a report names it.
function markFrozenStraddle(html) {
  return html.replace(/Straddle (sub-account|Gates)/g,
    'Straddle $1 <span class="badge fail frozen-tag">frozen, failed out-of-sample</span>');
}

// Horizontally scrollable table wrappers must be reachable by keyboard (WCAG 2.1.1).
function initScrollRegions() {
  document.querySelectorAll('.table-wrap').forEach(el => {
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    if (!el.hasAttribute('role')) el.setAttribute('role', 'region');
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', 'Scrollable table');
  });
}

document.addEventListener('DOMContentLoaded', initReveal);
document.addEventListener('DOMContentLoaded', initScrollRegions);
