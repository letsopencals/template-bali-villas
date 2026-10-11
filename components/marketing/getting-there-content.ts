/** Editorial copy for /getting-there. Times are approximate and say so. */

export interface RouteLeg {
	place: string;
	local?: string;
	text: string;
}

export const routeLegs: RouteLeg[] = [
	{
		place: 'Ngurah Rai airport (DPS)',
		local: 'Bandara',
		text: 'Out through arrivals, past the taxi desks. If you booked our transfer, your driver waits outside with a Lumbung sign and your name on it.',
	},
	{
		place: 'East on the coast road',
		local: 'Jalan Bypass',
		text: 'The bypass takes you around Sanur and onto the Ida Bagus Mantra coast road, with black-sand beaches on your right. This is the busy part, and traffic decides how long it takes.',
	},
	{
		place: 'Klungkung (Semarapura)',
		local: 'Kota Klungkung',
		text: 'The old royal town, with its floating pavilion and a good market. The last ATMs and pharmacies before the valley are here, if you need either.',
	},
	{
		place: 'North into the hills',
		local: 'Jalan Raya Sidemen',
		text: 'A narrow road climbs north along the Unda river, through villages and between terraces. It gets cooler. Agung appears ahead on a clear day.',
	},
	{
		place: 'Banjar Tabola, Sidemen',
		local: 'Sampai',
		text: 'Turn at the carved stone gate on the right, past the warung. Park by the coffee garden. Someone will walk you, and your bags, down the path to your villa.',
	},
];

export const darkArrival = [
	'There are no street lights after Klungkung, and the last part of the road is narrow and steep. Drivers who know it are fine. If you are driving yourself, go slowly and watch for dogs and scooters without lights.',
	'Tell us your flight number and arrival time when you book, and message us on WhatsApp when you land. We will have the path lamps lit, the gate open and someone waiting with a torch.',
	'If you arrive very late, we leave the villa unlocked, the fan on, water and fruit on the table, and we do the welcome properly in the morning.',
];

export interface PackItem {
	title: string;
	text: string;
}

export const packingList: PackItem[] = [
	{ title: 'A warm layer', text: 'At 400 m the evenings are cool and the early mornings can be cold, especially for the sunrise trek.' },
	{ title: 'Shoes for paths', text: 'The paths between the villas are stone and grass, and can be slippery after rain. Sandals with grip, or trainers.' },
	{ title: 'A rain jacket', text: 'In the wet season, roughly November to March, afternoon rain is normal. It is also when the terraces are greenest.' },
	{ title: 'Something to cover up', text: 'Shoulders and knees covered for temples. We lend sarongs and sashes, so you do not need to buy one.' },
	{ title: 'Some cash in rupiah', text: 'Village warungs, weavers and drivers prefer cash. The villa and the add-ons take cards.' },
	{ title: 'A torch, or your phone', text: 'The paths are lit, but the village and the paddies at night are not. Fireflies are easier to see in the dark anyway.' },
];
