declare interface Route {
  path: string;

  children?: Route[];

  action?: Function;

  redirect?: string;

  bundle?: string;

  component?: string;

  name?: string;
}

declare interface RouterOptions {
  baseUrl?: string;
}

declare interface NavigationTrigger {
  activate(): void;
  inactivate(): void;
}

declare namespace Router {
  class Location {
    baseUrl: string;

    params: any | null;

    pathname: string | null;

    redirectFrom?: string;

    route: Route | null;

    routes: Array<Route|null> | null;

    getUrl(params?: any): string;
  }
}
