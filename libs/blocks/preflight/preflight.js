import { html, render, signal } from '../../deps/htm-preact.js';
import { setModalSuppression } from '../../utils/preflight-notification.js';
import General, { localizationIssues } from './panels/general.js';
import SEO from './panels/seo.js';
import Accessibility from './accessibility/accessibility.js';
import Martech from './panels/martech.js';
import Merch from './panels/merch.js';
import Performance from './panels/performance.js';
import Assets from './panels/assets.js';
import { getPreflightResults } from './checks/preflightApi.js';

const HEADING = 'Milo Preflight';

const TAB_ICONS = {
  General: '<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' width=\'20\' height=\'20\' fill=\'currentColor\'><path d=\'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-13h2v6h-2zm0 8h2v2h-2z\'/></svg>',
  SEO: '<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' width=\'20\' height=\'20\' fill=\'currentColor\'><path d=\'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z\'/></svg>',
  Martech: '<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' width=\'20\' height=\'20\' fill=\'currentColor\'><path d=\'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z\'/></svg>',
  'M@S': '<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' width=\'20\' height=\'20\' fill=\'currentColor\'><path d=\'M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.8 13h8.4l1.5-5H5.2L4.3 4H1v2h2l3.6 7.6L5.2 16c-.1.2-.2.4-.2.6C5 17.4 5.6 18 6.3 18H19v-2H6.7l1.1-3z\'/></svg>',
  Accessibility: '<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' width=\'20\' height=\'20\' fill=\'currentColor\'><path d=\'M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 6c1.1 0 2 .9 2 2v1.07A5 5 0 0 1 17 16h-2a3 3 0 0 0-6 0H7a5 5 0 0 1 3-4.93V10a2 2 0 0 0-2-2H7a2 2 0 0 1 0-4h10a2 2 0 0 1 0 4h-1a2 2 0 0 0-2 2v.07z\'/></svg>',
  Performance: '<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' width=\'20\' height=\'20\' fill=\'currentColor\'><path d=\'M13 2.05V4.1c3.95.49 7 3.85 7 7.9 0 3.21-1.81 6-4.72 7.28L13 17v5l5-3.18C21.3 16.87 23 14.1 23 11c0-5.46-4.01-9.97-10-10zm-2-.04C5.01 2.54 1 7.05 1 12.01 1 15.1 2.69 17.88 5 19.81L8 17v-4H4.28L6 11H4l-1.27-4.92C4.5 3.9 7.5 2.54 11 2V1.96z\'/></svg>',
  Assets: '<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' width=\'20\' height=\'20\' fill=\'currentColor\'><path d=\'M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z\'/></svg>',
};

const tabs = signal([
  { title: 'General', selected: true },
  { title: 'SEO' },
  { title: 'Martech' },
  { title: 'M@S' },
  { title: 'Accessibility' },
  { title: 'Performance' },
  { title: 'Assets' },
]);

const badgeCounts = signal({});

function setTab(active) {
  tabs.value = tabs.value.map((tab) => {
    const selected = tab.title === active.title;
    return { ...tab, selected };
  });
}

function setPanel(title) {
  switch (title) {
    case 'General':
      return html`<${General} />`;
    case 'SEO':
      return html`<${SEO} />`;
    case 'Martech':
      return html`<${Martech} />`;
    case 'M@S':
      return html`<${Merch} />`;
    case 'Accessibility':
      return html`<${Accessibility} />`;
    case 'Performance':
      return html`<${Performance} />`;
    case 'Assets':
      return html`<${Assets} />`;
    default:
      return html`<p>No matching panel.</p>`;
  }
}

function getPanelHeader(title) {
  const labels = {
    General: 'General',
    SEO: 'SEO',
    Martech: 'Martech',
    'M@S': 'Merch @ Scale',
    Accessibility: 'Accessibility',
    Performance: 'Performance',
    Assets: 'Assets',
  };
  return labels[title] || title;
}

function Badge({ count, type }) {
  if (!count) return null;
  return html`<span class="preflight-tab-badge preflight-tab-badge-${type}">${count}</span>`;
}

function NavRailButton({ tab, idx }) {
  const id = `tab-${idx + 1}`;
  const selected = tab.selected === true;
  const counts = badgeCounts.value[tab.title] || {};
  const icon = TAB_ICONS[tab.title] || '';

  return html`
    <button
      id=${id}
      class="preflight-nav-button${selected ? ' is-selected' : ''}"
      aria-selected=${selected}
      onClick=${() => setTab(tab)}>
      <span class="preflight-nav-icon" dangerouslySetInnerHTML=${{ __html: icon }}></span>
      <span class="preflight-nav-label">${tab.title}</span>
      ${counts.errors > 0 && html`<${Badge} count=${counts.errors} type="error" />`}
      ${counts.warnings > 0 && html`<${Badge} count=${counts.warnings} type="warning" />`}
    </button>`;
}

function TabPanel({ tab, idx }) {
  const id = `panel-${idx + 1}`;
  const labeledBy = `tab-${idx + 1}`;
  const selected = tab.selected === true;

  return html`
    <div
      id=${id}
      class=preflight-tab-panel
      aria-labelledby=${labeledBy}
      key=${tab.title}
      aria-selected=${selected}
      role="tabpanel">
      ${selected && html`
        <div class="preflight-panel-header">
          <h2 class="preflight-panel-title">${getPanelHeader(tab.title)}</h2>
        </div>
      `}
      ${setPanel(tab.title)}
    </div>`;
}

function Preflight() {
  return html`
    <nav class="preflight-nav-rail" role="tablist" aria-labelledby="preflight-title">
      <p id="preflight-title" class="preflight-nav-heading">${HEADING}</p>
      ${tabs.value.map((tab, idx) => html`<${NavRailButton} tab=${tab} idx=${idx} />`)}
    </nav>
    <div class="preflight-content">
      ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
    </div>
  `;
}

async function loadBadgeCounts() {
  try {
    const results = await getPreflightResults({
      url: window.location.pathname,
      area: document,
      useCache: true,
      injectVisualMetadata: false,
    });
    if (!results) return;

    const { runChecks } = results;
    const counts = {};

    const countChecks = (checks, tabTitle) => {
      if (!checks || !Array.isArray(checks)) return;
      let errors = 0;
      let warnings = 0;
      checks.forEach((c) => {
        if (c?.status === 'fail') {
          if (c?.severity === 'critical') errors += 1;
          else warnings += 1;
        } else if (c?.status === 'limbo') {
          warnings += 1;
        }
      });
      counts[tabTitle] = { errors, warnings };
    };

    countChecks(runChecks.seo, 'SEO');
    countChecks(runChecks.performance, 'Performance');
    countChecks(runChecks.assets, 'Assets');
    countChecks(runChecks.merch, 'M@S');
    countChecks(runChecks.accessibility, 'Accessibility');
    countChecks(runChecks.structure, 'General');

    // Also count localization issues into General badge
    const locIssues = localizationIssues.value.length;
    if (locIssues > 0) {
      counts.General = counts.General || { errors: 0, warnings: 0 };
      counts.General.errors += locIssues;
    }

    badgeCounts.value = counts;
  } catch {
    // badge counts are best-effort
  }
}

export default async function init(el) {
  setModalSuppression(true);

  render(html`<${Preflight} />`, el);

  const dialogEl = el.closest('dialog') || el.closest('.dialog-modal');
  if (dialogEl) {
    const onClose = () => {
      setModalSuppression(false);
      dialogEl.removeEventListener('close', onClose);
    };
    dialogEl.addEventListener('close', onClose);
  }

  loadBadgeCounts();
}
