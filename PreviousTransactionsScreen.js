import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { observer } from "mobx-react";
import { useNavigation } from "@react-navigation/native";
import transactionDetailsStore from "./stores/TransactionDetailsStore";
import cryptoStore from "./stores/TransactionStore";
/**
 * React component for displaying the previous transactions screen.
 * @returns {JSX.Element} PreviousTransactionsScreen component.
 */
const PreviousTransactionsScreen = observer(() => {
  const navigation = useNavigation();

  /**
   * Handles the press event when a transaction is selected.
   * @param {string} transactionHash - The hash of the transaction.
   * @param {string} walletType - The type of wallet associated with the transaction.
   */
  const handleTransactionPress = (transactionHash, walletType) => {
    navigation.navigate("TransactionDetails", { transactionHash, walletType });
  };

  /**
   * Renders the transaction history for a specific wallet type.
   * @param {string[]} transactions - The array of transactions.
   * @param {string} walletType - The type of wallet associated with the transactions.
   * @returns {JSX.Element[]} Array of transaction links.
   */
  const renderTransactionHistory = (transactions, walletType) => {
    return transactions.map((transaction, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => handleTransactionPress(transaction, walletType)}
      >
        <Text style={styles.transactionLink}>
          Transaction: {transaction}
        </Text>
      </TouchableOpacity>
    ));
  };

  /**
   * Renders the Bitcoin transactions.
   * @returns {JSX.Element} Bitcoin transactions.
   */
  const renderBitcoinTransactions = () => {
    return (
      <>
        <Text style={styles.subtitle}>Bitcoin Transactions:</Text>
        {renderTransactionHistory(cryptoStore.bitcoinTransactionHistory, "bitcoin")}
      </>
    );
  };

  /**
   * Renders the Polygon transactions.
   * @returns {JSX.Element} Polygon transactions.
   */
  const renderPolygonTransactions = () => {
    return (
      <>
        <Text style={styles.subtitle}>Polygon Transactions:</Text>
        {renderTransactionHistory(cryptoStore.polygonTransactionHistory, "polygon")}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Previous Transactions</Text>
      {renderBitcoinTransactions()}
      {renderPolygonTransactions()}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  transactionLink: {
    color: "blue",
    textDecorationLine: "underline",
    marginBottom: 5,
  },
});

export default PreviousTransactionsScreen;
