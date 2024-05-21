import { ethers } from 'ethers';
import pkg from 'ethers-multicall-provider';
import fs from 'fs';
const { MulticallWrapper } = pkg;

const rpc =
  'https://ethereum-mainnet.core.chainstack.com/06bf7f5770dd4ff777a669d0cabe3f57';
const defaultProvider = new ethers.JsonRpcProvider(rpc);
const provider = MulticallWrapper.wrap(defaultProvider);

const erc20abi = JSON.parse(fs.readFileSync('erc20abi.json'));

// Replace with the USDT contract address
const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';

let contract = new ethers.Contract(usdtAddress, erc20abi, provider);

function readLines(filePath) {
  const data = fs.readFileSync(filePath, 'utf-8');
  const lines = data.split('\n').map(line => line.trim());
  return lines;
}

// List of 100 addresses to check the balance of
const addresses = readLines('addresses.txt');

// Function to check balances using multicall
async function checkBalances() {
  // Create an array of balanceOf calls
  const balanceCalls = addresses.map(address => contract.balanceOf(address));

  // Perform the multicall
  const balances = await Promise.all(balanceCalls);

  // Convert balances to a readable format (assuming USDT has 6 decimals)
  const formattedBalances = balances.map(balance => ethers.formatUnits(balance, 6));

  // Log the balances
  addresses.forEach((address, index) => {
    const line = `${address} ${formattedBalances[index]} USDT`;
    console.log(line);
    fs.appendFileSync('result.txt', `${line}\n`);
  });
}

// Run the balance check
const startTime = performance.now();
await checkBalances().catch(console.error);
const endTime = performance.now();
const time = endTime - startTime;
console.log(time);
