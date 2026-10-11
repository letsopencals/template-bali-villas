import type { JournalPost } from './types';

export const joglo: JournalPost = {
	slug: 'joglo',
	title: 'How a teak joglo',
	titleItalic: 'travels from Java',
	excerpt: 'Our joglos were built in Central Java, taken apart beam by beam, carried across the strait and put back together in the rice fields. This is how it is done.',
	date: '2026-08-27',
	author: 'Kadek',
	category: 'Rumah · the houses',
	image: 'journal/joglo',
	imageAlt: 'The carved teak roof structure of a joglo, four central pillars rising to a stepped ceiling',
	relatedVillas: ['joglo-jati', 'joglo-agung', 'puri-sidemen'],
	body: [
		{
			type: 'p',
			text: 'A joglo is a traditional Javanese house, and it is not from Bali at all. You can recognise one by its roof: steep in the middle, lifting to a high peak, then flaring out wide over the walls. Inside, four central pillars hold up the whole structure, and above them a stepped ceiling of interlocking beams rises into the dark under the roof.',
		},
		{
			type: 'p',
			text: 'Our father saw his first one in a village near Yogyakarta and talked about it for years. When the family finally had the money for a third house, he went back to Java to find one.',
		},
		{ type: 'term', term: 'Joglo', meaning: 'A Javanese teak house with a high, stepped roof on four central pillars.' },
		{ type: 'h2', text: 'Old houses, new places' },
		{
			type: 'p',
			text: 'Many joglos in Java are old. Families who no longer live in them, or who are rebuilding in brick, sell them to carpenters and dealers who restore them. Because a joglo is built entirely from fitted timber, it can be taken apart and moved. Javanese builders have always done this. A house could travel with a family, or be passed on to a new village.',
		},
		{
			type: 'p',
			text: 'The wood is teak, jati in Indonesian, which is why one of our houses is called Joglo Jati. Teak is heavy, oily and hard. It resists termites and rain, it darkens beautifully with age, and it moves with the seasons without cracking. A well-kept teak frame outlives the people who build it.',
		},
		{ type: 'h2', text: 'Taking it apart' },
		{
			type: 'p',
			text: 'There are no nails in a joglo frame. Every joint is a mortise and tenon, a dovetail or a lap, locked with wooden pegs. To move one, the carpenters first number every piece, then knock out the pegs and lift the frame apart from the top down: roof boards, rafters, the stepped ceiling, the beams, finally the four great pillars.',
		},
		{
			type: 'p',
			text: 'Each piece is cleaned, and any rotten section is cut out and patched with old teak of the same colour. The carved panels are packed separately, wrapped in cloth. The whole house fits on a couple of trucks, which take the ferry across the strait from Java to Bali and then drive, slowly, up the valley road to Sidemen.',
		},
		{
			type: 'quote',
			text: 'A joglo is a puzzle that somebody already solved. My job is not to lose any pieces.',
			cite: 'Pak Komang, our carpenter',
		},
		{ type: 'h2', text: 'Putting it back' },
		{
			type: 'p',
			text: 'Pak Komang spent a season learning how Javanese carpenters put a joglo together, and then he did it in our rice fields. First a raised stone platform, so the wood never sits on wet ground. Then the four pillars, set on carved stone bases and pegged together by the beams that run between them. Then the ceiling, layer by layer, each ring of beams sitting a little higher and further in than the last.',
		},
		{
			type: 'p',
			text: 'The roof was the only part we changed. In Java a joglo is usually covered in clay tiles. Here some of ours have tiles and some have alang-alang thatch, which is cooler in the afternoon and quieter in the rain. The walls are new: sliding teak panels and glass, so the house opens fully onto the terrace and the view.',
		},
		{ type: 'h2', text: 'What to look for when you stay' },
		{
			type: 'list',
			items: [
				'Lie on your back under the centre of the roof and look up at the stepped ceiling. That is the tumpang sari, the heart of the house.',
				'Look for small numbers scratched into the beams. They are the carpenters’ marks from the move.',
				'Run your hand along the four pillars. They are each a single piece of teak.',
				'Notice how the house is cool at midday and holds a little warmth at night. That is the high roof doing its work.',
			],
		},
		{
			type: 'p',
			text: 'Each of our joglos has its own story and its own village of origin in Java. Ask Pak Komang, if you find him in the workshop. He knows which beam came from where, and which one gave him the most trouble.',
		},
	],
};
