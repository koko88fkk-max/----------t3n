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

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { idToken, filename } = req.body;

  if (!idToken || !filename) {
    return res.status(400).json({ success: false, error: 'Missing parameters' });
  }

  try {
    // 1. Verify the user's token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 2. Check if the user is VIP (has active key) in Firestore
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(403).json({ success: false, error: 'User data not found' });
    }

    const userData = userDoc.data();
    if (userData.isVIP !== true) {
      return res.status(403).json({ success: false, error: 'عذراً، يجب تفعيل مفتاح لتتمكن من تحميل الملفات' });
    }

    // 3. Optional: Check if they have access to this specific product type
    // If you want strict checking per product type, you can add it here.
    // For now, any VIP can download.

    // 4. Return the secure signed URL or the actual file URL
    // Since the files are in public/, we can just return the path for now, 
    // but a better approach long-term is moving them to Firebase Storage or similar.
    // For Vercel, we can just let the frontend know it's approved.
    
    return res.status(200).json({ 
      success: true, 
      downloadUrl: `/${filename}` 
    });

  } catch (error) {
    console.error("Secure Download Error:", error);
    return res.status(401).json({ success: false, error: 'جلسة غير صالحة. يرجى تسجيل الدخول مجدداً' });
  }
}
