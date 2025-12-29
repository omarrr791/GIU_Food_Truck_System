const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const session = require('express-session');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

// Middleware for parsing JSON and form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware for session management
app.use(
    session({
        secret: 'your_secret_key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // Set to true for production with HTTPS
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day session expiration
        },
    })
);

// PostgreSQL connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'projectSoftwear',
    password: '1234',
    port: 5432,
});

// Serve static files
app.use(express.static('public'));

// Middleware to check user roles
function checkRole(role) {
    return (req, res, next) => {
        if (!req.session.user || req.session.user.role !== role) {
            console.log(`Access denied for role: ${req.session.user ? req.session.user.role : 'None'}`);
            return res.status(403).send({ error: 'Access denied.' });
        }
        next();
    };
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ==============================
// User Routes
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/index', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/admin-dashboard', checkRole('admin'), (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html')));

app.get('/api/user', async (req, res) => {
    if (!req.session.user) return res.status(401).send({ error: 'Not logged in' });
    try {
        const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [req.session.user.id]);
        res.status(200).send(result.rows[0]);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).send({ error: 'Server error' });
    }
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
            [username, email, hashedPassword, 'user']
        );
        res.status(201).send({ message: 'User registered successfully!', redirect: '/login' });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(err.code === '23505' ? 400 : 500).send({ error: 'Error during registration' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0 || !(await bcrypt.compare(password, result.rows[0].password))) {
            return res.status(400).send({ error: 'Invalid email or password' });
        }
        const user = result.rows[0];
        req.session.user = {
            id: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role,
            profile_image: user.profile_image || 'default-profile.jpg',
        };
        res.status(200).send({ message: 'Login successful!', redirect: user.role === 'admin' ? '/admin-dashboard' : '/index' });
    } catch (err) {
        console.error('Server error during login:', err);
        res.status(500).send({ error: 'Server error' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send({ error: 'Could not log out' });
        res.redirect('/login');
    });
});

// ==============================
// Cart Routes
app.get('/api/cart', (req, res) => {
    if (!req.session.user) return res.status(401).send({ error: 'Not logged in' });
    const cart = req.session.cart || [];
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    res.status(200).send({ cart, totalPrice });
});

app.post('/api/cart', async (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
        return res.status(400).send({ error: 'Invalid product ID or quantity' });
    }

    try {
        const productResult = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);

        if (productResult.rows.length === 0) {
            return res.status(404).send({ error: 'Product not found' });
        }

        const product = productResult.rows[0];
        if (product.quantity < quantity) {
            return res.status(400).send({ error: 'Insufficient stock available' });
        }

        // Mock saving to cart (Session/DB)
        req.session.cart = req.session.cart || [];
        const existingItem = req.session.cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            req.session.cart.push({ id: product.id, name: product.name, price: product.price, quantity });
        }

        res.status(200).send({ message: 'Product added to cart successfully!' });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).send({ error: 'Failed to add product to cart' });
    }
});

// ==============================
// Product Routes
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY name ASC');
        res.status(200).send({ products: result.rows });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send({ error: 'Server error while fetching products' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT id, name, description, price, quantity, image FROM products WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send({ error: 'Product not found' });
        }

        res.status(200).send(result.rows[0]);
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});



// ==============================
// Admin-Specific Routes
app.post('/api/add-product', checkRole('admin'), upload.single('image'), async (req, res) => {
    const { name, description, price, quantity } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    try {
        const result = await pool.query(
            'INSERT INTO products (name, description, price, quantity, image) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, description, parseFloat(price), parseInt(quantity), imagePath]
        );
        res.status(201).send({ message: 'Product added successfully!', product: result.rows[0] });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).send({ error: 'Failed to add product.' });
    }
});

// ==============================
// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
