import Reactotron from 'reactotron-react-native';
import { NativeModules } from 'react-native';

let reactotron;

if (__DEV__) {
  // Hardcoded to your computer's local IP so your phone can connect over Wi-Fi
  const scriptHostname = '192.168.1.50';

  reactotron = Reactotron
    .configure({ 
      name: 'QuickBasket', 
      host: scriptHostname 
    })
    .useReactNative({
      networking: {
        ignoreUrls: /symbolicate/,
      },
    })
    .connect();
    
  Reactotron.clear(); 
  
  // Create a global shortcut for testing
  console.tron = Reactotron;
  console.tron.log('✅ Reactotron is successfully connected!');
}

export default reactotron;
