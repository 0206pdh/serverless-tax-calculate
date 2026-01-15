import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { rateLimiter, xssProtection, corsOptions } from './middleware/security.js';
import { errorHandler } from './utils/error.js';
import { httpLogger, errorLogger } from './utils/logger.js';
import { SECURITY_HEADERS } from './config/security.js';
import routes from './api/routes/index.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(helmet.contentSecurityPolicy(SECURITY_HEADERS));
app.use(cors(corsOptions));
app.use(rateLimiter);
app.use(xssProtection);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(httpLogger);

app.use(express.static(publicDir));
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.use('/api', routes);

app.use(errorLogger);
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Resource not found.'
  });
});

export default app;
