import { siteConfig } from '@/lib/site-config';
import { villaContent } from '@/lib/villa-content';
import type { FaqEntry } from '@/lib/seo';

/**
 * FAQ copy. Answers are plain text because the same strings feed the
 * FAQPage JSON-LD. Facts come from siteConfig and villaContent only.
 */

export interface FaqGroup {
	key: string;
	title: string;
	local: string;
	items: FaqEntry[];
}

const villas = Object.values(villaContent);
const minNights = villas.map((v) => v.minNights);
const shortest = Math.min(...minNights);
const longestMin = Math.max(...minNights);
const largest = Math.max(...villas.map((v) => v.maxGuests));
const { checkIn, checkOut, cancellationDays, maxNights } = siteConfig.stay;

export const faqGroups: FaqGroup[] = [
	{
		key: 'booking',
		title: 'Booking and prices',
		local: 'Pemesanan dan harga',
		items: [
			{
				question: 'What does the nightly price include?',
				answer: `Prices are per villa per night, not per person. Every stay includes ${siteConfig.priceIncludes.join(', ').toLowerCase()}. Breakfast, airport transfers, activities and the spa are extras you can add at checkout.`,
			},
			{
				question: 'Are taxes included?',
				answer: 'Taxes are shown exactly as the booking system charges them, on the checkout page, before you pay. The total you see there is the total you pay. Nothing is added on arrival.',
			},
			{
				question: 'Is there a minimum stay?',
				answer: `Yes. The rice barns and smaller villas have a ${shortest}-night minimum and the larger family houses ${longestMin} nights. Each villa page shows its own minimum, and the calendar won’t let you pick fewer nights. The longest stay you can book online is ${maxNights} nights; for longer, write to us.`,
			},
			{
				question: 'How do I pay?',
				answer: 'By card when you book, through our secure checkout. Add-ons are paid with the stay. Things you order at the warung or arrange on the day are paid locally, in rupiah or by card.',
			},
			{
				question: 'Can I use a promo code?',
				answer: 'Yes. There is a promo code field on the payment step of the checkout. The discount shows in the total before you pay.',
			},
		],
	},
	{
		key: 'check-in',
		title: 'Check-in and check-out',
		local: 'Datang dan pulang',
		items: [
			{
				question: 'What time is check-in and check-out?',
				answer: `Check-in is from ${checkIn} and check-out is by ${checkOut}, local time (WITA, UTC+8). The gap between them is when the house is cleaned and the morning offering is made for the next guest.`,
			},
			{
				question: 'Can I arrive early or leave late?',
				answer: 'You can request either as an add-on at checkout. Because another guest may be leaving or arriving the same day, we confirm it a few days before you come. If we can’t, we tell you before you travel and sort out the add-on with you. Either way you are welcome to leave your bags and use the warung.',
			},
			{
				question: 'What if I arrive in the middle of the night?',
				answer: `That’s fine. Reception is open ${siteConfig.contact.hours.replace(/^Reception\s*/i, '')}. Add your flight number and arrival time at checkout and message us on WhatsApp when you land, and someone will be at the gate with a torch.`,
			},
		],
	},
	{
		key: 'cancellation',
		title: 'Cancellation and changes',
		local: 'Pembatalan',
		items: [
			{
				question: 'What is the cancellation policy?',
				answer: `Free cancellation up to ${cancellationDays} days before check-in. The exact date is shown on the villa page, at checkout and in your trip. After that date the stay can no longer be cancelled online. Write to us and we will do what we fairly can.`,
			},
			{
				question: 'How do I cancel or change my dates?',
				answer: 'Sign in to My trips with your email address and the code we send you. From your trip you can change the dates (if the villa is free on the new ones) or cancel, inside the free-cancellation window.',
			},
		],
	},
	{
		key: 'guests',
		title: 'Guests and children',
		local: 'Tamu dan anak-anak',
		items: [
			{
				question: 'How many people can stay?',
				answer: `Each villa page shows its maximum number of guests, from 2 in the rice barns to ${largest} in the largest estate. The guest picker on each villa page stops at that number.`,
			},
			{
				question: 'Are children welcome?',
				answer: 'Very. The family houses have room to run, and children are welcome at the cooking class. Some houses are less suited to small children, such as Lumbung Padi, where the loft bed is up a steep ladder; this is noted on the villa page. Please keep an eye on little ones by the pools and the irrigation channels.',
			},
			{
				question: 'Can you provide a cot or an extra bed?',
				answer: 'A cot, yes. Ask when you book and it will be made up before you arrive. Extra adult beds are only possible where the villa page says so, because the houses are sized for their beds.',
			},
		],
	},
	{
		key: 'getting-there',
		title: 'Getting there',
		local: 'Perjalanan',
		items: [
			{
				question: 'How far is Sidemen from the airport?',
				answer: 'About two hours by road from Ngurah Rai airport (DPS), east along the coast road to Klungkung and then north into the hills. Traffic in the south decides most of the timing.',
			},
			{
				question: 'Do you arrange airport transfers?',
				answer: 'Yes. Add the airport transfer at checkout and your driver will meet you in arrivals with your name on a sign. Put your flight number in the arrival details so we can follow delays.',
			},
			{
				question: 'Do I need a car or scooter while I’m there?',
				answer: 'No. The village, the weavers and the walks through the terraces are on foot. For Besakih, the beach or the sunrise trek, we arrange a driver. We can lend bicycles.',
			},
		],
	},
	{
		key: 'villa',
		title: 'In the villa',
		local: 'Di vila',
		items: [
			{
				question: 'Is there wifi and air conditioning?',
				answer: 'Every villa has fast fibre wifi and ceiling fans. At 400 m the nights are cool, so most guests never miss air conditioning. Check the amenities on each villa page for the exact list.',
			},
			{
				question: 'Is the water safe to drink?',
				answer: 'Filtered drinking water is provided in every villa and refilled daily. Please don’t drink from the taps.',
			},
			{
				question: 'What about insects?',
				answer: 'It is a rice valley, so there are insects, frogs and geckos. Many beds have mosquito nets, and housekeeping can light a coil on your terrace in the evening.',
			},
			{
				question: 'What is the offering on my doorstep?',
				answer: 'A canang sari, the small palm-leaf tray of flowers made every morning as thanks. Please step around it rather than on it. Our journal has the full story.',
			},
		],
	},
];

export const allFaqEntries: FaqEntry[] = faqGroups.flatMap((g) => g.items);
