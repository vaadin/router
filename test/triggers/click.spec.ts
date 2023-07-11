// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
import { expect } from '@esm-bundle/chai';
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

const Button = {
  MAIN: 0, // usually left
  AUXILLARY: 1, // usually middle
  SECONDARY: 2, // usually right
};

const Key = {
  ALT: 1 << 0,
  CONTROL: 1 << 1,
  META: 1 << 2,
  SHIFT: 1 << 3,
};

describe('NavigationTriggers.CLICK', function () {
  function emulateClick(target, button = Button.MAIN, keys = 0) {
    const ctrl = keys & Key.CONTROL;
    const alt = keys & Key.ALT;
    const shift = keys & Key.SHIFT;
    const meta = keys & Key.META;

    let event;
    try {
      event = new MouseEvent('click', {
        ctrlKey: ctrl,
        altKey: alt,
        shiftKey: shift,
        metaKey: meta,
        button: button,
        bubbles: true,
        cancelable: true,
        composed: true,
      });

      const o = event.preventDefault;

      Object.defineProperty(event, 'preventDefault', {
        configurable: true,
        value() {
          console.log('PREVENTED');
          console.trace();
          return o.call(this);
        }
      })

    } catch (e) {
      event = document.createEvent('MouseEvents');
      event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, ctrl, alt, shift, meta, button, null);
      if (window.ShadyDOM) {
        Object.defineProperty(event, 'composed', {
          get() {
            return true;
          },
        });
      }
    }
    target.dispatchEvent(event);
  }

  let preventNavigationDefault = true;

  const clicks = [];
  function onWindowClick(event) {
    clicks.push({ defaultPrevented: event.defaultPrevented });
    event.preventDefault();
  }

  const navigateEvents = [];
  function onWindowNavigate(event) {
    console.log('preventNavigationDefault', preventNavigationDefault);
    if (preventNavigationDefault) {
      event.preventDefault();
    }

    navigateEvents.push({
      type: event.type,
      cancelable: event.cancelable,
      detail: event.detail,
    });
  }

  let outlet: HTMLElement;

  before(() => {
    const baseURLElement = document.createElement('base');
    baseURLElement.href = location.origin;
    document.head.append(baseURLElement);

    outlet = document.createElement('div');
    outlet.innerHTML = TEMPLATE;
    document.body.append(outlet);

    // Setup cross-origin link
    const origin =
      window.location.protocol + '//' + window.location.hostname + ':' + (parseInt(window.location.port) + 1);
    document.getElementById('cross-origin')?.setAttribute('href', `${origin}/in-app`);

    // Setup in-page hash link
    document.getElementById('in-page-hash-link')?.setAttribute('href', window.location.pathname + '#in-page');

    // Setup shadow roots
    const hosts = document.querySelectorAll('.shadow-host');
    for (let i = 0; i < hosts.length; i += 1) {
      const template = hosts[i].querySelector('template')!;
      const root = hosts[i].attachShadow({ mode: 'open' });
      root.appendChild(template.content.cloneNode(true));
    }

    // Setup click events preventing
    document.getElementById('default-preventer')?.addEventListener('click', (event) => event.preventDefault());

    window.addEventListener('click', onWindowClick);
    window.addEventListener('vaadin-router-go', onWindowNavigate);
  });

  after(() => {
    outlet.remove();
    window.removeEventListener('vaadin-router-go', onWindowNavigate);
    window.removeEventListener('click', onWindowClick);
  });

  beforeEach(() => {
    // clear the array
    clicks.length = 0;
    navigateEvents.length = 0;
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

    it('should translate `click` events on <a> links into `vaadin-router-go` events on window', () => {
      emulateClick(document.getElementById('in-app'));

      expect(navigateEvents).to.have.lengthOf(1);
      expect(navigateEvents[0]).to.have.property('type', 'vaadin-router-go');
    });

    it('should have cancelable `vaadin-router-go` events on window', () => {
      emulateClick(document.getElementById('in-app'));

      expect(navigateEvents).to.have.lengthOf(1);
      expect(navigateEvents[0]).to.have.property('cancelable', true);
    });

    it('should prevent the `click` event default action if the `vaadin-router-go` event is prevented', () => {
      emulateClick(document.getElementById('in-app'));

      expect(clicks).to.have.lengthOf(1);
      expect(clicks[0]).to.have.property('defaultPrevented', true);
    });

    // TODO: investigate and enable test back
    xit('should not prevent the `click` event default action if the `vaadin-router-go` event is not prevented', () => {
      preventNavigationDefault = false;

      window.DEBUGGER = true;

      try {
        emulateClick(document.getElementById('in-app'));
      } finally {
        expect(clicks).to.have.lengthOf(1);
        expect(clicks[0]).to.have.property('defaultPrevented', false);

        preventNavigationDefault = true;
      }

      window.DEBUGGER = false;
    });

    it('should set the `detail.pathname` property of the `vaadin-router-go` event to the pathname of the clicked link', () => {
      emulateClick(document.getElementById('in-app'));

      expect(navigateEvents[0]).to.have.nested.property('detail.pathname', '/in-app/link');
    });

    it('should carry `detail.search` property on `vaadin-router-go` event', () => {
      emulateClick(document.getElementById('in-app'));

      expect(navigateEvents[0]).to.have.nested.property('detail.search', '');

      emulateClick(document.getElementById('in-app-search'));

      expect(navigateEvents[1]).to.have.nested.property('detail.search', '?search');
    });

    it('should carry `detail.hash` property on `vaadin-router-go` event', () => {
      emulateClick(document.getElementById('in-app'));

      expect(navigateEvents[0]).to.have.nested.property('detail.hash', '');

      emulateClick(document.getElementById('in-app-hash'));

      expect(navigateEvents[1]).to.have.nested.property('detail.hash', '#hash');
    });

    it('should translate `click` events inside <a> links into `vaadin-router-go` events on window', () => {
      emulateClick(document.getElementById('text-in-a-link'));

      expect(navigateEvents).to.have.lengthOf(1);
      expect(navigateEvents[0]).to.have.property('type', 'vaadin-router-go');
      expect(navigateEvents[0]).to.have.nested.property('detail.pathname', '/in-app/link');

      expect(clicks).to.have.lengthOf(1);
      expect(clicks[0]).to.have.property('defaultPrevented', true);
    });

    it('should translate `click` events on <a> links inside Shadow DOM into `vaadin-router-go` events on window', () => {
      const shadowRoot = document.getElementById('shadow-host-with-a-link').shadowRoot;
      emulateClick(shadowRoot.getElementById('in-app-in-a-shadow'));

      expect(navigateEvents).to.have.lengthOf(1);
      expect(navigateEvents[0]).to.have.property('type', 'vaadin-router-go');
      expect(navigateEvents[0]).to.have.nested.property('detail.pathname', '/in-app/link');

      expect(clicks).to.have.lengthOf(1);
      expect(clicks[0]).to.have.property('defaultPrevented', true);
    });

    it('should translate `click` events inside shadow DOM inside <a> links into `vaadin-router-go` events on window', () => {
      const shadowRoot = document.getElementById('shadow-host-in-a-link').shadowRoot;
      emulateClick(shadowRoot.getElementById('text-in-a-shadow-in-a-link'));

      expect(navigateEvents).to.have.lengthOf(1);
      expect(navigateEvents[0]).to.have.property('type', 'vaadin-router-go');
      expect(navigateEvents[0]).to.have.nested.property('detail.pathname', '/in-app/link');

      expect(clicks).to.have.lengthOf(1);
      expect(clicks[0]).to.have.property('defaultPrevented', true);
    });

    it('should work for navigation from /deep/pages/in/app to /', () => {
      const location = window.location.pathname;
      window.history.replaceState(null, document.title, '/deep/page/in/app');
      emulateClick(document.getElementById('home'));
      window.history.replaceState(null, document.title, location);

      expect(navigateEvents).to.have.lengthOf(1);
      expect(navigateEvents[0]).to.have.property('type', 'vaadin-router-go');
      expect(navigateEvents[0]).to.have.nested.property('detail.pathname', '/');

      expect(clicks).to.have.lengthOf(1);
      expect(clicks[0]).to.have.property('defaultPrevented', true);
    });

    it('should scroll to top on click event', () => {
      const div = document.createElement('div');
      div.setAttribute('style', 'width:2000px; height:2000px;');
      document.body.append(div);

      window.scrollTo(10, 10);
      expect(window.scrollX).to.within(9, 11);
      expect(window.scrollY).to.within(9, 11);

      emulateClick(document.getElementById('in-app'));

      expect(window.scrollX).to.within(0, 1);
      expect(window.scrollY).to.within(0, 1);
      document.body.removeChild(div);
    });

    // TODO: investigate and enable test back
    xit('should not scroll to top on unhandled click event', () => {
      preventNavigationDefault = false;

      const div = document.createElement('div');
      div.setAttribute('style', 'width:2000px; height:2000px;');
      document.body.append(div);

      window.scrollTo(10, 10);
      expect(window.scrollX).to.be.within(9, 11);
      expect(window.scrollY).to.be.within(9, 11);

      emulateClick(document.getElementById('in-app'));

      expect(window.scrollX).to.be.within(9, 11);
      expect(window.scrollY).to.be.within(9, 11);
      document.body.removeChild(div);

      preventNavigationDefault = true;
    });

    describe('irrelevant `click` events', () => {
      function expectClickIgnored() {
        expect(navigateEvents).to.have.lengthOf(0);
        expect(clicks).to.have.lengthOf(1);
        expect(clicks[0]).to.have.property('defaultPrevented', false);
      }

      it('should ignore `click` events with the secondary mouse button', () => {
        emulateClick(document.getElementById('in-app'), Button.SECONDARY);
        expectClickIgnored();
      });

      it('should ignore `click` events with the middle mouse button', () => {
        emulateClick(document.getElementById('in-app'), Button.AUXILLARY);
        expectClickIgnored();
      });

      it('should ignore `click` events if the SHIFT modifier key is also pressed', () => {
        emulateClick(document.getElementById('in-app'), Button.MAIN, Key.SHIFT);
        expectClickIgnored();
      });

      it('should ignore `click` events if the CONTROL modifier key is also pressed', () => {
        emulateClick(document.getElementById('in-app'), Button.MAIN, Key.CONTROL);
        expectClickIgnored();
      });

      it('should ignore `click` events if the ALT modifier key is also pressed', () => {
        emulateClick(document.getElementById('in-app'), Button.MAIN, Key.ALT);
        expectClickIgnored();
      });

      it('should ignore `click` events if the META modifier key is also pressed', () => {
        emulateClick(document.getElementById('in-app'), Button.MAIN, Key.META);
        expectClickIgnored();
      });

      it('should ignore `click` events on links with a non-default target', () => {
        emulateClick(document.getElementById('in-app-target-blank'));
        expectClickIgnored();
      });

      it('should ignore `click` events on links with a `download` attribute', () => {
        emulateClick(document.getElementById('in-app-download'));
        expectClickIgnored();
      });

      it('should ignore `click` events on page-local links (same pathname, different hash)', () => {
        emulateClick(document.getElementById('in-page-hash-link'));
        expectClickIgnored();
      });

      it('should ignore `click` events on external links', () => {
        emulateClick(document.getElementById('external'));
        expectClickIgnored();
      });

      it('should ignore `click` events on cross-origin links', () => {
        emulateClick(document.getElementById('cross-origin'));
        expectClickIgnored();
      });

      it('should ignore `click` events on non-link elements', () => {
        emulateClick(document.getElementById('not-a-link'));
        expectClickIgnored();
      });

      it('should ignore `click` events on links with a `router-ignore` attribute', () => {
        emulateClick(document.getElementById('ignore-link'));
        expectClickIgnored();
      });

      it('should ignore `click` events with prevented default action', () => {
        emulateClick(document.getElementById('in-app-prevented'));
        expect(navigateEvents).to.have.lengthOf(0);
        expect(clicks).to.have.lengthOf(1);
        expect(clicks[0]).to.have.property('defaultPrevented', true);
      });
    });
  });

  describe('inactivated', () => {
    before(() => {
      CLICK.inactivate();
    });

    it('should not translate `click` events into `vaadin-router-go` when inactivated', () => {
      emulateClick(document.getElementById('in-app'));

      expect(navigateEvents).to.have.lengthOf(0);
    });

    it('should not prevent the default action on the original `click` event', () => {
      emulateClick(document.getElementById('in-app'));

      expect(clicks).to.have.lengthOf(1);
      expect(clicks[0]).to.have.property('defaultPrevented', false);
    });
  });
});
