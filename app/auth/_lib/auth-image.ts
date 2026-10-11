import { getVillas } from '@/lib/server-data';
import { templateImage } from '@/lib/villa-images';

export interface AuthImage {
	src: string;
	/** Villa name for the caption, or null for the editorial valley shot. */
	villa: string | null;
}

/**
 * The photo beside the sign-in form: one villa per day (stable within a day,
 * so it doesn't flicker between requests), else the valley.
 */
export async function getAuthImage(): Promise<AuthImage> {
	try {
		const villas = (await getVillas()).filter((v) => v.image);
		if (villas.length > 0) {
			const day = Math.floor(Date.now() / 86_400_000);
			const v = villas[day % villas.length];
			if (v?.image) return { src: v.image, villa: v.title };
		}
	} catch {
		// Fall through to the editorial image.
	}
	return { src: templateImage('about/valley'), villa: null };
}
