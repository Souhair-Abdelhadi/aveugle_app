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
import SendMyLOcation from './components/SendMyLocation';






class App extends React.Component {

  state = {
    imageLoaded : false,
  }



  render(){
    return(
      <SafeAreaView style={styles.container} >
        <SendMyLOcation />
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container : {
    flex : 1,
  },

});

export default App;
