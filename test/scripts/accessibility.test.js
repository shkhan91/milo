import sinon from 'sinon';
import { expect } from '@esm-bundle/chai';

function buildPlayBtn() {
  const link = document.createElement('div');
  link.className = 'modal-img-link';
  const btn = document.createElement('a');
  btn.className = 'consonant-play-btn';
  link.appendChild(btn);
  document.body.appendChild(link);
  return { link, btn };
}

describe('scrollTabFocusedElIntoView', () => {
  let scrollSpy;

  before(async () => {
    const { default: init } = await import('../../libs/scripts/accessibility.js');
    init();
  });

  beforeEach(() => {
    document.body.innerHTML = '';
    scrollSpy = sinon.stub(Element.prototype, 'scrollIntoView');
  });

  afterEach(() => {
    sinon.restore();
  });

  // Tab keydown sets isTab=true; focusin must fire before the queued setTimeout
  async function tabThenFocus(btn) {
    // Dispatch on body so e.target is an Element (has .closest); bubbles to document
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    btn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await new Promise((resolve) => { setTimeout(resolve, 0); });
  }

  it('scrolls play button into view when its rect is below the viewport fold', async () => {
    const { btn } = buildPlayBtn();
    const h = window.innerHeight;
    sinon.stub(btn, 'getBoundingClientRect').returns({
      top: h + 50, bottom: h + 122, left: 50, right: 122, width: 72, height: 72,
    });

    await tabThenFocus(btn);

    expect(scrollSpy.calledOnce).to.be.true;
    expect(scrollSpy.getCall(0).args[0]).to.deep.equal({ behavior: 'instant', block: 'center' });
  });

  it('scrolls play button into view when its rect is above the viewport top', async () => {
    const { btn } = buildPlayBtn();
    sinon.stub(btn, 'getBoundingClientRect').returns({
      top: -80, bottom: -8, left: 50, right: 122, width: 72, height: 72,
    });

    await tabThenFocus(btn);

    expect(scrollSpy.calledOnce).to.be.true;
    expect(scrollSpy.getCall(0).args[0]).to.deep.equal({ behavior: 'instant', block: 'center' });
  });

  it('scrolls play button into view when it has zero dimensions (not yet painted)', async () => {
    const { btn } = buildPlayBtn();
    sinon.stub(btn, 'getBoundingClientRect').returns({
      top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0,
    });

    await tabThenFocus(btn);

    expect(scrollSpy.calledOnce).to.be.true;
    expect(scrollSpy.getCall(0).args[0]).to.deep.equal({ behavior: 'instant', block: 'center' });
  });

  it('scrolls play button when btn rect appears in-viewport but ancestor modal-img-link is below fold', async () => {
    const { link, btn } = buildPlayBtn();
    const h = window.innerHeight;
    sinon.stub(btn, 'getBoundingClientRect').returns({
      top: 300, bottom: 372, left: 50, right: 122, width: 72, height: 72,
    });
    sinon.stub(link, 'getBoundingClientRect').returns({
      top: h + 100, bottom: h + 400, left: 0, right: 300, width: 300, height: 300,
    });

    await tabThenFocus(btn);

    expect(scrollSpy.calledOnce).to.be.true;
    expect(scrollSpy.getCall(0).args[0]).to.deep.equal({ behavior: 'instant', block: 'center' });
  });

  it('does not force-scroll play button when both btn and ancestor are fully within viewport', async () => {
    const { link, btn } = buildPlayBtn();
    const h = window.innerHeight;
    sinon.stub(btn, 'getBoundingClientRect').returns({
      top: 200, bottom: 272, left: 50, right: 122, width: 72, height: 72,
    });
    sinon.stub(link, 'getBoundingClientRect').returns({
      top: 100, bottom: Math.min(500, h - 10), left: 0, right: 300, width: 300, height: 400,
    });
    sinon.stub(document, 'elementFromPoint').returns(btn);

    await tabThenFocus(btn);

    expect(scrollSpy.called).to.be.false;
  });
});
