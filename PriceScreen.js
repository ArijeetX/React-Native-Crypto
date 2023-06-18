import React from "react";
import { observer } from "mobx-react";
import { View, Text, StyleSheet, Button, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";

import priceStore from "./stores/PriceStore";
/**
 * 
 * React component for displaying the price screen.
 * @returns {JSX.Element} PriceScreen component.
 */
const PriceScreen = observer(() => {
  const { bitcoinPrice, utsdPrice } = priceStore;
  const navigation = useNavigation();

  /**
   * Navigates to the wallet screen.
   */
  const navigateToWalletScreen = () => {
    navigation.navigate("Wallet");
  };

  /**
   * Navigates to the transaction screen.
   */
  const navigateToTransactionScreen = () => {
    navigation.navigate("Transaction");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Bitcoin Price:</Text>
      <Text style={styles.price}>{bitcoinPrice}</Text>

      <Text style={styles.label}>UTSD Price:</Text>
      <Text style={styles.price}>{utsdPrice}</Text>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <Button
            style={styles.button}
            title="Go to Wallet"
            onPress={navigateToWalletScreen}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Button
            style={styles.button}
            title="Go to Transaction"
            onPress={navigateToTransactionScreen}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Button
            style={styles.button}
            title="Go to Previous Transactions"
            onPress={() => navigation.navigate("PreviousTransactions")}
          />
        </View>
      </View>
    </View>
  );
});

const { width } = Dimensions.get("window");

/**
 * Styles for the PriceScreen component.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.1,
  },
  label: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    marginBottom: width * 0.02,
  },
  price: {
    fontSize: width * 0.06,
    marginBottom: width * 0.05,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: width * 0.1,
    marginTop: width * 0.05,
    marginBottom: width * 0.05,
  },
  buttonWrapper: {
    marginBottom: width * 0.02, // Add margin bottom for spacing between buttons
  },
  button: {
    width: "100%",
    height: width * 0.12,
  },
});

export default PriceScreen;
