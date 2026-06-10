const fs = require('fs');
const path = './src/constants/translations.ts';
let content = fs.readFileSync(path, 'utf8');

const keysToAdd = {
  en: `      logoutConfirmDesc: 'Are you sure you want to logout from QuickBasket?',\n      cancel: 'Cancel'`,
  hi: `      logoutConfirmDesc: 'क्या आप वाकई QuickBasket से लॉगआउट करना चाहते हैं?',\n      cancel: 'रद्द करें'`,
  ml: `      logoutConfirmDesc: 'QuickBasket-ൽ നിന്ന് ലോഗ്ഔട്ട് ചെയ്യണമെന്ന് നിങ്ങൾക്ക് ഉറപ്പാണോ?',\n      cancel: 'റദ്ദാക്കുക'`,
  hinglish: `      logoutConfirmDesc: 'Kya aap waqai QuickBasket se logout karna chahte hain?',\n      cancel: 'Cancel'`
};

let occurrences = 0;
content = content.replace(/editProfileTitle: '.*?'\n    \},/g, (match) => {
  occurrences++;
  let replacement = match.slice(0, -6); // remove '\n    },'
  if (occurrences === 1) return `${replacement},\n${keysToAdd.en}\n    },`;
  if (occurrences === 2) return `${replacement},\n${keysToAdd.hi}\n    },`;
  if (occurrences === 3) return `${replacement},\n${keysToAdd.hinglish}\n    },`;
  if (occurrences === 4) return `${replacement},\n${keysToAdd.ml}\n    },`;
  return match;
});

fs.writeFileSync(path, content, 'utf8');
console.log('Done updating translations');
