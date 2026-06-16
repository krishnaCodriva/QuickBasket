# Complete Guide to Setting up Reactotron in React Native (Expo) on Linux

Reactotron is a desktop application used to inspect your React Native and Expo projects. It is an essential tool for tracking API requests, state changes, and viewing cleaner console logs, especially since standard debuggers often fail to intercept modern network requests like those made by Axios.

This guide covers the complete step-by-step process of installing Reactotron, setting up the code, and troubleshooting common Linux-specific issues.

---

## Phase 1: Project Integration

The first step is to install the Reactotron library into your project and configure it.

### 1. Install the Dependency
Open your terminal in the root of your project and install the Reactotron React Native package as a development dependency.

```bash
npm install --save-dev reactotron-react-native
```

### 2. Create the Configuration File
Create a new file named `ReactotronConfig.ts` inside your `src` directory (or project root). This file acts as the initialization script.

```typescript
import Reactotron from 'reactotron-react-native';
import { NativeModules } from 'react-native';

let reactotron;

if (__DEV__) {
  // Try to dynamically grab the IP of the computer running the Metro server
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  let scriptHostname = scriptURL ? scriptURL.split('://')[1].split(':')[0] : 'localhost';

  // 💡 TIP: If you are running Expo Go on a physical phone over Wi-Fi, 
  // dynamic detection sometimes fails. Hardcode your computer's local IP:
  // scriptHostname = '192.168.1.50'; 

  reactotron = Reactotron
    .configure({ 
      name: 'My Awesome App', 
      host: scriptHostname 
    })
    .useReactNative({
      networking: {
        // This tells Reactotron to intercept all network requests (including Axios)
        ignoreUrls: /symbolicate/,
      },
    })
    .connect();
    
  // Clear the Reactotron timeline on every app reload
  Reactotron.clear(); 
  
  // (Optional) Map console.tron for easy global debugging
  console.tron = Reactotron;
}

export default reactotron;
```

> [!WARNING]
> **Physical Devices over Wi-Fi:** If you are testing on a real phone, your phone must be on the same Wi-Fi network as your laptop. If Reactotron refuses to connect, use your terminal (`hostname -I` or `ipconfig`) to find your laptop's local IP and hardcode it into `scriptHostname` as shown in the code comment.

### 3. Initialize Reactotron
Reactotron must be the very first thing your app loads. Go to your app's main entry file (usually `index.js` or `App.tsx`) and require the configuration file at the very top.

```javascript
// index.js
if (__DEV__) {
  require('./src/ReactotronConfig');
}

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

---

## Phase 2: Installing the Desktop App (Linux)

Next, you need the actual desktop interface to view the logs.

### 1. Download the AppImage
Download the latest Reactotron release for Linux from the official GitHub repository.
1. Go to: [Reactotron Releases](https://github.com/infinitered/reactotron/releases)
2. Download the `.AppImage` file.

### 2. Extracting the AppImage (Fixing FUSE Errors)
On modern Linux distributions (like Ubuntu 22.04+), running an AppImage directly often fails with a FUSE error (`dlopen(): error loading libfuse.so.2`). 

Instead of installing legacy system libraries, you can extract the AppImage directly:

```bash
cd ~/Downloads
chmod +x Reactotron*.AppImage
./Reactotron*.AppImage --appimage-extract
```
This creates a folder named `squashfs-root` containing the extracted application.

### 3. Bypassing the Sandbox Security
Linux has strict sandbox security for Electron-based apps. If you try to run the extracted app normally, it will crash asking for Root/SUID permissions. Bypass this by running the binary with the `--no-sandbox` flag:

```bash
cd squashfs-root
./reactotron-app --no-sandbox
```

> [!TIP]
> You can create an alias or a desktop shortcut that automatically runs `./reactotron-app --no-sandbox` to make launching it easier in the future!

---

## Phase 3: Testing the Connection

With both the codebase configured and the desktop app open, it is time to connect them.

1. **Keep the Reactotron Desktop App open.**
2. Go to the terminal running your Metro Bundler (`npx expo start`).
3. If you just installed Reactotron, **restart the server completely** (Press `Ctrl + C`, then run `npx expo start` again).
4. Press **`r`** to reload the app on your phone or emulator.
5. Watch the Reactotron Desktop App. Under the "Timeline" tab, you should see a `CONNECTION` log. 

> [!IMPORTANT]
> If it says "0 Connections", double-check your `scriptHostname` in `ReactotronConfig.ts`. It **must** match your computer's local IP address if you are using a physical phone over Wi-Fi!

Once connected, any API request your app makes (like an Axios `GET` or `POST`) will instantly appear in the Timeline. You can click on the request to view the headers, the payload, and the raw server response.
