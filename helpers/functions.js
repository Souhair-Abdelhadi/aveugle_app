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
