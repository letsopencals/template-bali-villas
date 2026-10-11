import type { JournalPost } from './types';

export const offerings: JournalPost = {
	slug: 'offerings',
	title: 'Canang sari',
	titleItalic: 'and the morning ritual',
	excerpt: 'Every morning, a small palm-leaf tray of flowers appears at your door. What it is, who makes it, and how to behave around one.',
	date: '2026-10-02',
	author: 'Ibu Ketut',
	category: 'Pagi · mornings',
	image: 'journal/offerings',
	imageAlt: 'Hands placing a canang sari of white, red, yellow and blue flowers on a stone step at dawn',
	relatedVillas: ['griya-kopi', 'bale-air', 'pondok-bambu'],
	body: [
		{
			type: 'p',
			text: 'If you wake early on your first morning, you may see me on the path with a flat basket on my hip and a stick of incense in my hand. I am making the morning offerings. There is one for each house, one for the kitchen, the gate, the shrine in the family compound, the well, the car and the motorbikes. When I am finished, it is time for coffee.',
		},
		{
			type: 'p',
			text: 'The little tray I leave by your door is a canang sari. Every Balinese Hindu household makes them, every day. You will see them everywhere in Bali: on doorsteps, on shop counters, on the dashboards of taxis, at crossroads and at the foot of trees.',
		},
		{ type: 'term', term: 'Canang sari', meaning: 'A daily offering: a small palm-leaf tray of flowers, given as thanks.' },
		{ type: 'h2', text: 'What is in it' },
		{
			type: 'p',
			text: 'The tray itself is cut and pinned from young coconut leaf, folded into a little square with raised sides. Inside goes a base of something to give: a few grains of rice, a piece of betel leaf with lime and areca nut, sometimes a sweet or a biscuit. On top go the flowers, arranged in a particular order.',
		},
		{
			type: 'p',
			text: 'Each colour faces a direction and belongs to a god. White to the east, red to the south, yellow to the west, and blue or dark green to the north. In the middle goes a pinch of shredded pandan leaf, for fragrance. The little offering basket drawn around this website uses the same four colours.',
		},
		{
			type: 'quote',
			text: 'Sari means essence. The flowers are the best part of the morning, so you give that part away first.',
			cite: 'Ibu Ketut',
		},
		{ type: 'h2', text: 'Who makes them' },
		{
			type: 'p',
			text: 'In our family it is the women who make most of the offerings, though everyone helps on big ceremony days. I learned from my mother-in-law, sitting on the floor of the family bale in the afternoon with my sisters-in-law, cutting and pinning leaves while we talked. We still do it that way. The young ones are faster than me now, and their trays are straighter.',
		},
		{
			type: 'p',
			text: 'For a normal day we make enough for the next morning. Before a ceremony we make hundreds, of many kinds, some of them tall towers of fruit and cakes that the women carry to the temple on their heads.',
		},
		{ type: 'h2', text: 'The ritual' },
		{
			type: 'p',
			text: 'Each offering is placed with a short prayer. I light the incense, set the tray down, sprinkle it with holy water using a flower, and waft the smoke towards it with my hand three times. The offering on a high shrine is for the gods. The one on the ground is for the spirits of the lower world, so they are content and leave the house in peace. Both matter.',
		},
		{
			type: 'p',
			text: 'Once it has been offered, the essence has been given. That is why you will see dogs and chickens eating the rice from the ground offerings later in the day, and nobody minds.',
		},
		{ type: 'h2', text: 'How to behave around one' },
		{
			type: 'list',
			items: [
				'Step around offerings on the ground, not over or on them. If you do tread on one by accident, don’t worry. It happens all the time.',
				'Don’t move or tidy them away. Housekeeping will clear the old ones in the afternoon.',
				'Photos are fine. Asking first is kind.',
				'If you would like to make one, ask at reception. I am usually free in the afternoon, and I will show you.',
			],
		},
		{
			type: 'p',
			text: 'Guests sometimes ask me whether it is tiring, making offerings every single day. It is a little. But it is also how my day begins: the cool air, the path, the incense, a moment at each door to say thank you. Then the coffee. I wouldn’t give it up.',
		},
	],
};
