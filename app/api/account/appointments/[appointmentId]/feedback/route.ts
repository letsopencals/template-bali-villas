import '@/lib/opencals';
import { AppointmentService, type QuestionAnswer } from '@opencals/storefront-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { handleApiError } from '@/lib/api-error-handler';

const MAX_ANSWERS = 30;
const MAX_QUESTION = 255;
const MAX_ANSWER = 5000;

/**
 * POST { answers: [{ questionId, question, answer }] } → the guest's review of
 * a past stay (upserted per question by the backend). File uploads are not
 * supported here, so `fileIds` is never forwarded.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ appointmentId: string }> }) {
	const { appointmentId } = await params;
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
	}
	const raw = (body as { answers?: unknown } | null)?.answers;
	if (!Array.isArray(raw) || raw.length === 0) return NextResponse.json({ error: 'answers is required' }, { status: 400 });

	const answers: QuestionAnswer[] = [];
	for (const item of raw.slice(0, MAX_ANSWERS)) {
		const { questionId, question, answer } = (item ?? {}) as Record<string, unknown>;
		if (typeof questionId !== 'string' || !questionId || typeof question !== 'string') continue;
		const text = typeof answer === 'string' ? answer.trim().slice(0, MAX_ANSWER) : null;
		answers.push({ questionId, question: question.slice(0, MAX_QUESTION), answer: text || null });
	}
	if (answers.length === 0) return NextResponse.json({ error: 'No valid answers' }, { status: 400 });

	try {
		// Ownership: the detail call 404s/403s for someone else's appointment, so check it first.
		await AppointmentService.find({ path: { appointmentId }, headers: auth.headers });
		const { data } = await AppointmentService.feedback({ path: { appointmentId }, body: { answers }, headers: auth.headers });
		return NextResponse.json({ count: Array.isArray(data) ? data.length : answers.length }, { status: 201 });
	} catch (err) {
		return handleApiError(err, 'Could not save your review');
	}
}
