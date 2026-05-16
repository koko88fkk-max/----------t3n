import axios from 'axios';

// ==========================================
// ضع التوكن ورقم التطبيق هنا قبل تشغيل الملف
// ==========================================
const BOT_TOKEN = 'ضع_التوكن_هنا';
const APP_ID = 'ضع_الـ_Application_ID_هنا';

const url = `https://discord.com/api/v10/applications/${APP_ID}/commands`;

const commands = [
  {
    name: 'genkey',
    description: 'لوحة تحكم بوابة تعن',
    type: 1, // CHAT_INPUT
    options: []
  },
  {
    name: 'إرسال مفتاح', // User Command
    type: 2 // USER
  }
];

async function registerCommand() {
  try {
    console.log('جاري تسجيل الأوامر في الديسكورد...');
    const response = await axios.put(url, commands, {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ تم تسجيل الأوامر بنجاح!');
    console.log(response.data);
  } catch (error) {
    console.error('❌ حدث خطأ:', error.response ? error.response.data : error.message);
  }
}

registerCommand();
