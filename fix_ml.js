const fs = require('fs');
const file = 'src/constants/translations.ts';
let content = fs.readFileSync(file, 'utf8');

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

// Replace the end of ml block before };
content = content.replace(
  "ആവശ്യമില്ല.'\n    }\n  }\n};",
  "ആവശ്യമില്ല.'\n    },\n" + mlAdd + "\n  }\n};"
);

// Fallback if formatting was different:
if (!content.includes('പ്രൊഫൈൽ ഉടൻ വരുന്നു')) {
  content = content.replace(
    /(\n    \}\n  \}\n\};)/,
    ",\n" + mlAdd + "$1"
  );
}

fs.writeFileSync(file, content);
