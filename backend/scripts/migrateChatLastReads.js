#!/usr/bin/env node
/* Backfill script: populate Chat.lastReads for existing chats
   - For each chat, ensure lastReads exists for each participant with lastReadAt = chat.updatedAt
   - Run with: node backend/scripts/migrateChatLastReads.js
*/

import database from '../config/database.js';
import Chat from '../models/Chat.js';

async function run() {
  try {
    await database.connect();
    console.log('Connected to DB');

    const chats = await Chat.find().lean();
    console.log(`Found ${chats.length} chats`);
    let updated = 0;

    for (const c of chats) {
      const participants = c.participants || [];
      const lastReads = Array.isArray(c.lastReads) ? c.lastReads : [];
      const lrMap = new Map((lastReads || []).map(l => [String(l.user), l.lastReadAt]));

      let changed = false;
      const newLastReads = [];
      for (const p of participants) {
        const pid = String(p);
        if (lrMap.has(pid)) {
          newLastReads.push({ user: pid, lastReadAt: lrMap.get(pid) });
        } else {
          // default to chat.updatedAt or createdAt if missing
          const defaultTs = c.updatedAt || c.createdAt || new Date();
          newLastReads.push({ user: pid, lastReadAt: defaultTs });
          changed = true;
        }
      }

      if (changed) {
        await Chat.findByIdAndUpdate(c._id, { $set: { lastReads: newLastReads } });
        updated++;
      }
    }

    console.log(`Updated ${updated} chats`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed', err);
    process.exit(2);
  }
}

run();
