let lastNavigation;

const navigationStack = {
  push(pathname, event) {
    // ignore "popstate" event dispatched after navigation caused by "click"
    // TODO(web-padawan): consider storing and checking `event.type` instead,
    // e.g. to also prevent reloading route on the exactly same URL link click
    if (!(event instanceof PopStateEvent) || pathname !== lastNavigation) {
      lastNavigation = pathname;
      return true;
    }
    return false;
  }
};

export default navigationStack;
