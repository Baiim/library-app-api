import App from './app';
import UserRoutes from './routers/UserRoutes';
import RoleRoutes from './routers/RoleRoutes';
import CategoryRoutes from './routers/CategoryRoutes';
import RatingRoutes from './routers/RatingRoutes';
import BookRoutes from './routers/BookRoutes';
import BookmarkRoutes from './routers/BookmarkRoutes';
import NewsRoutes from './routers/NewsRoutes';
import TransactionRoutes from './routers/TransactionRoutes';

const app = new App([
    new UserRoutes(),
    new RoleRoutes(),
    new CategoryRoutes(),
    new RatingRoutes(),
    new BookRoutes(),
    new BookmarkRoutes(),
    new NewsRoutes(),
    new TransactionRoutes(),
]);

app.listen();
