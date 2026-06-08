import { NextResponse } from 'next/server';
import { getProfile, getStorageMode, saveProfile } from '@/lib/profile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const adminToken = process.env.ADMIN_TOKEN || 'demo-admin-token';

function isAuthorized(request) {
  return request.headers.get('x-admin-token') === adminToken;
}

export async function GET() {
  return NextResponse.json({ profile: await getProfile(), storageMode: getStorageMode() });
}

export async function PUT(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: '后台令牌不正确。' }, { status: 401 });
  }

  const profile = await request.json();
  const requiredFields = ['name', 'initials', 'role', 'headline', 'summary', 'email', 'about'];
  const missingField = requiredFields.find((field) => !profile[field]);

  if (missingField) {
    return NextResponse.json({ message: `缺少必填字段：${missingField}` }, { status: 400 });
  }

  if (!Array.isArray(profile.projects) || !Array.isArray(profile.skills) || !Array.isArray(profile.stats)) {
    return NextResponse.json({ message: '项目、技能和统计信息必须是数组。' }, { status: 400 });
  }

  try {
    return NextResponse.json({ profile: await saveProfile(profile), storageMode: getStorageMode() });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
