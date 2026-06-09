const fs = require('fs');
const file = 'src/constants/translations.ts';
let content = fs.readFileSync(file, 'utf8');

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

content = content.replace(
  /\n(\s*)ml: \{/,
  "\n" + hiAdd + "$1ml: {"
);

fs.writeFileSync(file, content);
