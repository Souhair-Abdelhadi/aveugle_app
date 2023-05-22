// obligatoire pour fonctionnement
import React from "react";
// bach katssawab design dyal interface li f application, b7al button,image,couleur,text ...
import { SafeAreaView,Text,View,StyleSheet,PermissionsAndroid, NativeModules,DeviceEventEmitter, ScrollView, TouchableOpacity} from "react-native";
import Geolocation from "@react-native-community/geolocation";
// biblio li katkhalik ta3raf wach téléphone tankhad wla la
import RNShake from "react-native-shake"
// biblio li katkhalik tssifat sms direct lwa7ad namra
import SmsAndroid from 'react-native-get-sms-android';
import {calculateDistance, checkWiFiStatus, getSound} from "../helpers/functions"
// biblio katkhalik ta3raf wach mconnectet=r lwifi wla la
import NetInfo from '@react-native-community/netinfo'
//biblio katkhalik tkharaj sawt dyal wa7ad fichier, mp3 wla wav, etc ...
import Sound from 'react-native-sound'

import AsyncStorage from "@react-native-async-storage/async-storage";
import DeviceInfo from "react-native-device-info";

class SendMyLocation extends React.Component {
  constructor(props) {
    super(props);
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'always',
      locationProvider: 'auto',
    });
  }

  // objet fih les variables li ma7tajin
  state = {
    lockShake : false,// bach n7absso partage dyal sms, ila kan true ma3adnach l7a9 nssifto sms 7ta doz 3 minutes
    obstacle_bas : false,// bach n3arfo wach obstacle bas kayn wla la
    obstacle_haut : false, // bach n3arfo wach obstacle haut kayn wla la
    wifi : false,
    battery : 0,
    gps : false,
    connectedToESP32 : false,
    isConnected : false,
    confiance : null,
    lockConfiance : false,
    espEtatBatt100 : false,
    espEtatBatt75 : false,
    espEtatBatt25 : false,
  }

  // bach nssifto sms lwa7ad namra
  sendMsg = (phoneNumber,msg) => {
    SmsAndroid.autoSend(
      phoneNumber,
      msg,
      (fail) => {
        // console.log('Failed with this error: ' + fail);
      },
      (success) => {
        // console.log('SMS sent successfully');
      },
    );
  }


  _requestSmsPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        {
          title: 'SMS permission',
          message:
            'Need SMS permission to share your location in case of an urgency',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // console.log('You can SMS functionallity');
        return true;
      } else {
        // console.log('SMS permission denied');
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  requestSmsPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        {
          title: 'SMS permission',
          message:
            'Need SMS permission to share your location in case of an urgency',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.getCoordiantes();
        return true;
      } else {
        // console.log('SMS wasn\'t sent');
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
          title: 'Location permission',
          message:
            'Need GPS permission to share your location in case of an urgency',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // console.log('You can use the read my GPS data');
        return true;
      } else {
        // console.log('GPS permission denied');
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  // https://www.google.com/maps/search/?api=1&query=

  // khod les coordonnés dyal gps dyal téléphone
  getCoordiantes = () => {
    Geolocation.getCurrentPosition(
      position => {
        // console.log(position);
        const {latitude, longitude} = position.coords;
        // partager localisation dyali m3a contact li 7at
        this.shareMyLocation(latitude,longitude)
      },

      error => {
        // console.log('error', error);
      },
    );
  };

  // hna fen kayn partage dyal localisation lwa7ad namra
  shareMyLocation = async (latitude, longitude) => {

    // const msg = "I shared with you my location in order to find me because i think i'm lost, and sorry for any inconvience " +
    // ` https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    const contacts = JSON.parse(await AsyncStorage.getItem("contacts"))
    contacts.forEach(phoneNumber => {
      // console.log("phonenumber :",phoneNumber)
      const msg =
        "I shared with you my location in order to find me because i think i'm lost, and sorry for any inconvience " +
        ` https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      //const phoneNumber = '0608745953';
      this.sendMsg(phoneNumber,msg)
      // console.log("loaction shared")
      
    });

    var whoosh = new Sound(
      'sms.mp3',
      Sound.MAIN_BUNDLE,
      error => {
        if (error) {
          // console.log('failed to load the sound', error);
          return;
        }

        //------------------------------
        whoosh.play(success => {
          if (success) {
            // console.log('successfully finished playing');
          } else {
            // console.log('playback failed due to audio decoding errors',);
          }
        });
      },
    );
    
    // const msg =
    //     "I shared with you my location in order to find me because i think i'm lost, and sorry for any inconvience " +
    //     ` https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    //   //const phoneNumber = '0608745953';
    //   this.sendMsg(contacts[0],msg)

    // DirectSms.sendDirectSms(phoneNumber,msg)
    // this.sendMsg(phoneNumber,msg)
    // console.log("loaction shared")

  };



  // njibo les données mn ESP32 dyal les ultrasonics
  getHttpData = async () => {
    await NetInfo.fetch().then(state => {
      // console.log(state)
      if (state.isConnected === true && state.isWifiEnabled === true && state.details.ipAddress.search("192.168.3") == 0 ) {
        try {
          this.setState({connectedToESP32 : true})
          fetch(
            'http://192.168.3.1/' // mn had address ip li f wifi li mconnectin lih
          )
          // mn ta3tik les données dir hadchi
          .then(async (response) => {
            // console.log("status",response.status)
            if (response.status == 200) { // ila kan kolchi mzn makayn 7ta mochkil f réseau

              let json = await response.json(); // tssana 7ta takhod donnée kamal 3la had chkal {"bas_dis" : 1000,"haut_dist" : 1500}
              // console.log(json); // pour l'affichage 
              // console.log("bas_dist",json.bas_dist)
              if( this.state.espEtatBatt100 == false && json.etat_batt_esp == "100"){
                this.setState({  espEtatBatt75 : true});
                var whoosh = new Sound(
                  'esp_batterie_charge.mp3',
                  Sound.MAIN_BUNDLE,
                  error => {
                    if (error) {
                      // console.log('failed to load the sound', error);
                      return;
                    }
                    whoosh.play(success => {
                      if (success) {
                        // console.log('successfully finished playing');
                        this.setState({espEtatBatt100 : true})
                      } else {
                        // console.log('playback failed due to audio decoding errors',);
                      }
                    });
                  },
                );
              }
              if( this.state.espEtatBatt75 == false && json.etat_batt_esp == "75"){
                this.setState({  espEtatBatt75 : true});
                var whoosh = new Sound(
                  'esp_batterie_75.mp3',
                  Sound.MAIN_BUNDLE,
                  error => {
                    if (error) {
                      // console.log('failed to load the sound', error);
                      return;
                    }
                    whoosh.play(success => {
                      if (success) {
                        // console.log('successfully finished playing');
                        this.setState({espEtatBatt75 : true})
                      } else {
                        // console.log('playback failed due to audio decoding errors',);
                      }
                    });
                  },
                );
              }
              if( this.state.espEtatBatt25 == false && json.etat_batt_esp == "25"){
                var whoosh = new Sound(
                  'esp_batterie_25.mp3',
                  Sound.MAIN_BUNDLE,
                  error => {
                    if (error) {
                      // console.log('failed to load the sound', error);
                      return;
                    }
                    whoosh.play(success => {
                      if (success) {
                        // console.log('successfully finished playing');
                        this.setState({  espEtatBatt25 : true});
                      } else {
                        // console.log('playback failed due to audio decoding errors',);
                      }
                    });
                  },
                );
              }

              //this.setState({ sensor_value: json.sensor_value });

              // for bottom obstacle 
              // condition m7a9a9 9al mn 0.5m o makan 7ta obstacle mn 9bal
              if (json.bas_dist <= 500 &&  !this.state.obstacle_bas) {  // !false => true | !true => false
                var whoosh = new Sound(
                  'obstacle_devant_vous.wav',
                  Sound.MAIN_BUNDLE,
                  error => {
                    if (error) {
                      // console.log('failed to load the sound', error);
                      return;
                    }

                    // 7bass takhraj dyal sawt dyal obstacle devant vous, 7ta l9aw passage
                    this.setState({obstacle_bas: true});
                    //------------------------------
                    whoosh.play(success => {
                      if (success) {
                        // console.log('successfully finished playing');
                      } else {
                        // console.log(
                        //   'playback failed due to audio decoding errors',
                        // );
                      }
                    });
                  },
                );
              }

              // kharaj sawt ila makanch obstacle db walakin kan mn 9bal
              if (json.bas_dist > 500 && this.state.obstacle_bas) {
                var whoosh = new Sound(
                  'permission_de_passage.mp3',
                  Sound.MAIN_BUNDLE,
                  error => {
                    if (error) {
                      // console.log('failed to load the sound', error);
                      return;
                    }
                    whoosh.play(success => {
                      if (success) {
                        // console.log('successfully finished playing');
                        this.setState({obstacle_bas: false});
                      } else {
                        // console.log(
                        //   'playback failed due to audio decoding errors',
                        // );
                      }
                    });
                  },
                );
              }


              // for obstacle above
              // bach nkharjo sawt dyal obstacle li lfo9 khass lmassafa dyal obstacle li lfo9 tkon sghar mn 2m
              // o ma3andi 7ta obstacle bas o ma3andi 7ta obstacle haut
              if (json.haut_dist <= 2000 && !this.state.obstacle_bas &&  !this.state.obstacle_haut) {
                var whoosh = new Sound(
                  'obstacle_en_haut.wav',
                  Sound.MAIN_BUNDLE,
                  error => {
                    if (error) {
                      // console.log('failed to load the sound', error);
                      return;
                    }
                    this.setState({obstacle_haut: true});
                    whoosh.play(success => {
                      if (success) {
                        // console.log('successfully finished playing');
                      } else {
                        // console.log(
                        //   'playback failed due to audio decoding errors',
                        // );
                      }
                    });
                  },
                );
              }

              if (json.haut_dist > 2000 && this.state.obstacle_haut) {
                var whoosh = new Sound(
                  'permission_de_passage.mp3',
                  Sound.MAIN_BUNDLE,
                  error => {
                    if (error) {
                      // console.log('failed to load the sound', error);
                      return;
                    }
                    whoosh.play(success => {
                      if (success) {
                        // console.log('successfully finished playing');
                        this.setState({obstacle_haut: false});
                      } else {
                        // console.log(
                        //   'playback failed due to audio decoding errors',
                        // );
                      }
                    });
                  },
                );
              }


            }

            else {
              //throw new Error('HTTP response status not code 200 as expected.');
              // console.log("there is an error in the connection");
            }

          })
            .catch(e => {
              // console.log(e)
            });


        }
        catch (error) {
          // console.log(error);

        }
      }
      else { 

        this.setState(({connectedToESP32 : false}))

      }

    });

  };


  checkPlaceDistance = (myLat,myLong) => {

    const amphisDist = calculateDistance(myLat,myLong,33.7056591,-7.3546376)
    // console.log("amphi dist",amphisDist)
    if(amphisDist < 3){
      getSound('amphis.mp3')
    }
    const affaireDist = calculateDistance(myLat,myLong,33.7054521,-7.3549386)
    // console.log("affaire dist",affaireDist)
    if(affaireDist < 3){
      getSound('affaire_estudient.mp3')
    }
    const terrainDist = calculateDistance(myLat,myLong,33.7051726,-7.3546456)
    // console.log("terrain dist",terrainDist)
    if(terrainDist < 3){
      getSound('terrain.mp3')
    }
    const portDist = calculateDistance(myLat,myLong,33.705828,-7.355188)
    // console.log("port dist",portDist)
    if(portDist < 6){
      getSound('port_fstm.mp3')
    }

    // const repereDist = calculateDistance(myLat,myLong,33.7055171,-7.3548709)
    // console.log("repere dist",repereDist)
    // if(repereDist < 2){
    //   getSound('repere.mp3')
    // }


  }

  checkComponent = async () => {
    const net = await NetInfo.fetch()
    const batteryLevel = Math.round((await DeviceInfo.getBatteryLevel()) * 100)
    const wifi = net.isWifiEnabled
    const isConnected = net.isConnected
    const connectedToESP32 = net.details.ipAddress.search("192.168.3") == 0 ? true : false
    const gps = (await DeviceInfo.getAvailableLocationProviders()).gps
    // console.log("battery level :",batteryLevel)
    // console.log("wifi :",wifi ? "true" : "false")
    // console.log("isconnected :",isConnected ? "connected" : "not connected")
    // console.log("connectedToESP32 :",connectedToESP32? "connected" : "not connected")
    // console.log("gps :",gps ? "enabled" : "not")

    this.setState({
      wifi : wifi,
      battery : batteryLevel,
      isConnected : isConnected,
      connectedToESP32 : connectedToESP32,
      gps : gps
    })

    if (this.state.confiance == true && this.state.lockConfiance == false && (!gps || !connectedToESP32)){
      var whoosh = new Sound(
        'esp_pas_confiance.mp3',
        Sound.MAIN_BUNDLE,
        error => {
          if (error) {
            // console.log('failed to load the sound', error);
            return;
          }
          whoosh.play(success => {
            if (success) {
              // console.log('successfully finished playing');
              this.setState({obstacle_bas: false});
            } else {
              // console.log(
              //   'playback failed due to audio decoding errors',
              // );
            }
          });
        },
      );
      this.setState({confiance : false,lockConfiance : true})
    }
    else if(this.state.confiance == false && this.state.lockConfiance == false && gps && connectedToESP32 ){
      var whoosh = new Sound(
        'tous_fonctionne.mp3',
        Sound.MAIN_BUNDLE,
        error => {
          if (error) {
            // console.log('failed to load the sound', error);
            return;
          }
          whoosh.play(success => {
            if (success) {
              // console.log('successfully finished playing');
              this.setState({obstacle_bas: false});
            } else {
              // console.log(
              //   'playback failed due to audio decoding errors',
              // );
            }
          });
        },
      );
      this.setState({confiance : true,lockConfiance : true})
    }
    else if(this.state.confiance == false && this.state.lockConfiance == false  ){
      var whoosh = new Sound(
        'esp_pas_confiance.mp3',
        Sound.MAIN_BUNDLE,
        error => {
          if (error) {
            // console.log('failed to load the sound', error);
            return;
          }
          whoosh.play(success => {
            if (success) {
              // console.log('successfully finished playing');
              this.setState({obstacle_bas: false});
            } else {
              // console.log(
              //   'playback failed due to audio decoding errors',
              // );
            }
          });
        },
      );
      this.setState({lockConfiance : true})
    }
    

  }


  confianceApp = () => {
    if(this.state.confiance == null){
      if(!this.state.gps || !this.state.isConnected ){
        var whoosh = new Sound(
          'esp_pas_confiance.mp3',
          Sound.MAIN_BUNDLE,
          error => {
            if (error) {
              // console.log('failed to load the sound', error);
              return;
            }
            whoosh.play(success => {
              if (success) {
                // console.log('successfully finished playing');
                this.setState({obstacle_bas: false});
              } else {
                // console.log(
                //   'playback failed due to audio decoding errors',
                // );
              }
            });
          },
        );
        this.setState({confiance : false,lockConfiance : true})
      }
      else{
        var whoosh = new Sound(
          'tous_fonctionne.mp3',
          Sound.MAIN_BUNDLE,
          error => {
            if (error) {
              // console.log('failed to load the sound', error);
              return;
            }
            whoosh.play(success => {
              if (success) {
                // console.log('successfully finished playing');
                this.setState({obstacle_bas: false});
              } else {
                // console.log(
                //   'playback failed due to audio decoding errors',
                // );
              }
            });
          },
        );
        this.setState({confiance : true,lockConfiance : true})
      }
    }
  }


  componentDidMount() {
    this.confianceApp()
    this._requestSmsPermission()
    // this.requestRecordVoicePermission();

     this.dataRef =  setInterval(() => {

        this.getHttpData()
      
     }, 3000);

    //  this.getHttpData()

    // checkWiFiStatus()

    this.requestLocationPermission()
      .then(status => {
        if (status) {
          
        }
      })
      .catch(e => console.log(e));


      // ki tssanat li telephone wach tankhad, ila tankhad kissifat sms fih localisation dyali lwa7ad namra
      // o ki7bass l partage l 3 minutes
      this.shakeRef = RNShake.addListener(()=> {
        if(!this.state.lockShake){
          this.setState({lockShake : true})
          // console.log("phone is shaking -> share location")
          this.requestSmsPermission()
          
          // minuteur kitssana 7ta doz 3minutes 3ad kiraja3 liya l7a9 nssifat sms
          this. timeoutRef = setTimeout(() => {
            this.setState({lockShake : false})
          }, 3*60*1000);
        }
        
      })

      this.ref = DeviceEventEmitter.addListener('sms_onDelivery',(msg)=>{
        console.log(msg)
      })

      this.placeRef = setInterval(() => {
        Geolocation.getCurrentPosition(
          position => {
            console.log(position);
            const {latitude, longitude} = position.coords;
            this.checkPlaceDistance(latitude,longitude)
          },
    
          error => {
            console.log('error', error);
          },
        );
      }, 20*1000);

      this.checkComp = setInterval(() => {
        this.checkComponent()
      }, 5000);

      this.lockConfiance = setInterval(() => {
        if(this.state.lockConfiance == true){
          this.setState({lockConfiance : false})
        }
      }, 6000);

  }

  componentWillUnmount() {
    clearInterval(this.dataRef)
    this.shakeRef.remove()
    this.ref.remove()
    clearTimeout(this.timeoutRef)
    clearInterval(this.placeRef)
    clearInterval(this.checkComp)
    clearInterval(this.lockConfiance)
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>App Status</Text>
        </View>
        <View style={styles.body}>
          <ScrollView>
            <View style={styles.row}>
              <Text style={styles.component}>WiFi</Text>
              <Text style={styles.component}>:</Text>
              <Text style={[styles.component,{color :this.state.wifi ? "green" : "red" }]}>
                 {this.state.wifi ? "ON" : "OFF"} </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.component}>Connecter à ESP32</Text>
              <Text style={styles.component}> : </Text>
              <Text style={[styles.component,{color :this.state.connectedToESP32 ? "green" : "red" }]}>
                 {this.state.connectedToESP32 ? " OUI" : "NON"} </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.component}>GPS Activer</Text>
              <Text style={styles.component}>:</Text>
              <Text style={[styles.component,{color :this.state.gps ? "green" : "red" }]}>
                 {this.state.gps ? "OUI" : "NON"} </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.component}>Batterie</Text>
              <Text style={styles.component}>:</Text>
              <Text style={styles.component}>{this.state.battery}%</Text>
            </View>
            
          </ScrollView>
          <TouchableOpacity
            onPress={()=>{
              this.props.navigation.navigate("Change")
            }}
            style={styles.change}
          >
            <Text style={styles.changeText} >Modifier contacts</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}


const styles = StyleSheet.create({
    container : {
        flex : 1,
        backgroundColor : "white"
    },
    header : {
        height : 50,
        justifyContent : 'center',
        alignItems : 'center',
        borderBottomWidth : 3,
        borderBottomColor : "gray"
    },
    headerText : {
        color : "black",
        fontSize : 18,
        fontWeight : "bold"
    },
    body : {
      flex : 1,
      marginTop : "20%",
      width : "85%",
      alignSelf : 'center',
    },
    row : {
      flexDirection : 'row',
      minHeight : 80,
      justifyContent : 'space-between',
      marginTop : '5%',
      marginBottom : "3%"
    },
    component : {
      fontSize : 25,
      fontWeight : "bold",
      color : "black",
      width : 140,
    },
    change : {
      alignSelf : 'center',
      width : "60%",
      height : 50,
      backgroundColor : 'black',
      color : 'white',
      alignItems : 'center',
      justifyContent : 'center',
      marginBottom : '10%',
    },
    changeText : {
      color: 'white',
      fontSize : 18,

    }
})

export default SendMyLocation