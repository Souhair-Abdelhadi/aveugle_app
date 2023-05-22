import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { SafeAreaView,Text,View,ActivityIndicator,StyleSheet } from "react-native";



export default class Loading extends React.Component{


    componentDidMount(){
        setTimeout(async() => {
           const contacts = JSON.parse(await AsyncStorage.getItem('contacts'))
           if(contacts == null || contacts.length === 0){
            // console.log("list is empty")
            this.props.navigation.navigate("Contacts")
           }
           else{
            // console.log("redirect to app")
            this.props.navigation.navigate("App")
           }
        }, 3000);
    }

    render(){
        return (
            <SafeAreaView style={styles.container} >
                <View style={styles.contentView} >
                    <Text style={styles.text} >
                        <Text style={{color : "cyan"}} >A</Text>
                        <Text style={{color : 'white'}} >vous</Text>
                        <Text style={{color : 'cyan'}} >orienter</Text>
                    </Text>
                </View>
                <ActivityIndicator style={styles.indicator}  size={42} color={"white"}  />
            </SafeAreaView>
        )
    }


}

const styles = StyleSheet.create({
    container : {
        flex : 1,
        backgroundColor : "black",
        justifyContent : 'center',
        alignItems : 'center',
    },
    text : {
        fontSize : 25,
        color : 'white',
        fontWeight : 'bold',
        letterSpacing : 10
    },
    indicator : {
        marginTop : '15%'
    }
})