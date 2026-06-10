const fs = require('fs');
const file = 'src/constants/translations.ts';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the misplaced blocks first
content = content.replace(/    orderTrackingScreen: \{[\s\S]*?comingSoon: 'Profile Coming Soon',\n    \},\n/, '');
content = content.replace(/    orderTrackingScreen: \{[\s\S]*?comingSoon: 'प्रोफ़ाइल जल्द ही आ रही है',\n    \},\n/, '');
content = content.replace(/    orderTrackingScreen: \{[\s\S]*?comingSoon: 'പ്രൊഫൈൽ ഉടൻ വരുന്നു',\n    \}\n/, '');

// 2. Define the correct additions
const enAdd = `    orderTrackingScreen: {
      title: 'Order Tracking',
      subtitle: 'Track your order here.',
    },
    manualLocationScreen: {
      searchPlaceholder: 'Search for area, street, city...',
      noResults: 'No results found',
      useCurrentLocation: 'Use my current location',
    },
    profileScreen: {
      comingSoon: 'Profile Coming Soon',
    }`;

const hiAdd = `    orderTrackingScreen: {
      title: 'ऑर्डर ट्रैकिंग',
      subtitle: 'अपना ऑर्डर यहां ट्रैक करें।',
    },
    manualLocationScreen: {
      searchPlaceholder: 'क्षेत्र, सड़क, शहर खोजें...',
      noResults: 'कोई परिणाम नहीं मिला',
      useCurrentLocation: 'मेरे वर्तमान स्थान का उपयोग करें',
    },
    profileScreen: {
      comingSoon: 'प्रोफ़ाइल जल्द ही आ रही है',
    }`;

const mlAdd = `    orderTrackingScreen: {
      title: 'ഓർഡർ ട്രാക്കിംഗ്',
      subtitle: 'നിങ്ങളുടെ ഓർഡർ ഇവിടെ ട്രാക്ക് ചെയ്യുക.',
    },
    manualLocationScreen: {
      searchPlaceholder: 'പ്രദേശം, തെരുവ്, നഗരം തിരയുക...',
      noResults: 'ഫലങ്ങളൊന്നും ലഭിച്ചില്ല',
      useCurrentLocation: 'എൻ്റെ നിലവിലെ ലൊക്കേഷൻ ഉപയോഗിക്കുക',
    },
    profileScreen: {
      comingSoon: 'പ്രൊഫൈൽ ഉടൻ വരുന്നു',
    }`;

// 3. Insert inside EN
content = content.replace(
  "ire a physical signature.'\n    }\n  },",
  "ire a physical signature.'\n    },\n" + enAdd + "\n  },"
);

// 4. Insert inside HI
content = content.replace(
  "ौतिक हस्ताक्षर की आवश्यकता नहीं है।'\n    }\n  },",
  "ौतिक हस्ताक्षर की आवश्यकता नहीं है।'\n    },\n" + hiAdd + "\n  },"
);

// 5. Insert inside ML
content = content.replace(
  "്ള ഒപ്പ് ആവശ്യമില്ല.'\n    }\n  }",
  "്ള ഒപ്പ് ആവശ്യമില്ല.'\n    },\n" + mlAdd + "\n  }"
);

fs.writeFileSync(file, content);
