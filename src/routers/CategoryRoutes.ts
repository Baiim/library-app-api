import BaseRouter from './BaseRouter';
import CategoryController from '../controllers/CategoryController';
import NotAllowedController from '../controllers/NotAllowedController';

class CategoryRoutes extends BaseRouter {
    routes(): void {
        this.router.get('/categories', CategoryController.getAll);
        this.router.post('/category', CategoryController.create);
        this.router.put('/category/:id', CategoryController.update);
        this.router.delete('/category/:id', CategoryController.delete);

        //Error 405 handling
        this.router.all('/category', NotAllowedController.error);
        this.router.all('/categories', NotAllowedController.error);
        this.router.all('/category/:id', NotAllowedController.error);
    }
}

export default CategoryRoutes;
