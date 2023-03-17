import BaseRouter from './BaseRouter';

class UserRoutes extends BaseRouter {
  routes(): void {
    this.router.get('/user', () => 'hello world');
  }
}

export default UserRoutes;
