"use client";

import { Button } from "@/components/ui/button";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface CardPaginationProps {
	currentPage: number;
	totalPages?: number;
	onPageChange: (page: number) => void;
	totalItems?: number;
	itemsPerPage?: number;
	showInfo?: boolean;
	className?: string;
	hasNextPage?: boolean;
	currentPageItems?: number;
	labels?: {
		previous?: string;
		next?: string;
		page?: string;
		of?: string;
		showing?: string;
		items?: string;
	};
}

export function CardPagination({
	currentPage,
	totalPages,
	onPageChange,
	totalItems,
	itemsPerPage = 12,
	showInfo = true,
	className,
	hasNextPage,
	currentPageItems,
	labels = {},
}: CardPaginationProps) {
	const {
		previous = "Previous",
		next = "Next",
		page = "Page",
		of = "of",
		showing = "Showing",
		items = "items",
	} = labels;

	const isServerPagination = totalPages === undefined;

	if (!isServerPagination && totalPages <= 1) return null;

	if (isServerPagination && currentPage === 1 && !hasNextPage) return null;

	const startItem = (currentPage - 1) * itemsPerPage + 1;
	const endItem =
		totalItems !== undefined
			? Math.min(currentPage * itemsPerPage, totalItems)
			: currentPageItems !== undefined
			? startItem + currentPageItems - 1
			: currentPage * itemsPerPage;

	const getPageNumbers = () => {
		if (totalPages === undefined) return [];

		const pages: (number | "ellipsis")[] = [];
		const maxVisible = 5;

		if (totalPages <= maxVisible) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			pages.push(1);

			if (currentPage > 3) {
				pages.push("ellipsis");
			}

			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);

			for (let i = start; i <= end; i++) {
				if (!pages.includes(i)) {
					pages.push(i);
				}
			}

			if (currentPage < totalPages - 2) {
				pages.push("ellipsis");
			}

			if (!pages.includes(totalPages)) {
				pages.push(totalPages);
			}
		}

		return pages;
	};

	return (
		<div
			className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 pt-4", className)}
		>
			{showInfo && (
				<p className="text-sm text-muted-foreground">
					{totalItems !== undefined ? (
						<>
							{showing} {startItem}-{endItem} {of} {totalItems} {items}
						</>
					) : isServerPagination && currentPageItems !== undefined ? (
						<>
							{showing} {startItem}-{endItem} ({page} {currentPage})
						</>
					) : (
						<>
							{page} {currentPage}
						</>
					)}
				</p>
			)}

			<div className="flex items-center gap-1">
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage <= 1}
					className="gap-1"
				>
					<IconChevronLeft className="h-4 w-4" />
					<span className="hidden sm:inline">{previous}</span>
				</Button>

				{!isServerPagination && (
					<div className="flex items-center gap-1">
						{getPageNumbers().map((pageNum, index) =>
							pageNum === "ellipsis" ? (
								<span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
									...
								</span>
							) : (
								<Button
									key={pageNum}
									variant={currentPage === pageNum ? "default" : "outline"}
									size="sm"
									onClick={() => onPageChange(pageNum)}
									className="min-w-9"
								>
									{pageNum}
								</Button>
							)
						)}
					</div>
				)}

				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={isServerPagination ? !hasNextPage : currentPage >= totalPages}
					className="gap-1"
				>
					<span className="hidden sm:inline">{next}</span>
					<IconChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
