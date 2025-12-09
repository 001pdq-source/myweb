// ============================================
// Server Setup - server.js
// ============================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoSanitize = require('mongo-sanitize');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

const app = express();

// ============================================
// Security Middleware
// ============================================

// Helmet for security headers
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // limit login attempts
    message: 'Too many login attempts, please try again later.'
});

app.use(limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Compression
app.use(compression());

// Logging
app.use(morgan('combined'));

// ============================================
// Database Setup
// ============================================

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/hikaya';
        await mongoose.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

connectDB();

// ============================================
// Database Models
// ============================================

// User Model
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    age: {
        type: Number,
        min: [13, 'Must be at least 13 years old']
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', '']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    profilePicture: String,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationCode: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    twoFactorEnabled: Boolean,
    twoFactorSecret: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Story Model
const storySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a story title'],
        trim: true
    },
    author: {
        type: String,
        required: [true, 'Please provide an author name']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description']
    },
    content: String,
    category: {
        type: String,
        enum: ['adventure', 'romance', 'mystery', 'science-fiction', 'children', 'other'],
        default: 'other'
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: 0
    },
    imageUrl: String,
    imagePath: String,
    rating: {
        type: Number,
        default: 4.5,
        min: 1,
        max: 5
    },
    reviews: [{
        userId: mongoose.Schema.Types.ObjectId,
        rating: Number,
        comment: String,
        createdAt: Date
    }],
    purchaseCount: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Purchase Model
const purchaseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    storyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
        required: true
    },
    amount: Number,
    currency: {
        type: String,
        default: 'SAR'
    },
    paymentMethod: String,
    stripePaymentId: String,
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    receiptEmail: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Session Model
const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    token: String,
    ipAddress: String,
    userAgent: String,
    expiresAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);
const Story = mongoose.model('Story', storySchema);
const Purchase = mongoose.model('Purchase', purchaseSchema);
const Session = mongoose.model('Session', sessionSchema);

// ============================================
// Authentication Middleware
// ============================================

const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Admin authorization middleware
const authorizeAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// ============================================
// Routes - Authentication
// ============================================

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const authRoutes = express.Router();

// Email transporter (configure with your email service)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Sign up
authRoutes.post('/signup', async (req, res) => {
    try {
        const { name, email, age, gender, password } = req.body;

        // Validation
        if (!name || !email || !password || !age) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Create user
        const user = new User({
            name,
            email,
            age,
            gender,
            password: hashedPassword,
            emailVerificationCode: verificationCode,
            emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        await user.save();

        // Send verification email
        await transporter.sendMail({
            to: email,
            subject: 'Verify Your Email - حكاية',
            html: `
                <h2>Welcome to حكاية</h2>
                <p>Your verification code is: <strong>${verificationCode}</strong></p>
                <p>This code will expire in 24 hours.</p>
            `
        });

        res.status(201).json({ message: 'User created. Please check your email for verification code.' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify email
authRoutes.post('/verify-email', async (req, res) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({
            email,
            emailVerificationCode: code,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        user.isEmailVerified = true;
        user.emailVerificationCode = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
authRoutes.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({ message: 'Please verify your email first' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // Create session
        const session = new Session({
            userId: user._id,
            token,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        await session.save();

        // Remove password from response
        user.password = undefined;

        res.json({
            message: 'Login successful',
            token,
            user
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Forgot password
authRoutes.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await user.save();

        // Send reset email
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

        await transporter.sendMail({
            to: email,
            subject: 'Password Reset - حكاية',
            html: `
                <h2>Password Reset</h2>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>This link will expire in 30 minutes.</p>
            `
        });

        res.json({ message: 'Password reset link sent to your email' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify token
authRoutes.get('/verify-token', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Logout
authRoutes.post('/logout', authenticateToken, async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        await Session.findOneAndDelete({ token });

        res.json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// Routes - Stories
// ============================================

const storiesRoutes = express.Router();

// Get all stories
storiesRoutes.get('/', async (req, res) => {
    try {
        const stories = await Story.find().select('-content');
        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get story by ID
storiesRoutes.get('/:id', async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        res.json(story);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// Routes - Users
// ============================================

const usersRoutes = express.Router();

// Get user library
usersRoutes.get('/library', authenticateToken, async (req, res) => {
    try {
        const purchases = await Purchase.find({
            userId: req.user.id,
            status: 'completed'
        }).populate('storyId');

        const stories = purchases.map(p => p.storyId);
        res.json({ stories });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// Routes - Payments
// ============================================

const paymentsRoutes = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment intent
paymentsRoutes.post('/create-intent', authenticateToken, async (req, res) => {
    try {
        const { storyId, amount } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount),
            currency: 'sar',
            metadata: { storyId, userId: req.user.id }
        });

        // Create purchase record
        const purchase = new Purchase({
            userId: req.user.id,
            storyId,
            amount: amount / 100,
            stripePaymentId: paymentIntent.id,
            status: 'pending'
        });

        await purchase.save();

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Payment intent error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Stripe webhook
paymentsRoutes.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;

            // Update purchase status
            const purchase = await Purchase.findOne({
                stripePaymentId: paymentIntent.id
            }).populate('userId').populate('storyId');

            if (purchase) {
                purchase.status = 'completed';
                await purchase.save();

                // Update purchase count
                await Story.findByIdAndUpdate(
                    purchase.storyId._id,
                    { $inc: { purchaseCount: 1 } }
                );

                // Send receipt email
                await transporter.sendMail({
                    to: purchase.userId.email,
                    subject: `Receipt - ${purchase.storyId.title} - حكاية`,
                    html: `
                        <h2>Purchase Receipt</h2>
                        <p>Thank you for purchasing: <strong>${purchase.storyId.title}</strong></p>
                        <p>Amount: ${purchase.amount} SAR</p>
                        <p>Transaction ID: ${paymentIntent.id}</p>
                        <p>Date: ${new Date().toLocaleDateString('ar-SA')}</p>
                    `
                });
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).send('Webhook error');
    }
});

// ============================================
// Routes - Admin
// ============================================

const adminRoutes = express.Router();

// Add story
adminRoutes.post('/stories', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { title, author, description, category, price } = req.body;

        const story = new Story({
            title,
            author,
            description,
            category,
            price,
            createdBy: req.user.id
        });

        await story.save();

        res.status(201).json({ message: 'Story added successfully', story });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all stories (admin)
adminRoutes.get('/stories', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const stories = await Story.find();
        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete story
adminRoutes.delete('/stories/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        await Story.findByIdAndDelete(req.params.id);
        res.json({ message: 'Story deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all users (admin)
adminRoutes.get('/users', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get purchases (admin)
adminRoutes.get('/purchases', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const purchases = await Purchase.find()
            .populate('userId')
            .populate('storyId')
            .sort({ createdAt: -1 });
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get analytics (admin)
adminRoutes.get('/analytics', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStories = await Story.countDocuments();
        const totalPurchases = await Purchase.countDocuments({ status: 'completed' });
        const totalRevenue = await Purchase.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        res.json({
            totalUsers,
            totalStories,
            totalPurchases,
            totalRevenue: totalRevenue[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// API Routes Setup
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/stories', storiesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin', adminRoutes);

// ============================================
// Error Handling
// ============================================

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error'
    });
});

// ============================================
// Server Start
// ============================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
