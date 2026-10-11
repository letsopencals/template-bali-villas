import type { AppointmentDetailResponse } from '@opencals/storefront-sdk';
import { DetailCard } from '@/components/account/trip-detail/detail-card';
import { ReviewForm } from '@/components/account/trip-detail/review-form';
import type { ReviewQuestion } from '@/components/account/trip-detail/review-types';
import { buttonClasses } from '@/components/ui/button';
import { whatsappHref } from '@/lib/contact';

function displayAnswer(answer: string | null): string {
	if (answer === 'TRUE') return 'Yes';
	if (answer === 'FALSE') return 'No';
	if (answer && /^[1-5]$/.test(answer)) return `${'★'.repeat(Number(answer))}${'☆'.repeat(5 - Number(answer))}`;
	return answer ?? '';
}

/** After the stay (anchor #review): the guest's answers, or the store's questions as a form. */
export function ReviewSection({
	tripId,
	answers,
	questions,
}: {
	tripId: string;
	answers: AppointmentDetailResponse['feedbackQuestionAnswers'];
	questions: ReviewQuestion[];
}) {
	const given = answers.filter((a) => a.answer != null && a.answer !== '');
	if (given.length > 0) {
		return (
			<DetailCard id="review" label="Terima kasih" title="Your review">
				<dl className="space-y-4">
					{given.map((a) => (
						<div key={a.id}>
							<dt className="text-sm text-ink-muted">{a.question}</dt>
							<dd className="mt-1 whitespace-pre-line text-ink">{displayAnswer(a.answer)}</dd>
						</div>
					))}
				</dl>
				<p className="mt-6 text-sm text-ink-muted">Thank you for staying with us. We read every one.</p>
			</DetailCard>
		);
	}
	return (
		<DetailCard id="review" label="Ulasan" title="How was your stay?">
			{questions.length > 0 ? (
				<ReviewForm tripId={tripId} questions={questions} />
			) : (
				<>
					<p className="text-ink">We’d love to hear how it went. Send us a note, a photo of the sunrise, anything.</p>
					<a href={whatsappHref} target="_blank" rel="noreferrer" className={buttonClasses('outline', 'md', { className: 'mt-5' })}>
						Message us
					</a>
				</>
			)}
		</DetailCard>
	);
}
