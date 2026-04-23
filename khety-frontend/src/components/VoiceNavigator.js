import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const normalizeText = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const speechLocales = {
  en: "en-IN",
  hi: "hi-IN",
  bn: "bn-IN",
  te: "te-IN",
  mr: "mr-IN",
  ta: "ta-IN",
  ur: "ur-PK",
  gu: "gu-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  pa: "pa-IN",
  or: "or-IN",
  as: "as-IN",
  fr: "fr-FR",
  es: "es-ES",
  de: "de-DE",
  pt: "pt-PT",
  ar: "ar-SA",
  ja: "ja-JP",
  ko: "ko-KR",
  "zh-CN": "zh-CN",
  ru: "ru-RU"
};

const localizedCommandAliases = {
  hi: {
    dashboard: ["डैशबोर्ड खोलो", "डैशबोर्ड", "होम पेज खोलो"],
    products: ["प्रोडक्ट खोलो", "प्रोडक्ट्स खोलो", "मार्केटप्लेस खोलो"],
    listings: ["लिस्टिंग खोलो", "मेरी लिस्टिंग खोलो", "फसल जोड़ो", "क्रॉप जोड़ो"],
    reports: ["रिपोर्ट खोलो", "हिस्ट्री खोलो", "मेरी रिपोर्ट"],
    detect: ["डिटेक्शन खोलो", "स्कैन करो", "रोग जांच"],
    profile: ["प्रोफाइल खोलो", "मेरा प्रोफाइल", "अकाउंट खोलो"],
    login: ["लॉगिन खोलो", "साइन इन", "लॉगिन"],
    signup: ["साइन अप", "रजिस्टर", "अकाउंट बनाओ"],
    help: ["मदद", "क्या कर सकते हो"],
    logout: ["लॉग आउट", "साइन आउट"],
    useLocation: ["लोकेशन लो", "मेरी लोकेशन लो", "लोकेशन इस्तेमाल करो"],
    sendOtp: ["ओटीपी भेजो", "ओटीपी", "कोड भेजो"],
    saveProfile: ["प्रोफाइल सेव करो", "प्रोफाइल अपडेट करो"],
    uploadPhoto: ["फोटो अपलोड करो", "इमेज अपलोड करो", "फोटो जोड़ो"],
    scrollDown: ["नीचे स्क्रॉल करो", "नीचे जाओ"],
    scrollUp: ["ऊपर स्क्रॉल करो", "ऊपर जाओ"],
    top: ["ऊपर ले चलो", "टॉप पर जाओ"],
    bottom: ["नीचे तक जाओ", "बॉटम पर जाओ"],
    back: ["पीछे जाओ", "वापस जाओ"],
    forward: ["आगे जाओ"],
    language: ["भाषा बदलो", "अनुवाद खोलो", "ट्रांसलेट खोलो"]
  },
  bn: {
    dashboard: ["ড্যাশবোর্ড খুলো", "ড্যাশবোর্ড"],
    products: ["প্রোডাক্ট খুলো", "মার্কেটপ্লেস খুলো"],
    listings: ["লিস্টিং খুলো", "ফসল যোগ করো"],
    reports: ["রিপোর্ট খুলো", "হিস্ট্রি খুলো"],
    detect: ["ডিটেকশন খুলো", "স্ক্যান করো"],
    profile: ["প্রোফাইল খুলো", "আমার প্রোফাইল"],
    login: ["লগইন খুলো", "সাইন ইন"],
    signup: ["সাইন আপ", "অ্যাকাউন্ট খুলো"],
    help: ["সাহায্য", "কি করতে পারো"],
    logout: ["লগ আউট"],
    useLocation: ["লোকেশন নাও", "আমার লোকেশন নাও"],
    sendOtp: ["ওটিপি পাঠাও"],
    saveProfile: ["প্রোফাইল সেভ করো"],
    uploadPhoto: ["ছবি আপলোড করো"],
    language: ["ভাষা বদলাও", "অনুবাদ খুলো"]
  },
  te: {
    dashboard: ["డాష్‌బోర్డ్ తెరువు", "డాష్‌బోర్డ్"],
    products: ["ప్రోడక్ట్స్ తెరువు", "మార్కెట్‌ప్లేస్ తెరువు"],
    listings: ["లిస్టింగ్స్ తెరువు", "పంట చేరు"],
    reports: ["రిపోర్ట్స్ తెరువు", "హిస్టరీ తెరువు"],
    detect: ["డిటెక్షన్ తెరువు", "స్కాన్ చేయి"],
    profile: ["ప్రొఫైల్ తెరువు"],
    login: ["లాగిన్ తెరువు", "సైన్ ఇన్"],
    signup: ["సైన్ అప్", "అకౌంట్ సృష్టించు"],
    help: ["సహాయం", "ఏం చేయగలవు"],
    logout: ["లాగ్ అవుట్"],
    useLocation: ["లోకేషన్ తీసుకో"],
    sendOtp: ["ఓటీపీ పంపు"],
    saveProfile: ["ప్రొఫైల్ సేవ్ చేయి"],
    uploadPhoto: ["ఫోటో అప్‌లోడ్ చేయి"],
    language: ["భాష మార్చు", "ట్రాన్స్‌లేట్ తెరువు"]
  },
  mr: {
    dashboard: ["डॅशबोर्ड उघड", "डॅशबोर्ड"],
    products: ["प्रॉडक्ट उघड", "मार्केटप्लेस उघड"],
    listings: ["लिस्टिंग उघड", "पीक जोडा"],
    reports: ["रिपोर्ट उघड", "हिस्ट्री उघड"],
    detect: ["डिटेक्शन उघड", "स्कॅन करा"],
    profile: ["प्रोफाइल उघड"],
    login: ["लॉगिन उघड", "साइन इन"],
    signup: ["साइन अप", "अकाउंट तयार करा"],
    help: ["मदत", "काय करू शकता"],
    logout: ["लॉग आउट"],
    useLocation: ["लोकेशन घ्या"],
    sendOtp: ["ओटीपी पाठवा"],
    saveProfile: ["प्रोफाइल सेव्ह करा"],
    uploadPhoto: ["फोटो अपलोड करा"],
    language: ["भाषा बदला", "ट्रान्सलेट उघडा"]
  },
  ta: {
    dashboard: ["டாஷ்போர்டு திற", "டாஷ்போர்டு"],
    products: ["ப்ரொடக்ட்ஸ் திற", "மார்க்கெட்ப்ளேஸ் திற"],
    listings: ["லிஸ்டிங்ஸ் திற", "பயிர் சேர்"],
    reports: ["ரிப்போர்ட்ஸ் திற", "ஹிஸ்டரி திற"],
    detect: ["டிடெக்ஷன் திற", "ஸ்கேன் செய்"],
    profile: ["ப்ரொஃபைல் திற"],
    login: ["லாகின் திற", "சைன் இன்"],
    signup: ["சைன் அப்", "அக்கவுண்ட் உருவாக்கு"],
    help: ["உதவி", "என்ன செய்ய முடியும்"],
    logout: ["லாக் அவுட்"],
    useLocation: ["லொக்கேஷன் எடு"],
    sendOtp: ["ஓடிபி அனுப்பு"],
    saveProfile: ["ப்ரொஃபைல் சேமி"],
    uploadPhoto: ["புகைப்படம் பதிவேற்று"],
    language: ["மொழி மாற்று", "டிரான்ஸ்லேட் திற"]
  },
  ur: {
    dashboard: ["ڈیش بورڈ کھولو", "ڈیش بورڈ"],
    products: ["پروڈکٹس کھولو", "مارکیٹ پلیس کھولو"],
    listings: ["لسٹنگ کھولو", "فصل شامل کرو"],
    reports: ["رپورٹس کھولو", "ہسٹری کھولو"],
    detect: ["ڈیٹیکشن کھولو", "اسکین کرو"],
    profile: ["پروفائل کھولو"],
    login: ["لاگ ان کھولو", "سائن ان"],
    signup: ["سائن اپ", "اکاؤنٹ بناؤ"],
    help: ["مدد", "کیا کر سکتے ہو"],
    logout: ["لاگ آؤٹ"],
    useLocation: ["لوکیشن لو"],
    sendOtp: ["او ٹی پی بھیجو"],
    saveProfile: ["پروفائل محفوظ کرو"],
    uploadPhoto: ["تصویر اپ لوڈ کرو"],
    language: ["زبان بدلو", "ترجمہ کھولو"]
  },
  gu: {
    dashboard: ["ડેશબોર્ડ ખોલો", "ડેશબોર્ડ"],
    products: ["પ્રોડક્ટ ખોલો", "માર્કેટપ્લેસ ખોલો"],
    listings: ["લિસ્ટિંગ ખોલો", "પાક ઉમેરો"],
    reports: ["રિપોર્ટ ખોલો", "હિસ્ટ્રી ખોલો"],
    detect: ["ડિટેક્શન ખોલો", "સ્કેન કરો"],
    profile: ["પ્રોફાઇલ ખોલો"],
    login: ["લોગિન ખોલો", "સાઇન ઇન"],
    signup: ["સાઇન અપ", "એકાઉન્ટ બનાવો"],
    help: ["મદદ", "તમે શું કરી શકો"],
    logout: ["લોગઆઉટ"],
    useLocation: ["લોકેશન લો"],
    sendOtp: ["ઓટીપી મોકલો"],
    saveProfile: ["પ્રોફાઇલ સેવ કરો"],
    uploadPhoto: ["ફોટો અપલોડ કરો"],
    language: ["ભાષા બદલો", "ટ્રાન્સલેટ ખોલો"]
  },
  kn: {
    dashboard: ["ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ", "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್"],
    products: ["ಪ್ರೊಡಕ್ಟ್ಸ್ ತೆರೆಯಿರಿ", "ಮಾರ್ಕೆಟ್‌ಪ್ಲೇಸ್ ತೆರೆಯಿರಿ"],
    listings: ["ಲಿಸ್ಟಿಂಗ್ಸ್ ತೆರೆಯಿರಿ", "ಬೆಳೆ ಸೇರಿಸಿ"],
    reports: ["ರಿಪೋರ್ಟ್ ತೆರೆಯಿರಿ", "ಹಿಸ್ಟರಿ ತೆರೆಯಿರಿ"],
    detect: ["ಡಿಟೆಕ್ಷನ್ ತೆರೆಯಿರಿ", "ಸ್ಕ್ಯಾನ್ ಮಾಡಿ"],
    profile: ["ಪ್ರೊಫೈಲ್ ತೆರೆಯಿರಿ"],
    login: ["ಲಾಗಿನ್ ತೆರೆಯಿರಿ", "ಸೈನ್ ಇನ್"],
    signup: ["ಸೈನ್ ಅಪ್", "ಖಾತೆ ತೆರೆಯಿರಿ"],
    help: ["ಸಹಾಯ", "ಏನು ಮಾಡಬಹುದು"],
    logout: ["ಲಾಗ್ ಔಟ್"],
    useLocation: ["ಲೊಕೇಶನ್ ತೆಗೆದುಕೊ"],
    sendOtp: ["ಒಟಿಪಿ ಕಳುಹಿಸಿ"],
    saveProfile: ["ಪ್ರೊಫೈಲ್ ಸೇವ್ ಮಾಡಿ"],
    uploadPhoto: ["ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ"],
    language: ["ಭಾಷೆ ಬದಲಿಸಿ", "ಟ್ರಾನ್ಸ್‌ಲೇಟ್ ತೆರೆಯಿರಿ"]
  },
  ml: {
    dashboard: ["ഡാഷ്ബോർഡ് തുറക്കൂ", "ഡാഷ്ബോർഡ്"],
    products: ["പ്രൊഡക്ട്സ് തുറക്കൂ", "മാർക്കറ്റ്പ്ലേസ് തുറക്കൂ"],
    listings: ["ലിസ്റ്റിംഗ് തുറക്കൂ", "വിള ചേർക്കൂ"],
    reports: ["റിപ്പോർട്ട് തുറക്കൂ", "ഹിസ്റ്ററി തുറക്കൂ"],
    detect: ["ഡിറ്റക്ഷൻ തുറക്കൂ", "സ്കാൻ ചെയ്യൂ"],
    profile: ["പ്രൊഫൈൽ തുറക്കൂ"],
    login: ["ലോഗിൻ തുറക്കൂ", "സൈൻ ഇൻ"],
    signup: ["സൈൻ അപ്പ്", "അക്കൗണ്ട് ഉണ്ടാക്കൂ"],
    help: ["സഹായം", "എന്ത് ചെയ്യാം"],
    logout: ["ലോഗ്ഔട്ട്"],
    useLocation: ["ലൊക്കേഷൻ എടുക്കൂ"],
    sendOtp: ["ഒടിപി അയക്കൂ"],
    saveProfile: ["പ്രൊഫൈൽ സേവ് ചെയ്യൂ"],
    uploadPhoto: ["ഫോട്ടോ അപ്ലോഡ് ചെയ്യൂ"],
    language: ["ഭാഷ മാറ്റൂ", "ട്രാൻസ്ലേറ്റ് തുറക്കൂ"]
  },
  pa: {
    dashboard: ["ਡੈਸ਼ਬੋਰਡ ਖੋਲ੍ਹੋ", "ਡੈਸ਼ਬੋਰਡ"],
    products: ["ਪਰੋਡਕਟ ਖੋਲ੍ਹੋ", "ਮਾਰਕੀਟਪਲੇਸ ਖੋਲ੍ਹੋ"],
    listings: ["ਲਿਸਟਿੰਗ ਖੋਲ੍ਹੋ", "ਫਸਲ ਜੋੜੋ"],
    reports: ["ਰਿਪੋਰਟ ਖੋਲ੍ਹੋ", "ਹਿਸਟਰੀ ਖੋਲ੍ਹੋ"],
    detect: ["ਡਿਟੈਕਸ਼ਨ ਖੋਲ੍ਹੋ", "ਸਕੈਨ ਕਰੋ"],
    profile: ["ਪਰੋਫਾਈਲ ਖੋਲ੍ਹੋ"],
    login: ["ਲਾਗਇਨ ਖੋਲ੍ਹੋ", "ਸਾਇਨ ਇਨ"],
    signup: ["ਸਾਇਨ ਅੱਪ", "ਅਕਾਉਂਟ ਬਣਾਓ"],
    help: ["ਮਦਦ", "ਤੁਸੀਂ ਕੀ ਕਰ ਸਕਦੇ ਹੋ"],
    logout: ["ਲਾਗ ਆਉਟ"],
    useLocation: ["ਲੋਕੇਸ਼ਨ ਲਓ"],
    sendOtp: ["ਓਟੀਪੀ ਭੇਜੋ"],
    saveProfile: ["ਪਰੋਫਾਈਲ ਸੇਵ ਕਰੋ"],
    uploadPhoto: ["ਫੋਟੋ ਅੱਪਲੋਡ ਕਰੋ"],
    language: ["ਭਾਸ਼ਾ ਬਦਲੋ", "ਟ੍ਰਾਂਸਲੇਟ ਖੋਲ੍ਹੋ"]
  },
  or: {
    dashboard: ["ଡାଶବୋର୍ଡ ଖୋଲ", "ଡାଶବୋର୍ଡ"],
    products: ["ପ୍ରୋଡକ୍ଟ ଖୋଲ", "ମାର୍କେଟପ୍ଲେସ ଖୋଲ"],
    listings: ["ଲିଷ୍ଟିଂ ଖୋଲ", "ଫସଲ ଯୋଡ଼"],
    reports: ["ରିପୋର୍ଟ ଖୋଲ", "ହିଷ୍ଟୋରି ଖୋଲ"],
    detect: ["ଡିଟେକ୍ସନ ଖୋଲ", "ସ୍କାନ କର"],
    profile: ["ପ୍ରୋଫାଇଲ ଖୋଲ"],
    login: ["ଲଗିନ ଖୋଲ", "ସାଇନ ଇନ"],
    signup: ["ସାଇନ ଅପ", "ଆକାଉଣ୍ଟ ବନାଅ"],
    help: ["ସାହାଯ୍ୟ", "ତୁମେ କଣ କରିପାରିବ"],
    logout: ["ଲଗ ଆଉଟ"],
    useLocation: ["ଲୋକେସନ ନିଅ"],
    sendOtp: ["ଓଟିପି ପଠାଅ"],
    saveProfile: ["ପ୍ରୋଫାଇଲ ସେଭ କର"],
    uploadPhoto: ["ଫୋଟୋ ଅପଲୋଡ କର"],
    language: ["ଭାଷା ବଦଳାଅ", "ଟ୍ରାନ୍ସଲେଟ ଖୋଲ"]
  },
  as: {
    dashboard: ["ডেশ্বব’ৰ্ড খোলক", "ডেশ্বব’ৰ্ড"],
    products: ["প্ৰডাক্ট খোলক", "মাৰ্কেটপ্লেচ খোলক"],
    listings: ["লিষ্টিং খোলক", "শস্য যোগ কৰক"],
    reports: ["ৰিপোৰ্ট খোলক", "হিষ্ট্ৰী খোলক"],
    detect: ["ডিটেকশ্যন খোলক", "স্কেন কৰক"],
    profile: ["প্ৰফাইল খোলক"],
    login: ["লগিন খোলক", "ছাইন ইন"],
    signup: ["ছাইন আপ", "একাউণ্ট বনাওক"],
    help: ["সহায়", "কি কৰিব পাৰা"],
    logout: ["লগ আউট"],
    useLocation: ["লোকেশন লওক"],
    sendOtp: ["অটিপি পঠাওক"],
    saveProfile: ["প্ৰফাইল সংৰক্ষণ কৰক"],
    uploadPhoto: ["ফটো আপলোড কৰক"],
    language: ["ভাষা সলনি কৰক", "ট্ৰান্সলেট খোলক"]
  },
  fr: {
    dashboard: ["ouvrir le tableau de bord", "tableau de bord"],
    products: ["ouvrir les produits", "ouvrir le marche"],
    listings: ["ouvrir les annonces", "ajouter une culture"],
    reports: ["ouvrir les rapports", "ouvrir l historique"],
    detect: ["ouvrir la detection", "scanner la culture"],
    profile: ["ouvrir le profil"],
    login: ["ouvrir la connexion", "se connecter"],
    signup: ["sinscrire", "creer un compte"],
    help: ["aide", "que peux tu faire"],
    logout: ["se deconnecter"],
    useLocation: ["utiliser la position", "prendre ma position"],
    sendOtp: ["envoyer otp", "envoyer le code"],
    saveProfile: ["enregistrer le profil"],
    uploadPhoto: ["telecharger la photo", "ajouter la photo"],
    language: ["changer la langue", "ouvrir la traduction"]
  },
  es: {
    dashboard: ["abrir panel", "abrir tablero", "panel"],
    products: ["abrir productos", "abrir mercado"],
    listings: ["abrir publicaciones", "agregar cultivo"],
    reports: ["abrir reportes", "abrir historial"],
    detect: ["abrir deteccion", "escanear cultivo"],
    profile: ["abrir perfil"],
    login: ["abrir inicio de sesion", "iniciar sesion"],
    signup: ["registrarme", "crear cuenta"],
    help: ["ayuda", "que puedes hacer"],
    logout: ["cerrar sesion"],
    useLocation: ["usar ubicacion", "tomar mi ubicacion"],
    sendOtp: ["enviar otp", "enviar codigo"],
    saveProfile: ["guardar perfil"],
    uploadPhoto: ["subir foto", "agregar foto"],
    language: ["cambiar idioma", "abrir traduccion"]
  },
  de: {
    dashboard: ["dashboard offnen", "zum dashboard"],
    products: ["produkte offnen", "marktplatz offnen"],
    listings: ["angebote offnen", "ernte hinzufugen"],
    reports: ["berichte offnen", "verlauf offnen"],
    detect: ["erkennung offnen", "pflanze scannen"],
    profile: ["profil offnen"],
    login: ["anmeldung offnen", "einloggen"],
    signup: ["registrieren", "konto erstellen"],
    help: ["hilfe", "was kannst du tun"],
    logout: ["abmelden"],
    useLocation: ["standort verwenden", "meinen standort nehmen"],
    sendOtp: ["otp senden", "code senden"],
    saveProfile: ["profil speichern"],
    uploadPhoto: ["foto hochladen", "foto hinzufugen"],
    language: ["sprache andern", "ubersetzung offnen"]
  },
  pt: {
    dashboard: ["abrir painel", "painel"],
    products: ["abrir produtos", "abrir marketplace"],
    listings: ["abrir listagens", "adicionar cultura"],
    reports: ["abrir relatorios", "abrir historico"],
    detect: ["abrir deteccao", "escanear cultura"],
    profile: ["abrir perfil"],
    login: ["abrir login", "entrar"],
    signup: ["cadastrar", "criar conta"],
    help: ["ajuda", "o que voce pode fazer"],
    logout: ["sair"],
    useLocation: ["usar localizacao", "pegar minha localizacao"],
    sendOtp: ["enviar otp", "enviar codigo"],
    saveProfile: ["salvar perfil"],
    uploadPhoto: ["enviar foto", "adicionar foto"],
    language: ["mudar idioma", "abrir traducao"]
  },
  ar: {
    dashboard: ["افتح لوحة التحكم", "لوحة التحكم"],
    products: ["افتح المنتجات", "افتح السوق"],
    listings: ["افتح القوائم", "اضف محصول"],
    reports: ["افتح التقارير", "افتح السجل"],
    detect: ["افتح الفحص", "افحص المحصول"],
    profile: ["افتح الملف الشخصي"],
    login: ["افتح تسجيل الدخول", "تسجيل الدخول"],
    signup: ["انشاء حساب", "سجل"],
    help: ["مساعدة", "ماذا تستطيع ان تفعل"],
    logout: ["تسجيل الخروج"],
    useLocation: ["استخدم الموقع", "خذ موقعي"],
    sendOtp: ["ارسل رمز", "ارسل otp"],
    saveProfile: ["احفظ الملف الشخصي"],
    uploadPhoto: ["ارفع الصورة", "اضف صورة"],
    language: ["غير اللغة", "افتح الترجمة"]
  },
  ja: {
    dashboard: ["ダッシュボードを開いて", "ダッシュボード"],
    products: ["商品を開いて", "マーケットを開いて"],
    listings: ["出品を開いて", "作物を追加して"],
    reports: ["レポートを開いて", "履歴を開いて"],
    detect: ["検出を開いて", "作物をスキャンして"],
    profile: ["プロフィールを開いて"],
    login: ["ログインを開いて", "サインイン"],
    signup: ["サインアップ", "アカウントを作成して"],
    help: ["ヘルプ", "何ができますか"],
    logout: ["ログアウト"],
    useLocation: ["位置情報を使って", "現在地を使って"],
    sendOtp: ["otpを送って", "コードを送って"],
    saveProfile: ["プロフィールを保存して"],
    uploadPhoto: ["写真をアップロードして"],
    language: ["言語を変えて", "翻訳を開いて"]
  },
  ko: {
    dashboard: ["대시보드 열어 줘", "대시보드"],
    products: ["상품 열어 줘", "마켓 열어 줘"],
    listings: ["목록 열어 줘", "작물 추가해 줘"],
    reports: ["리포트 열어 줘", "기록 열어 줘"],
    detect: ["탐지 열어 줘", "작물 스캔해 줘"],
    profile: ["프로필 열어 줘"],
    login: ["로그인 열어 줘", "로그인"],
    signup: ["회원가입", "계정 만들어 줘"],
    help: ["도움말", "무엇을 할 수 있어"],
    logout: ["로그아웃"],
    useLocation: ["위치 사용해 줘", "내 위치 써 줘"],
    sendOtp: ["otp 보내 줘", "코드 보내 줘"],
    saveProfile: ["프로필 저장해 줘"],
    uploadPhoto: ["사진 업로드해 줘"],
    language: ["언어 바꿔 줘", "번역 열어 줘"]
  },
  "zh-CN": {
    dashboard: ["打开仪表板", "仪表板"],
    products: ["打开产品", "打开市场"],
    listings: ["打开列表", "添加作物"],
    reports: ["打开报告", "打开历史"],
    detect: ["打开检测", "扫描作物"],
    profile: ["打开个人资料"],
    login: ["打开登录", "登录"],
    signup: ["注册", "创建账户"],
    help: ["帮助", "你能做什么"],
    logout: ["退出登录"],
    useLocation: ["使用位置", "获取我的位置"],
    sendOtp: ["发送验证码", "发送otp"],
    saveProfile: ["保存个人资料"],
    uploadPhoto: ["上传照片"],
    language: ["切换语言", "打开翻译"]
  },
  ru: {
    dashboard: ["открой панель", "панель управления"],
    products: ["открой товары", "открой рынок"],
    listings: ["открой объявления", "добавь урожай"],
    reports: ["открой отчеты", "открой историю"],
    detect: ["открой распознавание", "сканируй урожай"],
    profile: ["открой профиль"],
    login: ["открой вход", "войти"],
    signup: ["зарегистрируйся", "создай аккаунт"],
    help: ["помощь", "что ты умеешь"],
    logout: ["выйти"],
    useLocation: ["используй местоположение", "возьми мою локацию"],
    sendOtp: ["отправь otp", "отправь код"],
    saveProfile: ["сохрани профиль"],
    uploadPhoto: ["загрузи фото"],
    language: ["смени язык", "открой перевод"]
  }
};

const getCommandAliases = (groupName, selectedLanguage) => {
  const languageMap = localizedCommandAliases[selectedLanguage];
  return languageMap?.[groupName] || [];
};

const routeMatchers = [
  { phrases: ["home", "go home", "open home", "take me home"], path: "/", label: "home" },
  { phrases: ["login", "sign in", "open login", "open sign in"], path: "/login", label: "login" },
  { phrases: ["signup", "sign up", "create account", "register", "open signup"], path: "/signup", label: "signup" },
  { phrases: ["dashboard", "open dashboard", "show dashboard", "go to dashboard"], path: "/dashboard", label: "dashboard" },
  { phrases: ["detect", "detection", "disease detection", "scan crop", "open detect", "open scanner"], path: "/detect", label: "detection" },
  { phrases: ["history", "reports", "open reports", "my reports", "prediction history"], path: "/history", label: "reports" },
  { phrases: ["sell", "listings", "my listings", "sell crops", "open listings", "add crop"], path: "/sell", label: "listings" },
  { phrases: ["marketplace", "products", "open marketplace", "open products", "product page", "show products"], path: "/marketplace", label: "products" },
  { phrases: ["farmer listings", "owner marketplace", "open farmer listings", "owner page", "browse farmers"], path: "/owner-marketplace", label: "farmer listings" },
  { phrases: ["profile", "open profile", "my profile", "account page"], path: "/profile", label: "profile" }
];

const keywordIntents = [
  { label: "products", path: "/marketplace", keywords: ["product", "products", "input", "inputs", "buy", "market"] },
  { label: "farmer listings", path: "/owner-marketplace", keywords: ["farmer", "farmers", "owner", "browse", "request crop"] },
  { label: "listings", path: "/sell", keywords: ["sell", "listing", "listings", "crop listing", "add crop", "my crop"] },
  { label: "reports", path: "/history", keywords: ["report", "reports", "history", "prediction", "predictions"] },
  { label: "detection", path: "/detect", keywords: ["detect", "scan", "disease", "camera", "diagnosis"] },
  { label: "profile", path: "/profile", keywords: ["profile", "account", "photo", "image", "avatar"] },
  { label: "dashboard", path: "/dashboard", keywords: ["dashboard", "overview", "summary", "home panel"] },
  { label: "login", path: "/login", keywords: ["login", "signin", "sign in"] },
  { label: "signup", path: "/signup", keywords: ["signup", "sign up", "register", "create account"] }
];

const actionPhrases = {
  help: ["help", "what can you do", "show commands", "voice help"],
  goBack: ["go back", "back", "previous page"],
  goForward: ["go forward", "forward", "next page"],
  scrollDown: ["scroll down", "move down", "go down"],
  scrollUp: ["scroll up", "move up", "go up"],
  top: ["top of page", "scroll top", "go to top"],
  bottom: ["bottom of page", "scroll bottom", "go to bottom"],
  logout: ["logout", "log out", "sign me out"],
  stop: ["stop listening", "close voice assistant", "dismiss voice assistant"]
};

const buttonActionMatchers = [
  {
    keywords: ["send otp", "otp", "send code", "verification code"],
    targets: ["send otp", "continue"]
  },
  {
    keywords: ["sign in", "login now", "log me in", "submit login"],
    targets: ["sign in", "login"]
  },
  {
    keywords: ["create account", "register account", "signup now", "sign up now"],
    targets: ["create account", "continue", "sign up"]
  },
  {
    keywords: ["save profile", "update profile", "save my profile"],
    targets: ["save profile"]
  },
  {
    keywords: ["upload photo", "upload image", "add photo", "add image"],
    targets: ["upload photo"]
  },
  {
    keywords: ["remove photo", "delete photo", "remove image"],
    targets: ["remove photo"]
  },
  {
    keywords: ["add crop", "submit listing", "post listing", "save listing"],
    targets: ["add crop listing"]
  },
  {
    keywords: ["use location", "get location", "my location", "fetch location"],
    targets: ["use live", "use"]
  },
  {
    keywords: ["send message", "send chat", "reply now"],
    targets: ["send chat message"]
  },
  {
    keywords: ["accept request", "approve request", "accept this"],
    targets: ["accept request"]
  },
  {
    keywords: ["reject request", "decline request", "reject this"],
    targets: ["reject request"]
  },
  {
    keywords: ["confirm request", "confirm deal", "confirm from farmer side"],
    targets: ["confirm from farmer side", "final confirmed"]
  }
];

const projectKeywordGroups = {
  products: ["product", "products", "marketplace", "buy", "inputs"],
  listings: ["listing", "listings", "crop", "sell", "farmer listing"],
  reports: ["report", "reports", "history", "prediction"],
  detect: ["detect", "scan", "disease", "image"],
  profile: ["profile", "account", "photo", "avatar", "image"],
  auth: ["login", "sign in", "signup", "sign up", "otp", "register"],
  location: ["location", "address", "place", "use live"],
  language: ["language", "translate", "translation", "hindi", "english"],
  dashboard: ["dashboard", "overview", "summary"],
  chat: ["message", "chat", "reply", "request", "confirm"]
};

const commandIncludes = (command, phrases = []) =>
  phrases.some((phrase) => command.includes(phrase));

const includesAnyKeyword = (command, keywords = []) =>
  keywords.some((keyword) => command.includes(keyword));

const getBestKeywordIntent = (command) => {
  const scored = keywordIntents
    .map((intent) => ({
      ...intent,
      score: intent.keywords.filter((keyword) => command.includes(keyword)).length
    }))
    .filter((intent) => intent.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0] || null;
};

const getProjectContextHint = (command) => {
  if (includesAnyKeyword(command, projectKeywordGroups.products)) {
    return "It sounds like you want something in products or marketplace. You can say open products or open marketplace.";
  }

  if (includesAnyKeyword(command, projectKeywordGroups.listings)) {
    return "It sounds like you want crop listings. You can say add crop, open listings, or submit listing.";
  }

  if (includesAnyKeyword(command, projectKeywordGroups.reports)) {
    return "It sounds like you want reports or history. You can say open reports or open history.";
  }

  if (includesAnyKeyword(command, projectKeywordGroups.detect)) {
    return "It sounds like you want the detection page. You can say open detection or scan crop.";
  }

  if (includesAnyKeyword(command, projectKeywordGroups.profile)) {
    return "It sounds like you want profile actions. You can say open profile, upload photo, or save profile.";
  }

  if (includesAnyKeyword(command, projectKeywordGroups.auth)) {
    return "It sounds like you want account access. You can say sign in, create account, or send OTP.";
  }

  if (includesAnyKeyword(command, projectKeywordGroups.location)) {
    return "It sounds like you want location help. You can say use location or get my location.";
  }

  if (includesAnyKeyword(command, projectKeywordGroups.language)) {
    return "It sounds like you want translation. You can say translate page or open language menu.";
  }

  if (includesAnyKeyword(command, projectKeywordGroups.dashboard)) {
    return "It sounds like you want the dashboard. You can say open dashboard.";
  }

  if (includesAnyKeyword(command, projectKeywordGroups.chat)) {
    return "It sounds like you want request or chat actions. You can say send chat message, accept request, reject request, or confirm request.";
  }

  return "";
};

const conversationalReplies = [
  {
    phrases: ["hello", "hi", "hey", "good morning", "good evening", "good afternoon"],
    replies: [
      "Hi, I am right here with you. Tell me where you want to go.",
      "Hello. I am ready to help you around Khety.",
      "Hey, good to hear you. What would you like me to open?"
    ]
  },
  {
    phrases: ["how are you", "how are you doing", "how do you feel"],
    replies: [
      "I am doing well, and I am ready to help you smoothly through the app.",
      "I am feeling good. Tell me what you want to do next and I will handle it.",
      "I am great, thank you. Let us get your next step done."
    ]
  },
  {
    phrases: ["thank you", "thanks", "thank you so much", "thanks a lot"],
    replies: [
      "You are always welcome.",
      "Happy to help.",
      "Anytime. I am here whenever you need me."
    ]
  },
  {
    phrases: ["who are you", "what are you", "introduce yourself"],
    replies: [
      "I am your Khety voice assistant. I can guide you, open pages, and help you move around faster.",
      "I am the Khety voice guide. Think of me like your in-app teammate.",
      "I am your Khety assistant, here to help with navigation and quick actions."
    ]
  },
  {
    phrases: ["what can you do", "what all can you do", "how can you help me"],
    replies: [
      "I can open products, reports, profile, dashboard, listings, detection, and I can also scroll, go back, and log you out.",
      "I can help you move around Khety quickly. Try saying open products, open profile, add crop, open reports, or go to dashboard.",
      "I can navigate the app for you and respond to simple questions. You can ask me to open products, listings, profile, reports, or detection."
    ]
  },
  {
    phrases: ["i am confused", "help me", "i need help", "i need support"],
    replies: [
      "No problem. Tell me the page or task you want, and I will guide you step by step.",
      "I am with you. Just say something like open products, open profile, or go to dashboard.",
      "That is okay. Start with your goal, and I will help you get there."
    ]
  },
  {
    phrases: ["you are nice", "good job", "well done", "you are smart", "you are helpful"],
    replies: [
      "That is sweet of you. I am glad I could help.",
      "Thank you. Let us keep going.",
      "I appreciate that. Tell me the next thing you want to do."
    ]
  }
];

const pickReply = (replies = []) =>
  replies[Math.floor(Math.random() * replies.length)] || "";

function VoiceNavigator() {
  const navigate = useNavigate();
  const location = useLocation();
  const recognitionRef = useRef(null);
  const panelRef = useRef(null);
  const [selectedLanguage, setSelectedLanguage] = useState(
    () => sessionStorage.getItem("siteLanguage") || "en"
  );
  const [supported, setSupported] = useState(Boolean(SpeechRecognition));
  const [isListening, setIsListening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("Voice navigation is ready.");
  const [transcript, setTranscript] = useState("");

  const helpCommands = useMemo(
    () => [
      "go to dashboard",
      "open products",
      "open profile",
      "add crop",
      "open reports",
      "scroll down",
      "click sign in",
      "logout",
      "what can you do"
    ],
    []
  );

  const speakFeedback = useCallback((text) => {
    if (!window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLocales[selectedLanguage] || speechLocales.en;
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, [selectedLanguage]);

  const setStatus = useCallback((text, shouldSpeak = true) => {
    setMessage(text);
    if (shouldSpeak) {
      speakFeedback(text);
    }
  }, [speakFeedback]);

  const clickElementByVoice = useCallback((command) => {
    const candidates = Array.from(
      document.querySelectorAll("button, a, [role='button']")
    ).filter((element) => {
      const label = normalizeText(
        element.innerText ||
          element.textContent ||
          element.getAttribute("aria-label") ||
          ""
      );

      return (
        label &&
        !element.hasAttribute("disabled") &&
        (label.includes(command) || command.includes(label))
      );
    });

    if (candidates.length > 0) {
      candidates[0].click();
      return true;
    }

    return false;
  }, []);

  const handleVoiceCommand = useCallback((rawCommand) => {
    const command = normalizeText(rawCommand);
    const localizedRouteMatchers = routeMatchers.map((route) => ({
      ...route,
      phrases: [...route.phrases, ...getCommandAliases(route.label, selectedLanguage)]
    }));
    const localizedActionPhrases = {
      help: [...actionPhrases.help, ...getCommandAliases("help", selectedLanguage)],
      goBack: [...actionPhrases.goBack, ...getCommandAliases("back", selectedLanguage)],
      goForward: [...actionPhrases.goForward, ...getCommandAliases("forward", selectedLanguage)],
      scrollDown: [...actionPhrases.scrollDown, ...getCommandAliases("scrollDown", selectedLanguage)],
      scrollUp: [...actionPhrases.scrollUp, ...getCommandAliases("scrollUp", selectedLanguage)],
      top: [...actionPhrases.top, ...getCommandAliases("top", selectedLanguage)],
      bottom: [...actionPhrases.bottom, ...getCommandAliases("bottom", selectedLanguage)],
      logout: [...actionPhrases.logout, ...getCommandAliases("logout", selectedLanguage)],
      stop: [...actionPhrases.stop]
    };
    const localizedButtonMatchers = buttonActionMatchers.map((matcher) => {
      const aliases = {
        "send otp": getCommandAliases("sendOtp", selectedLanguage),
        "save profile": getCommandAliases("saveProfile", selectedLanguage),
        "upload photo": getCommandAliases("uploadPhoto", selectedLanguage),
        "use location": getCommandAliases("useLocation", selectedLanguage),
        "sign in": getCommandAliases("login", selectedLanguage),
        "create account": getCommandAliases("signup", selectedLanguage),
        "add crop": getCommandAliases("listings", selectedLanguage)
      };
      const extraKeywords = Object.entries(aliases)
        .filter(([keyword]) => matcher.keywords.some((item) => item.includes(keyword)))
        .flatMap(([, values]) => values);

      return {
        ...matcher,
        keywords: [...matcher.keywords, ...extraKeywords]
      };
    });

    if (!command) {
      setStatus("I did not catch that. Please try again.");
      return;
    }

    setTranscript(rawCommand);

    const conversationalMatch = conversationalReplies.find(({ phrases }) =>
      phrases.some((phrase) => command.includes(phrase))
    );

    if (conversationalMatch) {
      setStatus(pickReply(conversationalMatch.replies));
      return;
    }

    const matchedRoute = localizedRouteMatchers.find(({ phrases }) =>
      phrases.some((phrase) => command.includes(phrase))
    );

    if (matchedRoute) {
      navigate(matchedRoute.path);
      setStatus(`Opening ${matchedRoute.label}.`);
      return;
    }

    const keywordIntent = getBestKeywordIntent(command);

    if (keywordIntent) {
      navigate(keywordIntent.path);
      setStatus(`Taking you to ${keywordIntent.label}.`);
      return;
    }

    if (commandIncludes(command, localizedActionPhrases.help)) {
      setStatus(
        "You can ask me to open products, listings, reports, profile, detection, dashboard, or farmer listings. I can also help with send OTP, save profile, use location, and some request actions."
      );
      return;
    }

    if (commandIncludes(command, localizedActionPhrases.goBack)) {
      window.history.back();
      setStatus("Going back.");
      return;
    }

    if (commandIncludes(command, localizedActionPhrases.goForward)) {
      window.history.forward();
      setStatus("Going forward.");
      return;
    }

    if (commandIncludes(command, localizedActionPhrases.scrollDown)) {
      window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
      setStatus("Scrolling down.");
      return;
    }

    if (commandIncludes(command, localizedActionPhrases.scrollUp)) {
      window.scrollBy({ top: -window.innerHeight * 0.8, behavior: "smooth" });
      setStatus("Scrolling up.");
      return;
    }

    if (commandIncludes(command, localizedActionPhrases.top)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setStatus("Going to the top.");
      return;
    }

    if (commandIncludes(command, localizedActionPhrases.bottom)) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      setStatus("Going to the bottom.");
      return;
    }

    if (commandIncludes(command, localizedActionPhrases.logout)) {
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("siteLanguage");
      navigate("/login");
      setStatus("Logged out.");
      return;
    }

    if (commandIncludes(command, localizedActionPhrases.stop)) {
      setIsOpen(false);
      setStatus("Closing voice assistant.");
      return;
    }

    if (
      command.includes("translate") ||
      command.includes("language") ||
      command.includes("change language") ||
      includesAnyKeyword(command, getCommandAliases("language", selectedLanguage))
    ) {
      const translatorTrigger =
        document.querySelector(".translator-trigger") ||
        Array.from(document.querySelectorAll("button")).find((button) =>
          normalizeText(button.textContent || "").includes("translate")
        );

      if (translatorTrigger) {
        translatorTrigger.click();
        setStatus("Opening translation options.");
        return;
      }
    }

    const clickCommand = command.replace(/^click\s+/, "").trim();
    if (command.startsWith("click ") && clickCommand && clickElementByVoice(clickCommand)) {
      setStatus(`Clicked ${clickCommand}.`);
      return;
    }

    const localizedTriggerMatchedButtonAction = (voiceCommand) => {
      const match = localizedButtonMatchers.find(({ keywords }) =>
        includesAnyKeyword(voiceCommand, keywords)
      );

      if (!match) {
        return false;
      }

      return match.targets.some((target) => clickElementByVoice(target));
    };

    if (localizedTriggerMatchedButtonAction(command)) {
      setStatus("Done. I handled that action for you.");
      return;
    }

    if (clickElementByVoice(command)) {
      setStatus(`Done. I matched an action for ${rawCommand}.`);
      return;
    }

    const contextHint = getProjectContextHint(command);

    setStatus(
      contextHint ||
        `I heard ${rawCommand}. I could not finish that exact step yet, but I can still help with products, listings, profile, reports, detection, dashboard, auth, and request actions.`
    );
  }, [clickElementByVoice, navigate, selectedLanguage, setStatus]);

  useEffect(() => {
    const syncLanguage = () => {
      setSelectedLanguage(sessionStorage.getItem("siteLanguage") || "en");
    };

    syncLanguage();
    window.addEventListener("storage", syncLanguage);
    window.addEventListener("focus", syncLanguage);

    return () => {
      window.removeEventListener("storage", syncLanguage);
      window.removeEventListener("focus", syncLanguage);
    };
  }, []);

  useEffect(() => {
    if (!SpeechRecognition) {
      setSupported(false);
      setMessage("Voice navigation is not supported in this browser.");
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = speechLocales[selectedLanguage] || speechLocales.en;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("Listening...");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setStatus(`Voice recognition error: ${event.error}`);
    };

    recognition.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript || "";
      handleVoiceCommand(text);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [handleVoiceCommand, selectedLanguage, setStatus]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const toggleListening = () => {
    if (!supported || !recognitionRef.current) {
      setStatus("Voice navigation is not available in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    recognitionRef.current.start();
  };

  return (
    <div className="fixed right-0 top-1/2 z-[60] -translate-y-1/2" ref={panelRef}>
      <div className="flex items-center gap-2 pr-3">
        {isOpen ? (
          <div className="w-[min(84vw,330px)] rounded-[24px] border border-white/70 bg-white/95 p-4 shadow-[0_18px_60px_rgba(16,34,23,0.18)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#8a5b21]">
                  Voice Navigation
                </p>
                <p className="mt-2 text-sm font-semibold text-[#102217]">
                  {location.pathname === "/" ? "Site-wide commands enabled" : `Active on ${location.pathname}`}
                </p>
              </div>

              <button
                type="button"
                onClick={toggleListening}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                  isListening
                    ? "bg-[#9b1c1c] text-white shadow-[0_0_0_8px_rgba(155,28,28,0.12)]"
                    : "bg-[#215732] text-white hover:bg-[#173d24]"
                }`}
              >
                Mic
              </button>
            </div>

            <p className="mt-4 rounded-2xl bg-[#f6f8f3] px-4 py-3 text-sm leading-6 text-[#4f5f55]">
              {message}
            </p>

            {transcript ? (
              <p className="mt-3 text-xs text-[#6d7a71]">
                Last heard: <span className="font-semibold text-[#102217]">{transcript}</span>
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              {helpCommands.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-[#eef4ee] px-3 py-2 text-xs font-semibold text-[#215732]"
                >
                  {item}
                </span>
              ))}
            </div>

            <p className="mt-4 text-xs leading-6 text-[#6d7a71]">
              Every matched command is spoken back so the assistant feels hands-free while you move
              through the app.
            </p>

            {!supported ? (
              <p className="mt-3 text-xs text-rose-600">
                This browser does not support the Web Speech API.
              </p>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="voice-toggle-tab flex min-h-[54px] w-9 items-center justify-center rounded-l-2xl rounded-r-none bg-[#102217] px-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white shadow-[0_18px_40px_rgba(16,34,23,0.22)] transition hover:w-10 hover:bg-[#173724]"
          aria-label="Open voice navigation"
        >
          <span className="[writing-mode:vertical-rl] rotate-180">
            Voice
          </span>
        </button>
      </div>
    </div>
  );
}

export default VoiceNavigator;
