
import { getMyProfile, login, logout, register } from '../controllers/user.controller.ts';
import { isAuthenticated } from '../middlewares/auth.ts';
import express, { type Router } from 'express';

const app: Router = express.Router();

app.post('/register', register);
app.post('/login', login);

app.use(isAuthenticated);

app.post('/logout', logout);
app.get('/me', getMyProfile);

export default app;
