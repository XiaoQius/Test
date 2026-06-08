import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const profilePath = path.join(process.cwd(), 'data', 'profile.json');
const profileKey = process.env.PROFILE_KV_KEY || 'profile';

function hasRedisStorage() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function redisCommand(command, ...args) {
  const response = await fetch(process.env.KV_REST_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([command, ...args]),
  });

  if (!response.ok) {
    throw new Error(`Redis storage request failed with status ${response.status}`);
  }

  const payload = await response.json();
  return payload.result;
}

function parseStoredProfile(profile) {
  return typeof profile === 'string' ? JSON.parse(profile) : profile;
}

async function getSeedProfile() {
  const rawProfile = await readFile(profilePath, 'utf8');
  return JSON.parse(rawProfile);
}

export async function getProfile() {
  if (hasRedisStorage()) {
    const storedProfile = await redisCommand('GET', profileKey);
    return storedProfile ? parseStoredProfile(storedProfile) : getSeedProfile();
  }

  return getSeedProfile();
}

export async function saveProfile(profile) {
  if (hasRedisStorage()) {
    await redisCommand('SET', profileKey, JSON.stringify(profile));
    return profile;
  }

  if (process.env.VERCEL) {
    throw new Error('Vercel 部署环境需要绑定 Redis/KV 存储后才能持久化后台内容。');
  }

  await writeFile(profilePath, `${JSON.stringify(profile, null, 2)}\n`, 'utf8');
  return profile;
}

export function getStorageMode() {
  if (hasRedisStorage()) {
    return 'redis';
  }

  return process.env.VERCEL ? 'vercel-readonly' : 'local-file';
}
