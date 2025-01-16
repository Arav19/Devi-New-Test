import { getBirthChart } from '@/lib/astrology/birthchart';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const birthChartDetails = await getBirthChart(body);
    return NextResponse.json(birthChartDetails);
  } catch (error) {
    console.error('Birth Chart API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate birth chart' },
      { status: 500 }
    );
  }
}
