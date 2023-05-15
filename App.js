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




// fichier principal
class App extends React.Component {

  state = {
    imageLoaded : false,
  }



  render(){
    return(
      <SafeAreaView style={styles.container} >
        {/* composant a ajouter sur application */}
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
