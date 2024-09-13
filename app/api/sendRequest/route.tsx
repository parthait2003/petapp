import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const formBody = new URLSearchParams({
      username,
      password,
      grant_type: 'password',
    });

    const response = await fetch('http://uat.foxfire.money:6699/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody.toString(),
    });

    const text = await response.text();
    if (!text) {
      throw new Error('Empty response from server');
    }

    const data = JSON.parse(text);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Something went wrong' }, { status: 500 });
  }
}
