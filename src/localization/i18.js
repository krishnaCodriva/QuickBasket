// // import * as Localization from "expo-localization";
// import i18n from "i18next";
// import { initReactI18next } from "react-i18next";
// import { STRINGS } from "../constants/translations"


// const en = STRINGS.en;
// const hi = STRINGS.hi;
// const ml = STRINGS.ml;
// const hinglish = STRINGS.hinglish;

// const getActiveLang = () => {

// }
// // const devicesLanguage = Localization.getLocales()[0].languageCode || "en";
// i18n.use(initReactI18next).init({
//     lng: "en",
//     fallbackLng: "en",
//     resources: {
//         en: {
//             translation: en, //object
//         },
//         hi: {
//             translation: hi,
//         },
//         ml: {
//             translation: ml,
//         },
//         hinglish: {
//             translation: hinglish,
//         },
//     },
//     interpolation: {
//         escapeValue: false, // react already safes from xss
//     },
// });

// export default i18n;

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { translations } from "../constants/translations";

const en = translations.en;
const hi = translations.hi;
const ml = translations.ml;
const hinglish = translations.hinglish;


let activeLang = "en"
export const getActive = (lang) => {
    activeLang = lang || activeLang;
    if (i18n.isInitialized) {
        return i18n.changeLanguage(activeLang);
    }
}
console.log("active lang : ", activeLang)

i18n.use(initReactI18next).init({
    lng: activeLang || "en",
    fallbackLng: activeLang || "en",
    resources: {
        en: { translation: en },
        hi: { translation: hi },
        ml: { translation: ml },
        hinglish: { translation: hinglish },
    },
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;