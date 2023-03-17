import App from './app';
import UserRoutes from './routers/UserRoutes';

const app = new App([
  new UserRoutes(),
]);

app.listen();
