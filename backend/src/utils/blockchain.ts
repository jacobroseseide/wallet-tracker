import { ethers } from 'ethers';

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const ALCHEMY_NETWORK = process.env.ALCHEMY_NETWORK || 'mainnet';

if (!ALCHEMY_API_KEY) {
  throw new Error('ALCHEMY_API_KEY is not set in environment variables');
}

// Create provider
const provider = new ethers.AlchemyProvider(ALCHEMY_NETWORK, ALCHEMY_API_KEY);

export const getBlockNumber = async (): Promise<number> => {
  return await provider.getBlockNumber();
};

export const getBalance = async (address: string): Promise<string> => {
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
};

interface FormattedTransaction {
    hash: string;
    from: string;
    to: string | null;
    value: string;
    timestamp: string;
    blockNumber: string;
    category: string;
  }
  
  export const getWalletTransactions = async (
    address: string, 
    limit: number = 10
  ): Promise<FormattedTransaction[]> => {
    try {
      // Validate address
      if (!ethers.isAddress(address)) {
        throw new Error('Invalid Ethereum address');
      }
  
      // Use Alchemy's Enhanced API
      const url = `https://eth-${ALCHEMY_NETWORK}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'alchemy_getAssetTransfers',
          params: [
            {
              fromAddress: address,
              category: ['external', 'internal', 'erc20', 'erc721', 'erc1155'],
              maxCount: `0x${limit.toString(16)}`,
              order: 'desc'
            }
          ]
        })
      });
  
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
  
      const transfers = data.result.transfers || [];
      
      const formattedTxs = transfers.map((tx: any) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value?.toString() || '0',
        timestamp: tx.metadata?.blockTimestamp || 'Unknown',
        blockNumber: tx.blockNum,
        category: tx.category
      }));
      
      return formattedTxs;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  };