// export {Route} from './src/route.js';
// export {Router} from './src/router.js';

import {Router} from './src/router.js';
import {Route} from './src/route';
import {Resolver} from './src/resolver';

Router.Route = Route;
Router.Resolver = Resolver;
export default Router;