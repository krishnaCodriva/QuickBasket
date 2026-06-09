const fs = require('fs');
const path = './src/constants/translations.ts';
let content = fs.readFileSync(path, 'utf8');

const enReplacement = `    profileScreen: {
      comingSoon: 'Profile Coming Soon',
      myOrders: 'My Orders',
      myOrdersDesc: 'Track, return, or buy things again',
      savedAddresses: 'Saved Addresses',
      savedAddressesDesc: 'Manage delivery locations',
      notifications: 'Notifications',
      notificationsDesc: 'Manage alerts and promos',
      helpSupport: 'Help & Support',
      helpSupportDesc: 'Contact us, FAQs',
      logout: 'Logout',
      orders: 'Orders',
      status: 'Status',
      elite: 'Elite'
    },
    editProfileScreen: {
      title: 'Edit Profile',
      fullName: 'Full Name',
      email: 'Email Address',
      mobile: 'Mobile Number',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
      validationError: 'Validation Error',
      mandatoryFields: 'Mandatory fields cannot be blank',
      invalidEmail: 'Invalid email format',
      success: 'Success',
      profileUpdated: 'Profile updated successfully',
      changePicture: 'Change Picture'
    },`;

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
      elite: 'एलीट'
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
      changePicture: 'चित्र बदलें'
    },`;

const mlReplacement = `    profileScreen: {
      comingSoon: 'പ്രൊഫൈൽ ഉടൻ വരുന്നു',
      myOrders: 'എന്റെ ഓർഡറുകൾ',
      myOrdersDesc: 'ട്രാക്ക് ചെയ്യുക, മടക്കിനൽകുക, അല്ലെങ്കിൽ വീണ്ടും വാങ്ങുക',
      savedAddresses: 'സംരക്ഷിച്ച വിലാസങ്ങൾ',
      savedAddressesDesc: 'ഡെലിവറി ലൊക്കേഷനുകൾ നിയന്ത്രിക്കുക',
      notifications: 'അറിയിപ്പുകൾ',
      notificationsDesc: 'അലേർട്ടുകളും പ്രൊമോകളും നിയന്ത്രിക്കുക',
      helpSupport: 'സഹായവും പിന്തുണയും',
      helpSupportDesc: 'ഞങ്ങളെ ബന്ധപ്പെടുക, പതിവുചോദ്യങ്ങൾ',
      logout: 'ലോഗ്ഔട്ട്',
      orders: 'ഓർഡറുകൾ',
      status: 'പദവി',
      elite: 'എലൈറ്റ്'
    },
    editProfileScreen: {
      title: 'പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യുക',
      fullName: 'പൂർണ്ണ നാമം',
      email: 'ഇമെയിൽ വിലാസം',
      mobile: 'മൊബൈൽ നമ്പർ',
      saveChanges: 'മാറ്റങ്ങൾ സംരക്ഷിക്കുക',
      cancel: 'റദ്ദാക്കുക',
      validationError: 'സാധുത പിശക്',
      mandatoryFields: 'നിർബന്ധിത ഫീൽഡുകൾ ശൂന്യമായിരിക്കരുത്',
      invalidEmail: 'അസാധുവായ ഇമെയിൽ ഫോർമാറ്റ്',
      success: 'വിജയം',
      profileUpdated: 'പ്രൊഫൈൽ വിജയകരമായി അപ്‌ഡേറ്റ് ചെയ്‌തു',
      changePicture: 'ചിത്രം മാറ്റുക'
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
      elite: 'Elite'
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
      changePicture: 'Picture Change Karein'
    },`;

content = content.replace(/    profileScreen: \{\n      comingSoon: 'Profile Coming Soon'\n    \},/g, enReplacement);
content = content.replace(/    profileScreen: \{\n      comingSoon: 'प्रोफ़ाइल जल्द आ रही है'\n    \},/g, hiReplacement);
content = content.replace(/    profileScreen: \{\n      comingSoon: 'പ്രൊഫൈൽ ഉടൻ വരുന്നു'\n    \},/g, mlReplacement);
content = content.replace(/    profileScreen: \{\n      comingSoon: 'Profile jald aa rahi hai'\n    \},/g, hinglishReplacement);

fs.writeFileSync(path, content, 'utf8');
console.log('Translations updated successfully.');
