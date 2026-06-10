const fs = require('fs');
const file = 'src/constants/translations.ts';
let content = fs.readFileSync(file, 'utf8');

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
    },
`;

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
    },
`;

// Insert for EN
content = content.replace(
  "  // You can easily add more languages here later:\n  // es: { common: { ... }, navigation: { ... } }\n\n  hi: {",
  enAdd + "  // You can easily add more languages here later:\n  // es: { common: { ... }, navigation: { ... } }\n\n  hi: {"
);

// Insert for HI
content = content.replace(
  "    }\n  },\n  ml: {",
  "    }\n  }," + hiAdd + "  ml: {"
);

fs.writeFileSync(file, content);
