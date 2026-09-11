import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');

    if (authHeader) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });
      } catch {
        // Continue clearing client cookie
      }
    }

    const res = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    res.cookies.set({
      name: 'zentura_refresh_token',
      value: '',
      maxAge: 0,
      path: '/',
    });

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Logout failed';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
