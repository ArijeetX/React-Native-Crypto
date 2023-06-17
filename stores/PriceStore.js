import { action, makeAutoObservable, runInAction } from "mobx";
import axios from "axios";
import api from "../api.json";

/**
 * Store for managing Bitcoin and USD prices.
 */
class PriceStore {
  /**
   * Current price of Bitcoin.
   * @type {number}
   */
  bitcoinPrice = 0;

  /**
   * Current price of USD.
   * @type {number}
   */
  utsdPrice = 0;

  /**
   * Creates an instance of PriceStore.
   */
  constructor() {
    makeAutoObservable(this);
    this.fetchPrices();
    this.fetchPeriodically();
  }

  /**
   * Fetches prices periodically.
   */
  fetchPeriodically() {
    setInterval(() => {
      this.fetchPrices();
    }, 10000);
  }

  /**
   * Sets the prices of Bitcoin and USD.
   * @param {number} bitcoinPrice - The price of Bitcoin.
   * @param {number} utsdPrice - The price of USD.
   */
  setPrices(bitcoinPrice, utsdPrice) { 
    this.bitcoinPrice = bitcoinPrice;
    this.utsdPrice = utsdPrice;
  }

  /**
   * Fetches the prices of Bitcoin and USD from the API.
   * @returns {Promise<void>} A promise that resolves when the prices are fetched.
   */
  async fetchPrices() {
    try {
      const response = await axios.get(api.endpoints.coingecko);
      runInAction(() => {
        this.setPrices(response.data.bitcoin.usd, response.data.usd.usd);
      });
    } catch (error) {
      console.error("Error fetching prices:", error);
    }
  }
}

/**
 * An instance of the PriceStore class.
 * @type {PriceStore}
 */
const priceStore = new PriceStore();
export default priceStore;
