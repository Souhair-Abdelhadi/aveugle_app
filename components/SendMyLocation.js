import React from "react";
import { SafeAreaView,Text,View,StyleSheet,PermissionsAndroid, NativeModules,DeviceEventEmitter} from "react-native";
import Geolocation from "@react-native-community/geolocation";
import RNShake from "react-native-shake"
import SmsAndroid from 'react-native-get-sms-android';
import {checkWiFiStatus} from "../helpers/functions"
import NetInfo from '@react-native-community/netinfo'
import Sound from 'react-native-sound'
import WifiManager from "react-native-wifi-reborn";


const DirectSms = NativeModules.DirectSms

class SendMyLocation extends React.Component {
  constructor(props) {
    super(props);
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'always',
      locationProvider: 'auto',
    });
  }

  state = {
    lockShake : false,
    obstacle_bas : false,
    obstacle_haut : false,
  }


  sendMsg = (phoneNumber,msg) => {
    SmsAndroid.autoSend(
      phoneNumber,
      msg,
      (fail) => {
        console.log('Failed with this error: ' + fail);
      },
      (success) => {
        console.log('SMS sent successfully');
      },
    );
  }



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
        console.log('You can SMS functionallity');
        this.getCoordiantes();
        return true;
      } else {
        console.log('SMS permission denied');
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
        console.log('You can use the read my GPS data');
        return true;
      } else {
        console.log('GPS permission denied');
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  requestRecordVoicePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Audio permission',
          message: 'Need Audio permission to listen to your words ',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can record listen to my audio now');
        return true;
      } else {
        console.log('Audio permission denied');
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  // https://www.google.com/maps/search/?api=1&query=

  getCoordiantes = () => {
    Geolocation.getCurrentPosition(
      position => {
        console.log(position);
        const {latitude, longitude} = position.coords;
        this.shareMyLocation(latitude,longitude)
      },

      error => {
        console.log('error', error);
      },
    );
  };

  shareMyLocation = (latitude, longitude) => {

    // const msg = "I shared with you my location in order to find me because i think i'm lost, and sorry for any inconvience " +
    // ` https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    const msg = "I shared with you my location in order to find me because i think i'm lost, and sorry for any inconvience " +
          ` https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    const phoneNumber = '0608745953'

    // DirectSms.sendDirectSms(phoneNumber,msg)
    this.sendMsg(phoneNumber,msg)
    console.log("loaction shared")

  };

  getHttpData = async () => {
    await NetInfo.fetch().then(state => {
        console.log(state)
      if (state.isConnected === true && state.isWifiEnabled === true) {

        try {

          fetch(
            'http://192.168.3.1/'
          ).then(async (response) => {

            if (response.status == 200) {

              let json = await response.json();
              console.log(json);
              console.log("bas_dist",json.bas_dist)
            //   this.setState({ sensor_value: json.sensor_value });

              // for bottom obstacle
              if (json.bas_dist <= 500 &&  !this.state.obstacle_bas) {
                var whoosh = new Sound(
                  'obstacle_devant_vous.wav',
                  Sound.MAIN_BUNDLE,
                  error => {
                    if (error) {
                      console.log('failed to load the sound', error);
                      return;
                    }
                    this.setState({obstacle_bas: true});
                    whoosh.play(success => {
                      if (success) {
                        console.log('successfully finished playing');
                      } else {
                        console.log(
                          'playback failed due to audio decoding errors',
                        );
                      }
                    });
                  },
                );
              }

              if (json.bas_dist > 500 && this.state.obstacle_bas) {
                var whoosh = new Sound(
                  'permission_de_passage.mp3',
                  Sound.MAIN_BUNDLE,
                  error => {
                    if (error) {
                      console.log('failed to load the sound', error);
                      return;
                    }
                    whoosh.play(success => {
                      if (success) {
                        console.log('successfully finished playing');
                        this.setState({obstacle_bas: false});
                      } else {
                        console.log(
                          'playback failed due to audio decoding errors',
                        );
                      }
                    });
                  },
                );
              }


              // for obstacle above
              if (json.haut_dist <= 2000 && !this.state.obstacle_bas &&  !this.state.obstacle_haut) {
                var whoosh = new Sound(
                  'obstacle_en_haut.wav',
                  Sound.MAIN_BUNDLE,
                  error => {
                    if (error) {
                      console.log('failed to load the sound', error);
                      return;
                    }
                    this.setState({obstacle_haut: true});
                    whoosh.play(success => {
                      if (success) {
                        console.log('successfully finished playing');
                      } else {
                        console.log(
                          'playback failed due to audio decoding errors',
                        );
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
                      console.log('failed to load the sound', error);
                      return;
                    }
                    whoosh.play(success => {
                      if (success) {
                        console.log('successfully finished playing');
                        this.setState({obstacle_haut: false});
                      } else {
                        console.log(
                          'playback failed due to audio decoding errors',
                        );
                      }
                    });
                  },
                );
              }


            }

            else {
              //throw new Error('HTTP response status not code 200 as expected.');
              console.log("there is an error in the connection");
            }

          })
            .catch(function (error) {

              console.log(error);

            });


        }
        catch (error) {
          console.log(error);

        }
      }
      else {

        console.log("Not connected to any WiFi");
        // this.setState({ obstacle: "no" });
        // checkWiFiStatus();

      }

    });

  };

  componentDidMount() {
    //this.requestSmsPermission()
    // this.requestRecordVoicePermission();

     this.dataRef =  setInterval(() => {
      this.getHttpData()
     }, 3000);

     this.getHttpData()

    // checkWiFiStatus()

    this.requestLocationPermission()
      .then(status => {
        if (status) {
          
        }
      })
      .catch(e => console.log(e));

      this.shakeRef = RNShake.addListener(()=> {
        if(!this.state.lockShake){
          this.setState({lockShake : true})
          console.log("phone is shaking -> share location")
          this.requestSmsPermission()
          this. timeoutRef = setTimeout(() => {
            this.setState({lockShake : false})
          }, 3*60*1000);
        }
        
      })

      this.ref = DeviceEventEmitter.addListener('sms_onDelivery',(msg)=>{
        console.log(msg)
      })

  }

  componentWillUnmount() {
    clearInterval(this.dataRef)
    this.shakeRef.remove()
    this.ref.remove()
    clearTimeout(this.timeoutRef)
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Share my Location</Text>
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
    }

})

export default SendMyLocation