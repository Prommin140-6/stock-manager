import { NextResponse } from 'next/server';
import connectMongo from '../../../../../lib/mongodb';
import History from '../../../../../models/history';

export async function GET() {
  try {
    await connectMongo();
    const history = await History.find().sort({ timestamp: -1 });
    return NextResponse.json(history, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history', details: error.message },
      { status: 500 }
    );
  }
}