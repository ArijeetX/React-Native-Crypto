import { action, makeObservable, observable } from "mobx";
import { payments, networks } from "bitcoinjs-lib";
import { ECPairFactory } from "ecpair";
import { Keyring } from "@polkadot/api";
import { hexToU8a, u8aToHex } from "@polkadot/util";
import { ethers } from "ethers";
import api from "../api.json";
import ecc from "@bitcoinerlab/secp256k1";
import { useNavigation } from '@react-navigation/native';

const ECPair = ECPairFactory(ecc);

class WalletStore {
  bitcoinAddresses = [];
  polygonAddresses = [];

  /**
   * Creates an instance of WalletStore.
   */
  constructor() {
    makeObservable(this, {
      bitcoinAddresses: observable,
      polygonAddresses: observable,
      importBitcoinWallet: action,
      importPolygonWallet: action,
      setBitcoinAddresses: action,
      setPolygonAddresses: action,
    });
  }

  /**
   * Sets the Bitcoin addresses.
   * @param {object} bitcoinAddress - The Bitcoin address object.
   */
  setBitcoinAddresses(bitcoinAddress) { 
    this.bitcoinAddresses.push(bitcoinAddress);
  }

  /**
   * Sets the Polygon addresses.
   * @param {object} polygonAddress - The Polygon address object.
   */
  setPolygonAddresses(polygonAddress) {
    this.polygonAddresses.push(polygonAddress);
  }

  /**
   * Imports a Bitcoin wallet using the provided private key.
   * @param {string} privateKey - The private key of the Bitcoin wallet.
   * @returns {boolean} - True if the wallet import was successful, false otherwise.
   */
  importBitcoinWallet(privateKey) {
    try {
      let keyPair;

      if (privateKey.length === 64) {
        keyPair = ECPair.fromPrivateKey(Buffer.from(privateKey, "hex"));
      } else {
        keyPair = ECPair.fromWIF(privateKey, networks.testnet);
      }

      const { address } = payments.p2pkh({ pubkey: keyPair.publicKey, network: networks.testnet });
      this.setBitcoinAddresses({ address: address, privateKey: privateKey });
    } catch (error) {
      return false;
    }
    return true;
  }

  /**
   * Imports a Polygon wallet using the provided private key.
   * @param {string} privateKey - The private key of the Polygon wallet.
   * @returns {boolean} - True if the wallet import was successful, false otherwise.
   */
  async importPolygonWallet(privateKey) {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        api.endpoints.plygonMumbai
      );
      const wallet = new ethers.Wallet(privateKey, provider);
      const address = await wallet.getAddress();

      this.setPolygonAddresses({ address: address, privateKey: privateKey });
    } catch (error) {
      return false;
    }
    return true;
  }
}

const walletStore = new WalletStore();
export default walletStore;
