import { Router } from '../../src/index.js';

type MessageData = Readonly<{ url: string }>;

type ParentData = {
  source: MessageEventSource | null;
  origin: string;
};

let parentData: ParentData | undefined;

function updateParentUrl() {
  if (parentData?.source) {
    parentData.source.postMessage({ url: location.href }, { targetOrigin: location.origin });
  }
}

addEventListener('message', ({ data }: MessageEvent<MessageData | null>) => {
  if (data != null) {
    Router.go(new URL(data.url, location.origin).href);
  } else {
    Router.go('/');
  }

  updateParentUrl();
});

addEventListener('vaadin-router-location-changed', updateParentUrl);
