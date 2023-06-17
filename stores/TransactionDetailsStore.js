import { makeObservable, observable, action } from "mobx";
import axios from "axios";
import { ethers } from "ethers";
import "@ethersproject/shims"
import api from "../api.json";
class TransactionDetailsStore {
  transactionDetails = null;
  isLoading = false;
  error = "";

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

  setTransactionDetails(details) {
    this.transactionDetails = details;
  }

  setLoading(value) {
    this.isLoading = value;
  }

  setError(errorMessage) {
    this.error = errorMessage;
  }

  fetchBitcoinTransactionDetails(transactionHash) {
    this.setLoading(true);
    this.setError("");
    this.setTransactionDetails(null);

    axios
      .get(api.endpoints.getTxn+`${transactionHash}?includeHex=true`)
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
  async fetchPolygonTransactionDetails(txHash) {
    this.setLoading(true);
    this.setError("");
    this.setTransactionDetails(null);
    try {
      const provider = new ethers.providers.JsonRpcProvider(api.endpoints.plygonMumbai);
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
        fee: ethers.utils.formatUnits(transaction.gasPrice, 'gwei'),
        blockNumber: transaction.blockNumber,
        timestamp: block.timestamp,
        confirmations: block.confirmations,
        status: receipt.status === 1 ? 'Confirmed' : 'Pending',
      };
      this.setTransactionDetails(details);
      this.setLoading(false);
    } catch (error) {
      console.error('Error retrieving transaction details:', error);
      return null;
    }

  }

  fetchTransactionDetails(transactionHash, walletType) { 
    if(walletType === "bitcoin") {
      this.fetchBitcoinTransactionDetails(transactionHash);
    }
    else if (walletType === "polygon") {
      this.fetchPolygonTransactionDetails(transactionHash);
    }
  }
}

const transactionDetailsStore = new TransactionDetailsStore();

export default transactionDetailsStore;
