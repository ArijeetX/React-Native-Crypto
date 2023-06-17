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

/**
 * Store for managing cryptocurrency transactions.
 */
class CryptoStore {
  /**
   * The sender's private key.
   * @type {string}
   */
  senderPrivateKey = "<sender Bitcoin private key>";

  /**
   * The sender's Bitcoin address.
   * @type {string}
   */
  senderAddress = "<sender Bitcoin address>";

  /**
   * The recipient's Bitcoin address.
   * @type {string}
   */
  recipientAddress = "<recipient Bitcoin address>";

  /**
   * The transaction amount in Bitcoin.
   * @type {number}
   */
  transactionAmount = 0.00000001;

  /**
   * The USDT contract address.
   * @type {string}
   */
  usdtContractAddress = "0x466DD1e48570FAA2E7f69B75139813e4F8EF75c2";

  /**
   * Array to store Bitcoin transaction history.
   * @type {Array<string>}
   */
  bitcoinTransactionHistory = [];

  /**
   * Array to store Polygon transaction history.
   * @type {Array<string>}
   */
  polygonTransactionHistory = [];

  /**
   * Flag indicating if the transaction was successful.
   * @type {boolean}
   */
  transactionSuccessFull = false;

  /**
   * Flag indicating if the transaction was unsuccessful.
   * @type {boolean}
   */
  transactionUnSuccessFull = false;

  /**
   * Flag indicating if a transaction is currently being processed.
   * @type {boolean}
   */
  isLoading = false;

  /**
   * Constructs an instance of the CryptoStore.
   */
  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Sets the transaction checkers (isLoading, transactionSuccessFull, transactionUnSuccessFull) to false.
   */
  setTransactionCheckersFalse() {
    this.isLoading = false;
    this.transactionSuccessFull = false;
    this.transactionUnSuccessFull = false;
  }

  /**
   * Sets the sender's private key.
   * @param {string} privateKey - The sender's private key.
   */
  setSenderPrivateKey(privateKey) {
    this.senderPrivateKey = privateKey;
  }

  /**
   * Sets the sender's Bitcoin address.
   * @param {string} address - The sender's Bitcoin address.
   */
  setSenderAddress(address) {
    this.senderAddress = address;
  }

  /**
   * Sets the recipient's Bitcoin address.
   * @param {string} address - The recipient's Bitcoin address.
   */
  setRecipientAddress(address) {
    this.recipientAddress = address;
  }

  /**
   * Sets the transaction amount in Bitcoin.
   * @param {number} amount - The transaction amount in Bitcoin.
   */
  setTransactionAmount(amount) {
    this.transactionAmount = amount;
  }

  /**
   * Sets the loading state.
   * @param {boolean} isLoading - The loading state value.
   */
  setIsLoading(isLoading) {
    this.isLoading = isLoading;
  }

  /**
   * Sets the transaction success state.
   * @param {boolean} transactionSuccessFull - The transaction success state value.
   */
  setTransactionSuccessFull(transactionSuccessFull) {
    this.transactionSuccessFull = transactionSuccessFull;
  }

  /**
   * Sets the transaction unsuccessful state.
   * @param {boolean} transactionUnSuccessFull - The transaction unsuccessful state value.
   */
  setTransactionUnSuccessFull(transactionUnSuccessFull) {
    this.transactionUnSuccessFull = transactionUnSuccessFull;
  }

  /**
   * Adds a transaction to the transaction history.
   * @param {string} transaction - The transaction to add.
   * @param {string} walletType - The type of wallet ('bitcoin' or 'polygon').
   */
  addTransactionHistory(transaction, walletType) {
    if (walletType === "polygon") {
      this.polygonTransactionHistory.push(transaction);
    } else {
      this.bitcoinTransactionHistory.push(transaction);
    }
  }

  /**
   * Performs a Bitcoin transaction.
   */
  async performBitcoinTransaction() {
    this.setIsLoading(true);
    try {
      const utxos = await this.getUTXOs(this.senderAddress);

      const psbt = new Psbt({ network: networks.testnet });
      psbt.setVersion(1);
      psbt.setLocktime(0);

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

      const amountSatoshi = sb.toSatoshi(Number(this.transactionAmount));

      psbt.addOutput({
        address: this.recipientAddress,
        value: amountSatoshi,
      });

      utxos.forEach((utxo, index) => {
        psbt.signInput(index, keyPair);
      });

      psbt.finalizeAllInputs();

      const tx = psbt.extractTransaction();
      const rawTransaction = tx.toHex();

      const txHash = await this.broadcastTransaction(rawTransaction);
      this.addTransactionHistory(txHash, "bitcoin");
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

  /**
   * Performs a Polygon transaction.
   */
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

  /**
   * Retrieves the unspent transaction outputs (UTXOs) for a given address.
   * @param {string} address - The address to retrieve UTXOs for.
   * @returns {Promise<Array>} - A promise that resolves to an array of UTXOs.
   */
  async getUTXOs(address) {
    const url = api.endpoints.utxo + `${address}?unspentOnly=true`;
    const response = await axios.get(url);
    return response.data.txrefs.filter((utxo) => !utxo.spent);
  }

  /**
   * Broadcasts a Bitcoin transaction to the Bitcoin network.
   * @param {string} rawTransaction - The raw transaction in hex format.
   * @returns {Promise<string>} - A promise that resolves to the transaction hash.
   */
  async broadcastTransaction(rawTransaction) {
    const url = "https://api.blockcypher.com/v1/btc/test3/txs/push";
    const response = await axios.post(url, { tx: rawTransaction });
    return response.data.tx.hash;
  }

  /**
   * Retrieves a Bitcoin transaction.
   * @param {string} txHash - The transaction hash.
   * @returns {Promise<Object>} - A promise that resolves to the Bitcoin transaction object.
   */
  async getBitcoinTransaction(txHash) {
    const url = api.endpoints.getTxn + `${txHash}?includeHex=true`;
    const response = await axios.get(url);
    return response.data;
  }
}

const cryptoStore = new CryptoStore();
export default cryptoStore;
