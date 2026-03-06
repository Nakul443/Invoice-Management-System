import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import invoiceRoutes from './routes/invoiceRoutes.js'; // Note the .js extension

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main Route
app.use('/api/invoices', invoiceRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is healthy' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});