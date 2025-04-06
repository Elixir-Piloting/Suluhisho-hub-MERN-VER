const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connect = require('./config/connect.js');
const authRoutes = require('./routes/auth.routes.js');
const profileRoutes = require('./routes/profile.routes.js');
const cookieParser = require('cookie-parser');
const postRoutes = require('./routes/post.routes.js');
const adminRoutes = require('./routes/admin.routes.js');

const corsOptions = {
    origin: "http://localhost:5173", // Make sure there are no trailing slashes
    credentials: true, // Set to true for allowing credentials (cookies, HTTP authentication)
  };

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

connect(); 
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/post', postRoutes)
app.use('/api/admin',adminRoutes)

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
