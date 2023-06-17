import { makeObservable, observable, action } from "mobx";
import axios from "axios";
import { ethers } from "ethers";
import "@ethersproject/shims";
import api from "../api.json";

/**
 * Store for managing transaction details.
 */
class TransactionDetailsStore {
  /**
   * The transaction details.
   * @type {Object|null}
   */
  transactionDetails = null;

  /**
   * Flag indicating if the transaction details are being loaded.
   * @type {boolean}
   */
  isLoading = false;

  /**
   * Error message related to fetching transaction details.
   * @type {string}
   */
  error = "";

  /**
   * Constructs an instance of the TransactionDetailsStore.
   */
  constructor() {
    makeObservable(this, {
      transactionDetails: observable,
      isLoading: observable,
      error: observable,
      setTransactionDetails: action,
      setLoading: action,
      setError: action,
      fetchTransactionDetails: action,
    });
  }

  /**
   * Sets the transaction details.
   * @param {Object} details - The transaction details.
   */
  setTransactionDetails(details) {
    this.transactionDetails = details;
  }

  /**
   * Sets the loading state.
   * @param {boolean} value - The loading state value.
   */
  setLoading(value) {
    this.isLoading = value;
  }

  /**
   * Sets the error message.
   * @param {string} errorMessage - The error message.
   */
  setError(errorMessage) {
    this.error = errorMessage;
  }

  /**
   * Fetches Bitcoin transaction details.
   * @param {string} transactionHash - The transaction hash.
   */
  fetchBitcoinTransactionDetails(transactionHash) {
    this.setLoading(true);
    this.setError("");
    this.setTransactionDetails(null);

    axios
      .get(api.endpoints.getTxn + `${transactionHash}?includeHex=true`)
      .then((response) => {
        const data = response.data;
        if (data) {
          this.setTransactionDetails(data);
        } else {
          this.setError("Failed to fetch transaction details");
        }
      })
      .catch(() => {
        this.setError("An error occurred while fetching transaction details");
      })
      .finally(() => {
        this.setLoading(false);
      });
  }

  /**
   * Fetches Polygon transaction details.
   * @param {string} txHash - The transaction hash.
   */
  async fetchPolygonTransactionDetails(txHash) {
    this.setLoading(true);
    this.setError("");
    this.setTransactionDetails(null);
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        api.endpoints.plygonMumbai
      );
      const transaction = await provider.getTransaction(txHash);

      // Retrieve additional transaction details
      const receipt = await provider.getTransactionReceipt(txHash);
      const block = await provider.getBlock(transaction.blockHash);

      // Extract relevant information
      const details = {
        hash: transaction.hash,
        from: transaction.from,
        to: transaction.to,
        value: ethers.utils.formatEther(transaction.value),
        fee: ethers.utils.formatUnits(transaction.gasPrice, "gwei"),
        blockNumber: transaction.blockNumber,
        timestamp: block.timestamp,
        confirmations: block.confirmations,
        status: receipt.status === 1 ? "Confirmed" : "Pending",
      };
      this.setTransactionDetails(details);
      this.setLoading(false);
    } catch (error) {
      console.error("Error retrieving transaction details:", error);
      return null;
    }
  }

  /**
   * Fetches transaction details based on the wallet type.
   * @param {string} transactionHash - The transaction hash.
   * @param {string} walletType - The wallet type ('bitcoin' or 'polygon').
   */
  fetchTransactionDetails(transactionHash, walletType) {
    if (walletType === "bitcoin") {
      this.fetchBitcoinTransactionDetails(transactionHash);
    } else if (walletType === "polygon") {
      this.fetchPolygonTransactionDetails(transactionHash);
    }
  }
}

const transactionDetailsStore = new TransactionDetailsStore();

export default transactionDetailsStore;
