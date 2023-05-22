import NetInfo from '@react-native-community/netinfo'
import Sound from 'react-native-sound'




export const checkWiFiStatus = () => {
      const enabled = WifiManager.isEnabled();

      enabled.then(stat => {
        // stat.valueOf() the check if the wifi is on or not

        // if (stat.valueOf() === false) {
        //   WifiManager.setEnabled(true);
        // } else if (stat.valueOf() === true) {
        //   WifiManager.getCurrentWifiSSID().then(data => {
        //     if (data != 'ESP32') {
        //       WifiManager.disconnect().catch(e => console.log(e));

        //       WifiManager.connectToProtectedSSID('ESP32', '123456789', false)
        //         .then(() => {
        //           console.log('------------------------');
        //           console.log('Connected successfully!');
        //           console.log('------------------------');
        //         })
        //         .catch(e => console.log(e));
        //     }
        //   });
        // }

      });
    };


export const calculateDistance = (lat1,lon1,lat2,lon2) => {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d
}


export const getSound = (filename) => {
  var whoosh = new Sound(
    filename,
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
          // console.log(
          //   'playback failed due to audio decoding errors',
          // );
        }
      });
    },
  );
}