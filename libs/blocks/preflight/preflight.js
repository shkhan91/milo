import { html, render, signal, useEffect } from '../../deps/htm-preact.js';
import { suppressForPreflight, unsuppressForPreflight } from '../../utils/preflight-notification.js';
import General from './panels/general.js';
import SEO from './panels/seo.js';
import Accessibility from './accessibility/accessibility.js';
import Martech from './panels/martech.js';
import Merch from './panels/merch.js';
import Performance from './panels/performance.js';
import Assets from './panels/assets.js';

const HEADING = 'Milo Preflight';

const TAB_ICONS = {
  General: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  SEO: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  Martech: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  'M@S': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  Accessibility: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>',
  Performance: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  Assets: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
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

const tabBadges = signal({});

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

function NavItem(props) {
  const id = `tab-${props.idx + 1}`;
  const selected = props.tab.selected === true;
  const badge = tabBadges.value[props.tab.title];

  return html`
    <button
      id=${id}
      class="preflight-nav-item${selected ? ' is-selected' : ''}"
      aria-selected=${selected}
      onClick=${() => setTab(props.tab)}>
      <span class="preflight-nav-icon" dangerouslySetInnerHTML=${{ __html: TAB_ICONS[props.tab.title] || '' }}></span>
      <span class="preflight-nav-label">${props.tab.title}</span>
      ${badge?.errors > 0 && html`<span class="preflight-nav-badge preflight-nav-badge-error">${badge.errors}</span>`}
      ${!badge?.errors && badge?.warnings > 0 && html`<span class="preflight-nav-badge preflight-nav-badge-warning">${badge.warnings}</span>`}
    </button>`;
}

function TabPanel(props) {
  const id = `panel-${props.idx + 1}`;
  const labeledBy = `tab-${props.idx + 1}`;
  const selected = props.tab.selected === true;

  return html`
    <div
      id=${id}
      class=preflight-tab-panel
      aria-labelledby=${labeledBy}
      key=${props.tab.title}
      aria-selected=${selected}
      role="tabpanel">
      <p class="preflight-section-header">${props.tab.title}</p>
      ${setPanel(props.tab.title)}
    </div>`;
}

function Preflight() {
  useEffect(() => {
    suppressForPreflight();

    const handleBadgeUpdate = (e) => {
      const { tab, errors = 0, warnings = 0 } = e.detail;
      tabBadges.value = {
        ...tabBadges.value,
        [tab]: { errors, warnings },
      };
    };
    window.addEventListener('preflight:badge-update', handleBadgeUpdate);

    return () => {
      unsuppressForPreflight();
      window.removeEventListener('preflight:badge-update', handleBadgeUpdate);
    };
  }, []);

  return html`
    <div class=preflight-heading>
      <p id=preflight-title>${HEADING}</p>
    </div>
    <div class=preflight-body>
      <nav class="preflight-nav-rail" role="tablist" aria-labelledby=preflight-title>
        ${tabs.value.map((tab, idx) => html`<${NavItem} tab=${tab} idx=${idx} />`)}
      </nav>
      <div class=preflight-content>
        ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
      </div>
    </div>
  `;
}

export default async function init(el) {
  render(html`<${Preflight} />`, el);
}
