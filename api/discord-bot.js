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

// Function to generate a random key
function generateRandomKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let p1 = '';
  let p2 = '';
  for(let i=0;i<6;i++) p1 += chars.charAt(Math.floor(Math.random() * chars.length));
  for(let i=0;i<6;i++) p2 += chars.charAt(Math.floor(Math.random() * chars.length));
  return `T3N-${p1}-${p2}`;
}

// Function to verify Discord signature using built-in Node crypto
function verifyInteractionSignature(req, bodyText) {
  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];
  const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

  if (!signature || !timestamp || !PUBLIC_KEY) return false;

  try {
    const isVerified = crypto.verify(
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
    return isVerified;
  } catch (err) {
    console.error("Verification error:", err);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const rawBody = await getRawBody(req);

    // Verify Discord Request
    if (!verifyInteractionSignature(req, rawBody)) {
      return res.status(401).json({ error: 'invalid request signature' });
    }

    const interaction = JSON.parse(rawBody);

    // Type 1 is a Ping interaction (Discord checks if the endpoint is alive)
    if (interaction.type === 1) {
      return res.status(200).json({ type: 1 });
    }

    // Type 2 is a Slash Command interaction
    if (interaction.type === 2) {
      const { name, options } = interaction.data;

      if (name === 'genkey') {
        const typeOpt = options?.find(o => o.name === 'type')?.value || 'fortnite';
        const daysOpt = options?.find(o => o.name === 'days')?.value || 30;

        const newKey = generateRandomKey();

        try {
          await db.collection('keys').doc(newKey).set({
            productType: typeOpt,
            durationDays: daysOpt,
            status: 'unused',
            createdAt: new Date().toISOString(),
            createdBy: interaction.member?.user?.username || 'DiscordBot',
            usedByUid: null
          });

          // Respond back to Discord
          return res.status(200).json({
            type: 4, // ChannelMessageWithSource
            data: {
              content: `✅ **تم إنشاء المفتاح بنجاح!**\n\n**المفتاح:** \`${newKey}\`\n**النوع:** ${typeOpt}\n**المدة:** ${daysOpt} يوم`,
              flags: 64 // Ephemeral (Only the user who ran the command can see it privately)
            }
          });
        } catch (error) {
          console.error("Error creating key:", error);
          return res.status(200).json({
            type: 4,
            data: {
              content: `❌ حدث خطأ أثناء إنشاء المفتاح في قاعدة البيانات.`,
              flags: 64
            }
          });
        }
      }
    }

    return res.status(400).json({ error: 'Unknown interaction type' });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
