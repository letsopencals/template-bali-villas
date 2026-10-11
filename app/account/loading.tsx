import { CanangSari } from '@/components/motifs/canang-sari';

export default function AccountLoading() {
	return (
		<div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-ink-muted">
			<CanangSari size={64} spinning label="Loading your trips" />
			<p className="text-sm">Sebentar… one moment</p>
		</div>
	);
}
