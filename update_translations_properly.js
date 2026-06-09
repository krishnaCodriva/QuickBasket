const fs = require('fs');
const path = './src/constants/translations.ts';
let content = fs.readFileSync(path, 'utf8');

const keysToAdd = {
  en: `      myAccount: 'My Account',\n      accountSection: 'ACCOUNT',\n      supportSection: 'SUPPORT',\n      settings: 'Settings',\n      helpCenter: 'Help Center',\n      contactSupport: 'Contact Support',\n      editProfileTitle: 'Edit Profile'\n    },`,
  hi: `      myAccount: 'मेरा खाता',\n      accountSection: 'खाता',\n      supportSection: 'समर्थन',\n      settings: 'समायोजन',\n      helpCenter: 'सहायता केंद्र',\n      contactSupport: 'संपर्क समर्थन',\n      editProfileTitle: 'प्रोफ़ाइल संपादित करें'\n    },`,
  ml: `      myAccount: 'എന്റെ അക്കൗണ്ട്',\n      accountSection: 'അക്കൗണ്ട്',\n      supportSection: 'പിന്തുണ',\n      settings: 'ക്രമീകരണങ്ങൾ',\n      helpCenter: 'സഹായ കേന്ദ്രം',\n      contactSupport: 'പിന്തുണയുമായി ബന്ധപ്പെടുക',\n      editProfileTitle: 'പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യുക'\n    },`,
  hinglish: `      myAccount: 'My Account',\n      accountSection: 'ACCOUNT',\n      supportSection: 'SUPPORT',\n      settings: 'Settings',\n      helpCenter: 'Help Center',\n      contactSupport: 'Contact Support',\n      editProfileTitle: 'Edit Profile'\n    },`
};

let occurrences = 0;
content = content.replace(/guestEmail: 'guest@example\.com'\n    \},/g, (match) => {
  occurrences++;
  if (occurrences === 1) return `guestEmail: 'guest@example.com',\n${keysToAdd.en}`;
  if (occurrences === 2) return `guestEmail: 'guest@example.com',\n${keysToAdd.hi}`;
  if (occurrences === 3) return `guestEmail: 'guest@example.com',\n${keysToAdd.hinglish}`;
  if (occurrences === 4) return `guestEmail: 'guest@example.com',\n${keysToAdd.ml}`;
  return match;
});

// Update the descriptions that changed in the screenshot
content = content.replace(/Track, return, or buy things again/g, 'Track current and past orders');
content = content.replace(/ट्रैक करें, वापस करें, या फिर से खरीदें/g, 'वर्तमान और पिछले आदेशों को ट्रैक करें');
content = content.replace(/Track karein, return karein, ya fir se kharidein/g, 'Current aur past orders track karein');
content = content.replace(/ട്രാക്ക് ചെയ്യുക, മടങ്ങുക, അല്ലെങ്കിൽ വീണ്ടും സാധനങ്ങൾ വാങ്ങുക/g, 'നിലവിലെയും കഴിഞ്ഞ ഓർഡറുകളും ട്രാക്കുചെയ്യുക');

fs.writeFileSync(path, content, 'utf8');
console.log('Done updating translations');
