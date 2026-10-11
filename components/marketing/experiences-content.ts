/**
 * Editorial copy for /experiences. Prices are never written here: they come from
 * the store's add-ons (matched by `addOnKeywords`), otherwise the page says
 * "ask at reception".
 */

export interface Experience {
	key: string;
	/** Name in English. */
	name: string;
	/** Indonesian name or a short local line. */
	local: string;
	/** templateImage path. */
	image: string;
	imageAlt: string;
	/** Time of day label (Pagi / Siang / Sore / Malam). */
	when: string;
	duration: string;
	summary: string;
	body: [string, string];
	/** Practical notes, 3 short lines. */
	notes: string[];
	/** Keyword groups to find the store add-on (see matchAddOn). Empty: not an add-on. */
	addOnKeywords: string[][];
}

export const experiences: Experience[] = [
	{
		key: 'sunrise-trek',
		name: 'Sunrise on Mount Agung',
		local: 'Mendaki ke Pura Pasar Agung',
		image: 'experiences/sunrise-trek',
		imageAlt: 'First light over the crater ridge of Mount Agung, seen from the trail above Pura Pasar Agung',
		when: 'Pagi · before dawn',
		duration: 'About 8 hours door to door, pickup around 01:30',
		summary: 'A night drive to the temple on Agung’s southern slope, then a guided climb in the dark to watch the sun come up over Lombok.',
		body: [
			'Our driver collects you at the gate in the small hours and takes the mountain road to Pura Pasar Agung, the temple where the southern trail begins. From there you walk with a guide from the village of Selat, by head torch, on volcanic gravel and old stone steps. It is steep and it is cold. It is also the only way to see Agung’s shadow fall across half of Bali at first light.',
			'You are back at the villa by late morning, hungry and dusty. Breakfast is waiting, and so is the pool. We recommend it on your second or third morning, once you have slept off the flight.',
		],
		notes: ['For fit walkers. Bring a warm layer, gloves and real shoes', 'The trail closes during big ceremonies and when the volcano alert level rises', 'Guide, head torch, transport and a simple breakfast on the mountain'],
		addOnKeywords: [['sunrise'], ['trek'], ['agung']],
	},
	{
		key: 'weaving',
		name: 'Songket weaving in Sidemen',
		local: 'Tenun songket',
		image: 'experiences/weaving',
		imageAlt: 'Hands passing a gold thread through a songket loom in a family workshop',
		when: 'Siang · late morning',
		duration: 'About 2 hours, walkable from the villas',
		summary: 'Sidemen is one of the places in Bali where songket, the gold-threaded ceremonial cloth, is still woven by hand. Visit a family workshop in the village and try the loom.',
		body: [
			'Most houses on the road into Sidemen have a loom on the veranda. A length of songket, with its supplementary weft of gold or silver thread, can take a weaver weeks. The women who weave it will show you how the pattern is counted out thread by thread, and they will let you sit at the loom and make a very slow, very crooked start of your own.',
			'Nothing is staged and nothing is sold to you. If you want to buy a piece, the workshops sell directly and the money stays in the family. Ask us the night before and we will tell them you are coming.',
		],
		notes: ['Bring small notes in rupiah if you want to buy', 'Mornings are best, when the weavers are working', 'We walk you there, or lend you a bicycle'],
		addOnKeywords: [['weav'], ['songket']],
	},
	{
		key: 'cooking-class',
		name: 'Cooking class in the family kitchen',
		local: 'Belajar masak Bali',
		image: 'experiences/cooking-class',
		imageAlt: 'A stone mortar of fresh bumbu spice paste beside banana leaves and shallots',
		when: 'Sore · afternoon',
		duration: 'About 3 hours, then you eat what you made',
		summary: 'Start in the market or the garden, grind a bumbu base genep in the stone mortar, and cook a full Balinese table with our mother, Ibu Ketut.',
		body: [
			'Every Balinese kitchen starts with base genep, the spice paste of shallot, garlic, galangal, turmeric, chilli, candlenut and shrimp paste that goes into almost everything. Ibu Ketut makes it the way her mother did, in a volcanic-stone mortar, and she will make you do the same. Then sate lilit on lemongrass sticks, a vegetable lawar, sambal matah and rice from the terraces outside.',
			'The class ends at the table in the family bale, where you eat the whole thing slowly. Vegetarian and vegan versions are no trouble. Tell us about allergies when you book.',
		],
		notes: ['Recipes to take home, written out by hand', 'Vegetarian, vegan and gluten-free on request', 'Children are welcome at the table and the mortar'],
		addOnKeywords: [['cooking']],
	},
	{
		key: 'spa',
		name: 'Balinese massage, for two',
		local: 'Pijat Bali',
		image: 'experiences/spa',
		imageAlt: 'Two massage beds in an open bale with frangipani and coconut oil, the rice terraces behind',
		when: 'Sore · or any time you like',
		duration: 'About 90 minutes',
		summary: 'Long-stroke Balinese massage with warm coconut oil, in the open bale above the terraces or on your own terrace.',
		body: [
			'Our therapists are from the valley and trained in the traditional long-stroke style: firm palms, acupressure and warm coconut oil pressed in Karangasem. You can have it in the spa bale, with the sound of water from the terraces below, or we set up on your own terrace.',
			'Late afternoon is the best time, after the heat and before the light goes. Tell us if you prefer a lighter or firmer pressure, or a single therapist for one guest.',
		],
		notes: ['In the spa bale or on your terrace', 'Tell us about pregnancy or injuries when you book', 'Flower bath and ginger tea afterwards'],
		addOnKeywords: [['massage'], ['spa']],
	},
	{
		key: 'warung',
		name: 'Breakfast and the warung',
		local: 'Makan di warung',
		image: 'experiences/warung',
		imageAlt: 'A simple breakfast of black rice pudding, fruit and Kintamani coffee on a teak table by the paddy',
		when: 'Pagi to Malam',
		duration: 'Open from breakfast to dinner',
		summary: 'The family warung by the coffee garden cooks breakfast, lunch and a short dinner menu. Or we float breakfast to you in the pool.',
		body: [
			'Breakfast is not included in the nightly price, on purpose: some guests want it every day, others walk to the village. When you want it, it is black rice pudding with coconut milk, fruit from the garden, eggs any way, and Kintamani coffee. Lunch and dinner are short menus of whatever is good that week, nasi campur, soups, grilled fish from the coast.',
			'For a slow morning, add the floating breakfast to your stay and we bring it to you on a tray in your pool. Order at the warung otherwise and pay there, in rupiah or by card.',
		],
		notes: ['Prices for the warung menu are on the table, in rupiah', 'Floating breakfast is for villas with a pool', 'Room delivery until 21:00'],
		addOnKeywords: [['floating', 'breakfast'], ['breakfast']],
	},
	{
		key: 'temple',
		name: 'Temples and the village',
		local: 'Ke pura bersama keluarga',
		image: 'experiences/temple',
		imageAlt: 'A split temple gate and stone steps under frangipani trees in the Sidemen valley',
		when: 'Pagi · or on a ceremony day',
		duration: 'Half a day, at your own pace',
		summary: 'Visit the village temples with one of the family, learn what the offerings are for, and, if a ceremony is on, how to join respectfully.',
		body: [
			'There are temples in every banjar of the valley, and something is almost always being celebrated somewhere. One of us will walk you through the village temple, explain the three courtyards and the offerings, and lend you a sarong and a sash. On ceremony days you may be invited in. If you are, you will be among the few visitors there.',
			'Further out, Pura Besakih, the mother temple, is about an hour by car up the slope of Agung. We can arrange a driver and tell you how to go early and avoid the touts at the gate.',
		],
		notes: ['Sarong and sash lent at reception', 'Shoulders and knees covered inside temple walls', 'Driver to Besakih or Tirta Gangga on request'],
		addOnKeywords: [['temple']],
	},
];

/** Short lines for the "how add-ons work" band. */
export const addOnSteps = [
	{ title: 'Pick your villa and dates', text: 'Every villa page shows the nightly price and the total for your stay.' },
	{ title: 'Add experiences at checkout', text: 'Under “Make it yours”, add the trek, the massage, the class or a transfer. Each shows its price.' },
	{ title: 'Choose the day when you arrive', text: 'We plan the timing with you at reception, around the weather and the ceremonies.' },
] as const;
