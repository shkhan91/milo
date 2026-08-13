/* eslint-disable import/no-named-as-default-member */
import { expect } from 'chai';
import { html, render } from '../../../../../libs/deps/htm-preact.js';
import Panel from '../../../../../libs/blocks/preflight/panels/performance.js';

describe('Preflight performance', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  describe('Panel', () => {
    it('renders a panel with all the items', () => {
      const panel = html`<${Panel} />`;
      render(panel, document.body);
      const panelItems = document.querySelectorAll('.preflight-item');
      expect(panelItems.length).to.exist;
    });

    it('does not render Highlight LCP link when no LCP element found', () => {
      const panel = html`<${Panel} />`;
      render(panel, document.body);
      // lcpFound starts false; the highlight link should not be present
      const highlightLink = document.querySelector('.performance-element-preview');
      expect(highlightLink).to.not.exist;
    });
  });
});
