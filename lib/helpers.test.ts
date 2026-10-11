import { describe, expect, it } from 'vitest';
import { normalizeRedirect } from '@/lib/link-redirect';
import { sanitizeStayAttributes } from '@/lib/reserve-attributes';
import { defaultVillaImage, imageNameOf, orderedGallery, resolveImage, templateImage } from '@/lib/villa-images';
import { villaContent } from '@/lib/villa-content';

describe('normalizeRedirect', () => {
	it('maps generic appointment links to trips', () => {
		expect(normalizeRedirect('/account/appointments/abc')).toBe('/account/trips/abc');
		expect(normalizeRedirect('/account/appointments/abc/view?action=cancel')).toBe('/account/trips/abc?action=cancel');
		expect(normalizeRedirect('/account/appointments')).toBe('/account');
		expect(normalizeRedirect('/account/orders/1')).toBe('/account');
		expect(normalizeRedirect('/villas')).toBe('/villas');
	});
});

describe('sanitizeStayAttributes', () => {
	it('keeps only known keys as trimmed strings', () => {
		expect(sanitizeStayAttributes({ adults: 2, children: 0, occasion: '  Honeymoon ', evil: 'x', flight_number: '', arrival_time: { a: 1 } })).toEqual({
			adults: '2',
			children: '0',
			occasion: 'Honeymoon',
		});
		expect(sanitizeStayAttributes(null)).toEqual({});
		expect(sanitizeStayAttributes(['adults'])).toEqual({});
		expect(sanitizeStayAttributes({ occasion: 'x'.repeat(300) }).occasion).toHaveLength(255);
	});
});

describe('villa images', () => {
	const gallery = [
		'https://media.opencals.com/products/seeding-datasets/bali-villa-rental/joglo-jati-pool.jpg?v=2',
		'https://media.opencals.com/products/seeding-datasets/bali-villa-rental/Joglo-Jati.JPG',
		'https://cdn.example.com/merchant-upload.webp',
	];

	it('matches names ignoring query, extension and case', () => {
		expect(imageNameOf(gallery[0]!)).toBe('joglo-jati-pool');
		expect(imageNameOf('https://x/y/no-extension')).toBeNull();
		expect(resolveImage(gallery, 'joglo-jati')).toBe(gallery[1]);
		expect(resolveImage(gallery, 'missing')).toBeNull();
	});

	it('picks the day exterior as the default image, then the fallback', () => {
		expect(defaultVillaImage(gallery, 'joglo-jati')).toBe(gallery[1]);
		expect(defaultVillaImage(gallery, 'other', 'fallback.jpg')).toBe('fallback.jpg');
	});

	it('orders the gallery editorially and keeps merchant uploads', () => {
		const content = villaContent['joglo-jati'];
		expect(content).toBeDefined();
		const ordered = orderedGallery(gallery, content ?? null);
		expect(ordered[0]).toBe(gallery[1]);
		expect(ordered).toHaveLength(3);
		expect(ordered[2]).toBe(gallery[2]);
	});

	it('builds template image paths', () => {
		expect(templateImage('day/pagi')).toBe('/images/day/pagi.jpg');
		expect(templateImage('/og.jpg')).toBe('/images/og.jpg');
	});
});
