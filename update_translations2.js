const fs = require('fs');
const path = './src/constants/translations.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/elite: 'Elite'/g, "elite: 'Elite',\n      guestUser: 'Guest User',\n      guestEmail: 'guest@example.com'");
content = content.replace(/elite: 'एलीट'/g, "elite: 'एलीट',\n      guestUser: 'अतिथि उपयोगकर्ता',\n      guestEmail: 'guest@example.com'");
content = content.replace(/elite: 'എലൈറ്റ്'/g, "elite: 'എലൈറ്റ്',\n      guestUser: 'അതിഥി ഉപയോക്താവ്',\n      guestEmail: 'guest@example.com'");

content = content.replace(/changePicture: 'Change Picture'/g, "changePicture: 'Change Picture',\n      permissionRequired: 'Permission Required',\n      galleryPermission: 'Permission to access gallery is required!'");
content = content.replace(/changePicture: 'चित्र बदलें'/g, "changePicture: 'चित्र बदलें',\n      permissionRequired: 'अनुमति आवश्यक है',\n      galleryPermission: 'गैलरी तक पहुंचने की अनुमति आवश्यक है!'");
content = content.replace(/changePicture: 'ചിത്രം മാറ്റുക'/g, "changePicture: 'ചിത്രം മാറ്റുക',\n      permissionRequired: 'അനുമതി ആവശ്യമാണ്',\n      galleryPermission: 'ഗാലറി ആക്സസ് ചെയ്യാൻ അനുമതി ആവശ്യമാണ്!'");
content = content.replace(/changePicture: 'Picture Change Karein'/g, "changePicture: 'Picture Change Karein',\n      permissionRequired: 'Permission Required',\n      galleryPermission: 'Gallery access karne ke liye permission required hai!'");

fs.writeFileSync(path, content, 'utf8');
console.log('Translations updated successfully.');
