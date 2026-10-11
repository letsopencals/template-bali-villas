import type { JournalPost } from './types';

export const harvest: JournalPost = {
	slug: 'harvest',
	title: 'The rice year',
	titleItalic: 'in the Sidemen valley',
	excerpt: 'Planting, flooding, the green months and the harvest: how the terraces around the villas change through the year, and what you will see when you come.',
	date: '2026-09-18',
	author: 'Wayan',
	category: 'Sawah · the fields',
	image: 'journal/harvest',
	imageAlt: 'Women harvesting golden rice by hand on a terrace in the Sidemen valley, Mount Agung behind',
	relatedVillas: ['lumbung-padi', 'rumah-sawah', 'lumbung-kembar'],
	body: [
		{
			type: 'p',
			text: 'People often ask us when the best time is to see the rice. The honest answer is that there is no bad time, only different ones. The terraces around the villas are working fields, farmed by our parents and our neighbours, and they go through their whole life in a few months. If you stay for a week, you will see them change.',
		},
		{
			type: 'p',
			text: 'In Sidemen we usually grow two crops of rice a year, sometimes with a season of something else in between: chillies, peanuts, corn, or a rest. Not every terrace keeps the same calendar. One family plants while their neighbour harvests, so on most days the valley is a patchwork of water, green and gold.',
		},
		{ type: 'term', term: 'Sawah', meaning: 'A wet rice field. The terraces you see from your villa are sawah.' },
		{ type: 'h2', text: 'Water first' },
		{
			type: 'p',
			text: 'Everything starts with water. The terraces are fed by the subak, the irrigation system that Balinese farmers have shared for centuries. Water comes down from the mountain through channels and tunnels, and the subak decides together how it is divided and when each field is flooded. There is a temple for the water at the top of the system, and offerings are made there before the fields are opened.',
		},
		{
			type: 'p',
			text: 'When a field is flooded and ploughed, it turns into a mirror. This is the season for photographs at dawn. The terraces reflect the sky, Agung appears twice on a clear morning, and the herons walk in the mud looking for frogs.',
		},
		{ type: 'h2', text: 'Planting by hand' },
		{
			type: 'p',
			text: 'Seedlings are grown in a nursery corner of the field, then pulled and replanted by hand, in rows, by groups of neighbours working backwards through the mud. It is hard work and it is social work. If you walk the paths in the early morning in planting season, you will hear it before you see it: talking, laughing, a radio somewhere.',
		},
		{
			type: 'quote',
			text: 'You plant walking backwards, so you never step on what you have just done.',
			cite: 'Bapak Made, our father',
		},
		{ type: 'h2', text: 'The green months' },
		{
			type: 'p',
			text: 'For the next weeks the fields grow from a few green stripes into a solid, bright carpet. This is when the valley looks like the postcards, and it is our favourite time to sit on the terrace of Rumah Sawah with a coffee. Farmers put up scarecrows, strings of plastic and little bamboo clappers worked by the wind to keep the birds off. In the evening the frogs are very loud.',
		},
		{ type: 'h2', text: 'Harvest' },
		{
			type: 'p',
			text: 'As the grain ripens, the green turns to yellow and then to gold, and the stalks bend under the weight. Harvest is done by hand with small sickles, then the rice is threshed in the field by beating the stalks against a wooden frame. The straw is burned or left to rot back into the soil, and for a few days the valley smells of smoke and dry grass.',
		},
		{
			type: 'p',
			text: 'Before the harvest, and after it, there are offerings to Dewi Sri, the goddess of rice. You may see small figures woven from palm leaf or rice stalks at the corners of the fields. Please leave them where they are.',
		},
		{ type: 'term', term: 'Lumbung', meaning: 'The rice barn on stilts where the harvest was stored. Our name, and our smallest houses.' },
		{ type: 'h2', text: 'What you can do' },
		{
			type: 'list',
			items: [
				'Walk the terrace paths in the early morning. Ask us for the loop that starts behind the coffee garden.',
				'Ask at reception whether anyone is planting or harvesting nearby. Neighbours are often happy for you to watch, and sometimes to try.',
				'Stay on the narrow dykes between fields, single file, and step aside for anyone carrying a load.',
				'Don’t walk into a flooded or planted field. It damages the young rice.',
			],
		},
		{
			type: 'p',
			text: 'The rice you eat at the warung comes from these fields when there is enough of it, and from the next village when there isn’t. The barn that gave us our name stored it once. Now we keep the rice in the kitchen and you sleep in the barn, which seems like a fair exchange.',
		},
	],
};
