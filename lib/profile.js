import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const profilePath = path.join(process.cwd(), 'data', 'profile.json');
const profileKey = process.env.PROFILE_KV_KEY || 'profile';

const redisUrl =
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.REDIS_REST_API_URL;

const redisToken =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_API_TOKEN;

function hasRedisStorage() {
  return Boolean(redisUrl && redisToken);
}

async function redisCommand(command, ...args) {
  if (!hasRedisStorage()) {
    throw new Error('Redis REST 环境变量不完整，请检查存储绑定。');
  }

  const response = await fetch(redisUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${redisToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([command, ...args]),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Redis storage request failed with status ${response.status}`);
  }

  const payload = await response.json();

  if (payload.error) {
    throw new Error(`Redis storage request failed: ${payload.error}`);
  }

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
    throw new Error(
      'Vercel 已成功运行，但后台保存需要绑定 Redis 存储。请在 Vercel Marketplace 添加 Upstash Redis，并重新部署。',
    );
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
