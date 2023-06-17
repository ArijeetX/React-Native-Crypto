import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { observer } from "mobx-react";
import { useNavigation } from "@react-navigation/native";
import transactionDetailsStore from "./stores/TransactionDetailsStore";
import cryptoStore from "./stores/TransactionStore";

const PreviousTransactionsScreen = observer(() => {
  const navigation = useNavigation();

  const handleTransactionPress = (transactionHash, walletType) => {
    navigation.navigate("TransactionDetails", { transactionHash, walletType });
  };

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

  const renderBitcoinTransactions = () => {
    return (
      <>
        <Text style={styles.subtitle}>Bitcoin Transactions:</Text>
        {renderTransactionHistory(cryptoStore.bitcoinTransactionHistory, "bitcoin")}
      </>
    );
  };

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
