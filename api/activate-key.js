import admin from 'firebase-admin';

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

// Validate key format (case-insensitive, normalizes to uppercase)
function isValidKeyFormat(keyId) {
  const trimmed = String(keyId).trim().toUpperCase();
  // Key format: T3N-XXXXXX-XXXXXX (where X is alphanumeric uppercase)
  return /^T3N-[A-Z0-9]{6}-[A-Z0-9]{6}$/.test(trimmed);
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'طريقة الطلب غير مسموحة' });
  }

  // Ensure Firebase Admin is initialized
  if (!admin.apps.length) {
    return res.status(500).json({ success: false, error: 'خطأ في إعدادات الخادم' });
  }

  const { keyId, uid, email, userData } = req.body;

  // Validate all required parameters
  if (!keyId || !uid) {
    return res.status(400).json({ success: false, error: 'معاملات مفقودة مطلوبة' });
  }

  // Validate and clean key format - ALWAYS uppercase for consistency
  const cleaned = String(keyId).trim().toUpperCase();
  
  if (!isValidKeyFormat(cleaned)) {
    return res.status(400).json({ success: false, error: 'صيغة المفتاح غير صحيحة. الصيغة الصحيحة: T3N-XXXXXX-XXXXXX' });
  }

  const db = admin.firestore();

  try {
    const keyRef = db.collection('keys').doc(cleaned);
    const keySnap = await keyRef.get();

    if (!keySnap.exists) {
      return res.status(404).json({ success: false, error: 'المفتاح غير موجود في النظام' });
    }

    const kd = keySnap.data();

    // Check key status
    if (kd.status === 'banned') {
      return res.status(403).json({ success: false, error: 'هذا المفتاح محظور ولا يمكن استخدامه' });
    }
    if (kd.status === 'frozen') {
      return res.status(403).json({ success: false, error: 'هذا المفتاح مُجمّد مؤقتاً. اتصل بالدعم الفني' });
    }

    // Check if key is already used by another user (prevent key sharing)
    if (kd.usedByUid && kd.usedByUid !== uid) {
      return res.status(403).json({ success: false, error: 'هذا المفتاح مربوط بحساب آخر ولا يمكن استخدامه من قبل حساب مختلف' });
    }

    // Keep original product type for role assignment
    let pt = kd.productType || 'superstar';

    // If already activated by the same user, just verify and return products
    if (kd.usedByUid === uid) {
      const userRef = db.collection('users').doc(uid);
      const userSnap = await userRef.get();
      let prods = userSnap.exists ? (userSnap.data().activatedProducts || []) : [];
      
      // Ensure product is in list
      if (pt && !prods.includes(pt)) {
        prods.push(pt);
        await userRef.set({ activatedProducts: prods }, { merge: true });
      }
      return res.status(200).json({ success: true, productType: pt, activatedProducts: prods, message: 'المفتاح مفعل بالفعل' });
    }

    // New Activation - Mark key as used
    const now = new Date();
    await keyRef.set({
      status: 'active',
      activatedAt: now.toISOString(),
      usedByUid: uid,
      usedByEmail: email || null,
      usedByName: userData?.displayName || null,
      usedByPhoto: userData?.photoURL || null,
      usedByProvider: userData?.provider || 'discord',
      productType: pt,
      activationCount: (kd.activationCount || 0) + 1
    }, { merge: true });

    // Update user document with activated key and products
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    
    const existingProducts = userSnap.exists ? (userSnap.data().activatedProducts || []) : [];
    const existingKeys = userSnap.exists ? (userSnap.data().activatedKeys || []) : [];
    
    // Add product if not already there
    if (!existingProducts.includes(pt)) {
      existingProducts.push(pt);
    }
    
    // Add key to user's keys list
    if (!existingKeys.includes(cleaned)) {
      existingKeys.push(cleaned);
    }

    await userRef.set({
      isVIP: true,
      activatedProducts: existingProducts,
      activatedKeys: existingKeys,
      email: email || null,
      displayName: userData?.displayName || null,
      photoURL: userData?.photoURL || null,
      provider: userData?.provider || 'discord',
      verifiedAt: now.toISOString()
    }, { merge: true });

    // ==== Auto-Assign Discord Roles based on product type ====
    if (uid.startsWith('discord_')) {
      const discordId = uid.replace('discord_', '');
      const BOT_TOKEN = process.env.BOT_TOKEN;
      const GUILD_ID = process.env.GUILD_ID || '1396959491786018826';
      const CUSTOMER_ROLE = '1397221350095192074';
      
      const PRODUCT_ROLES = {
        'fortnite_unban': ['1483330317040484364', CUSTOMER_ROLE],
        'spoofer_t3n': ['1500092886467870720', CUSTOMER_ROLE],
        'spoofer_temp': ['1503919636696273068', CUSTOMER_ROLE],
        'superstar': [CUSTOMER_ROLE],
        'fortnite': ['1483330317040484364', CUSTOMER_ROLE],
        'spoofer': ['1500092886467870720', CUSTOMER_ROLE],
      };
      
      const rolesToAssign = PRODUCT_ROLES[pt] || [CUSTOMER_ROLE];
      
      if (BOT_TOKEN) {
        for (const roleId of rolesToAssign) {
          try {
            await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordId}/roles/${roleId}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bot ${BOT_TOKEN}`
              }
            });
            console.log(`Assigned role ${roleId} to ${discordId} automatically.`);
          } catch (err) {
            console.error(`Failed to assign role ${roleId}:`, err);
          }
        }
      }
    }

    return res.status(200).json({ 
      success: true, 
      productType: pt, 
      activatedProducts: existingProducts,
      message: 'تم تفعيل المفتاح بنجاح ومربط بحسابك'
    });
  } catch (error) {
    console.error("Activate Key Error:", {
      error: error instanceof Error ? error.message : String(error),
      keyId: cleaned,
      uid: uid,
      timestamp: new Date().toISOString()
    });
    
    // Return user-friendly error message
    if (error instanceof Error) {
      if (error.message.includes('PERMISSION_DENIED')) {
        return res.status(403).json({ 
          success: false, 
          error: 'خطأ في الصلاحيات. تأكد من أن الخادم مهيأ بشكل صحيح' 
        });
      }
      if (error.message.includes('NOT_FOUND')) {
        return res.status(404).json({ 
          success: false, 
          error: 'المفتاح غير موجود' 
        });
      }
    }
    
    return res.status(500).json({ 
      success: false, 
      error: 'حدث خطأ في السيرفر أثناء التفعيل: ' + (error instanceof Error ? error.message : String(error))
    });
  }
}
