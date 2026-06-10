const fs = require('fs');
const path = './src/constants/translations.ts';
let content = fs.readFileSync(path, 'utf8');

const hiReplacement = `    profileScreen: {
      comingSoon: 'प्रोफ़ाइल जल्द आ रही है',
      myOrders: 'मेरे आदेश',
      myOrdersDesc: 'ट्रैक करें, वापस करें, या फिर से खरीदें',
      savedAddresses: 'सहेजे गए पते',
      savedAddressesDesc: 'वितरण स्थान प्रबंधित करें',
      notifications: 'सूचनाएं',
      notificationsDesc: 'अलर्ट और प्रोमो प्रबंधित करें',
      helpSupport: 'सहायता और समर्थन',
      helpSupportDesc: 'हमसे संपर्क करें, सामान्य प्रश्न',
      logout: 'लॉग आउट',
      orders: 'आदेश',
      status: 'स्थिति',
      elite: 'एलीट',
      guestUser: 'अतिथि उपयोगकर्ता',
      guestEmail: 'guest@example.com'
    },
    editProfileScreen: {
      title: 'प्रोफ़ाइल संपादित करें',
      fullName: 'पूरा नाम',
      email: 'ईमेल पता',
      mobile: 'मोबाइल नंबर',
      saveChanges: 'परिवर्तन सहेजें',
      cancel: 'रद्द करें',
      validationError: 'सत्यापन त्रुटि',
      mandatoryFields: 'अनिवार्य फ़ील्ड खाली नहीं हो सकते',
      invalidEmail: 'अमान्य ईमेल प्रारूप',
      success: 'सफलता',
      profileUpdated: 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई',
      changePicture: 'चित्र बदलें',
      permissionRequired: 'अनुमति आवश्यक है',
      galleryPermission: 'गैलरी तक पहुंचने की अनुमति आवश्यक है!'
    },`;

const hinglishReplacement = `    profileScreen: {
      comingSoon: 'Profile jald aa rahi hai',
      myOrders: 'Mere Orders',
      myOrdersDesc: 'Track karein, return karein, ya fir se kharidein',
      savedAddresses: 'Saved Addresses',
      savedAddressesDesc: 'Delivery locations manage karein',
      notifications: 'Notifications',
      notificationsDesc: 'Alerts aur promos manage karein',
      helpSupport: 'Help & Support',
      helpSupportDesc: 'Contact us, FAQs',
      logout: 'Logout',
      orders: 'Orders',
      status: 'Status',
      elite: 'Elite',
      guestUser: 'Guest User',
      guestEmail: 'guest@example.com'
    },
    editProfileScreen: {
      title: 'Profile Edit Karein',
      fullName: 'Pura Naam',
      email: 'Email Address',
      mobile: 'Mobile Number',
      saveChanges: 'Changes Save Karein',
      cancel: 'Cancel',
      validationError: 'Validation Error',
      mandatoryFields: 'Mandatory fields blank nahi ho sakte',
      invalidEmail: 'Invalid email format',
      success: 'Success',
      profileUpdated: 'Profile successfully update ho gayi',
      changePicture: 'Picture Change Karein',
      permissionRequired: 'Permission Required',
      galleryPermission: 'Gallery access karne ke liye permission required hai!'
    },`;

content = content.replace(/    profileScreen: \{\n      comingSoon: 'प्रोफ़ाइल जल्द ही आ रही है'\n    \},/g, hiReplacement);
content = content.replace(/    profileScreen: \{\n      comingSoon: 'Profile jald hi aa rahi hai'\n    \},/g, hinglishReplacement);

fs.writeFileSync(path, content, 'utf8');
console.log('Translations updated successfully.');
