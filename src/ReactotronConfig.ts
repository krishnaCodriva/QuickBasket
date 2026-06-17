import Reactotron from 'reactotron-react-native';
import { NativeModules } from 'react-native';
import Constants from 'expo-constants';

let reactotron;

if (__DEV__) {
  let scriptHostname = 'localhost';
  
  // Try getting IP from Expo first (most reliable for Expo Go)
  const hostUri = Constants?.expoConfig?.hostUri;
  if (hostUri) {
    scriptHostname = hostUri.split(':')[0];
  } else {
    // Fallback to NativeModules for bare React Native
    const scriptURL = NativeModules.SourceCode?.scriptURL;
    if (scriptURL) {
      scriptHostname = scriptURL.split('://')[1].split(':')[0];
    }
  }

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
