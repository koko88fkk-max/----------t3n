# 🔑 نظام المفاتيح - مرجع سريع للمطورين

## ⚡ التغييرات السريعة

### صيغة المفتاح الصحيحة
```
✅ الصيغة: T3N-XXXXXX-XXXXXX
✅ مثال: T3N-ABC123-DEF456
✅ الأحرف: حروف إنجليزية (A-Z) وأرقام (0-9) فقط
❌ غير مقبول: أحرف صغيرة، رموز خاصة، مسافات
```

### الدوال الرئيسية

#### 1. التحقق من صيغة المفتاح
```typescript
import { isValidKeyFormat } from './lib/firebase';

if (isValidKeyFormat('T3N-ABCDEF-123456')) {
  console.log('✓ الصيغة صحيحة');
} else {
  console.log('✗ الصيغة غير صحيحة');
}
```

#### 2. تفعيل المفتاح
```typescript
import { activateKey } from './lib/firebase';

const result = await activateKey(
  'T3N-ABCDEF-123456',  // keyId
  user.uid,              // uid
  user.email,            // email
  {
    displayName: user.displayName,
    photoURL: user.photoURL,
    provider: 'discord'
  }
);

if (result.success) {
  console.log('✓ تم التفعيل بنجاح');
  console.log('المنتجات:', result.activatedProducts);
} else {
  console.error('✗ خطأ:', result.error);
}
```

#### 3. التحقق من ملكية المفتاح
```typescript
import { verifyKeyBelongsToUser } from './lib/firebase';

const verify = await verifyKeyBelongsToUser('T3N-ABCDEF-123456', userId);

if (verify.valid) {
  console.log('✓ المفتاح صالح للاستخدام');
  console.log('المنتج:', verify.productType);
} else {
  console.log('✗ المفتاح غير صالح:', verify.reason);
}
```

#### 4. إنشاء مفاتيح جديدة
```typescript
import { createKeys } from './lib/firebase';

const newKeys = await createKeys(50, 'superstar');
console.log('تم إنشاء:', newKeys);
```

#### 5. التحقق من حالة المفتاح
```typescript
import { checkKeyStatus } from './lib/firebase';

const status = await checkKeyStatus('T3N-ABCDEF-123456');
console.log(status);
// {
//   status: 'active' | 'unused' | 'banned' | 'frozen',
//   usedByUid: string | null,
//   usedByEmail: string | null,
//   activatedAt: string | null
// }
```

---

## 🐛 معالجة الأخطاء

### الأخطاء الشائعة ورسائلها

| الخطأ | السبب | الحل |
|------|------|------|
| صيغة المفتاح غير صحيحة | إدخال خاطئ | استخدم: T3N-XXXXXX-XXXXXX |
| المفتاح غير موجود | المفتاح لم يُنشأ | أنشئ مفاتيح جديدة من Admin |
| هذا المفتاح محظور | المفتاح محظور من Admin | اتصل بالدعم |
| هذا المفتاح مجمد | المفتاح معطل مؤقتاً | انتظر إلغاء التجميد |
| المفتاح مربوط بحساب آخر | مستخدم آخر يملك المفتاح | استخدم مفتاح آخر |

---

## 📊 حالات المفتاح (States)

```
unused ──→ active ──→ banned
           │
           └──→ frozen ──→ active (after unfreeze)
```

### Unused (غير مستخدم)
- المفتاح جديد ولم يُفعَّل بعد
- يمكن لأي مستخدم تفعيله

### Active (نشط)
- المفتاح مفعَّل ومرتبط بمستخدم
- لا يمكن لمستخدم آخر استخدامه
- مستخدمه الأصلي يمكنه تفعيله مجدداً

### Banned (محظور)
- المفتاح محظور من قبل Admin
- لا يمكن تفعيله بأي شكل
- يجب حذفه أو فك الحظر

### Frozen (مجمد)
- المفتاح معطل مؤقتاً
- لا يمكن استخدامه حالياً
- يمكن إلغاء التجميد

---

## 🔐 معايير الأمان

✅ **تم التطبيق**:
- تحويل المفاتيح إلى أحرف كبيرة (UPPERCASE)
- التحقق من ملكية المفتاح قبل التفعيل
- منع استخدام المفتاح من عدة مستخدمين
- تسجيل جميع عمليات التفعيل
- معالجة شاملة للأخطاء

⚙️ **المزيد للمستقبل**:
- إضافة حد زمني لصلاحية المفتاح
- نظام إعادة محاولة ذكي
- تنبيهات عند محاولات استخدام غير قانوني
- سجل تفصيلي لجميع المحاولات

---

## 🧪 أمثلة الاختبار

### اختبار وحدة بسيط
```typescript
import { isValidKeyFormat } from './lib/firebase';

describe('Key Format Validation', () => {
  it('should accept valid format', () => {
    expect(isValidKeyFormat('T3N-ABCDEF-123456')).toBe(true);
  });

  it('should convert lowercase to uppercase', () => {
    expect(isValidKeyFormat('t3n-abcdef-123456')).toBe(true);
  });

  it('should reject invalid formats', () => {
    expect(isValidKeyFormat('INVALID')).toBe(false);
    expect(isValidKeyFormat('T3N-ABC-DEF')).toBe(false);
  });
});
```

### اختبار التكامل
```typescript
import { activateKey, verifyKeyBelongsToUser } from './lib/firebase';

describe('Key Activation', () => {
  it('should activate key for new user', async () => {
    const result = await activateKey(
      'T3N-TEST01-TEST01',
      'user-123',
      'user@test.com'
    );
    expect(result.success).toBe(true);
  });

  it('should prevent other users from using same key', async () => {
    const result = await activateKey(
      'T3N-TEST01-TEST01',
      'user-456', // مستخدم مختلف
      'other@test.com'
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain('مربوط بحساب آخر');
  });
});
```

---

## 📚 الموارد الإضافية

- `KEY_SYSTEM_FIXES.md` - وثائق الإصلاحات الكاملة
- `/api/activate-key.js` - معالج تفعيل المفتاح
- `/src/lib/firebase.ts` - منطق Firebase الكامل
- `/src/App.tsx` - واجهة المستخدم

---

**آخر تحديث**: 2026-05-02  
**الإصدار**: 1.0.0 (مستقر)  
**الحالة**: ✅ جاهز للإنتاج
