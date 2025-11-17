import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'Wallet Tracker API is running!',
    timestamp: new Date().toISOString()
  });
});

// Blockchain endpoint
app.get('/api/blockchain/info', async (req: Request, res: Response) => {
  try {
    const { getBlockNumber } = await import('./utils/blockchain');
    const blockNumber = await getBlockNumber();
    
    res.json({
      blockNumber,
      network: process.env.ALCHEMY_NETWORK || 'eth-mainnet',
      connected: true
    });
  } catch (error) {
    console.error('Blockchain error:', error);
    res.status(500).json({ 
      error: 'Failed to connect to blockchain',
      connected: false 
    });
  }
});

// Get wallet transactions
app.get('/api/wallet/:address/transactions', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const { getWalletTransactions } = await import('./utils/blockchain');
    const transactions = await getWalletTransactions(address, limit);
    
    res.json({
      address,
      transactions,
      count: transactions.length
    });
  } catch (error: any) {
    console.error('Error fetching wallet transactions:', error);
    res.status(400).json({ 
      error: error.message || 'Failed to fetch transactions'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});