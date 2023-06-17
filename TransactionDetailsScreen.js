/**
 * React component for displaying transaction details.
 * @param {object} route - The route object containing the transactionHash and walletType parameters.
 * @returns {JSX.Element} TransactionDetailsScreen component.
 */
const TransactionDetailsScreen = observer(({ route }) => {
  const { transactionHash, walletType } = route.params;

  /**
   * Fetches transaction details on component mount.
   */
  useEffect(() => {
    transactionDetailsStore.fetchTransactionDetails(transactionHash, walletType);
    console.log(transactionDetailsStore.transactionDetails);
  }, [transactionHash, walletType]);

  const { transactionDetails, isLoading, error } = transactionDetailsStore;

  /**
   * Opens the transaction link in a web browser.
   */
  const openTransactionLink = () => {
    let url = "";
    if (walletType === "bitcoin") {
      url = `https://live.blockcypher.com/btc-testnet/tx/${transactionHash}`;
    } else if (walletType === "polygon") {
      url = `https://mumbai.polygonscan.com/tx/${transactionHash}`;
    }
    Linking.openURL(url);
  };

  const { width, height } = Dimensions.get("window");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoading && <Text style={styles.text}>Loading transaction details...</Text>}
      {error && <Text style={styles.errorText}>Error: {error}</Text>}
      {transactionDetails && (
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Transaction Details</Text>
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Transaction Hash:</Text>
              <TouchableOpacity onPress={openTransactionLink}>
                <Text style={styles.link} numberOfLines={1}>{transactionDetails.hash}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Fee:</Text>
              <Text style={styles.value}>{transactionDetails.fee}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Confirmations:</Text>
              <Text style={styles.value}>{transactionDetails.confirmations}</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
});

/**
 * Styles for the TransactionDetailsScreen component.
 */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    marginBottom: 10,
  },
  contentContainer: {
    width: "100%",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  detailsContainer: {
    backgroundColor: "#F5F5F5",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    maxWidth: 400, // Adjust the maximum width as needed
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    fontWeight: "bold",
    marginRight: 10,
  },
  value: {
    flex: 1,
  },
  link: {
    color: "blue",
    textDecorationLine: "underline",
  },
});

export default TransactionDetailsScreen;
