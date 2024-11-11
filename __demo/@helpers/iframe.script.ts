import './common.css';
import './common.js';

import { Router } from '@vaadin/router';

history.replaceState(null, '', '/');

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

addEventListener('message', ({ data, origin, source }: MessageEvent<MessageData | null>) => {
  if (data != null) {
    Router.go(new URL(data.url, location.origin).href);
  } else {
    parentData = { source, origin };
    Router.go('/');
  }

  updateParentUrl();
});

addEventListener('vaadin-router-location-changed', updateParentUrl);
