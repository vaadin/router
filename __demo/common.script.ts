import { Router } from '../src/index.js';

type MessageData = Readonly<{ url: string }>;

type ParentData = {
  source: MessageEventSource | null;
  origin: string;
};

let parentData: ParentData | undefined;

function updateParentUrl() {
  if (parentData?.source) {
    parentData.source.postMessage({ url: location.href }, { targetOrigin: parentData.origin });
  }
}

addEventListener('message', ({ data, source, origin }: MessageEvent<MessageData | null>) => {
  if (!parentData) {
    parentData = { source, origin };
  }

  if (data != null) {
    window.location.href = new URL(data.url, location.origin).href;
  } else {
    Router.go('/');
  }

  updateParentUrl();
});

addEventListener('vaadin-router-location-changed', updateParentUrl);
