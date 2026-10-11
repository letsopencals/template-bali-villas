/** Editorial copy for /about. No dates or numbers beyond siteConfig facts. */

export interface TimelineEntry {
	marker: string;
	local: string;
	title: string;
	text: string;
}

export const familyTimeline: TimelineEntry[] = [
	{
		marker: 'First generation',
		local: 'Kakek Nyoman',
		title: 'A farmer and his rice barn',
		text: 'Our grandfather farmed these terraces with his brothers and kept the harvest in a lumbung on stilts at the top of the slope, out of reach of the rats and the rain. The barn is still there. It is the one Lumbung Padi was rebuilt from.',
	},
	{
		marker: 'Second generation',
		local: 'Bapak Made & Ibu Ketut',
		title: 'Two rooms for walkers',
		text: 'Our parents started by giving a bed and a meal to walkers who came through the valley on the way to Agung. Then two bamboo rooms. Then a teak joglo, carried in pieces from Java, because our father fell in love with one in a village near Yogyakarta and would not stop talking about it.',
	},
	{
		marker: 'Third generation',
		local: 'Wayan, Kadek & cousins',
		title: 'Ten houses in the rice fields',
		text: 'Today the grandchildren run reception, the warung and the bookings, and our parents still farm the terraces around the villas. There are ten houses now. We have decided that ten is enough.',
	},
	{
		marker: 'Every day',
		local: 'Setiap pagi',
		title: 'Still a farm, still a family',
		text: 'The rice is planted and harvested by hand on the same cycle as before. Ibu Ketut still makes the morning offerings for every villa. If you wake early, you will see her on the paths with a tray of canang sari.',
	},
];

export const carpenter = {
	name: 'Pak Komang',
	local: 'Tukang kayu dari desa sebelah',
	paragraphs: [
		'Every lumbung and joglo here was built, or rebuilt, by Pak Komang, a carpenter from the next village, and the men he trained. He works the way his teacher did: mortise and tenon, wooden pegs, no nails in the frame. A lumbung roof is a curve of bamboo battens tied with rattan and covered in alang-alang grass, laid thick enough to keep a room cool at midday and warm at night.',
		'The joglos came from Java as numbered beams, the way they have always travelled. Pak Komang spent a season learning how they go together, and he will happily tell you about it if you find him in the workshop behind the coffee garden. He is also the person to ask if a door sticks.',
	],
	pullQuote: 'No nails in the frame. If you build it right, it moves with the earth and stays standing.',
};

export interface Value {
	title: string;
	local: string;
	text: string;
}

export const values: Value[] = [
	{
		title: 'Prices you can see',
		local: 'Harga jelas',
		text: 'Every villa shows its nightly price, and you see the total for your stay before you pay. Taxes are shown exactly as charged. Add-ons have their price next to them. No “from”, no “enquire”.',
	},
	{
		title: 'Local hands',
		local: 'Tangan lokal',
		text: 'The people who clean your villa, cook your breakfast, guide your trek and give your massage are from the valley. We buy rice, coffee, fruit and flowers from the families around us before anywhere else.',
	},
	{
		title: 'Water and rice',
		local: 'Air dan padi',
		text: 'The terraces are fed by the subak, the old shared irrigation system, so we take our share of water and not more. The shared pool is saltwater, the paddy is farmed, and the paths stay unlit beyond the villas so the fireflies have somewhere to go.',
	},
];
