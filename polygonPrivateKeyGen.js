const { ethers } = require('ethers');

/**
 * Generates a new Polygon address and logs it along with the private key.
 * @returns {Promise<void>} A Promise that resolves once the address and private key are logged.
 */
async function generatePolygonAddress() {
  // Connect to the Mumbai Testnet
  const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com/v1/5e35334230e91d7f7eebfa65fee2613d09832437');

  // Generate a new wallet
  const wallet = ethers.Wallet.createRandom();

  // Connect the wallet to the provider
  const connectedWallet = wallet.connect(provider);

  // Get the address of the wallet
  const address = await connectedWallet.getAddress();

  console.log('Polygon Address:', address);
  console.log('Private Key:', wallet.privateKey);
}

generatePolygonAddress();
