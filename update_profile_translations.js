const fs = require('fs');
const path = './src/constants/translations.ts';
let content = fs.readFileSync(path, 'utf8');

// en
const enReplacement = `    profileScreen: {
      comingSoon: 'Profile Coming Soon',
      myOrders: 'My Orders',
      myOrdersDesc: 'Track current and past orders',
      savedAddresses: 'Saved Addresses',
      savedAddressesDesc: 'Manage delivery locations',
      notifications: 'Notifications',
      notificationsDesc: 'Manage alerts and promos',
      helpSupport: 'Help & Support',
      helpSupportDesc: 'Contact us, FAQs',
      logout: 'Logout',
      orders: 'Orders',
      status: 'Status',
      elite: 'Elite',
      guestUser: 'Guest User',
      guestEmail: 'guest@example.com',
      myAccount: 'My Account',
      accountSection: 'ACCOUNT',
      supportSection: 'SUPPORT',
      settings: 'Settings',
      helpCenter: 'Help Center',
      contactSupport: 'Contact Support',
      editProfileTitle: 'Edit Profile'
    },`;

// hi
const hiReplacement = `    profileScreen: {
      comingSoon: 'प्रोफ़ाइल जल्द आ रही है',
      myOrders: 'मेरे आदेश',
      myOrdersDesc: 'वर्तमान और पिछले आदेशों को ट्रैक करें',
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
      guestEmail: 'guest@example.com',
      myAccount: 'मेरा खाता',
      accountSection: 'खाता',
      supportSection: 'समर्थन',
      settings: 'समायोजन',
      helpCenter: 'सहायता केंद्र',
      contactSupport: 'संपर्क समर्थन',
      editProfileTitle: 'प्रोफ़ाइल संपादित करें'
    },`;

// hinglish
const hinglishReplacement = `    profileScreen: {
      comingSoon: 'Profile jald aa rahi hai',
      myOrders: 'Mere Orders',
      myOrdersDesc: 'Current aur past orders track karein',
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
      guestEmail: 'guest@example.com',
      myAccount: 'My Account',
      accountSection: 'ACCOUNT',
      supportSection: 'SUPPORT',
      settings: 'Settings',
      helpCenter: 'Help Center',
      contactSupport: 'Contact Support',
      editProfileTitle: 'Edit Profile'
    },`;

// ml
const mlReplacement = `    profileScreen: {
      comingSoon: 'പ്രൊഫൈൽ ഉടൻ വരുന്നു',
      myOrders: 'എന്റെ ഓർഡറുകൾ',
      myOrdersDesc: 'നിലവിലെയും കഴിഞ്ഞ ഓർഡറുകളും ട്രാക്കുചെയ്യുക',
      savedAddresses: 'സംരക്ഷിച്ച വിലാസങ്ങൾ',
      savedAddressesDesc: 'ഡെലിവറി ലൊക്കേഷനുകൾ കൈകാര്യം ചെയ്യുക',
      notifications: 'അറിയിപ്പുകൾ',
      notificationsDesc: 'അലേർട്ടുകളും പ്രൊമോകളും കൈകാര്യം ചെയ്യുക',
      helpSupport: 'സഹായവും പിന്തുണയും',
      helpSupportDesc: 'ഞങ്ങളെ ബന്ധപ്പെടുക, പതിവുചോദ്യങ്ങൾ',
      logout: 'ലോഗ്ഔട്ട്',
      orders: 'ഓർഡറുകൾ',
      status: 'പദവി',
      elite: 'എലൈറ്റ്',
      guestUser: 'അതിഥി ഉപയോക്താവ്',
      guestEmail: 'guest@example.com',
      myAccount: 'എന്റെ അക്കൗണ്ട്',
      accountSection: 'അക്കൗണ്ട്',
      supportSection: 'പിന്തുണ',
      settings: 'ക്രമീകരണങ്ങൾ',
      helpCenter: 'സഹായ കേന്ദ്രം',
      contactSupport: 'പിന്തുണയുമായി ബന്ധപ്പെടുക',
      editProfileTitle: 'പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യുക'
    },`;

content = content.replace(/    profileScreen: \{[\s\S]*?guestEmail: 'guest@example\.com'\n    \},/g, enReplacement);
content = content.replace(/    profileScreen: \{[\s\S]*?guestEmail: 'guest@example\.com'\n    \},/g, function(match, offset, string) {
  // It replaces all matches. The first one was EN.
  // Wait, the regex matches ALL occurrences!
  return "WILL_BE_REPLACED_LATER";
});
