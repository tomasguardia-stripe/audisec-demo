import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getState } from '@/lib/store';
import { LogEntry } from '@/lib/types';

export async function POST(request: NextRequest) {
  const stripe = await getStripe();
  const state = getState();
  const logs: LogEntry[] = [];

  if (!state.setup_complete) {
    return NextResponse.json({ success: false, error: 'Setup not complete' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { contract, advance_days } = body;

    const clockId = state.test_clocks[contract as string];
    if (!clockId) {
      return NextResponse.json({ success: false, error: `No test clock for ${contract}` }, { status: 400 });
    }

    // Get current clock time
    const clock = await stripe.testHelpers.testClocks.retrieve(clockId);
    const currentTime = clock.frozen_time;
    const newTime = currentTime + advance_days * 24 * 60 * 60;

    // Advance the clock
    const advanced = await stripe.testHelpers.testClocks.advance(clockId, {
      frozen_time: newTime,
    });

    const advanceDesc = advance_days >= 365
      ? `${Math.round(advance_days / 365)} año(s)`
      : advance_days >= 30
        ? `${Math.round(advance_days / 30)} mes(es)`
        : `${advance_days} días`;

    logs.push({
      timestamp: new Date().toISOString(),
      action: 'test_clock.advance',
      detail: `${contract} — avanzado ${advanceDesc} → ${new Date(newTime * 1000).toLocaleDateString('es-ES')}`,
      stripe_id: advanced.id,
    });

    return NextResponse.json({
      success: true,
      clock_id: advanced.id,
      previous_time: new Date(currentTime * 1000).toISOString(),
      new_time: new Date(newTime * 1000).toISOString(),
      status: advanced.status,
      advance_days,
      logs,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message, logs }, { status: 500 });
  }
}

// GET: Retrieve current state of all test clocks
export async function GET() {
  const stripe = await getStripe();
  const state = getState();

  if (!state.setup_complete) {
    return NextResponse.json({ success: false, error: 'Setup not complete' }, { status: 400 });
  }

  try {
    const clocks: Record<string, { id: string; name: string; frozen_time: string; status: string }> = {};

    for (const [key, clockId] of Object.entries(state.test_clocks)) {
      const clock = await stripe.testHelpers.testClocks.retrieve(clockId);
      clocks[key] = {
        id: clock.id,
        name: clock.name || key,
        frozen_time: new Date(clock.frozen_time * 1000).toISOString(),
        status: clock.status,
      };
    }

    return NextResponse.json({ success: true, clocks });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
