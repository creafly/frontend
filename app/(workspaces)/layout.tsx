import type { Metadata } from "next";
import { WorkspacesLayoutWrapper } from "@/components/workspaces/workspaces-layout-wrapper";

export const metadata: Metadata = {
	title: {
		default: "Workspaces",
		template: "%s | Creafly",
	},
	robots: {
		index: false,
		follow: false,
	},
};

export default function WorkspacesLayout({ children }: { children: React.ReactNode }) {
	return <WorkspacesLayoutWrapper>{children}</WorkspacesLayoutWrapper>;
}
