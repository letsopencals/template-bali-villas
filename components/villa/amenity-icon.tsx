/** Keyword → small line icon for the amenities grid. Unknown amenities get a leaf. */
const ICONS: Array<[RegExp, string]> = [
	[/wifi/i, 'M2 8.5a12 12 0 0 1 16 0M4.8 11.3a8 8 0 0 1 10.4 0M7.6 14.1a4 4 0 0 1 4.8 0M10 17h.01'],
	[/pool|tub|soak/i, 'M2 15c1.6 0 1.6-1 3.2-1s1.6 1 3.2 1 1.6-1 3.2-1 1.6 1 3.2 1 1.6-1 3.2-1M2 18c1.6 0 1.6-1 3.2-1s1.6 1 3.2 1 1.6-1 3.2-1 1.6 1 3.2 1 1.6-1 3.2-1M6 13V4.5a1.5 1.5 0 0 1 3 0M13 13V4.5a1.5 1.5 0 0 1 3 0M6 7h7M6 10.5h7'],
	[/kitchen|cook|breakfast|dining/i, 'M5 2v6a2 2 0 0 0 4 0V2M7 2v16M14 2c-1.5 1-2 3-2 5s1 3 2 3v8'],
	[/air con/i, 'M10 2v16M3 6l14 8M17 6 3 14M8 3.5l2 1.5 2-1.5M8 16.5l2-1.5 2 1.5'],
	[/fan/i, 'M10 10c0-3 1-7 4-7s1.5 4-4 7zM10 10c3 0 7 1 7 4s-4 1.5-7-4zM10 10c0 3-1 7-4 7s-1.5-4 4-7zM10 10c-3 0-7-1-7-4s4-1.5 7 4z'],
	[/housekeeping|towel/i, 'M4 4h12v4H4zM5 8v9h10V8M8 11h4'],
	[/water/i, 'M10 2.5s-5 5.5-5 9a5 5 0 0 0 10 0c0-3.5-5-9-5-9z'],
	[/toiletries/i, 'M8 2h4v3H8zM7 5h6l1 3v9a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V8z'],
	[/speaker|sound/i, 'M4 7.5h3l4-3.5v12l-4-3.5H4zM14 7a4 4 0 0 1 0 6M16 5a7 7 0 0 1 0 10'],
	[/fire/i, 'M10 2s4 3.5 4 8a4 4 0 0 1-8 0c0-2 1-3 1-3s.5 2 2 2c0-3 1-5 1-7z'],
	[/garden|pond|koi|lotus/i, 'M10 18V9M10 9c0-3 2-6 6-6 0 4-3 6-6 6zM10 12c0-2.5-2-5-5-5 0 3 2.5 5 5 5z'],
	[/shrine/i, 'M3 18h14M5 18V9h10v9M4 9l6-6 6 6M9 18v-4h2v4'],
	[/cot|high chair|board game/i, 'M4 6h12v9H4zM4 15v3M16 15v3M8 6v9M12 6v9'],
	[/bale|nest|daybed/i, 'M2 9l8-6 8 6M4 9v9M16 9v9M4 13h12'],
	[/minibar/i, 'M5 2h10v16H5zM5 8h10M8 4.5v1.5M8 10.5v3'],
];
const LEAF = 'M4 16c0-7 5-12 12-12 0 7-5 12-12 12zM4 16l7-7';

export function AmenityIcon({ name }: { name: string }) {
	const d = ICONS.find(([re]) => re.test(name))?.[1] ?? LEAF;
	return (
		<svg aria-hidden viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-terracotta" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
			<path d={d} />
		</svg>
	);
}
