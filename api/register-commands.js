// This endpoint registers Discord bot commands when visited.
// Visit: https://t3n-2a2i.vercel.app/api/register-commands?secret=t3n2026
// After successful registration, you can delete this file.

export default async function handler(req, res) {
  // Simple secret to prevent unauthorized access
  const { secret } = req.query;
  if (secret !== 't3n2026') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN || process.env.DISCORD_TOKEN;
  if (!BOT_TOKEN) {
    return res.status(500).json({ error: 'Bot token not set in Vercel Environment Variables' });
  }

  const APP_ID = '1462977086653464729';
  const url = `https://discord.com/api/v10/applications/${APP_ID}/commands`;

  const commands = [
    {
      name: 'genkey',
      description: 'لوحة تحكم بوابة تعن',
      type: 1
    },
    {
      name: 'temp-key',
      type: 2, // USER context menu command
      default_member_permissions: '0' // Hide from normal users
    },
    {
      name: 'fortnite-key',
      type: 2,
      default_member_permissions: '0'
    },
    {
      name: 'perm-key',
      type: 2,
      default_member_permissions: '0'
    }
  ];

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commands)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Discord API Error', details: data });
    }

    return res.status(200).json({ 
      success: true, 
      message: '✅ تم تسجيل الأوامر بنجاح!',
      commands: data.map(c => ({ name: c.name, type: c.type, id: c.id }))
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to register', details: err.message });
  }
}
