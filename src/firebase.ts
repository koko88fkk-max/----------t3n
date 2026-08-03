import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { 
  getFirestore, doc, setDoc, getDoc, collection, getDocs, 
  query, orderBy, limit, deleteDoc, increment, onSnapshot 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB9mFTUF1_mBzTl3VvxNq5G-mdhrJvzI0A",
  authDomain: "t3n-stor-cd7d7.firebaseapp.com",
  projectId: "t3n-stor-cd7d7",
  storageBucket: "t3n-stor-cd7d7.firebasestorage.app",
  messagingSenderId: "1026259276675",
  appId: "1:1026259276675:web:8b1b49fb23373151531cb6",
  measurementId: "G-273H5TJ98L"
};

// 🔒 Main Admin email - ALWAYS has access
const MAIN_ADMIN_EMAIL = "koko.88.fkk@gmail.com";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();

// 📜 Audit Logging System
export async function logActivity(action: string, details: string, email?: string) {
  try {
    const logRef = doc(collection(db, "auditLogs"));
    await setDoc(logRef, {
      action,
      details,
      email: email || auth.currentUser?.email || 'زائر',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

export async function getAuditLogs(): Promise<any[]> {
  try {
    const q = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(100));
    const snap = await getDocs(q);
    const logs: any[] = [];
    snap.forEach((d) => {
      logs.push({ id: d.id, ...d.data() });
    });
    return logs;
  } catch (err) {
    // Fallback if index not ready
    const snap = await getDocs(collection(db, "auditLogs"));
    const logs: any[] = [];
    snap.forEach((d) => {
      logs.push({ id: d.id, ...d.data() });
    });
    return logs.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
  }
}

// 🌍 Detect user country/city from IP
async function detectUserGeo(): Promise<{ country: string; city: string; countryCode: string } | null> {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    if (data && data.country_name) {
      return { country: data.country_name, city: data.city, countryCode: data.country_code };
    }
    return null;
  } catch {
    return null;
  }
}

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const geo = await detectUserGeo();
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    const geoData = geo ? {
      country: geo.country,
      city: geo.city,
      countryCode: geo.countryCode
    } : {};

    if (!docSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'مستخدم',
        photoURL: user.photoURL || '',
        isVIP: false,
        verifiedOrders: [],
        adminNotes: '',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        ...geoData
      });
      await logActivity("تسجيل حساب جديد", `قام العميل ${user.email} بإنشاء وتصفح حساب لأول مرة`, user.email || '');
    } else {
      await setDoc(userRef, { 
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || docSnap.data().displayName,
        photoURL: user.photoURL || docSnap.data().photoURL || '',
        lastLoginAt: new Date().toISOString(),
        ...geoData
      }, { merge: true });
      await logActivity("تسجيل دخول", `سجل العميل ${user.email} الدخول إلى الموقع`, user.email || '');
    }

    return user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    return null;
  }
}

export async function logout() {
  const currentEmail = auth.currentUser?.email;
  if (currentEmail) {
    await logActivity("تسجيل خروج", `قام المستخدم ${currentEmail} بتسجيل الخروج`, currentEmail);
  }
  await signOut(auth);
}

// 🔒 Check if user is Admin
export async function checkIsAdmin(email: string | null): Promise<boolean> {
  if (!email) return false;
  if (email === MAIN_ADMIN_EMAIL) return true;
  const adminRef = doc(db, "admins", email);
  const adminSnap = await getDoc(adminRef);
  return adminSnap.exists();
}

export function isAdmin(email: string | null): boolean {
  return email === MAIN_ADMIN_EMAIL;
}

// 🔒 Check if user is banned
export async function checkBanned(uid: string): Promise<{ banned: boolean; reason?: string }> {
  const banRef = doc(db, "bannedUsers", uid);
  const banSnap = await getDoc(banRef);
  if (banSnap.exists()) {
    return { banned: true, reason: banSnap.data().reason || 'محظور من الموقع' };
  }
  return { banned: false };
}

// ==========================================
// 📦 ORDER NUMBER & KEY SYSTEM
// ==========================================

export function isValidOrderFormat(value: string): boolean {
  const cleaned = value.trim();
  if (cleaned === "T3N-un4U6I-kd8bN2") return true; 
  return /^2\d{8}$/.test(cleaned) || /^T3N-[A-Za-z0-9]{8,16}$/.test(cleaned); 
}

// Activate Order / Product
export async function activateOrder(orderId: string, uid: string, email: string, productName?: string): Promise<{ success: boolean; error?: string }> {
  const cleaned = orderId.trim();

  if (!isValidOrderFormat(cleaned)) {
    return { success: false, error: 'رقم الطلب أو المفتاح غير صحيح' };
  }

  const orderRef = doc(db, "orders", cleaned);
  const orderSnap = await getDoc(orderRef);

  if (orderSnap.exists()) {
    const orderData = orderSnap.data();

    if (orderData.status === 'banned') {
      return { success: false, error: 'رقم الطلب هذا محظور' };
    }

    if (orderData.status === 'frozen') {
      return { success: false, error: 'رقم الطلب هذا مُجمّد مؤقتاً' };
    }

    if (orderData.usedByUid && orderData.usedByUid !== uid) {
      return { success: false, error: 'رقم الطلب هذا مرتبط بحساب آخر' };
    }

    if (orderData.usedByUid === uid) {
      return { success: true };
    }
  }

  const now = new Date();

  await setDoc(orderRef, {
    orderId: cleaned,
    productName: productName || 'سبوفر T3N الشامل',
    status: 'active',
    activatedAt: now.toISOString(),
    usedByEmail: email,
    usedByUid: uid
  }, { merge: true });

  // Update user active orders
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  let currentOrders: any[] = [];
  if (userSnap.exists() && Array.isArray(userSnap.data().verifiedOrders)) {
    currentOrders = userSnap.data().verifiedOrders;
  }
  
  if (!currentOrders.some(o => (typeof o === 'string' ? o === cleaned : o.orderId === cleaned))) {
    currentOrders.push({
      orderId: cleaned,
      productName: productName || 'سبوفر T3N الشامل',
      activatedAt: now.toISOString()
    });
  }

  await setDoc(userRef, {
    isVIP: true,
    verifiedOrders: currentOrders,
    email: email,
    lastActiveAt: now.toISOString()
  }, { merge: true });

  await logActivity("تفعيل مفتاح/منتج", `قام العميل ${email} بتفعيل المفتاح (${cleaned}) بنجاح`, email);

  return { success: true };
}

// 📦 Admin: Revoke specific product/key from a user
export async function revokeUserProduct(uid: string, orderId: string) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  let userEmail = '';

  if (userSnap.exists()) {
    const data = userSnap.data();
    userEmail = data.email || '';
    const updatedOrders = (data.verifiedOrders || []).filter(
      (o: any) => (typeof o === 'string' ? o !== orderId : o.orderId !== orderId)
    );
    await setDoc(userRef, {
      verifiedOrders: updatedOrders,
      isVIP: updatedOrders.length > 0
    }, { merge: true });
  }

  // Update order document status
  const orderRef = doc(db, "orders", orderId);
  await setDoc(orderRef, { status: 'revoked', revokedAt: new Date().toISOString() }, { merge: true });

  await logActivity("إلغاء مفتاح/ترخيص", `قامت الإدارة بسحب وإلغاء المفتاح (${orderId}) من العميل ${userEmail || uid}`, auth.currentUser?.email || '');
}

// 📝 Admin: Save internal notes on a user
export async function saveUserAdminNotes(uid: string, notes: string) {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, { adminNotes: notes }, { merge: true });
  await logActivity("تحديث ملاحظات عميل", `تم حفظ ملاحظات إدارية جديدة على العميل (UID: ${uid})`, auth.currentUser?.email || '');
}

// 📦 Delete an order
export async function deleteOrder(orderId: string) {
  const orderRef = doc(db, "orders", orderId);
  const orderSnap = await getDoc(orderRef);
  if (orderSnap.exists()) {
    const orderData = orderSnap.data();
    if (orderData.usedByUid) {
      await revokeUserProduct(orderData.usedByUid, orderId);
    }
  }
  await deleteDoc(orderRef);
  await logActivity("حذف ترخيص", `حذف المفتاح (${orderId}) نهائياً من قاعدة البيانات`, auth.currentUser?.email || '');
}

// 📦 Ban an order
export async function banOrder(orderId: string) {
  const orderRef = doc(db, "orders", orderId);
  await setDoc(orderRef, { status: 'banned' }, { merge: true });
  await logActivity("حظر ترخيص", `تم حظر المفتاح/الطلب (${orderId})`, auth.currentUser?.email || '');
}

// 📦 Unban an order
export async function unbanOrder(orderId: string) {
  const orderRef = doc(db, "orders", orderId);
  await setDoc(orderRef, { status: 'active' }, { merge: true });
  await logActivity("فك حظر ترخيص", `تم إلغاء حظر المفتاح (${orderId})`, auth.currentUser?.email || '');
}

// 👑 Get all users for admin with search & notes
export async function getAdminUsersList() {
  const usersSnap = await getDocs(collection(db, "users"));
  const users: any[] = [];
  usersSnap.forEach((d) => {
    users.push({ id: d.id, ...d.data() });
  });
  return users;
}

// 📊 Admin: Get full stats
export async function getAdminStats() {
  const usersSnap = await getDocs(collection(db, "users"));
  const users: any[] = [];
  let vipCount = 0;
  usersSnap.forEach((d) => {
    const data = d.data();
    users.push({ id: d.id, ...data });
    if (data.isVIP || (data.verifiedOrders && data.verifiedOrders.length > 0)) vipCount++;
  });

  const ordersSnap = await getDocs(collection(db, "orders"));
  const orders: any[] = [];
  ordersSnap.forEach((d) => {
    orders.push({ id: d.id, ...d.data() });
  });

  const bannedSnap = await getDocs(collection(db, "bannedUsers"));
  const banned: any[] = [];
  bannedSnap.forEach((d) => {
    banned.push({ id: d.id, ...d.data() });
  });

  const logs = await getAuditLogs();

  return {
    totalUsers: users.length,
    vipUsers: vipCount,
    totalOrders: orders.length,
    bannedCount: banned.length,
    users,
    orders,
    banned,
    logs
  };
}

export async function banUser(uid: string, email: string, reason: string) {
  const banRef = doc(db, "bannedUsers", uid);
  await setDoc(banRef, {
    email: email,
    reason: reason,
    bannedAt: new Date().toISOString()
  });
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, { isVIP: false, banned: true }, { merge: true });
  await logActivity("حظر عميل", `تم حظر العميل ${email} بالسبب: ${reason}`, auth.currentUser?.email || '');
}

export async function unbanUser(uid: string) {
  const banRef = doc(db, "bannedUsers", uid);
  await deleteDoc(banRef);
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, { banned: false }, { merge: true });
  await logActivity("إلغاء حظر عميل", `تم فك حظر العميل (UID: ${uid})`, auth.currentUser?.email || '');
}
