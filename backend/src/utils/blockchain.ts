import { ethers } from 'ethers';

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const ALCHEMY_NETWORK = process.env.ALCHEMY_NETWORK || 'eth-mainnet';

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

export { provider };