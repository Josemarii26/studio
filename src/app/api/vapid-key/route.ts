
import { NextResponse } from 'next/server';
import { vapidKeys } from '@/firebase/vapid-keys';

export async function GET() {
  return NextResponse.json({ publicKey: vapidKeys.publicKey });
}
