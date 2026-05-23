const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function createAnchor({ href = '#', dataset = {} }) {
  return {
    dataset,
    href,
    click() {
      if (this.ownerDocument.listeners.click) {
        this.ownerDocument.listeners.click({ target: this });
      }
    },
    closest(selector) {
      if (selector === 'a[data-app-link]' && this.dataset.appLink) return this;
      if (
        selector === 'a[data-plan-web-link]' &&
        Object.prototype.hasOwnProperty.call(this.dataset, 'planWebLink')
      ) {
        return this;
      }
      return null;
    },
  };
}

function runAppLinks(anchors) {
  const events = [];
  const document = {
    listeners: {},
    addEventListener(type, listener) {
      this.listeners[type] = listener;
    },
    querySelectorAll(selector) {
      if (selector === 'a[data-app-link]') {
        return anchors.filter((anchor) => anchor.dataset.appLink);
      }
      if (selector === 'a[data-plan-web-link]') {
        return anchors.filter((anchor) =>
          Object.prototype.hasOwnProperty.call(anchor.dataset, 'planWebLink'),
        );
      }
      return [];
    },
  };

  anchors.forEach((anchor) => {
    anchor.ownerDocument = document;
  });

  const context = {
    document,
    window: {
      gtag() {
        events.push(Array.from(arguments));
      },
    },
  };

  context.globalThis = context;
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, '../assets/js/app-links.js'), 'utf8'),
    context,
  );

  return events;
}

test('tracks app download CTA taps', () => {
  const anchor = createAnchor({
    dataset: { appLink: 'ios', appLinkPlacement: 'hero' },
  });
  const events = runAppLinks([anchor]);

  anchor.click();

  assert.equal(JSON.stringify(events), JSON.stringify([
    [
      'event',
      'app_download_cta_tapped',
      {
        destination_url:
          'https://apps.apple.com/vn/app/cu%E1%BB%91i-tu%E1%BA%A7n-%C4%91i-%C4%91%C3%A2u/id6765682490',
        placement: 'hero',
        platform: 'ios',
      },
    ],
  ]));
});

test('tracks plan web views', () => {
  const anchor = createAnchor({
    href: 'https://s.cuoituandidau.vn/v/kid-cafe-sweet-town',
    dataset: { planWebLink: '', planWebPlacement: 'planner' },
  });
  const events = runAppLinks([anchor]);

  anchor.click();

  assert.equal(JSON.stringify(events), JSON.stringify([
    [
      'event',
      'plan_web_view_opened',
      {
        destination_url: 'https://s.cuoituandidau.vn/v/kid-cafe-sweet-town',
        placement: 'planner',
      },
    ],
  ]));
});
