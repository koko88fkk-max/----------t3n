import axios from 'axios';

// ==========================================
// ضع التوكن ورقم التطبيق هنا قبل تشغيل الملف
// ==========================================
const BOT_TOKEN = 'ضع_التوكن_هنا';
const APP_ID = 'ضع_الـ_Application_ID_هنا';

const url = `https://discord.com/api/v10/applications/${APP_ID}/commands`;

const commandData = {
  name: 't3nkey',
  description: 'لوحة تحكم بوابة تعن',
  options: []
};

async function registerCommand() {
  try {
    console.log('جاري تسجيل الأمر في الديسكورد...');
    const response = await axios.post(url, commandData, {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ تم تسجيل الأمر بنجاح!');
    console.log(response.data);
  } catch (error) {
    console.error('❌ حدث خطأ:', error.response ? error.response.data : error.message);
  }
}

registerCommand();
