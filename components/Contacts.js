import React from "react";
import {SafeAreaView,Text,TouchableOpacity,Keyboard,TextInput,
    TouchableWithoutFeedback,ScrollView,StyleSheet,View} from 'react-native'
import AsyncStorage from "@react-native-async-storage/async-storage";


export default class Contacts extends React.Component {

    state = {
        contacts : [""],
    }


    printListContact = async () => {
        // console.log("list contact",this.state.contacts)
        await AsyncStorage.setItem("contacts",JSON.stringify(this.state.contacts))
        this.props.navigation.navigate("App")
    }


    getInput = (index) => {
        return <View style={styles.inputView} key={index} >
            <TextInput value={this.state.contacts[index]} onChangeText={(value) =>{
                this.state.contacts[index] = value
                this.setState({contacts : this.state.contacts})
            }}
                placeholder="Put a number here"
                style={styles.input}
                keyboardType="phone-pad"
                maxLength={10}
                placeholderTextColor={"black"}
            />

            <TouchableOpacity onPress={()=>{
                this.state.contacts.push("")
                this.setState({contacts : this.state.contacts})
            }} style={styles.plusButton} >
                <Text style={styles.plusText} >+</Text>
            </TouchableOpacity>

        </View>
    }


    render() {
        return (
            <SafeAreaView style={styles.container} >
                <View style={styles.header} >
                    <Text style={styles.headerText} >Liste de contacts</Text>
                </View>
                <View style={styles.body} >
                    <ScrollView
                        style={styles.scroll}
                    >
                        {
                            this.state.contacts.map((value,index)=>{
                                return this.getInput(index)
                            })
                        }
                    </ScrollView>
                </View>
                <View style={styles.saveButtonView} >
                    <TouchableOpacity style={styles.saveButton} onPress={()=> this.printListContact() } >
                        <Text style={styles.saveText} >Enregistrer</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

}


const styles = StyleSheet.create({
    container : {
        flex : 1,
        backgroundColor : '#565d54'
    },
    header : {
        height : 100,
        justifyContent : 'center',
        alignItems : 'center',
        backgroundColor : '#D9EAD3',
        borderBottomRightRadius : 40
    },
    headerText : {
        fontSize : 20,
        fontWeight : 'bold',
        color : "black",
    },
    body : {
        flex : 1,
        marginTop : '10%',
        borderTopWidth : 2,
        borderTopRightRadius : 10,
        borderTopLeftRadius : 10,
        borderTopColor : '#2b2e2a',
        backgroundColor : '#D9EAD3',
    },
    inputView : {
        width : "90%",
        alignSelf : "center",
        marginTop : "4%",
        marginBottom : "2%",
        flexDirection : 'row',
        justifyContent : 'space-between'
    },
    input : {
        borderWidth : 2,
        borderColor : '#2b2e2a',
        height : 40,
        width : "80%",
        color : "black",
        fontSize : 18,
        borderRadius : 5
    },
    plusButton : {
        backgroundColor : "#a2cdf5",
        width : 30,
        height : 30,
        borderRadius : 5,
        marginTop : '2%',
        alignItems : 'center',
    },
    plusText : {
        fontSize : 30,
        fontWeight : 'bold',
        marginTop : '-20%',
    },
    scroll : {
        marginTop : "10%",
        marginBottom : '5%',
    },
    saveButtonView : {
        justifyContent : 'center',
        alignItems : 'center',
        backgroundColor : '#D9EAD3'
    },
    saveButton : {
        height : 90,
        width : 90,
        borderRadius : 90/2,
        backgroundColor : '#a2cdf5',
        justifyContent : 'center',
        alignItems : 'center'
    },
    saveText : {
        fontSize : 16,
        fontWeight : 'bold'
    }
})