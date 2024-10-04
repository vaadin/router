/* eslint-disable import/no-duplicates */
// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
import { expect } from '@esm-bundle/chai';
import userEvent from '@testing-library/user-event';
import type Sinon from 'sinon';
import sinon from 'sinon';
import CLICK from '../../src/triggers/click.js';
import '../setup.js';

const TEMPLATE = `<a id="home" href="">home</a>
<a id="in-app" href="in-app/link">in-app/link</a>
<a href="in-app/link">
  <span id="text-in-a-link">not a link (inside a link)</span>
  <div id="shadow-host-in-a-link" class="shadow-host">
    <template>
      <span id="text-in-a-shadow-in-a-link">not a link (inside a shadow DOM, inside a link)</span>
    </template>
  </div>
</a>
<a id="in-app-target-blank" target="_blank" href="in-app/link">in-app/link (target="_blank")</a>
<a id="in-app-download" download href="in-app/link">in-app/link (download)</a>
<a id="ignore-link" router-ignore href="ignore-this-link">ignore (router-ignore)</a>
<a id="external" href="http://example.com/in-app/link">http://example.com/in-app/link</a>
<a id="cross-origin" href="[same domain, different port]">[same domain, different port]</a>
<div id="shadow-host-with-a-link" class="shadow-host">
  <template>
    <a id="in-app-in-a-shadow" href="in-app/link">in-app/link (inside a shadow DOM)</a>
  </template>
</div>
<p id="not-a-link">p, not a link</p>
<div id="default-preventer">
  <a id="in-app-prevented" href="in-app/link">in-app/link (default prevented)</a>
</div>
<a id="in-page-hash-link" href="#in-page">#in-page</a>
<a id="in-app-search" href="in-app/link?search">in-app/link?search</a>
<a id="in-app-hash" href="in-app/link#hash">in-app/link#hash</a>`;

describe('NavigationTriggers.CLICK', () => {
  // const BASE_PATH = location.origin;
  const DEFAULT_PAGE = location.href;

  let preventNavigationDefault = true;
  let onWindowClick: Sinon.SinonSpy<[Event], void>;
  let onWindowNavigate: Sinon.SinonSpy<[Event], void>;
  let user: ReturnType<typeof userEvent.setup>;

  let outlet: HTMLElement;

  afterEach(() => {
    window.location.href = DEFAULT_PAGE;
  });

  before(() => {
    const baseURLElement = document.createElement('base');
    baseURLElement.href = location.origin;
    document.head.append(baseURLElement);

    outlet = document.createElement('div');
    outlet.innerHTML = TEMPLATE;
    document.body.append(outlet);

    // Setup cross-origin link
    const origin = `${window.location.protocol}//${window.location.hostname}:${parseInt(window.location.port, 10) + 1}`;
    document.getElementById('cross-origin')?.setAttribute('href', `${origin}/in-app`);

    // Setup in-page hash link
    document.getElementById('in-page-hash-link')?.setAttribute('href', `${window.location.pathname}#in-page`);

    // Setup shadow roots
    const hosts: NodeListOf<HTMLElement> = document.querySelectorAll('.shadow-host');
    for (const host of hosts) {
      const template = host.querySelector('template')!;
      const root = host.attachShadow({ mode: 'open' });
      root.appendChild(template.content.cloneNode(true));
    }

    for (const host of hosts) {
      const template = host.querySelector('template')!;
      const root = host.attachShadow({ mode: 'open' });
      root.appendChild(template.content.cloneNode(true));
    }

    // Setup click events preventing
    document.getElementById('default-preventer')?.addEventListener('click', (event) => event.preventDefault());
  });

  after(() => {
    outlet.remove();
  });

  beforeEach(() => {
    user = userEvent.setup();

    onWindowClick = sinon.spy((event: Event) => {
      event.preventDefault();
    });
    onWindowNavigate = sinon.spy((event: Event) => {
      if (preventNavigationDefault) {
        event.preventDefault();
      }
    });

    window.addEventListener('click', onWindowClick);
    window.addEventListener('vaadin-router-go', onWindowNavigate);
  });

  afterEach(() => {
    window.removeEventListener('vaadin-router-go', onWindowNavigate);
    window.removeEventListener('click', onWindowClick);
  });

  it('should expose the NavigationTrigger API', () => {
    expect(CLICK).to.have.property('activate').that.is.a('function');
    expect(CLICK).to.have.property('inactivate').that.is.a('function');
  });

  describe('activated', () => {
    before(() => {
      CLICK.activate();
    });

    after(() => {
      CLICK.inactivate();
    });

    it('should translate `click` events on <a> links into `vaadin-router-go` events on window', async () => {
      await user.click(document.getElementById('in-app')!);

      expect(onWindowNavigate).to.have.been.calledOnceWith({ type: 'vaadin-router-go' });
    });

    it('should have cancelable `vaadin-router-go` events on window', async () => {
      await user.click(document.getElementById('in-app')!);

      expect(onWindowNavigate).to.have.been.calledOnceWith({ cancelable: true });
    });

    it('should prevent the `click` event default action if the `vaadin-router-go` event is prevented', async () => {
      await user.click(document.getElementById('in-app')!);

      expect(onWindowClick).to.have.been.calledOnceWith({ defaultPrevented: true });
    });

    // TODO: investigate and enable test back
    xit('should not prevent the `click` event default action if the `vaadin-router-go` event is not prevented', async () => {
      // preventNavigationDefault = false;
      // window.DEBUGGER = true;
      // try {
      //   await user.click(document.getElementById('in-app'));
      // } finally {
      //   expect(clicks).to.have.lengthOf(1);
      //   expect(clicks[0]).to.have.property('defaultPrevented', false);
      //   preventNavigationDefault = true;
      // }
      // window.DEBUGGER = false;
    });

    it('should set the `detail.pathname` property of the `vaadin-router-go` event to the pathname of the clicked link', async () => {
      await user.click(document.getElementById('in-app')!);

      expect(onWindowNavigate).to.have.been.calledWithMatch({ detail: { pathname: '/in-app/link' } });
    });

    it('should carry `detail.search` property on `vaadin-router-go` event', async () => {
      await user.click(document.getElementById('in-app')!);

      expect(onWindowNavigate).to.have.been.calledWithMatch({ detail: { search: '' } });

      await user.click(document.getElementById('in-app-search')!);

      expect(onWindowNavigate).to.have.been.calledWithMatch({ detail: { search: '?search' } });
    });

    it('should carry `detail.hash` property on `vaadin-router-go` event', async () => {
      await user.click(document.getElementById('in-app')!);

      expect(onWindowNavigate).to.have.been.calledWithMatch({ detail: { hash: '' } });

      await user.click(document.getElementById('in-app-hash')!);

      expect(onWindowNavigate).to.have.been.calledWithMatch({ detail: { hash: '#hash' } });
    });

    it('should translate `click` events inside <a> links into `vaadin-router-go` events on window', async () => {
      await user.click(document.getElementById('text-in-a-link')!);

      expect(onWindowNavigate).to.have.been.calledWithMatch({
        type: 'vaadin-router-go',
        detail: { pathname: '/in-app/link' },
      });

      expect(onWindowClick).to.have.been.calledOnceWith({ defaultPrevented: true });
    });

    it('should translate `click` events on <a> links inside Shadow DOM into `vaadin-router-go` events on window', async () => {
      const shadowRoot = document.getElementById('shadow-host-with-a-link')!.shadowRoot!;
      await user.click(shadowRoot.getElementById('in-app-in-a-shadow')!);

      expect(onWindowNavigate).to.have.been.calledWithMatch({
        type: 'vaadin-router-go',
        detail: { pathname: '/in-app/link' },
      });

      expect(onWindowClick).to.have.been.calledOnceWith({ defaultPrevented: true });
    });

    it('should translate `click` events inside shadow DOM inside <a> links into `vaadin-router-go` events on window', async () => {
      const shadowRoot = document.getElementById('shadow-host-with-a-link')!.shadowRoot!;
      await user.click(shadowRoot.getElementById('text-in-a-shadow-in-a-link')!);

      expect(onWindowNavigate).to.have.been.calledWithMatch({
        type: 'vaadin-router-go',
        detail: { pathname: '/in-app/link' },
      });

      expect(onWindowClick).to.have.been.calledOnceWith({ defaultPrevented: true });
    });

    it('should work for navigation from /deep/pages/in/app to /', async () => {
      const location = window.location.pathname;
      window.history.replaceState(null, document.title, '/deep/page/in/app');
      await user.click(document.getElementById('home')!);
      window.history.replaceState(null, document.title, location);

      expect(onWindowNavigate).to.have.been.calledWithMatch({
        type: 'vaadin-router-go',
        detail: { pathname: '/' },
      });

      expect(onWindowClick).to.have.been.calledOnceWith({ defaultPrevented: true });
    });

    it('should scroll to top on click event', async () => {
      const div = document.createElement('div');
      div.setAttribute('style', 'width:2000px; height:2000px;');
      document.body.append(div);

      window.scrollTo(10, 10);
      expect(window.scrollX).to.within(9, 11);
      expect(window.scrollY).to.within(9, 11);

      await user.click(document.getElementById('in-app')!);

      expect(window.scrollX).to.within(0, 1);
      expect(window.scrollY).to.within(0, 1);
      document.body.removeChild(div);
    });

    // TODO: investigate and enable test back
    xit('should not scroll to top on unhandled click event', async () => {
      preventNavigationDefault = false;

      const div = document.createElement('div');
      div.setAttribute('style', 'width:2000px; height:2000px;');
      document.body.append(div);

      window.scrollTo(10, 10);
      expect(window.scrollX).to.be.within(9, 11);
      expect(window.scrollY).to.be.within(9, 11);

      await user.click(document.getElementById('in-app')!);

      expect(window.scrollX).to.be.within(9, 11);
      expect(window.scrollY).to.be.within(9, 11);
      document.body.removeChild(div);

      preventNavigationDefault = true;
    });

    describe('irrelevant `click` events', () => {
      function expectClickIgnored() {
        expect(onWindowNavigate).to.not.have.been.called;
        expect(onWindowClick).to.have.been.calledOnceWith({ defaultPrevented: false });
      }

      it('should ignore `click` events with the secondary mouse button', async () => {
        await user.pointer({ keys: '[MouseRight]', target: document.getElementById('in-app')! });
        expectClickIgnored();
      });

      it('should ignore `click` events with the middle mouse button', async () => {
        await user.pointer({ keys: '[MouseMiddle]', target: document.getElementById('in-app')! });
        expectClickIgnored();
      });

      it('should ignore `click` events if the SHIFT modifier key is also pressed', async () => {
        await user.keyboard('{Shift>}');
        await user.click(document.getElementById('in-app')!);
        await user.keyboard('{/Shift}');

        expectClickIgnored();
      });

      it('should ignore `click` events if the CONTROL modifier key is also pressed', async () => {
        await user.keyboard('{Control>}');
        await user.click(document.getElementById('in-app')!);
        await user.keyboard('{/Control}');
        expectClickIgnored();
      });

      it('should ignore `click` events if the ALT modifier key is also pressed', async () => {
        await user.keyboard('{Alt>}');
        await user.click(document.getElementById('in-app')!);
        await user.keyboard('{/Alt}');
        expectClickIgnored();
      });

      it('should ignore `click` events if the META modifier key is also pressed', async () => {
        await user.keyboard('{Meta>}');
        await user.click(document.getElementById('in-app')!);
        await user.keyboard('{/Meta}');
        expectClickIgnored();
      });

      it('should ignore `click` events on links with a non-default target', async () => {
        await user.click(document.getElementById('in-app-target-blank')!);
        expectClickIgnored();
      });

      it('should ignore `click` events on links with a `download` attribute', async () => {
        await user.click(document.getElementById('in-app-download')!);
        expectClickIgnored();
      });

      it('should ignore `click` events on page-local links (same pathname, different hash)', async () => {
        await user.click(document.getElementById('in-app-hash-link')!);
        expectClickIgnored();
      });

      it('should ignore `click` events on external links', async () => {
        await user.click(document.getElementById('external')!);
        expectClickIgnored();
      });

      it('should ignore `click` events on cross-origin links', async () => {
        await user.click(document.getElementById('cross-origin')!);
        expectClickIgnored();
      });

      it('should ignore `click` events on non-link elements', async () => {
        await user.click(document.getElementById('not-a-link')!);
        expectClickIgnored();
      });

      it('should ignore `click` events on links with a `router-ignore` attribute', async () => {
        await user.click(document.getElementById('ignore-link')!);
        expectClickIgnored();
      });

      it('should ignore `click` events with prevented default action', async () => {
        await user.click(document.getElementById('in-app-prevented')!);
        expect(onWindowNavigate).to.not.have.been.called;
        expect(onWindowClick).to.have.been.calledOnceWith({ defaultPrevented: true });
      });
    });
  });

  describe('inactivated', () => {
    before(() => {
      CLICK.inactivate();
    });

    it('should not translate `click` events into `vaadin-router-go` when inactivated', async () => {
      await user.click(document.getElementById('in-app')!);
      expect(onWindowNavigate).to.not.have.been.called;
    });

    it('should not prevent the default action on the original `click` event', async () => {
      await user.click(document.getElementById('in-app')!);
      expect(onWindowClick).to.have.been.calledOnceWith({ defaultPrevented: false });
    });
  });
});
