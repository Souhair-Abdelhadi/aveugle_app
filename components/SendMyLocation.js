// obligatoire pour fonctionnement
import React from "react";
// bach katssawab design dyal interface li f application, b7al button,image,couleur,text ...
import { SafeAreaView,Text,View,StyleSheet,PermissionsAndroid, NativeModules,DeviceEventEmitter} from "react-native";
import Geolocation from "@react-native-community/geolocation";
// biblio li katkhalik ta3raf wach téléphone tankhad wla la
import RNShake from "react-native-shake"
// biblio li katkhalik tssifat sms direct lwa7ad namra
import SmsAndroid from 'react-native-get-sms-android';
import {checkWiFiStatus} from "../helpers/functions"
// biblio katkhalik ta3raf wach mconnectet=r lwifi wla la
import NetInfo from '@react-native-community/netinfo'
//biblio katkhalik tkharaj sawt dyal wa7ad fichier, mp3 wla wav, etc ...
import Sound from 'react-native-sound'


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
  }

  // bach nssifto sms lwa7ad namra
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

  // khod les coordonnés dyal gps dyal téléphone
  getCoordiantes = () => {
    Geolocation.getCurrentPosition(
      position => {
        console.log(position);
        const {latitude, longitude} = position.coords;
        // partager localisation dyali m3a contact li 7at
        this.shareMyLocation(latitude,longitude)
      },

      error => {
        console.log('error', error);
      },
    );
  };

  // hna fen kayn partage dyal localisation lwa7ad namra
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



  // njibo les données mn ESP32 dyal les ultrasonics
  getHttpData = async () => {
    await NetInfo.fetch().then(state => {
        console.log(state)
      if (state.isConnected === true && state.isWifiEnabled === true) {

        try {

          fetch(
            'http://192.168.3.1/' // mn had address ip li f wifi li mconnectin lih
          )
          // mn ta3tik les données dir hadchi
          .then(async (response) => {

            if (response.status == 200) { // ila kan kolchi mzn makayn 7ta mochkil f réseau

              let json = await response.json(); // tssana 7ta takhod donnée kamal 3la had chkal {"bas_dis" : 1000,"haut_dist" : 1500}
              console.log(json); // pour l'affichage 
              console.log("bas_dist",json.bas_dist)
            //   this.setState({ sensor_value: json.sensor_value });

              // for bottom obstacle 
              // condition m7a9a9 9al mn 0.5m o makan 7ta obstacle mn 9bal
              if (json.bas_dist <= 500 &&  !this.state.obstacle_bas) {  // !false => true | !true => false
                var whoosh = new Sound(
                  'obstacle_devant_vous.wav',
                  Sound.MAIN_BUNDLE,
                  error => {
                    if (error) {
                      console.log('failed to load the sound', error);
                      return;
                    }

                    // 7bass takhraj dyal sawt dyal obstacle devant vous, 7ta l9aw passage
                    this.setState({obstacle_bas: true});
                    //------------------------------
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

              // kharaj sawt ila makanch obstacle db walakin kan mn 9bal
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
              // bach nkharjo sawt dyal obstacle li lfo9 khass lmassafa dyal obstacle li lfo9 tkon sghar mn 2m
              // o ma3andi 7ta obstacle bas o ma3andi 7ta obstacle haut
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


      // ki tssanat li telephone wach tankhad, ila tankhad kissifat sms fih localisation dyali lwa7ad namra
      // o ki7bass l partage l 3 minutes
      this.shakeRef = RNShake.addListener(()=> {
        if(!this.state.lockShake){
          this.setState({lockShake : true})
          console.log("phone is shaking -> share location")
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