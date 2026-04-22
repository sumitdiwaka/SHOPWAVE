import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { globalErrorHandler } from './middleware/errorMiddleware.js';

import authRoutes         from './routes/authRoutes.js';
import productRoutes      from './routes/productRoutes.js';
import orderRoutes        from './routes/orderRoutes.js';
import vendorRoutes       from './routes/vendorRoutes.js';
import adminRoutes        from './routes/adminRoutes.js';
import paymentRoutes      from './routes/paymentRoutes.js';
import reviewRoutes       from './routes/reviewRoutes.js';
import uploadRoutes       from './routes/uploadRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import returnRoutes       from './routes/returnRoutes.js';

dotenv.config();
connectDB();

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  socket.on('joinUserRoom', (userId) => socket.join('user_' + userId));
  socket.on('joinRoom', (orderId) => socket.join(orderId));
});

app.use((req, _res, next) => { req.io = io; next(); });
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',          authRoutes);
app.use('/api/products',      productRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/vendors',       vendorRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/payment',       paymentRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/upload',        uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/returns',       returnRoutes);

app.get('/', (_req, res) => res.json({ message: 'ShopWave API Running' }));
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('Server: http://localhost:' + PORT);
  console.log('Cloudinary:', process.env.CLOUDINARY_CLOUD_NAME ? 'OK' : 'MISSING');
  console.log('Razorpay:  ', process.env.RAZORPAY_KEY_ID ? 'OK' : 'MISSING');
  console.log('MongoDB:   ', process.env.MONGO_URI ? 'OK' : 'MISSING');
  console.log('Email:     ', process.env.EMAIL_USER ? 'OK' : 'MISSING');
});