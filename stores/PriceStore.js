import { action, makeAutoObservable, runInAction } from "mobx";
import axios from "axios";
import api from "../api.json"
class PriceStore {
  bitcoinPrice = 0;
  utsdPrice = 0;

  constructor() {
    makeAutoObservable(this);
    this.fetchPrices();
    this.fetchPeriodically();
  }

  fetchPeriodically() {
    setInterval(() => {
      this.fetchPrices();
    }, 10000);
  }

  setPrices(bitcoinPrice, utsdPrice) { 
    this.bitcoinPrice = bitcoinPrice;
    this.utsdPrice = utsdPrice;
  }

  async fetchPrices() {
    try {
      const response = await axios.get(
        api.endpoints.coingecko
      );
      this.setPrices(response.data.bitcoin.usd, response.data.usd.usd);
    } catch (error) {
      console.error("Error fetching prices:", error);
    }
  }
}

const priceStore = new PriceStore();
export default priceStore;
