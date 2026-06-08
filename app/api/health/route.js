import { NextResponse } from 'next/server';
import { getProfile, getStorageMode } from '@/lib/profile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profile = await getProfile();

    return NextResponse.json({
      ok: true,
      storageMode: getStorageMode(),
      profileLoaded: Boolean(profile?.name),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        storageMode: getStorageMode(),
        message: error.message,
      },
      { status: 500 },
    );
  }
}
