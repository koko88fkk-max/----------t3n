// Diagnostic endpoint to debug role assignment
// Visit: https://t3n-2a2i.vercel.app/api/debug-role?secret=t3n2026
import axios from 'axios';

export default async function handler(req, res) {
  if (req.query.secret !== 't3n2026') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN || process.env.DISCORD_TOKEN;
  const GUILD_ID = process.env.GUILD_ID || '1396959491786018826';

  const results = {
    env: {
      DISCORD_BOT_TOKEN: !!process.env.DISCORD_BOT_TOKEN,
      BOT_TOKEN: !!process.env.BOT_TOKEN,
      GUILD_ID: process.env.GUILD_ID || '(default) 1396959491786018826',
      FIREBASE_API_KEY: !!process.env.FIREBASE_API_KEY || !!process.env.VITE_FIREBASE_API_KEY,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
      token_resolved: !!BOT_TOKEN,
      token_preview: BOT_TOKEN ? BOT_TOKEN.substring(0, 20) + '...' : 'MISSING'
    },
    tests: {}
  };

  // Test 1: Bot identity
  try {
    const botRes = await axios.get('https://discord.com/api/v10/users/@me', {
      headers: { 'Authorization': `Bot ${BOT_TOKEN}` }
    });
    results.tests.bot_identity = { ok: true, username: botRes.data.username, id: botRes.data.id };
  } catch (e) {
    results.tests.bot_identity = { ok: false, error: e.response?.data || e.message };
  }

  // Test 2: Bot in guild
  try {
    const guildRes = await axios.get(`https://discord.com/api/v10/guilds/${GUILD_ID}`, {
      headers: { 'Authorization': `Bot ${BOT_TOKEN}` }
    });
    results.tests.guild_access = { ok: true, name: guildRes.data.name, member_count: guildRes.data.approximate_member_count };
  } catch (e) {
    results.tests.guild_access = { ok: false, error: e.response?.data || e.message };
  }

  // Test 3: Bot permissions in guild
  try {
    const memberRes = await axios.get(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/@me`, {
      headers: { 'Authorization': `Bot ${BOT_TOKEN}` }
    });
    results.tests.bot_permissions = { ok: true, roles: memberRes.data.roles };
  } catch (e) {
    results.tests.bot_permissions = { ok: false, error: e.response?.data || e.message };
  }

  return res.status(200).json(results);
}
