import admin from 'firebase-admin';
import crypto from 'crypto';

// Disable default body parser to get raw body for Discord signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

// Initialize Firebase Admin (Only once)
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : "";

  if (privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || 't3n-stor-cd7d7',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@t3n-stor-cd7d7.iam.gserviceaccount.com',
        privateKey: privateKey,
      }),
    });
  }
}

const db = admin.firestore();
const ALLOWED_CHANNEL_ID = '1494851523010625562';
const T3N_COLOR = 0x1A1A2E;
const BANNER_URL = 'https://t3n-2a2i.vercel.app/banner.png';

function generateRandomKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let p1 = '';
  let p2 = '';
  for(let i=0;i<6;i++) p1 += chars.charAt(Math.floor(Math.random() * chars.length));
  for(let i=0;i<6;i++) p2 += chars.charAt(Math.floor(Math.random() * chars.length));
  return `T3N-${p1}-${p2}`;
}

function verifyInteractionSignature(req, bodyText) {
  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];
  const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

  if (!signature || !timestamp || !PUBLIC_KEY) return false;

  try {
    return crypto.verify(
      null,
      Buffer.from(timestamp + bodyText),
      {
        key: crypto.createPublicKey({
          format: 'der',
          type: 'spki',
          key: Buffer.concat([
            Buffer.from('302a300506032b6570032100', 'hex'),
            Buffer.from(PUBLIC_KEY, 'hex'),
          ]),
        }),
      },
      Buffer.from(signature, 'hex')
    );
  } catch (err) {
    return false;
  }
}

const PRODUCT_NAMES = {
  'fortnite_unban': 'فك باند فورت هاردوير',
  'spoofer_t3n': 'سبوفر تعن',
  'spoofer_temp': 'سبوفر تيمب'
};

function getPanelUI() {
  return {
    type: 4,
    data: {
      flags: 64,
      embeds: [{
        title: "لوحة تحكم مفاتيح T3N",
        description: "اختر الإجراء الذي تريد القيام به من الأزرار أدناه:",
        color: T3N_COLOR,
        image: { url: BANNER_URL },
        footer: { text: "© 2026 Copyright T3N. All Rights Reserved." }
      }],
      components: [
        {
          type: 1,
          components: [
            { type: 2, style: 1, label: "إنشاء مفتاح", emoji: { name: "🔑" }, custom_id: "gen_single" },
            { type: 2, style: 1, label: "إنشاء متعدد", emoji: { name: "🗂️" }, custom_id: "gen_multi" },
            { type: 2, style: 3, label: "إرسال لشخص", emoji: { name: "✉️" }, custom_id: "send_to_user" },
          ]
        },
        {
          type: 1,
          components: [
            { type: 2, style: 4, label: "حذف مفتاح", emoji: { name: "🗑️" }, custom_id: "delete_key" },
            { type: 2, style: 4, label: "حظر مفتاح", emoji: { name: "🚫" }, custom_id: "ban_key" },
            { type: 2, style: 2, label: "كشف صاحب المفتاح", emoji: { name: "🔍" }, custom_id: "info_key" },
            { type: 2, style: 2, label: "الإحصائيات", emoji: { name: "📊" }, custom_id: "stats" }
          ]
        }
      ]
    }
  };
}

function getProductSelectUI(mode) {
  // mode = 'single' or 'multi' or 'send_USERID'
  let prefix = '';
  let title = "اختر نوع المنتج";
  if (mode === 'single') { prefix = 'pick_single_'; title = "🔑 اختر نوع المنتج"; }
  else if (mode === 'multi') { prefix = 'pick_multi_'; title = "🗂️ اختر نوع المنتج (إنشاء متعدد)"; }
  else if (mode.startsWith('send_')) { prefix = `pick_${mode}_`; title = "✉️ اختر المنتج للإرسال"; }

  return {
    type: 4,
    data: {
      flags: 64,
      embeds: [{
        title: title,
        description: "اضغط على المنتج المطلوب:",
        color: T3N_COLOR,
        footer: { text: "© 2026 Copyright T3N. All Rights Reserved." }
      }],
      components: [
        {
          type: 1,
          components: [
            { type: 2, style: 1, label: "فك باند فورت هاردوير", emoji: { name: "🎮" }, custom_id: prefix + "fortnite_unban" },
            { type: 2, style: 1, label: "سبوفر تعن", emoji: { name: "🛡️" }, custom_id: prefix + "spoofer_t3n" },
            { type: 2, style: 1, label: "سبوفر تيمب", emoji: { name: "⏱️" }, custom_id: prefix + "spoofer_temp" }
          ]
        },
        {
          type: 1,
          components: [
            { type: 2, style: 2, label: "رجوع للوحة التحكم", emoji: { name: "🔙" }, custom_id: "back_to_panel" }
          ]
        }
      ]
    }
  };
}

async function sendDM(userId, messageData) {
  // Check multiple possible env vars for the bot token
  const token = process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN || process.env.DISCORD_TOKEN;
  if (!token) {
    console.error("Missing Bot Token in Environment Variables");
    return false;
  }
  
  try {
    // 1. Create DM Channel
    const dmRes = await fetch('https://discord.com/api/v10/users/@me/channels', {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ recipient_id: userId })
    });
    const dmChannel = await dmRes.json();
    if (!dmChannel.id) {
      console.error("Failed to create DM channel:", dmChannel);
      return false;
    }

    // 2. Send Message
    const msgRes = await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    });
    
    if (!msgRes.ok) {
      console.error("Failed to send message:", await msgRes.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("DM Error:", e);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const rawBody = await getRawBody(req);
    if (!verifyInteractionSignature(req, rawBody)) {
      return res.status(401).json({ error: 'invalid request signature' });
    }

    const interaction = JSON.parse(rawBody);

    // Ping
    if (interaction.type === 1) return res.status(200).json({ type: 1 });

    // Check Channel
    if (interaction.channel_id !== ALLOWED_CHANNEL_ID) {
      return res.status(200).json({
        type: 4,
        data: { content: "❌ عذراً، لا يمكنك استخدام البوت إلا في روم الإدارة المخصص.", flags: 64 }
      });
    }

    // ==== Type 2: Commands (Slash & Context Menu) ====
    if (interaction.type === 2) {
      // 1. Slash Command
      if (interaction.data.name === 'genkey' && interaction.data.type === 1) {
        return res.status(200).json(getPanelUI());
      }
      
      // 2. User Context Menu Command
      if (interaction.data.name === 'إرسال مفتاح' && interaction.data.type === 2) {
        const targetUserId = interaction.data.target_id;
        if (!targetUserId) {
          return res.status(200).json({
            type: 4,
            data: { content: "❌ تعذر العثور على الشخص.", flags: 64 }
          });
        }
        // Return the product selection UI directly for this user
        return res.status(200).json(getProductSelectUI(`send_${targetUserId}`));
      }
    }

    // ==== Type 3: Component Clicks / Selects ====
    if (interaction.type === 3) {
      const cid = interaction.data.custom_id;

      if (cid === 'gen_single') return res.status(200).json(getProductSelectUI('single'));
      if (cid === 'gen_multi') return res.status(200).json(getProductSelectUI('multi'));
      
      // Changed: Instead of a Select Menu message, we open a Modal directly
      if (cid === 'send_to_user') {
        return res.status(200).json({
          type: 9,
          data: {
            title: "إرسال مفتاح لشخص",
            custom_id: "modal_send_user_id",
            components: [{
              type: 1,
              components: [{
                type: 4, // Text Input
                custom_id: "input_val",
                style: 1, // Short text
                label: "أدخل أيدي الشخص (User ID):",
                placeholder: "مثال: 123456789012345678",
                required: true,
                min_length: 15,
                max_length: 22
              }]
            }]
          }
        });
      }

      // Handle Send to User generation
      if (cid && cid.startsWith('pick_send_')) {
        // cid format: pick_send_<USERID>_<PRODUCT>
        const parts = cid.replace('pick_send_', '').split('_');
        const targetUserId = parts[0];
        const productType = parts.slice(1).join('_');
        const productName = PRODUCT_NAMES[productType] || productType;
        
        const newKey = generateRandomKey();
        await db.collection('keys').doc(newKey).set({
          productType: productType,
          status: 'unused',
          createdAt: new Date().toISOString(),
          createdBy: interaction.member?.user?.username || 'DiscordBot',
          usedByUid: null,
          sentToUser: targetUserId
        });

        // Send DM
        const dmContent = {
          content: "https://t3n-2a2i.vercel.app/\n\n`" + newKey + "` *مفتاح موقع*\n\n**خطوات التفعيل:**\n1. يرجى تسجيل الدخول في الموقع عبر حساب الديسكورد.\n2. الذهاب إلى \"بوابة التفعيل\" وتفعيل المفتاح.\n3. الانتقال إلى تحميل الملفات ومشاهدة شروحات الفيديو.",
          embeds: [{
            title: "بوابة تعن T3N | الرقمية",
            description: "متجر تعن T3N - وجهتك الأولى للمنتجات الرقمية المتميزة. سبوفر بيرم، فك باند فورت نايت، وأكثر.",
            color: T3N_COLOR,
            url: "https://t3n-2a2i.vercel.app/"
          }]
        };

        const dmSuccess = await sendDM(targetUserId, dmContent);

        return res.status(200).json({
          type: 4,
          data: {
            flags: 64,
            embeds: [{
              title: "✉️ T3N | Key Sent",
              description: `✅ **تم إنشاء المفتاح بنجاح!**\n\n👤 **تم الإرسال إلى:** <@${targetUserId}>\n📦 **المنتج:** ${productName}\n🔹 **المفتاح:**\n\`\`\`\n${newKey}\n\`\`\`\n📨 **حالة الإرسال بالخاص:** ${dmSuccess ? '✅ نجح' : '❌ فشل (يجب وضع توكن البوت في Vercel، أو الخاص مغلق)'}`,
              color: T3N_COLOR,
              footer: { text: "© 2026 Copyright T3N. All Rights Reserved." }
            }]
          }
        });
      }

      // Handle single key generation after product selection
      if (cid && cid.startsWith('pick_single_')) {
        const productType = cid.replace('pick_single_', '');
        const productName = PRODUCT_NAMES[productType] || productType;
        const newKey = generateRandomKey();
        await db.collection('keys').doc(newKey).set({
          productType: productType,
          status: 'unused',
          createdAt: new Date().toISOString(),
          createdBy: interaction.member?.user?.username || 'DiscordBot',
          usedByUid: null
        });

        return res.status(200).json({
          type: 4,
          data: {
            flags: 64,
            embeds: [{
              title: "🔑 T3N | Key Generated",
              description: `✅ **Key Generation Successful!**\n\n📦 **المنتج:** ${productName}\n🔹 **Your License Key:**\n\`\`\`\n${newKey}\n\`\`\`\n⏳ **Duration:** مدى الحياة (Lifetime)`,
              color: T3N_COLOR,
              thumbnail: { url: "https://t3n-2a2i.vercel.app/discord-thumb.png" },
              image: { url: BANNER_URL },
              footer: { text: "© 2026 Copyright T3N. All Rights Reserved." }
            }]
          }
        });
      }

      // Handle multi key - show modal to enter count, with product type stored in custom_id
      if (cid && cid.startsWith('pick_multi_')) {
        const productType = cid.replace('pick_multi_', '');
        return res.status(200).json({
          type: 9,
          data: {
            title: "إنشاء مفاتيح متعددة",
            custom_id: `modal_gen_multi_${productType}`,
            components: [{
              type: 1,
              components: [{
                type: 4,
                custom_id: "input_val",
                style: 1,
                label: "عدد المفاتيح (الحد الأقصى 100):",
                required: true
              }]
            }]
          }
        });
      }

      if (['delete_key', 'ban_key', 'info_key'].includes(cid)) {
        let title, label;
        if (cid === 'delete_key') { title = "حذف مفتاح"; label = "أدخل المفتاح:"; }
        if (cid === 'ban_key') { title = "حظر مفتاح"; label = "أدخل المفتاح:"; }
        if (cid === 'info_key') { title = "كشف صاحب المفتاح"; label = "أدخل المفتاح:"; }

        return res.status(200).json({
          type: 9,
          data: {
            title: title,
            custom_id: `modal_${cid}`,
            components: [{
              type: 1,
              components: [{
                type: 4,
                custom_id: "input_val",
                style: 1,
                label: label,
                required: true
              }]
            }]
          }
        });
      }

      if (cid === 'stats') {
        const snapUnused = await db.collection('keys').where('status', '==', 'unused').count().get();
        const snapUsed = await db.collection('keys').where('status', '==', 'active').count().get();
        const snapBanned = await db.collection('keys').where('status', '==', 'banned').count().get();
        
        const unused = snapUnused.data().count;
        const used = snapUsed.data().count;
        const banned = snapBanned.data().count;
        const total = unused + used + banned;

        return res.status(200).json({
          type: 4,
          data: {
            flags: 64,
            embeds: [{
              title: "📊 إحصائيات مفاتيح T3N",
              description: `🟢 **المفاتيح المتاحة:** \`${unused}\`\n🔴 **المفاتيح المستخدمة:** \`${used}\`\n⚫ **المفاتيح المحظورة:** \`${banned}\`\n\n━━━━━━━━━━━━━━━━━━\n🔢 **إجمالي المفاتيح:** \`${total}\``,
              color: T3N_COLOR,
              thumbnail: { url: "https://t3n-2a2i.vercel.app/discord-thumb.png" },
              image: { url: BANNER_URL },
              footer: { text: "© 2026 Copyright T3N. All Rights Reserved." }
            }],
            components: [{
              type: 1,
              components: [
                { type: 2, style: 2, label: "رجوع للوحة التحكم", emoji: { name: "🔙" }, custom_id: "back_to_panel" }
              ]
            }]
          }
        });
      }

      if (cid === 'back_to_panel') {
        // Update existing message (type 7)
        return res.status(200).json({
          type: 7,
          data: getPanelUI().data
        });
      }
    }

    // ==== Type 5: Modal Submits ====
    if (interaction.type === 5) {
      const cid = interaction.data.custom_id;
      const inputVal = interaction.data.components[0].components[0].value.trim();

      // Handle User ID Modal Submit
      if (cid === 'modal_send_user_id') {
        const userId = inputVal.match(/\d+/)?.[0];
        if (!userId || userId.length < 15) {
          return res.status(200).json({
            type: 4,
            data: { content: "❌ أيدي الشخص غير صحيح (User ID). تأكد من إدخال الأرقام فقط.", flags: 64 }
          });
        }
        return res.status(200).json(getProductSelectUI(`send_${userId}`));
      }

      // Handle multi-key generation with product type in custom_id
      if (cid.startsWith('modal_gen_multi_')) {
        const productType = cid.replace('modal_gen_multi_', '');
        const productName = PRODUCT_NAMES[productType] || productType;
        let count = parseInt(inputVal);
        if (isNaN(count) || count < 1 || count > 100) {
          return res.status(200).json({
            type: 4,
            data: { content: "❌ الرجاء إدخال رقم صحيح بين 1 و 100.", flags: 64 }
          });
        }

        let keys = [];
        const batch = db.batch();
        for (let i = 0; i < count; i++) {
          const k = generateRandomKey();
          keys.push(k);
          batch.set(db.collection('keys').doc(k), {
            productType: productType,
            status: 'unused',
            createdAt: new Date().toISOString(),
            createdBy: interaction.member?.user?.username || 'DiscordBot',
            usedByUid: null
          });
        }
        await batch.commit();

        return res.status(200).json({
          type: 4,
          data: {
            embeds: [{
              title: "🔑 T3N | Keys Generated",
              description: `✅ **Key Generation Successful!**\n\n📦 **المنتج:** ${productName}\n🔹 **Your License Key(s):**\n\`\`\`\n${keys.join('\n')}\n\`\`\`\n⏳ **Duration:** مدى الحياة (Lifetime)`,
              color: T3N_COLOR,
              thumbnail: { url: "https://t3n-2a2i.vercel.app/discord-thumb.png" },
              image: { url: BANNER_URL },
              footer: { text: "© 2026 Copyright T3N. All Rights Reserved." }
            }]
          }
        });
      }

      const cleanKey = inputVal.toUpperCase();

      if (cid === 'modal_delete_key') {
        await db.collection('keys').doc(cleanKey).delete();
        return res.status(200).json({
          type: 4,
          data: { content: `✅ تم حذف المفتاح \`${cleanKey}\` بنجاح!`, flags: 64 }
        });
      }

      if (cid === 'modal_ban_key') {
        await db.collection('keys').doc(cleanKey).update({ status: 'banned' });
        return res.status(200).json({
          type: 4,
          data: { content: `🚫 تم حظر المفتاح \`${cleanKey}\` بنجاح!`, flags: 64 }
        });
      }

      if (cid === 'modal_info_key') {
        const snap = await db.collection('keys').doc(cleanKey).get();
        if (!snap.exists) {
          return res.status(200).json({
            type: 4,
            data: { content: "❌ المفتاح غير موجود في النظام.", flags: 64 }
          });
        }
        const data = snap.data();
        let statusEmoji = data.status === 'unused' ? "🟢" : data.status === 'active' ? "🔴" : "⚫";
        let statusText = data.status === 'unused' ? "لم يتم استخدامه (متاح)" : data.status === 'active' ? "مستخدم" : "محظور";
        
        const createdTs = Math.floor(new Date(data.createdAt).getTime() / 1000);
        
        let desc = `🔑 **المفتاح:** \`${cleanKey}\`\n`;
        desc += `📌 **الحالة:** ${statusEmoji} **${statusText}**\n`;
        desc += `📅 **تاريخ الإنشاء:** <t:${createdTs}:f> (<t:${createdTs}:R>)\n`;
        
        if (data.status === 'active' || data.usedByUid) {
          desc += `\n━━━━━━━━━━━━━━━━━━\n**معلومات التفعيل:**\n`;
          if (data.activatedAt) {
             const actTs = Math.floor(new Date(data.activatedAt).getTime() / 1000);
             desc += `🕒 **وقت التفعيل:** <t:${actTs}:f> (<t:${actTs}:R>)\n`;
          }
          desc += `📝 **الاسم:** ${data.usedByName || 'غير متوفر'}\n`;
          desc += `📧 **الإيميل:** ${data.usedByEmail || 'غير متوفر'}\n`;
          
          if (data.usedByUid) {
            let discordIdMatch = data.usedByUid.match(/\d+/);
            if (discordIdMatch) {
              desc += `👤 **حساب الديسكورد:** <@${discordIdMatch[0]}>\n`;
            } else {
              desc += `👤 **معرف الحساب:** ${data.usedByUid}\n`;
            }
          }
        }

        const embedInfo = {
          title: "🔍 تفاصيل المفتاح",
          description: desc,
          color: T3N_COLOR,
          footer: { text: "© 2026 Copyright T3N. All Rights Reserved." }
        };

        if (data.usedByPhoto) {
          embedInfo.thumbnail = { url: data.usedByPhoto };
        }

        return res.status(200).json({
          type: 4,
          data: { flags: 64, embeds: [embedInfo] }
        });
      }
    }

    return res.status(400).json({ error: 'Unknown interaction type' });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
