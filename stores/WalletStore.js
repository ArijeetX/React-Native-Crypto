import { action, makeObservable, observable } from "mobx";
import { payments, networks, address as bitcoinAddresses } from "bitcoinjs-lib";
import { ECPairFactory } from "ecpair";
import { Keyring } from "@polkadot/api";
import { hexToU8a, u8aToHex } from "@polkadot/util";
import "@ethersproject/shims"
import { ethers } from "ethers";
import api from "../api.json"
// You need to provide the ECC library. The ECC library must implement
// all the methods of the `TinySecp256k1Interface` interface.
import ecc from "@bitcoinerlab/secp256k1";
import { useNavigation } from '@react-navigation/native';

const ECPair = ECPairFactory(ecc);

class WalletStore {
  bitcoinAddresses = [];
  polygonAddresses = [];
  

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

  setBitcoinAddresses(bitcoinAddress) { 
    this.bitcoinAddresses.push(bitcoinAddress);
  }

  setPolygonAddresses(polygonAddress) {
    this.polygonAddresses.push(polygonAddress);
  }


  importBitcoinWallet(privateKey) {
    try {
      let keyPair;

      if (privateKey.length === 64) {
        // If the privateKey is in hexadecimal format
        keyPair = ECPair.fromPrivateKey(Buffer.from(privateKey, "hex"));
      } else {
        // If the privateKey is in Wallet Import Format (WIF)
        keyPair = ECPair.fromWIF(privateKey, networks.testnet);
      }

      const { address } = payments.p2pkh({ pubkey: keyPair.publicKey, network: networks.testnet });
      this.setBitcoinAddresses({address: address, privateKey: privateKey});
    } catch (error) {
      return false;
    }
    return true;
  }

  async importPolygonWallet(privateKey) {
    try {
      // Connect to the Mumbai Testnet
      //debugger;
      const provider = new ethers.providers.JsonRpcProvider(
        api.endpoints.plygonMumbai
      );
      // Create a wallet from the private key
      const wallet = new ethers.Wallet(privateKey, provider);
      
      // Get the address of the wallet
      const address = await wallet.getAddress();

      this.setPolygonAddresses({address: address, privateKey: privateKey});
    } catch (error) {
      return false;
    }
    return true;
  }
}

const walletStore = new WalletStore();
export default walletStore;
