import { NextRequest, NextResponse } from 'next/server';
import { getAstrologicalReading } from '@/lib/gpt';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { prompt, messages, userId } = body;

        // Validate input
        if (!prompt || !messages || !userId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const response = await getAstrologicalReading(prompt, messages, userId);

        return NextResponse.json({ response });

    } catch (error) {
        console.error('API Route Error:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

