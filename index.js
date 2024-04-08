const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_51P2SATSFybd2lZ6RmuGjDilLwqr1dr3GqlPCZ8elqqJQEbOOOs1XxBNZMuZkBGtNsWdmbvYsndSbzMmdvq2ZMQqy00SbaHdQmg');

const app = express();
const PORT = 5000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/myapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define User schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // other fields...
});
app.use(cors({
    origin: "*"
}))

const User = mongoose.model('User', userSchema);

app.use(bodyParser.json());

// User registration endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        await User.create(req.body)
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.password !== password) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/update', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByIdAndUpdate(req.body._id, req.body);


        res.status(200).json({ message: 'Profile Update successful', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/createpayment', async (req, res) => {
    const { amount } = req.body;
    console.log(amount);
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert amount to cents
            currency: 'inr',


        });
        console.log(paymentIntent.client_secret);
        console.log(paymentIntent.amount);
        res.status(200).json({ paymentIntent: paymentIntent.client_secret });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
