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

const TransactionScreen = observer(() => {
  const [senderAddress, setSenderAddress] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [manualSenderAddress, setManualSenderAddress] = useState("");
  const [manualReceiverAddress, setManualReceiverAddress] = useState("");
  const [noTransactionAmount, setNoTransactionAmount] = useState(false);
  const [showPickerWarning, setShowPickerWarning] = useState(false);
  const [adressesEqual, setAdressesEqual] = useState(false);
  const [showManualSenderAddressWarning, setShowManualSenderAddressWarning] =
    useState(false);
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

  const handleManualSenderAddressChange = (address) => {
    setManualSenderAddress(address);
    setShowManualSenderAddressWarning(false);
  };

  const handleManualReceiverAddressChange = (address) => {
    setManualReceiverAddress(address);
    setShowManualReceiverAddressWarning(false);
  };

  const handleTransactionAmountChange = (amount) => {
    setTransactionAmount(amount);
  };

  const validateAddress = (address) => {
    if (bitcoinAdress.toOutputScript(address, networks.testnet)) {
      return true;
    }
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
    setNoTransactionAmount(false);

    if ((!senderAddress && !manualSenderAddress) || (senderAddress && manualSenderAddress)) {
      setShowPickerWarning(true);
      setShowManualSenderAddressWarning(true);
      isValid = false;
      return;
    }

    if ((!receiverAddress && !manualReceiverAddress) || (receiverAddress && manualReceiverAddress)) {
      setShowPickerWarning(true);
      setShowManualReceiverAddressWarning(true);
      isValid = false;
      return;
    }

    if (senderAddress === receiverAddress) {
      setAdressesEqual(true);
      isValid = false;
      return;
    }

    if (!transactionAmount) {
      setNoTransactionAmount(true);
      isValid = false;
      return;
    }

    if (isValid) {
      const finalSenderAddress = senderAddress || manualSenderAddress;
      const finalReceiverAddress = receiverAddress || manualReceiverAddress;
      const senderCryptoObject = getCryptoObject(finalSenderAddress, walletType);
      const receiverCryptoObject = getCryptoObject(finalReceiverAddress, walletType);

      cryptoStore.setSenderAddress(senderCryptoObject.address);
      cryptoStore.setSenderPrivateKey(senderCryptoObject.privateKey);
      cryptoStore.setRecipientAddress(receiverCryptoObject.address);
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
      <TextInput
        style={styles.input}
        placeholder="Enter sender address manually"
        value={manualSenderAddress}
        onChangeText={handleManualSenderAddressChange}
      />

      {showPickerWarning && showManualSenderAddressWarning && (
        <Text style={styles.warning}>
          Please select only one option for the sender address.
        </Text>
      )}

      {showManualSenderAddressWarning &&
        !validateAddress(manualSenderAddress) && (
          <Text style={styles.warning}>Invalid sender address.</Text>
        )}

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

      {showPickerWarning && showManualReceiverAddressWarning && (
        <Text style={styles.warning}>
          Please select only one option for the receiver address.
        </Text>
      )}

      {showManualReceiverAddressWarning &&
        !validateAddress(manualReceiverAddress) && (
          <Text style={styles.warning}>Invalid receiver address.</Text>
        )}
      <TextInput
        style={styles.input}
        placeholder="Enter the transaction amount"
        value={transactionAmount}
        onChangeText={handleTransactionAmountChange}
      />
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
