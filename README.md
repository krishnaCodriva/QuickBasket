# QuickBasket React Native App

![React Native](https://img.shields.io/badge/React%20Native-6.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-000000?style=for-the-badge&logo=expo&logoColor=white)
![Licence](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

> A modern, feature-rich e-commerce application built with React Native and Expo, offering a seamless shopping experience with features like multilingual support, PWA capabilities, and an intuitive user interface.

## Features

- **📦 Product Listing**: Comprehensive list of products with detailed information.
- **🛒 Cart Management**: Add, remove, and update items in the cart.
- **❤️ Wishlist**: Save favorite products for later.
- **💬 Multilingual Support**: Toggle between English, Hinglish, and Malayalam.
- **🌓 Dark Mode**: Automatic theme switching based on system preferences.
- **🔍 Enhanced Search**: Advanced search functionality with filters.
- **👤 Authentication**: Secure login and user management.

## Tech Stack

- **Framework**: React Native
- **Platform**: Expo
- **Language**: TypeScript
- **Styling**: Expo Themed Components
- **Routing**: React Navigation
- **State Management**: Context API
- **Storage**: AsyncStorage

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **[Node.js](https://nodejs.org/)** (v18 or higher recommended).
- **[Git](https://git-scm.com/)** for cloning the repository.
- **Expo Go App** installed on your physical device (Android/iOS) if you want to test on a phone.
  - _Android users can also download this specific [ExpoGo APK](https://play.google.com/store/apps/details?id=host.exp.exponent&hl=en)._
- _(Optional)_ **[Android Studio](https://developer.android.com/studio)** and an Android Virtual Device (AVD) if you want to run the app on a CLI Android Emulator.

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/krishnaCodriva/QuickBasket.git
   cd QuickBasket
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

### Running the App

Start the development server:

```bash
npm start
# or
yarn start
```

Once the server is running, you can open the app in any of the following ways:

#### 1. On Android Phones using Expo Go

1. Download the **Expo Go** app on your Android device from the Google Play Store (or use the APK link provided in prerequisites).
2. Make sure your phone and computer are on the same Wi-Fi network.
3. Open the Expo Go app.
4. Scan the **QR code** displayed in your computer's terminal.

#### 2. On Computer or Web

To run the app directly in your computer's web browser:

- Press **`w`** in the terminal where the server is running.
- The app will automatically open in your default browser (usually at `http://localhost:8081`).

#### 3. On CLI Android Emulator

If you have Android Studio and a virtual device set up:

1. Ensure your Android emulator is running.
2. Press **`a`** in the terminal where the server is running.
3. Expo will automatically install the Expo Go app on the emulator and launch your project.

## File Structure

```
QuickBasket/
├── src/
│   ├── components/        # Reusable UI components
│   ├── constants/         # Constants, colors, and strings
│   ├── context/           # React Context for state management
│   ├── hooks/             # Custom React hooks
│   ├── navigation/        # Navigation setup
│   ├── screens/           # Screen components
│   │   ├── Cart/          # Cart related screens
│   │   ├── Login/         # Authentication screens
│   │   ├── ProductListing/ # Product listing screens
│   │   └── ...
│   ├── utils/             # Utility functions
│   └── App.tsx            # Main application entry point
└── App.js                 # Application wrapper
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contributors

A big thank you to all the people who have contributed to this project:

- [krishnaCodriva](https://github.com/krishnaCodriva)
- [Satyam Tripathi (satyamtripathii)](https://github.com/satyamtripathii)
- [NEERAJ KUMAR (Neerajkumar151)](https://github.com/Neerajkumar151)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Documentation](https://reactnative.dev/)

## Support

If you encounter any issues or have questions, please feel free to open an issue on the GitHub repository.

---

Made with ❤️ for QuickBasket
