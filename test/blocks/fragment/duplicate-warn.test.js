/**
 * Unit tests for the duplicate fragment path warning introduced in fragment.js.
 *
 * The module-scoped `loadedFragmentPaths` Set must be reset between test cases;
 * we achieve this by re-importing the module after calling
 * `window.__resetFragmentPaths()` — a test-only escape hatch injected below —
 * or, more portably, by reloading the module via dynamic import with a cache-
 * busting query string so each `describe` block gets a fresh module instance.
 *
 * Because the Web Test Runner (WTR / @web/test-runner) does not support
 * jest.resetModules(), we instead isolate each scenario by importing the
 * module once per `it` block with a unique `?test=<n>` query parameter,
 * which forces the browser module registry to treat each import as a new
 * module instance — giving us a fresh `loadedFragmentPaths` Set every time.
 */
import { expect } from '@esm-bundle/chai';
import { stub, spy } from 'sinon';
import { setConfig } from '../../../libs/utils/utils.js';

// Minimal config so fragment.js can call getConfig() without throwing.
const locales = { '': { ietf: 'en-US', tk: 'hah7vzn.css' } };
setConfig({
  codeRoot: '/libs',
  contentRoot: window.location.origin,
  locales,
  env: { name: 'stage' },
});

// Shared counter so every dynamic import gets a unique URL → fresh module.
let importCounter = 0;

/**
 * Returns a fresh instance of the fragment module (new module scope, new Set).
 * The `?test=N` query string is stripped by the dev server but forces the
 * browser to treat each URL as a distinct module entry.
 */
const freshFragment = () => {
  importCounter += 1;
  return import(`../../../libs/blocks/fragment/fragment.js?test=${importCounter}`);
};

/**
 * Build a minimal <a> element whose href resolves to the given path.
 * localizeLinkAsync is a no-op for same-origin hrefs with no locale prefix,
 * so the resolved `relHref` inside init() will equal the pathname we pass.
 */
const makeAnchor = (path) => {
  const a = document.createElement('a');
  a.href = `${window.location.origin}${path}`;
  // Attach to body so document.body.contains(a) is true (avoids fragMap side-effects).
  document.body.appendChild(a);
  return a;
};

// Stub fetch globally so fragment.js never makes real network requests.
const fetchStub = stub(window, 'fetch').resolves(
  new Response('<div><div><h1>ok</h1></div></div>', {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  }),
);

describe('Duplicate fragment path warning', () => {
  let warnSpy;

  beforeEach(() => {
    warnSpy = spy(console, 'warn');
  });

  afterEach(() => {
    warnSpy.restore();
    // Clean up any anchors we appended.
    document.querySelectorAll('a[data-dup-test]').forEach((el) => el.remove());
  });

  after(() => {
    fetchStub.restore();
  });

  it('produces no warning when a single unique path is loaded', async () => {
    const { default: init } = await freshFragment();
    const a = makeAnchor('/fragments/unique-path-a');
    a.dataset.dupTest = '1';
    await init(a);
    expect(warnSpy.called).to.be.false;
  });

  it('produces exactly one warning when the same path is loaded twice', async () => {
    const { default: init } = await freshFragment();

    const a1 = makeAnchor('/fragments/dup-path');
    a1.dataset.dupTest = '1';
    await init(a1);

    const a2 = makeAnchor('/fragments/dup-path');
    a2.dataset.dupTest = '1';
    await init(a2);

    const dupWarns = warnSpy.args.filter(
      (args) => args[0] === 'Duplicate fragment reference detected:',
    );
    expect(dupWarns).to.have.lengthOf(1);
    expect(dupWarns[0][1]).to.include('/fragments/dup-path');
  });

  it('produces exactly one warning when the same path is loaded three times', async () => {
    const { default: init } = await freshFragment();

    for (let i = 0; i < 3; i += 1) {
      const a = makeAnchor('/fragments/triple-path');
      a.dataset.dupTest = '1';
      // eslint-disable-next-line no-await-in-loop
      await init(a);
    }

    const dupWarns = warnSpy.args.filter(
      (args) => args[0] === 'Duplicate fragment reference detected:',
    );
    expect(dupWarns).to.have.lengthOf(1);
    expect(dupWarns[0][1]).to.include('/fragments/triple-path');
  });

  it('produces no warnings when all loaded paths are distinct', async () => {
    const { default: init } = await freshFragment();

    const paths = ['/fragments/alpha', '/fragments/beta', '/fragments/gamma'];
    for (const path of paths) {
      const a = makeAnchor(path);
      a.dataset.dupTest = '1';
      // eslint-disable-next-line no-await-in-loop
      await init(a);
    }

    const dupWarns = warnSpy.args.filter(
      (args) => args[0] === 'Duplicate fragment reference detected:',
    );
    expect(dupWarns).to.have.lengthOf(0);
  });
});
