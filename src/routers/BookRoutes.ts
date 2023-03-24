import BaseRouter from './BaseRouter';
import BookController from '../controllers/BookController';
import NotAllowedController from '../controllers/NotAllowedController';
import authMiddleware from '../middlewares/auth.middleware';
import UploadFile from '../middlewares/multer.middleware';

class BookRoutes extends BaseRouter {
    routes(): void {
        const authJwt = authMiddleware.verifyAccessToken;

        this.router.post(
            '/book',
            [
                authJwt,
                new UploadFile('books').uploads([
                    {name: 'cover_book', maxCount: 1},
                    {name: 'book_pdf', maxCount: 1},
                ]),
            ],
            BookController.create
        );

        this.router.put(
            '/book/:id',
            [
                authJwt,
                new UploadFile('books').uploads([
                    {name: 'cover_book', maxCount: 1},
                    {name: 'book_pdf', maxCount: 1},
                ]),
            ],
            BookController.update
        );

        this.router.get('/books', authJwt, BookController.getAll);
        this.router.get('/books-mostpick', authJwt, BookController.getMostPicked);
        this.router.get('/book/:id', authJwt, BookController.get);
        this.router.get('/book-category/:id', authJwt, BookController.getByCategory);
        this.router.delete('/book/:id', authJwt, BookController.delete);

        //Error 405 handling
        this.router.all('/book', NotAllowedController.error);
        this.router.all('/books', NotAllowedController.error);
        this.router.all('/books-mostpick', NotAllowedController.error);
        this.router.all('/book/:id', NotAllowedController.error);
        this.router.all('/book-category/:id', NotAllowedController.error);
    }
}

export default BookRoutes;
