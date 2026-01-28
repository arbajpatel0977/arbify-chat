import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config'
import connectCloudinary from './configs/cloudnary.js';
import productRouter from './routes/productRoute.js';

const app = express();
const PORT = process.env.PORT || 4000;

await connectCloudinary();


// Define allowed origins for CORS
const allowedOrigins = [
    'http://localhost:5173',
    'https://arbify-chat-t7pa.vercel.app',
    'https://arbify-chat-t7pa-hknyifnui-arbaj-patels-projects.vercel.app/*'
];


// middleware configuration
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));




app.get('/', (req, res) => {
    res.send('Hello from the server!');
});

app.use('/api/product', productRouter)



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);

});

