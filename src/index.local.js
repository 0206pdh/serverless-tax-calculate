import 'dotenv/config';
import { connectDB } from './config/database.js';
import app from './app.js';

const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] === 'http') {
    res.redirect(`https://${req.headers.host}${req.url}`);
  } else {
    next();
  }
});

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
})();
