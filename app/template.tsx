import { PageTransition } from '@/components/motion/page-transition';

// Re-mounted by Next on every navigation, so each route plays the enter
// transition: the half-height candi bentar curtain parts (0.6s) and the page rises in.
export default function Template({ children }: { children: React.ReactNode }) {
	return <PageTransition>{children}</PageTransition>;
}
