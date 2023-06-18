import React, { useState } from "react";
import { observer } from "mobx-react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { address as bitcoinAdress, networks } from "bitcoinjs-lib";
import cryptoStore from "./stores/TransactionStore";
import addressStore from "./stores/WalletStore";
import { ethers } from "ethers";
import { set } from "react-native-reanimated";

const TransactionScreen = observer(() => {
  const [senderAddress, setSenderAddress] = useState("");
  const [senderAddressWarning, setSenderAddressWarning] = useState(false);
  const [receiverAddress, setReceiverAddress] = useState("");
  const [manualReceiverAddress, setManualReceiverAddress] = useState("");
  const [emptyReceiverAddress, setEmptyReceiverAddress] = useState(false);
  const [noTransactionAmount, setNoTransactionAmount] = useState(false);
  const [showPickerWarning, setShowPickerWarning] = useState(false);
  const [invalidRecieverAddressWarning, setInvalidRecieverAddressWarning] = useState(false);
  const [invalidTransactionAmountWarning, setInvalidTransactionAmountWarning] = useState(false);
  const [adressesEqual, setAdressesEqual] = useState(false);
  const [
    showManualReceiverAddressWarning,
    setShowManualReceiverAddressWarning,
  ] = useState(false);
  const [walletType, setWalletType] = useState("");
  const [transactionAmount, setTransactionAmount] = useState('');

  const handleSenderAddressChange = (address) => {
    setSenderAddress(address);
    setShowPickerWarning(false);
  };

  const handleReceiverAddressChange = (address) => {
    setReceiverAddress(address);
    setShowPickerWarning(false);
  };

  const handleManualReceiverAddressChange = (address) => {
    setManualReceiverAddress(address);
    setShowManualReceiverAddressWarning(false);
  };

  const handleTransactionAmountChange = (amount) => {
    setTransactionAmount(amount);
  };

  const validateAddress = (address, walletType) => {
    if (walletType === "bitcoin"&&bitcoinAdress.toOutputScript(address, networks.testnet))
      return true;
    
    if (walletType == "polygon" && ethers.utils.isAddress(address))
      return true;

    return false;
  };

  const getCryptoObject = (address, walletType) => {
    let index;
    if (walletType === "bitcoin") {
      index = addressStore.bitcoinAddresses.findIndex(
        (item) => item.address === address
      );
      return addressStore.bitcoinAddresses[index];
    } else {
      index = addressStore.polygonAddresses.findIndex(
        (item) => item.address === address
      );
      return addressStore.polygonAddresses[index];
    }
  };

  const handleTransactionSubmit = () => {
    let isValid = true;
    setAdressesEqual(false);
    setSenderAddressWarning(false);
    setNoTransactionAmount(false);
    setInvalidRecieverAddressWarning(false);
    setInvalidTransactionAmountWarning(false);
    setEmptyReceiverAddress(false);
    cryptoStore.setTransactionCheckersFalse();

    if (!senderAddress) {
      setSenderAddressWarning(true);
      isValid = false;
    }

    if (!receiverAddress && !manualReceiverAddress) {
      setEmptyReceiverAddress(true);
      isValid = false;
    }

    if ((receiverAddress && manualReceiverAddress)) {
      setShowPickerWarning(true);
      setShowManualReceiverAddressWarning(true);
      isValid = false;
    }
    const finalReceiverAddress = receiverAddress || manualReceiverAddress;

    if ((finalReceiverAddress&&senderAddress)&&finalReceiverAddress === senderAddress) {
      setAdressesEqual(true);
      isValid = false;
    }
    
    if (receiverAddress&&!validateAddress(finalReceiverAddress, walletType)) {
      setInvalidRecieverAddressWarning(true);
      isValid = false;
    }

    if (!transactionAmount) {
      setNoTransactionAmount(true);
      isValid = false;
    }

    if (isNaN(Number(transactionAmount))) {
      setInvalidTransactionAmountWarning(true);
      isValid = false;
    }

    if (isValid) {
      const senderCryptoObject = getCryptoObject(senderAddress, walletType);

      cryptoStore.setSenderAddress(senderCryptoObject.address);
      cryptoStore.setSenderPrivateKey(senderCryptoObject.privateKey);
      cryptoStore.setRecipientAddress(finalReceiverAddress);
      cryptoStore.setTransactionAmount(Number(transactionAmount));

      if (walletType === "bitcoin") {
        cryptoStore.performBitcoinTransaction();
      } else {
        cryptoStore.performPolygonTransaction();
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          title="Bitcoin"
          onPress={() => setWalletType("bitcoin")}
          color={walletType === "bitcoin" ? "#2196F3" : "#CCCCCC"}
        />
        <Button
          title="Polygon"
          onPress={() => setWalletType("polygon")}
          color={walletType === "polygon" ? "#2196F3" : "#CCCCCC"}
        />
      </View>
      <Text style={styles.label}>Sender Address:</Text>
      <Picker
        selectedValue={senderAddress}
        onValueChange={handleSenderAddressChange}
        style={styles.picker}
      >
        <Picker.Item label="Select an address" value="" />
        {walletType === "bitcoin" &&
          addressStore.bitcoinAddresses.map((address) => (
            <Picker.Item
              key={address.address}
              label={address.address}
              value={address.address}
            />
          ))}
        {walletType === "polygon" &&
          addressStore.polygonAddresses.map((address) => (
            <Picker.Item
              key={address.address}
              label={address.address}
              value={address.address}
            />
          ))}
      </Picker>
      {senderAddressWarning && <Text style={styles.warning}>Please select a sender address.</Text>}

      <Text style={styles.label}>Receiver Address:</Text>
      <Picker
        selectedValue={receiverAddress}
        onValueChange={handleReceiverAddressChange}
        style={styles.picker}
      >
        <Picker.Item label="Select an address" value="" />
        {walletType === "bitcoin" &&
          addressStore.bitcoinAddresses.map((address) => (
            <Picker.Item
              key={address.address}
              label={address.address}
              value={address.address}
            />
          ))}
        {walletType === "polygon" &&
          addressStore.polygonAddresses.map((address) => (
            <Picker.Item
              key={address.address}
              label={address.address}
              value={address.address}
            />
          ))}
      </Picker>
      <TextInput
        style={styles.input}
        placeholder="Enter receiver address manually"
        value={manualReceiverAddress}
        onChangeText={handleManualReceiverAddressChange}
      />

      {emptyReceiverAddress && <Text style={styles.warning}>Please select a receiver address or input one.</Text>}

      {showPickerWarning && showManualReceiverAddressWarning && (
        <Text style={styles.warning}>
          Please select only one option for the receiver address.
        </Text>
      )}

      {invalidRecieverAddressWarning&& (
          <Text style={styles.warning}>Invalid receiver address.</Text>
        )}
      <TextInput
        style={styles.input}
        placeholder="Enter the transaction amount"
        value={transactionAmount}
        onChangeText={handleTransactionAmountChange}
      />
      {invalidTransactionAmountWarning && <Text style={styles.warning}>Invalid transaction amount.</Text>}
      <Button title="Submit Transaction" onPress={handleTransactionSubmit} />
      {adressesEqual && (
        <Text style={styles.warning}>
          Sender and receiver addresses cannot be the same.
        </Text>
      )}
      {noTransactionAmount && (
        <Text style={styles.warning}>Please enter a transaction amount.</Text>
      )}
      {cryptoStore.transactionSuccessFull && (
        <Text style={styles.success}>Transaction successful!</Text>
      )}
      {cryptoStore.transactionUnSuccessFull && (
        <Text style={styles.warning}>Transaction unsuccessful!</Text>
      )}
      {cryptoStore.isLoading && (
        <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />
      )}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  picker: {
    width: 300,
    height: 40,
    marginBottom: 20,
  },
  input: {
    width: 300,
    height: 40,
    borderWidth: 1,
    borderColor: "gray",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  warning: {
    color: "red",
    marginBottom: 10,
  },
  success: {
    color: "green",
    marginBottom: 10,
  },
  loader: {
    marginTop: 20,
  },
});

export default TransactionScreen;
