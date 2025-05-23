require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');

// Import Passport configuration
require('./config/passport');



const app = express();

app.use(express.static(path.join(__dirname, '../google-drive-ui/dist')));

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../google-drive-ui/dist/index.html'));
//   });

// app.set('trust proxy', 2);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: [
        process.env.CLIENT_URL,
        'https://google-grive-clone.onrender.com',
        'https://google-grive.vercel.app',
        'http://localhost:4173',
        'http://localhost:3000',
        'http://localhost:5173'
    ],
    credentials: true,
    // exposedHeaders: ['set-cookie'],
    // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
}));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: process.env.MONGODB_URI}
        
    ),
    cookie: {
        secure: false,
        // domain: process.env.NODE_ENV === 'production' 
        // ? 'google-grive-clone.onrender.com' // No leading dot
        // : undefined,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        // httpOnly: true,
        // sameSite: 'lx'
    }
}));

app.use((req, res, next) => {
    console.log('--- Session Debug ---');
    console.log('Session ID:', req.sessionID);
    console.log('Session:', req.session);
    console.log('User:', req.user);
    console.log('Cookies:', req.cookies);
    console.log('Headers:', req.headers.cookie);
    next();
  });

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

// Error handling middleware
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({ message: 'Something went wrong!' });
// });

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../google-drive-ui/dist', 'index.html'))
  })

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 