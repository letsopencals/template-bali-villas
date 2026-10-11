import type { FeedbackQuestionResponse } from '@opencals/storefront-sdk';

/** A store feedback question, slimmed for the client review form. */
export interface ReviewQuestion {
	id: string;
	type: 'single-line-text-field' | 'multi-line-text-field' | 'dropdown' | 'rating' | 'checkbox';
	required: boolean;
	title: string;
	description: string;
	options: string[];
}

/** File uploads aren't supported in the account review, so those questions are dropped. */
export function toReviewQuestions(questions: FeedbackQuestionResponse[]): ReviewQuestion[] {
	const out: ReviewQuestion[] = [];
	for (const q of questions) {
		if (q.type === 'file-upload') continue;
		const t = q.translations?.find((tr) => tr.languageCode === 'en') ?? q.translations?.[0];
		out.push({
			id: q.id,
			type: q.type,
			required: q.required,
			title: t?.title?.trim() || q.internalName,
			description: t?.description?.trim() ?? '',
			options: t?.options ?? [],
		});
	}
	return out;
}
