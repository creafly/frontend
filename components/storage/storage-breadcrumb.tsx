"use client";

import { IconChevronRight, IconHome, IconLoader2 } from "@tabler/icons-react";

import { useTranslations } from "@/providers/i18n-provider";
import { Icon } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { useFolderBreadcrumb } from "@/hooks/use-storage";
import type { Folder } from "@/types/storage";
import { cn } from "@/lib/utils";

interface StorageBreadcrumbProps {
	tenantId: string;
	currentFolderId?: string;
	onNavigate: (folderId?: string) => void;
}

export function StorageBreadcrumb({
	tenantId,
	currentFolderId,
	onNavigate,
}: StorageBreadcrumbProps) {
	const t = useTranslations();

	const { data: breadcrumbData, isLoading } = useFolderBreadcrumb(
		tenantId,
		currentFolderId || ""
	);

	const breadcrumb = breadcrumbData?.breadcrumb || [];

	if (!currentFolderId) {
		return null;
	}

	return (
		<nav className="flex items-center gap-1 text-sm mb-4 overflow-x-auto">
			<Button
				variant="ghost"
				size="sm"
				className="h-8 px-2 flex-shrink-0"
				onClick={() => onNavigate(undefined)}
			>
				<Icon icon={IconHome} size="sm" className="mr-1" />
				{t.storage.rootFolder}
			</Button>

			{isLoading ? (
				<Icon icon={IconLoader2} size="sm" className="animate-spin ml-2" />
			) : (
				breadcrumb.map((folder: Folder, index: number) => (
					<div key={folder.id} className="flex items-center gap-1 flex-shrink-0">
						<Icon icon={IconChevronRight} size="sm" className="text-muted-foreground" />
						<Button
							variant="ghost"
							size="sm"
							className={cn(
								"h-8 px-2",
								index === breadcrumb.length - 1 && "font-medium"
							)}
							onClick={() => onNavigate(folder.id)}
							disabled={index === breadcrumb.length - 1}
						>
							{folder.name}
						</Button>
					</div>
				))
			)}
		</nav>
	);
}
