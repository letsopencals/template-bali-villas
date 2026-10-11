/**
 * Editorial content per villa, keyed by the product slug in the store.
 *
 * What comes from the API: title, nightly price, the photo gallery, availability,
 * add-ons and check-in/check-out times (product.fixedStartTime/fixedEndTime).
 * What lives here: everything a booking UI needs that the API doesn't model, such as
 * rooms, beds, sizes, amenities, house rules, the site-plan position and the house manual.
 *
 * Images: every name below is an image file name WITHOUT extension. The product's
 * gallery from the API contains URLs ending in `/<name>.jpg`, so match them with
 * `resolveImage(gallery, name)` (lib/villa-images.ts). Missing images are simply
 * skipped. The default product image is always `<slug>` (the day exterior).
 *
 * CONTRACT FILE: owned by the lead. Agents read it and don't edit it.
 */

export type VillaCollection = 'rice-barns' | 'pool-villas' | 'family-houses' | 'signature';

export type RoomKind = 'living' | 'bedroom' | 'bathroom' | 'kitchen' | 'pool' | 'terrace' | 'view' | 'approach' | 'detail';

export interface VillaRoom {
	/** Stable key, also the image suffix: `<slug>-<key>`. */
	key: string;
	kind: RoomKind;
	name: string;
	/** Bed setup for bedrooms, e.g. "King bed, mosquito net, garden doors". */
	bedSetup?: string;
	/** Three short features shown in the room tour. */
	features: [string, string, string];
	/** Image names (no extension). The first one is the room's lead image. */
	images: string[];
}

export interface VillaContent {
	slug: string;
	/** Short type line under the name, e.g. "Teak joglo with a private pool". */
	type: string;
	tagline: string;
	/** Two short paragraphs. */
	story: [string, string];
	pullQuote: string;
	collections: VillaCollection[];
	sizeM2: number;
	maxGuests: number;
	/** Adults allowed (the rest of maxGuests may be children). */
	maxAdults: number;
	bedrooms: number;
	beds: string;
	bathrooms: number;
	pool: 'private' | 'plunge' | 'shared' | 'none';
	view: string;
	minNights: number;
	rooms: VillaRoom[];
	amenities: string[];
	houseRules: string[];
	/** Position on the illustrated site plan, 0–100 percent of the plan's width/height. */
	sitePlan: { x: number; y: number; terrace: number };
	/** Image names for the Day/Dusk toggle (same framing, different light). */
	dayImage: string;
	duskImages: string[];
	/** Optional per-villa clip in /public/videos. None ship today (economy media set); the villa page
	 * falls back to the general valley film. */
	video?: string;
	houseManual: { wifi: string; tips: string[] };
	/** Floor plan: rooms as rectangles in a 100×60 viewBox, keyed to room keys. */
	floorPlan: Array<{ room: string; x: number; y: number; w: number; h: number; label: string }>;
}

const R = (
	slug: string,
	key: string,
	kind: RoomKind,
	name: string,
	features: [string, string, string],
	bedSetup?: string,
): VillaRoom => ({ key, kind, name, features, bedSetup, images: [`${slug}-${key}`] });

const COMMON_AMENITIES = ['Fast wifi (fibre)', 'Daily housekeeping', 'Filtered drinking water', 'Ceiling fans', 'Organic toiletries', 'Beach towels and umbrellas'];

const COMMON_RULES = [
	'Check-in from 15:00, check-out by 11:00',
	'Quiet hours after 22:00, out of respect for the village',
	'No smoking indoors',
	'Please cover shoulders and knees when visiting temples',
];

export const villaContent: Record<string, VillaContent> = {
	'lumbung-padi': {
		slug: 'lumbung-padi',
		type: 'Rice-barn studio with a loft bed',
		tagline: 'Sleep under the thatch, wake up level with the paddy.',
		story: [
			'Lumbung Padi is a real rice barn, rebuilt plank by plank by a carpenter from the next village. Downstairs is an open bale for reading and long breakfasts; up a teak ladder, a loft bed sits under the curve of the alang-alang roof.',
			'It is our smallest house and our most requested. Two people, one view, and the sound of water running through the terraces all night.',
		],
		pullQuote: 'The roof is the room.',
		collections: ['rice-barns'],
		sizeM2: 38,
		maxGuests: 2,
		maxAdults: 2,
		bedrooms: 1,
		beds: '1 queen (loft)',
		bathrooms: 1,
		pool: 'shared',
		view: 'Rice terraces',
		minNights: 2,
		rooms: [
			R('lumbung-padi', 'approach', 'approach', 'The path in', ['Stepping stones over the irrigation channel', 'Frangipani on both sides', 'Lit by oil lamps at night']),
			R('lumbung-padi', 'living', 'living', 'Open bale', ['Daybed with batik cushions', 'Coffee corner with local Kintamani beans', 'Rolled bamboo blinds']),
			R('lumbung-padi', 'bedroom', 'bedroom', 'Loft under the thatch', ['Teak ladder', 'Mosquito net', 'Round window to the paddy'], 'Queen bed in the loft'),
			R('lumbung-padi', 'bathroom', 'bathroom', 'Garden bathroom', ['Open-sky rain shower', 'River-stone floor', 'Hot water all day']),
			R('lumbung-padi', 'view', 'view', 'The view', ['Terraces at eye level', 'Agung on clear mornings', 'Herons at dusk']),
			R('lumbung-padi', 'detail', 'detail', 'Small things', ['Hand-carved door panels', 'Woven pandan mats', 'A fresh offering every morning']),
		],
		amenities: [...COMMON_AMENITIES, 'Shared saltwater pool', 'Breakfast bale'],
		houseRules: [...COMMON_RULES, 'The loft ladder is steep, so not suited to small children'],
		sitePlan: { x: 18, y: 38, terrace: 2 },
		dayImage: 'lumbung-padi',
		duskImages: ['lumbung-padi-dusk'],
		houseManual: {
			wifi: 'Lumbung-Padi · ask the host for the password',
			tips: ['The loft gets the first light, so the round window has a cover if you like to sleep in.', 'The shared pool is quietest before 10:00.'],
		},
		floorPlan: [
			{ room: 'living', x: 10, y: 20, w: 50, h: 30, label: 'Bale' },
			{ room: 'bathroom', x: 62, y: 20, w: 28, h: 30, label: 'Bath' },
			{ room: 'bedroom', x: 10, y: 4, w: 50, h: 14, label: 'Loft' },
		],
	},
	'lumbung-kembar': {
		slug: 'lumbung-kembar',
		type: 'Twin rice barns around a private garden',
		tagline: 'Two barns, one garden, and a daybed in between.',
		story: [
			'Kembar means twins. One barn holds the bedroom, the other a lounge and a little kitchen, and a frangipani garden connects them. You walk outside to go to bed, which is the point.',
			'Good for couples who like a bit of space, or a parent travelling with an older child on the daybed.',
		],
		pullQuote: 'You walk outside to go to bed.',
		collections: ['rice-barns'],
		sizeM2: 55,
		maxGuests: 2,
		maxAdults: 2,
		bedrooms: 1,
		beds: '1 king + 1 daybed',
		bathrooms: 1,
		pool: 'shared',
		view: 'Garden and terraces',
		minNights: 2,
		rooms: [
			R('lumbung-kembar', 'approach', 'approach', 'The garden', ['Frangipani and ginger lilies', 'Stone path between the barns', 'Outdoor daybed']),
			R('lumbung-kembar', 'living', 'living', 'Lounge barn', ['Low sofa and reading lamps', 'Kitchenette with kettle and fridge', 'Sliding teak shutters']),
			R('lumbung-kembar', 'bedroom', 'bedroom', 'Sleeping barn', ['King bed under the thatch', 'Linen curtains', 'Garden doors'], 'King bed'),
			R('lumbung-kembar', 'bathroom', 'bathroom', 'Stone bathroom', ['Terrazzo tub', 'Rain shower', 'Fern wall']),
			R('lumbung-kembar', 'terrace', 'terrace', 'Daybed terrace', ['Daybed between the barns', 'Hammock', 'Breakfast table for two']),
			R('lumbung-kembar', 'detail', 'detail', 'Small things', ['Hand-woven ikat throws', 'Brass bell at the gate', 'Clay water jugs']),
		],
		amenities: [...COMMON_AMENITIES, 'Shared saltwater pool', 'Kitchenette', 'Private garden'],
		houseRules: COMMON_RULES,
		sitePlan: { x: 28, y: 30, terrace: 2 },
		dayImage: 'lumbung-kembar',
		duskImages: ['lumbung-kembar-dusk'],
		houseManual: {
			wifi: 'Lumbung-Kembar · ask the host for the password',
			tips: ['Close the shutters of the lounge barn at night, because geckos love the lamps.', 'Breakfast can be served on the daybed terrace.'],
		},
		floorPlan: [
			{ room: 'living', x: 6, y: 14, w: 30, h: 32, label: 'Lounge barn' },
			{ room: 'terrace', x: 38, y: 20, w: 24, h: 20, label: 'Garden' },
			{ room: 'bedroom', x: 64, y: 14, w: 30, h: 22, label: 'Sleeping barn' },
			{ room: 'bathroom', x: 64, y: 38, w: 30, h: 12, label: 'Bath' },
		],
	},
	'rumah-sawah': {
		slug: 'rumah-sawah',
		type: 'House in the paddy with a plunge pool',
		tagline: 'A plunge pool with the rice field as its edge.',
		story: [
			'Rumah Sawah stands alone in the middle of a working rice field, reached by a raised path between the terraces. The farmers who plant around it are the owner’s cousins; in March you will watch the harvest from your pool.',
			'Inside it is one long room of teak and lime plaster, with glass doors that fold away entirely.',
		],
		pullQuote: 'In March you watch the harvest from the pool.',
		collections: ['pool-villas'],
		sizeM2: 62,
		maxGuests: 2,
		maxAdults: 2,
		bedrooms: 1,
		beds: '1 king',
		bathrooms: 1,
		pool: 'plunge',
		view: 'Working rice field',
		minNights: 2,
		rooms: [
			R('rumah-sawah', 'approach', 'approach', 'The paddy path', ['Raised path between terraces', 'Ducks in the morning', 'Lanterns at night']),
			R('rumah-sawah', 'living', 'living', 'One long room', ['Folding glass walls', 'Lime-plaster walls', 'Teak reading bench']),
			R('rumah-sawah', 'bedroom', 'bedroom', 'Bedroom', ['King bed facing the field', 'Blackout linen', 'Ceiling fan and AC'], 'King bed'),
			R('rumah-sawah', 'bathroom', 'bathroom', 'Bathroom', ['Twin basins in volcanic stone', 'Walk-in rain shower', 'Window onto the paddy']),
			R('rumah-sawah', 'pool', 'pool', 'Plunge pool', ['4 m saltwater plunge pool', 'Sunbed deck', 'Rice field on three sides']),
			R('rumah-sawah', 'view', 'view', 'The field', ['Planting, growing, harvest', 'Agung at sunrise', 'Fireflies after rain']),
		],
		amenities: [...COMMON_AMENITIES, 'Private plunge pool', 'Air conditioning', 'Bluetooth speaker'],
		houseRules: [...COMMON_RULES, 'Please keep to the raised path, the field is a working farm'],
		sitePlan: { x: 40, y: 58, terrace: 4 },
		dayImage: 'rumah-sawah',
		duskImages: ['rumah-sawah-dusk', 'rumah-sawah-pool-dusk'],
		houseManual: {
			wifi: 'Rumah-Sawah · ask the host for the password',
			tips: ['The farmers start at 06:00, so wave hello.', 'Ask for the harvest calendar at check-in.'],
		},
		floorPlan: [
			{ room: 'living', x: 6, y: 10, w: 44, h: 26, label: 'Living' },
			{ room: 'bedroom', x: 52, y: 10, w: 26, h: 26, label: 'Bedroom' },
			{ room: 'bathroom', x: 80, y: 10, w: 14, h: 26, label: 'Bath' },
			{ room: 'pool', x: 20, y: 40, w: 50, h: 14, label: 'Plunge pool' },
		],
	},
	'pondok-bambu': {
		slug: 'pondok-bambu',
		type: 'Bamboo treehouse in the coconut grove',
		tagline: 'Eight metres up, in the canopy.',
		story: [
			'Pondok Bambu is woven from black and golden bamboo by a Sidemen workshop, and it sits on stilts among coconut palms at the edge of the river ravine. The bedroom is a cocoon; the deck is the treetops.',
			'It sways, gently, when the wind comes up the valley. Most guests say that is the best part.',
		],
		pullQuote: 'It sways, gently, when the wind comes up the valley.',
		collections: ['signature'],
		sizeM2: 48,
		maxGuests: 2,
		maxAdults: 2,
		bedrooms: 1,
		beds: '1 king',
		bathrooms: 1,
		pool: 'shared',
		view: 'River ravine and palms',
		minNights: 2,
		rooms: [
			R('pondok-bambu', 'approach', 'approach', 'Up the stairs', ['Bamboo spiral stair', 'Rope handrails', 'Ferns all the way up']),
			R('pondok-bambu', 'bedroom', 'bedroom', 'The cocoon', ['Woven bamboo shell', 'King bed with a canopy net', 'Round window to the ravine'], 'King bed'),
			R('pondok-bambu', 'bathroom', 'bathroom', 'Canopy bathroom', ['Copper tub', 'Shower open to the palms', 'Bamboo screens']),
			R('pondok-bambu', 'terrace', 'terrace', 'Treetop deck', ['Hanging nest chair', 'Breakfast for two in the canopy', 'Sound of the river below']),
			R('pondok-bambu', 'view', 'view', 'The ravine', ['River 30 m below', 'Coconut palms at eye level', 'Kingfishers']),
			R('pondok-bambu', 'detail', 'detail', 'Made by hand', ['Black and golden bamboo', 'Rattan lamps', 'Rope joints, no nails']),
		],
		amenities: [...COMMON_AMENITIES, 'Shared saltwater pool', 'Copper soaking tub', 'Hanging nest chair'],
		houseRules: [...COMMON_RULES, 'Not suitable for children under 12 or guests with limited mobility (steep stairs)'],
		sitePlan: { x: 8, y: 62, terrace: 5 },
		dayImage: 'pondok-bambu',
		duskImages: ['pondok-bambu-dusk'],
		houseManual: {
			wifi: 'Pondok-Bambu · ask the host for the password',
			tips: ['Bring a torch for the stairs at night, there is one by the door.', 'The deck is magic in the rain.'],
		},
		floorPlan: [
			{ room: 'bedroom', x: 30, y: 8, w: 40, h: 26, label: 'Cocoon' },
			{ room: 'bathroom', x: 72, y: 8, w: 20, h: 26, label: 'Bath' },
			{ room: 'terrace', x: 10, y: 36, w: 80, h: 18, label: 'Treetop deck' },
		],
	},
	'joglo-jati': {
		slug: 'joglo-jati',
		type: 'Teak joglo with a private pool',
		tagline: 'A 90-year-old Javanese house, with a pool in front.',
		story: [
			'This joglo stood in a village near Kudus for ninety years before it was taken apart, shipped to Bali and raised again on our second terrace. The four central teak pillars still carry their original carvings.',
			'Under that great pyramid roof is a single high room for living and sleeping, opening onto a 9 m pool and the valley.',
		],
		pullQuote: 'The four central pillars still carry their original carvings.',
		collections: ['pool-villas'],
		sizeM2: 85,
		maxGuests: 3,
		maxAdults: 2,
		bedrooms: 1,
		beds: '1 king + 1 single daybed',
		bathrooms: 1,
		pool: 'private',
		view: 'Valley and Agung',
		minNights: 2,
		rooms: [
			R('joglo-jati', 'living', 'living', 'Under the roof', ['Carved teak pillars', 'Antique daybed', 'Six-metre ceiling']),
			R('joglo-jati', 'bedroom', 'bedroom', 'Bedroom', ['King four-poster bed', 'Batik canopy', 'Doors onto the pool'], 'King four-poster, single daybed for a child'),
			R('joglo-jati', 'bathroom', 'bathroom', 'Garden bathroom', ['Stone tub in a walled garden', 'Rain shower', 'Frangipani overhead']),
			R('joglo-jati', 'pool', 'pool', 'Private pool', ['9 m saltwater pool', 'Sunbed deck and bale', 'Valley view']),
			R('joglo-jati', 'view', 'view', 'The valley', ['Agung on clear mornings', 'Terraces below', 'Mist at dawn']),
			R('joglo-jati', 'detail', 'detail', 'Old wood', ['Hand-carved gebyok panels', 'Brass hardware', 'Old Javanese lanterns']),
		],
		amenities: [...COMMON_AMENITIES, 'Private 9 m pool', 'Air conditioning', 'Outdoor bale', 'Minibar'],
		houseRules: COMMON_RULES,
		sitePlan: { x: 52, y: 34, terrace: 2 },
		dayImage: 'joglo-jati',
		duskImages: ['joglo-jati-dusk', 'joglo-jati-pool-dusk'],
		houseManual: {
			wifi: 'Joglo-Jati · ask the host for the password',
			tips: ['The carved panels are original, so please no wet towels on them.', 'Sunset is best from the pool bale.'],
		},
		floorPlan: [
			{ room: 'living', x: 20, y: 6, w: 44, h: 30, label: 'Joglo' },
			{ room: 'bedroom', x: 66, y: 6, w: 24, h: 18, label: 'Bed' },
			{ room: 'bathroom', x: 66, y: 26, w: 24, h: 10, label: 'Bath' },
			{ room: 'pool', x: 10, y: 40, w: 80, h: 14, label: 'Pool' },
		],
	},
	'bale-air': {
		slug: 'bale-air',
		type: 'Water pavilion over a lotus pond',
		tagline: 'Two pavilions floating on a lotus pond.',
		story: [
			'Bale Air means water pavilion. Two open bales stand on stone piers in a pond of lotus and koi, linked by a timber bridge: one for sleeping, one for everything else.',
			'Spring water from the hill feeds the pond and then the terraces below, so the sound of it is always there.',
		],
		pullQuote: 'The sound of water is always there.',
		collections: ['pool-villas', 'family-houses'],
		sizeM2: 110,
		maxGuests: 4,
		maxAdults: 4,
		bedrooms: 2,
		beds: '1 king + 2 singles',
		bathrooms: 2,
		pool: 'private',
		view: 'Lotus pond and terraces',
		minNights: 2,
		rooms: [
			R('bale-air', 'approach', 'approach', 'The bridge', ['Timber bridge over the pond', 'Koi and lotus', 'Stepping stones']),
			R('bale-air', 'living', 'living', 'Living pavilion', ['Open on four sides', 'Sunken lounge', 'Dining for four']),
			R('bale-air', 'bedroom-1', 'bedroom', 'Main bedroom', ['King bed over the water', 'Sliding glass and screens', 'Pond at the foot of the bed'], 'King bed'),
			R('bale-air', 'bedroom-2', 'bedroom', 'Garden bedroom', ['Two single beds', 'Garden doors', 'Can be made into a king'], 'Two singles (or a king)'),
			R('bale-air', 'bathroom', 'bathroom', 'Stone bathroom', ['Stone bath', 'Twin showers', 'Lotus view']),
			R('bale-air', 'pool', 'pool', 'Pool', ['10 m pool at the pond edge', 'Daybeds', 'Shade sails']),
			R('bale-air', 'detail', 'detail', 'Water everywhere', ['Spring-fed pond', 'Carved stone spouts', 'Floating candles at night']),
		],
		amenities: [...COMMON_AMENITIES, 'Private 10 m pool', 'Air conditioning', 'Kitchenette', 'Lotus pond with koi'],
		houseRules: [...COMMON_RULES, 'Children must be supervised near the pond and pool'],
		sitePlan: { x: 64, y: 52, terrace: 4 },
		dayImage: 'bale-air',
		duskImages: ['bale-air-dusk'],
		houseManual: {
			wifi: 'Bale-Air · ask the host for the password',
			tips: ['Koi food is in the wooden box by the bridge, a pinch a day.', 'Ask for floating candles for an evening on the pond.'],
		},
		floorPlan: [
			{ room: 'living', x: 6, y: 8, w: 36, h: 24, label: 'Living' },
			{ room: 'bedroom-1', x: 56, y: 8, w: 30, h: 20, label: 'Main bed' },
			{ room: 'bedroom-2', x: 56, y: 30, w: 30, h: 12, label: 'Garden bed' },
			{ room: 'bathroom', x: 88, y: 8, w: 8, h: 34, label: 'Bath' },
			{ room: 'pool', x: 6, y: 44, w: 80, h: 12, label: 'Pool' },
		],
	},
	'griya-kopi': {
		slug: 'griya-kopi',
		type: 'Family house by the coffee garden',
		tagline: 'Room for the whole family, and coffee from the garden.',
		story: [
			'Griya Kopi sits at the top of the property, next to the little coffee and cacao garden our guests help harvest. It is a proper house: two bedrooms, a big kitchen, a long table and a lawn for running around.',
			'Families stay for a week and leave knowing how to roast coffee over a wood fire.',
		],
		pullQuote: 'Families leave knowing how to roast coffee over a wood fire.',
		collections: ['family-houses'],
		sizeM2: 130,
		maxGuests: 5,
		maxAdults: 4,
		bedrooms: 2,
		beds: '1 king + 1 twin + 1 extra bed',
		bathrooms: 2,
		pool: 'private',
		view: 'Coffee garden and valley',
		minNights: 3,
		rooms: [
			R('griya-kopi', 'living', 'living', 'Family room', ['Long teak table for eight', 'Floor cushions and games', 'Opens onto the lawn']),
			R('griya-kopi', 'kitchen', 'kitchen', 'Kitchen', ['Full kitchen with gas hob', 'Coffee roaster and grinder', 'Breakfast bar']),
			R('griya-kopi', 'bedroom-1', 'bedroom', 'Main bedroom', ['King bed', 'Ensuite bathroom', 'Valley view'], 'King bed'),
			R('griya-kopi', 'bedroom-2', 'bedroom', 'Kids’ room', ['Two singles and a pull-out', 'Bunk-style reading nook', 'Blackout blinds'], 'Twin beds + pull-out'),
			R('griya-kopi', 'bathroom', 'bathroom', 'Family bathroom', ['Big walk-in shower', 'Bath for small ones', 'Terrazzo']),
			R('griya-kopi', 'pool', 'pool', 'Pool and lawn', ['8 m pool with a shallow step', 'Fenced lawn', 'Shade tree']),
			R('griya-kopi', 'detail', 'detail', 'The coffee garden', ['Arabica and cacao trees', 'Wood-fire roasting', 'Beans to take home']),
		],
		amenities: [...COMMON_AMENITIES, 'Private 8 m pool (fenced)', 'Full kitchen', 'Air conditioning', 'Cot and high chair on request', 'Board games'],
		houseRules: [...COMMON_RULES, 'The pool is fenced, but please supervise children at all times'],
		sitePlan: { x: 76, y: 18, terrace: 1 },
		dayImage: 'griya-kopi',
		duskImages: ['griya-kopi-dusk'],
		houseManual: {
			wifi: 'Griya-Kopi · ask the host for the password',
			tips: ['Coffee harvest runs May to August, so ask to join.', 'The cot and high chair are in the hall cupboard.'],
		},
		floorPlan: [
			{ room: 'living', x: 6, y: 6, w: 40, h: 26, label: 'Family room' },
			{ room: 'kitchen', x: 6, y: 34, w: 40, h: 12, label: 'Kitchen' },
			{ room: 'bedroom-1', x: 48, y: 6, w: 28, h: 20, label: 'Main bed' },
			{ room: 'bedroom-2', x: 48, y: 28, w: 28, h: 18, label: 'Kids' },
			{ room: 'bathroom', x: 78, y: 6, w: 16, h: 40, label: 'Bath' },
			{ room: 'pool', x: 20, y: 48, w: 60, h: 8, label: 'Pool' },
		],
	},
	'rumah-batu': {
		slug: 'rumah-batu',
		type: 'Volcanic-stone house with a hot tub',
		tagline: 'Built from Agung’s own stone, warm on cool nights.',
		story: [
			'Sidemen sits at 400 metres, and evenings can be cool. Rumah Batu is built of grey volcanic paras stone carved on site, with thick walls that hold the day’s warmth and a wood-fired hot tub on the terrace.',
			'Two bedrooms face each other across a courtyard garden, good for two couples or a small family.',
		],
		pullQuote: 'Thick walls that hold the day’s warmth.',
		collections: ['family-houses'],
		sizeM2: 120,
		maxGuests: 4,
		maxAdults: 4,
		bedrooms: 2,
		beds: '2 kings',
		bathrooms: 2,
		pool: 'private',
		view: 'Agung and the ravine',
		minNights: 3,
		rooms: [
			R('rumah-batu', 'living', 'living', 'Stone hall', ['Fireplace', 'Carved paras walls', 'Long sofa and library']),
			R('rumah-batu', 'bedroom-1', 'bedroom', 'East bedroom', ['King bed', 'Sunrise over Agung', 'Ensuite'], 'King bed'),
			R('rumah-batu', 'bedroom-2', 'bedroom', 'West bedroom', ['King bed', 'Courtyard doors', 'Ensuite'], 'King bed'),
			R('rumah-batu', 'bathroom', 'bathroom', 'Stone bathroom', ['Carved stone basin', 'Rain shower', 'Heated towel rail']),
			R('rumah-batu', 'terrace', 'terrace', 'Hot-tub terrace', ['Wood-fired hot tub', 'Fire pit', 'Ravine view']),
			R('rumah-batu', 'pool', 'pool', 'Pool', ['7 m lap pool', 'Stone deck', 'Shade bale']),
			R('rumah-batu', 'detail', 'detail', 'Carved stone', ['Paras carved on site', 'Copper lamps', 'Woven grass rugs']),
		],
		amenities: [...COMMON_AMENITIES, 'Wood-fired hot tub', 'Fireplace', 'Private 7 m pool', 'Kitchenette'],
		houseRules: [...COMMON_RULES, 'The host lights the hot tub at 17:00 on request'],
		sitePlan: { x: 84, y: 44, terrace: 3 },
		dayImage: 'rumah-batu',
		duskImages: ['rumah-batu-dusk', 'rumah-batu-terrace-dusk'],
		houseManual: {
			wifi: 'Rumah-Batu · ask the host for the password',
			tips: ['Ask for the hot tub to be lit by 17:00, it takes about an hour to warm.', 'Blankets are in the chest at the foot of each bed.'],
		},
		floorPlan: [
			{ room: 'bedroom-1', x: 6, y: 8, w: 26, h: 26, label: 'East bed' },
			{ room: 'living', x: 34, y: 8, w: 32, h: 26, label: 'Stone hall' },
			{ room: 'bedroom-2', x: 68, y: 8, w: 26, h: 26, label: 'West bed' },
			{ room: 'terrace', x: 6, y: 38, w: 40, h: 16, label: 'Hot tub' },
			{ room: 'pool', x: 48, y: 38, w: 46, h: 16, label: 'Pool' },
		],
	},
	'joglo-agung': {
		slug: 'joglo-agung',
		type: 'Three-bedroom joglo facing Mount Agung',
		tagline: 'The mountain, framed by the doors of a teak house.',
		story: [
			'Joglo Agung is set on the highest terrace, turned so that its great doors open straight onto the volcano. On clear mornings Agung fills the frame; in the afternoon the clouds roll in and it disappears, which is its own show.',
			'A central joglo for living and dining, with three bedroom pavilions around a 12 m pool. A friends’ trip, or three generations.',
		],
		pullQuote: 'On clear mornings Agung fills the frame.',
		collections: ['pool-villas', 'family-houses', 'signature'],
		sizeM2: 210,
		maxGuests: 6,
		maxAdults: 6,
		bedrooms: 3,
		beds: '3 kings',
		bathrooms: 3,
		pool: 'private',
		view: 'Mount Agung, straight ahead',
		minNights: 3,
		rooms: [
			R('joglo-agung', 'living', 'living', 'Great room', ['Doors open onto Agung', 'Carved teak joglo', 'Dining for eight']),
			R('joglo-agung', 'kitchen', 'kitchen', 'Kitchen', ['Full kitchen', 'Breakfast cooked here each morning', 'Island bar']),
			R('joglo-agung', 'bedroom-1', 'bedroom', 'Mountain bedroom', ['King bed facing Agung', 'Daybed', 'Ensuite stone bath'], 'King bed'),
			R('joglo-agung', 'bedroom-2', 'bedroom', 'Garden bedroom', ['King bed', 'Garden shower', 'Writing desk'], 'King bed'),
			R('joglo-agung', 'bedroom-3', 'bedroom', 'Pool bedroom', ['King bed (or twins)', 'Steps into the pool', 'Ensuite'], 'King bed or twins'),
			R('joglo-agung', 'bathroom', 'bathroom', 'Stone bath', ['Volcanic-stone tub', 'Open-air shower', 'Agung view']),
			R('joglo-agung', 'pool', 'pool', 'Pool', ['12 m pool', 'Pool bale for lunch', 'Sunbeds for six']),
			R('joglo-agung', 'view', 'view', 'Agung', ['3,031 m volcano', 'Clearest before 08:00', 'Clouds roll in after lunch']),
		],
		amenities: [...COMMON_AMENITIES, 'Private 12 m pool', 'Full kitchen', 'Air conditioning', 'Daily breakfast cooked in the villa', 'Sound system'],
		houseRules: COMMON_RULES,
		sitePlan: { x: 58, y: 12, terrace: 1 },
		dayImage: 'joglo-agung',
		duskImages: ['joglo-agung-dusk', 'joglo-agung-pool-dusk'],
		houseManual: {
			wifi: 'Joglo-Agung · ask the host for the password',
			tips: ['Set an alarm for 06:00 at least once for the clearest view of Agung.', 'Breakfast is cooked in the villa kitchen, so tell the host the night before what you would like.'],
		},
		floorPlan: [
			{ room: 'living', x: 30, y: 6, w: 40, h: 24, label: 'Great room' },
			{ room: 'kitchen', x: 30, y: 32, w: 40, h: 8, label: 'Kitchen' },
			{ room: 'bedroom-1', x: 4, y: 6, w: 24, h: 16, label: 'Mountain' },
			{ room: 'bedroom-2', x: 4, y: 24, w: 24, h: 16, label: 'Garden' },
			{ room: 'bedroom-3', x: 72, y: 6, w: 24, h: 16, label: 'Pool bed' },
			{ room: 'bathroom', x: 72, y: 24, w: 24, h: 16, label: 'Bath' },
			{ room: 'pool', x: 10, y: 44, w: 80, h: 12, label: 'Pool' },
		],
	},
	'puri-sidemen': {
		slug: 'puri-sidemen',
		type: 'Four-bedroom estate with a 15 m pool',
		tagline: 'Our largest house: a small Balinese compound of your own.',
		story: [
			'A puri is a family compound: pavilions around a courtyard, behind a carved gate. Puri Sidemen has four bedroom pavilions, a long open dining bale, a kitchen with its own cook on request, and a 15 m pool looking down the valley.',
			'Celebrations, retreats, two families together. It is still a home, not a hotel, just a bigger one.',
		],
		pullQuote: 'Still a home, not a hotel, just a bigger one.',
		collections: ['pool-villas', 'family-houses', 'signature'],
		sizeM2: 340,
		maxGuests: 8,
		maxAdults: 8,
		bedrooms: 4,
		beds: '3 kings + 2 singles',
		bathrooms: 4,
		pool: 'private',
		view: 'The whole valley',
		minNights: 3,
		rooms: [
			R('puri-sidemen', 'approach', 'approach', 'The gate', ['Carved candi bentar gate', 'Courtyard with frangipani', 'Shrine for daily offerings']),
			R('puri-sidemen', 'living', 'living', 'Dining bale', ['Table for twelve', 'Open to the courtyard', 'Lounge corner']),
			R('puri-sidemen', 'kitchen', 'kitchen', 'Kitchen', ['Full kitchen', 'Private cook on request', 'Herb garden outside']),
			R('puri-sidemen', 'bedroom-1', 'bedroom', 'Main pavilion', ['King bed', 'Private garden bath', 'Valley view'], 'King bed'),
			R('puri-sidemen', 'bedroom-2', 'bedroom', 'East pavilion', ['King bed', 'Ensuite', 'Sunrise side'], 'King bed'),
			R('puri-sidemen', 'bedroom-3', 'bedroom', 'West pavilion', ['King bed', 'Ensuite', 'Sunset side'], 'King bed'),
			R('puri-sidemen', 'bedroom-4', 'bedroom', 'Garden pavilion', ['Two single beds', 'Ensuite', 'Garden doors'], 'Two singles'),
			R('puri-sidemen', 'bathroom', 'bathroom', 'Garden bath', ['Sunken stone tub', 'Open-air shower', 'Fern garden']),
			R('puri-sidemen', 'pool', 'pool', '15 m pool', ['15 m saltwater pool', 'Pool bale', 'Valley view']),
			R('puri-sidemen', 'view', 'view', 'The valley', ['Terraces all the way down', 'Agung to the north', 'Village temple below']),
		],
		amenities: [...COMMON_AMENITIES, 'Private 15 m pool', 'Full kitchen', 'Private cook on request', 'Air conditioning', 'Outdoor dining for twelve', 'Family shrine'],
		houseRules: [...COMMON_RULES, 'Events over 12 people need to be arranged with the host in advance'],
		sitePlan: { x: 32, y: 78, terrace: 6 },
		dayImage: 'puri-sidemen',
		duskImages: ['puri-sidemen-dusk', 'puri-sidemen-pool-dusk'],
		houseManual: {
			wifi: 'Puri-Sidemen · ask the host for the password',
			tips: ['The family shrine is active, please don’t sit on the shrine steps.', 'Book the private cook at least a day ahead.'],
		},
		floorPlan: [
			{ room: 'approach', x: 40, y: 2, w: 20, h: 6, label: 'Gate' },
			{ room: 'bedroom-1', x: 4, y: 10, w: 22, h: 16, label: 'Main' },
			{ room: 'bedroom-2', x: 74, y: 10, w: 22, h: 16, label: 'East' },
			{ room: 'living', x: 30, y: 12, w: 40, h: 18, label: 'Dining bale' },
			{ room: 'kitchen', x: 30, y: 32, w: 18, h: 10, label: 'Kitchen' },
			{ room: 'bathroom', x: 50, y: 32, w: 20, h: 10, label: 'Bath' },
			{ room: 'bedroom-3', x: 4, y: 28, w: 22, h: 14, label: 'West' },
			{ room: 'bedroom-4', x: 74, y: 28, w: 22, h: 14, label: 'Garden' },
			{ room: 'pool', x: 10, y: 46, w: 80, h: 10, label: '15 m pool' },
		],
	},
};

/** Villa slugs in display order (cheapest first). */
export const VILLA_ORDER = [
	'lumbung-padi',
	'lumbung-kembar',
	'rumah-sawah',
	'pondok-bambu',
	'joglo-jati',
	'bale-air',
	'griya-kopi',
	'rumah-batu',
	'joglo-agung',
	'puri-sidemen',
] as const;

/** Every image name of a villa, in gallery order: exterior, rooms, dusk set. */
export function villaImageNames(v: VillaContent): string[] {
	return [v.slug, ...v.rooms.flatMap((r) => r.images), ...v.duskImages];
}
