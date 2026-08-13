import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { html, render } from '../../../../libs/deps/htm-preact.js';
import Assets, { showBackToPreflight } from '../../../../libs/blocks/preflight/panels/assets.js';

describe('Preflight Assets Panel', () => {
  let container;
  let originalWindowProps = {};

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    originalWindowProps = {
      runChecksFromAssets: window.runChecksFromAssets,
      isViewportTooSmallFromAssets: window.isViewportTooSmallFromAssets,
    };
    window.runChecksFromAssets = sinon.stub();
    window.isViewportTooSmallFromAssets = sinon.stub().returns(false);
    window.mockImport = true;
  });

  afterEach(() => {
    document.body.removeChild(container);
    window.runChecksFromAssets = originalWindowProps.runChecksFromAssets;
    window.isViewportTooSmallFromAssets = originalWindowProps.isViewportTooSmallFromAssets;
    window.mockImport = false;
    sinon.restore();
  });

  it('displays loading state when check is running', () => {
    const pendingCheck = new Promise(() => {}); // Never resolves, simulates loading
    window.runChecksFromAssets.returns([pendingCheck]);

    render(html`<${Assets} />`, container);

    expect(container.querySelector('.assets-item-title').textContent).to.equal('Asset Dimensions');
    expect(container.querySelector('.assets-item-description').textContent).to.equal('Checking...');
  });

  it('shows warning message when viewport is too small', () => {
    window.isViewportTooSmallFromAssets.returns(true);
    render(html`<${Assets} />`, container);

    const tooSmallMessage = container.querySelector('.assets-image-grid-item.full-width');
    expect(tooSmallMessage).to.exist;
    expect(tooSmallMessage.textContent).to.include('Please resize your browser');
  });

  it('renders asset check items when viewport is appropriate', () => {
    window.isViewportTooSmallFromAssets.returns(false);
    const pendingCheck = new Promise(() => {});
    window.runChecksFromAssets.returns([pendingCheck]);
    render(html`<${Assets} />`, container);

    expect(container.querySelector('.assets-columns')).to.exist;
    expect(container.querySelector('.assets-item')).to.exist;
    expect(container.querySelector('.assets-item-title')).to.exist;
    expect(container.querySelector('.assets-item-description')).to.exist;
  });
});

describe('showBackToPreflight', () => {
  afterEach(() => {
    document.getElementById('preflight-back-popover')?.remove();
  });

  it('creates a pinned "Back to Preflight" button in the document body', () => {
    showBackToPreflight();
    const btn = document.getElementById('preflight-back-popover');
    expect(btn).to.exist;
    expect(btn.tagName).to.equal('BUTTON');
    expect(btn.textContent).to.equal('Back to Preflight');
    expect(btn.getAttribute('aria-label')).to.equal('Back to Preflight');
    expect(document.body.contains(btn)).to.be.true;
  });

  it('does not create a duplicate button if one already exists', () => {
    showBackToPreflight();
    showBackToPreflight();
    const all = document.querySelectorAll('#preflight-back-popover');
    expect(all.length).to.equal(1);
  });

  it('removes the button when clicked', () => {
    showBackToPreflight();
    const btn = document.getElementById('preflight-back-popover');
    btn.click();
    expect(document.getElementById('preflight-back-popover')).to.be.null;
  });

  it('dispatches custom:preflight event on a present sidekick element when clicked', () => {
    const sidekick = document.createElement('aem-sidekick');
    document.body.appendChild(sidekick);
    let fired = false;
    sidekick.addEventListener('custom:preflight', () => { fired = true; });

    showBackToPreflight();
    document.getElementById('preflight-back-popover').click();

    expect(fired).to.be.true;
    sidekick.remove();
  });
});
