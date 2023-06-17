import React, { useState } from "react";
import { View, Text, Button, StyleSheet, TextInput, ScrollView, Dimensions } from "react-native";
import { observer } from "mobx-react-lite";
import { useNavigation } from "@react-navigation/native";
import cryptoStore from "./stores/TransactionStore";
import walletStore from "./stores/WalletStore";

const { width } = Dimensions.get("window");

/**
 * Wallet screen component.
 * Displays wallet import functionality and navigation options.
 */
const WalletScreen = observer(() => {
  const [privateKey, setPrivateKey] = useState("");
  const [isInvalidPrivateKey, setIsInvalidPrivateKey] = useState(false);
  const [walletType, setWalletType] = useState("");
  const [selectedWalletType, setselectedWalletType] = useState(true);

  /**
   * Handles the import of the selected wallet type using the provided private key.
   */
  const handleImportWallet = () => {
    if (walletType === "") {
      setselectedWalletType(false);
      return;
    }
    if (walletType === "bitcoin") {
      if (walletStore.importBitcoinWallet(privateKey)) {
        setIsInvalidPrivateKey(false);
        setPrivateKey("");
      } else {
        setIsInvalidPrivateKey(true);
      }
    } else if (walletType === "polygon") {
      if (walletStore.importPolygonWallet(privateKey)) {
        setIsInvalidPrivateKey(false);
        setPrivateKey("");
      } else {
        setIsInvalidPrivateKey(true);
      }
    }
  };

  const navigation = useNavigation();

  /**
   * Navigates to the transaction screen.
   */
  const navigateToTransactionScreen = () => {
    cryptoStore.setTransactionCheckersFalse();
    navigation.navigate("Transaction");
  };

  /**
   * Navigates to the previous transactions screen.
   */
  const navigateToPreviousTransactionsScreen = () => {
    navigation.navigate("PreviousTransactions");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Import Wallet</Text>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <Button
            title="Bitcoin"
            style={styles.button}
            onPress={() => {
              setWalletType("bitcoin");
              setselectedWalletType(true);
            }}
            color={walletType === "bitcoin" ? "#2196F3" : "#CCCCCC"}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Button
            title="Polygon"
            style={styles.buttonWrapper}
            onPress={() => {
              setWalletType("polygon");
              setselectedWalletType(true);
            }}
            color={walletType === "polygon" ? "#2196F3" : "#CCCCCC"}
          />
        </View>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Private Key"
        value={privateKey}
        onChangeText={setPrivateKey}
        autoCapitalize="none"
      />
      {isInvalidPrivateKey && (
        <Text style={styles.warning}>Invalid private key</Text>
      )}
      {!selectedWalletType && (
        <Text style={styles.warning}>Please select wallet type</Text>
      )}
      <View style={styles.buttonContainerG}>
        <View style={styles.buttonWrap}>
          <Button
            title="Import Wallet"
            onPress={handleImportWallet}
            style={styles.button}
          />
        </View>
        <View style={styles.buttonWrap}>
          <Button
            style={styles.button}
            title="Go to Transaction"
            onPress={navigateToTransactionScreen}
          />
        </View>
        <View style={styles.buttonWrap}>
          <Button
            title="Go to Previous Transactions"
            onPress={navigateToPreviousTransactionsScreen}
          />
        </View>
      </View>
      {walletType === "bitcoin" &&
        walletStore.bitcoinAddresses.map((address, index) => (
          <Text key={index} style={styles.address}>
            Bitcoin Address: {address.address}
          </Text>
        ))}
      {walletType === "polygon" &&
        walletStore.polygonAddresses.map((address, index) => (
          <Text key={index} style={styles.address}>
            Polygon Address: {address.address}
          </Text>
        ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    marginBottom: 10,
    maxWidth: width * 0.7,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: width * 0.8,
    maxWidth: 400,
  },
  warning: {
    color: "red",
    marginBottom: 10,
  },
  buttonContainerG: {
    flexDirection: "column",
    marginBottom: 10,
    width: width * 0.8,
    maxWidth: 400,
  },
  buttonWrap: {
    marginBottom: 10,
  },
  address: {
    fontSize: 16,
    marginTop: 10,
  },
});

export default WalletScreen;
