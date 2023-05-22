/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Text,
  Image,
  View,
} from 'react-native';
import SendMyLocation from './components/SendMyLocation';
import Contacts from './components/Contacts';
import { calculateDistance } from './helpers/functions';
import Loading from './components/Loading';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChangeContacts from './components/ChangeContacts';



const Stack = createNativeStackNavigator();

function App() {

  
  return (
    
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Loading' >
        <Stack.Screen name="Loading" component={Loading} options={{
          headerShown : false
        }} />
        <Stack.Screen name="Contacts" component={Contacts} options={{
          headerShown : false
        }} />
        <Stack.Screen name="App" component={SendMyLocation} options={{
          headerShown : false
        }}/>
        <Stack.Screen name="Change" component={ChangeContacts} options={{
          headerShown : false
        }}/>
      </Stack.Navigator>
    </NavigationContainer>

    // <ChangeContacts />
  );

}


export default App;


{/* <SafeAreaView style={styles.container} >
composant a ajouter sur application
<SendMyLOcation />
<Contacts />
<Loading />
</SafeAreaView> */}