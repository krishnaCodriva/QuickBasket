const fs = require('fs');
const file = 'src/constants/translations.ts';
let content = fs.readFileSync(file, 'utf8');

// Remove the badly placed keys
content = content.replace(/    orderTrackingScreen: \{[\s\S]*?comingSoon: 'Profile Coming Soon',\n    \},/, '');
content = content.replace(/    orderTrackingScreen: \{[\s\S]*?comingSoon: 'प्रोफ़ाइल जल्द ही आ रही है',\n    \},/, '');
// Note: mlAdd was never inserted.

// Now insert them properly INSIDE the language objects.
// The objects end with `invoiceScreen: { ... } \n  },`
// We will replace `    }\n  },` with `    },\n` + Add + `\n  },` but we must be careful.

const enAdd = `
    orderTrackingScreen: {
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

const hiAdd = `
    orderTrackingScreen: {
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

const mlAdd = `
    orderTrackingScreen: {
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

// Find end of 'en' block (just before hi: {)
content = content.replace(/(\n  \},)(\n\s*\/\/.*)?(\n  hi: \{)/, ',\n' + enAdd + '$1$2$3');

// Find end of 'hi' block (just before ml: {)
content = content.replace(/(\n  \},)(\n\s*\/\/.*)?(\n  ml: \{)/, ',\n' + hiAdd + '$1$2$3');

// Find end of 'ml' block (just before };)
content = content.replace(/(\n  \})(\n\};)/, ',\n' + mlAdd + '$1$2');

fs.writeFileSync(file, content);
