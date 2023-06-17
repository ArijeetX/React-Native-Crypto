import "@ethersproject/shims";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import PriceScreen from "./PriceScreen";
import WalletScreen from "./WalletScreen";
import TransactionScreen from "./TransactionScreen";
import PreviousTransactionsScreen from "./PreviousTransactionsScreen";
import TransactionDetailsScreen from "./TransactionDetailsScreen";

const Stack = createStackNavigator();

/**
 * The main application component.
 *
 * @returns {JSX.Element} The JSX element representing the application.
 */
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Price" component={PriceScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="Transaction" component={TransactionScreen} />
        <Stack.Screen
          name="PreviousTransactions"
          component={PreviousTransactionsScreen}
        />
        <Stack.Screen
          name="TransactionDetails"
          component={TransactionDetailsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
