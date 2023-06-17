import { action, makeAutoObservable } from "mobx";
import { networks, payments, Psbt, Transaction } from "bitcoinjs-lib";
import axios from "axios";
import ecc from "@bitcoinerlab/secp256k1";
import { ECPairFactory } from "ecpair";
import bitcoinMessage from "bitcoinjs-message";
import sb from "satoshi-bitcoin";
import { ethers } from "ethers";
import "@ethersproject/shims";
import api from "../api.json";
const ECPair = ECPairFactory(ecc);

class CryptoStore {
  senderPrivateKey = "<sender Bitcoin private key>";
  senderAddress = "<sender Bitcoin address>";
  recipientAddress = "<recipient Bitcoin address>";
  transactionAmount = 0.00000001;
  usdtContractAddress = "0x466DD1e48570FAA2E7f69B75139813e4F8EF75c2";
  bitcoinTransactionHistory = [];
  polygonTransactionHistory = [];
  transactionSuccessFull = false;
  transactionUnSuccessFull = false;
  isLoading = false;
  constructor() {
    makeAutoObservable(this);
  }

  setTransactionCheckersFalse() {
    this.isLoading = false;
    this.transactionSuccessFull = false;
    this.transactionUnSuccessFull = false;
  }

  setSenderPrivateKey(privateKey) {
    this.senderPrivateKey = privateKey;
  }

  setSenderAddress(address) {
    this.senderAddress = address;
  }

  setRecipientAddress(address) {
    this.recipientAddress = address;
  }

  setTransactionAmount(amount) {
    this.transactionAmount = amount;
  }

  setIsLoading(isLoading) {
    this.isLoading = isLoading;
  }

  setTransactionSuccessFull(transactionSuccessFull) {
    this.transactionSuccessFull = transactionSuccessFull;
  }

  setTransactionUnSuccessFull(transactionUnSuccessFull) {
    this.transactionUnSuccessFull = transactionUnSuccessFull;
  }

  addTransactionHistory(transaction, walletType) {
    if (walletType === "polygon") {
      this.polygonTransactionHistory.push(transaction);
      return;
    }
    this.bitcoinTransactionHistory.push(transaction);
  }

  async performBitcoinTransaction() {
    //debugger
    this.setIsLoading(true);
    try {
      // Get unspent transaction outputs (UTXOs) for the sender address
      const utxos = await this.getUTXOs(this.senderAddress);

      // Create a new Partially Signed Bitcoin Transaction (PSBT)
      const psbt = new Psbt({ network: networks.testnet });

      // Set the transaction version and locktime
      psbt.setVersion(1);
      psbt.setLocktime(0);

      // Add inputs to the PSBT
      const keyPair = ECPair.fromWIF(this.senderPrivateKey, networks.testnet);
      for (const utxo of utxos) {
        const tx = await this.getBitcoinTransaction(utxo.tx_hash);
        const output = tx.outputs[utxo.tx_output_n];

        psbt.addInput({
          hash: utxo.tx_hash,
          index: utxo.tx_output_n,
          nonWitnessUtxo: Buffer.from(tx.hex, "hex"),
        });
      }

      // Convert transaction amount from Bitcoin to Satoshi
      const amountSatoshi = sb.toSatoshi(Number(this.transactionAmount));
      console.log(amountSatoshi);
      // Add output to the recipient address
      psbt.addOutput({
        address: this.recipientAddress,
        value: amountSatoshi,
      });

      // Sign the inputs with the private key
      utxos.forEach((utxo, index) => {
        psbt.signInput(index, keyPair);
      });

      // Finalize the PSBT
      psbt.finalizeAllInputs();

      // Extract the fully signed transaction
      const tx = psbt.extractTransaction();

      // Serialize the transaction to hex string
      const rawTransaction = tx.toHex();

      // Broadcast the transaction to the Bitcoin network
      const txHash = await this.broadcastTransaction(rawTransaction);
      this.addTransactionHistory(txHash);
    } catch (error) {
      console.error("Error performing the Bitcoin transaction:", error);
      this.setTransactionUnSuccessFull(true);
      this.setTransactionSuccessFull(false);
      this.setIsLoading(false);
      return;
    }
    this.setTransactionSuccessFull(true);
    this.setTransactionUnSuccessFull(true);
    this.setIsLoading(false);
  }

  async performPolygonTransaction() {
    this.setIsLoading(true);
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        api.endpoints.plygonMumbai
      );
      const wallet = new ethers.Wallet(this.senderPrivateKey, provider);

      const usdtContract = new ethers.Contract(
        this.usdtContractAddress,
        [
          "function transfer(address _to, uint256 _value) external returns (bool)",
        ],
        wallet
      );
      const gasPrice = ethers.utils.parseUnits("10", "gwei");
      const gasLimit = await usdtContract.estimateGas.transfer(
        this.recipientAddress,
        this.transactionAmount
      );
      const transaction = await usdtContract.transfer(
        this.recipientAddress,
        this.transactionAmount,
        {
          gasPrice,
          gasLimit,
        }
      );

      const receipt = await transaction.wait();
      const txHash = receipt.transactionHash;
      this.addTransactionHistory(txHash, "polygon");
    } catch (error) {
      console.error("Error performing the USDT transaction:", error);
      this.setTransactionUnSuccessFull(true);
      this.setTransactionSuccessFull(false);
      this.setIsLoading(false);
      return;
    }
    this.setTransactionSuccessFull(true);
    this.setTransactionUnSuccessFull(false);
    this.setIsLoading(false);
  }

  async getUTXOs(address) {
    const url = api.endpoints.utxo + `${address}?unspentOnly=true`;
    const response = await axios.get(url);
    return response.data.txrefs.filter((utxo) => !utxo.spent);
  }

  async broadcastTransaction(rawTransaction) {
    const url = "https://api.blockcypher.com/v1/btc/test3/txs/push";
    const response = await axios.post(url, { tx: rawTransaction });
    return response.data.tx.hash;
  }

  async getBitcoinTransaction(txHash) {
    const url = api.endpoints.getTxn + `${txHash}?includeHex=true`;
    const response = await axios.get(url);
    return response.data;
  }
}

const cryptoStore = new CryptoStore();
export default cryptoStore;
