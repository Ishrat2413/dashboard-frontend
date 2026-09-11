import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('zentura_refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'No active refresh session found.' },
        { status: 401 }
      );
    }

    const backendRes = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      // Clear cookie on invalid refresh token
      const errRes = NextResponse.json(data, { status: backendRes.status });
      errRes.cookies.set({
        name: 'zentura_refresh_token',
        value: '',
        maxAge: 0,
        path: '/',
      });
      return errRes;
    }

    const res = NextResponse.json({
      success: true,
      message: data.message || 'Token refreshed successfully',
      data: {
        access_token: data.data?.access_token,
        token_type: data.data?.token_type || 'Bearer',
        expires_in: data.data?.expires_in || 900,
        user: data.data?.user,
      },
    });

    // Rotate HttpOnly refresh token cookie
    if (data.data?.refresh_token) {
      res.cookies.set({
        name: 'zentura_refresh_token',
        value: data.data.refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Refresh failed';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
