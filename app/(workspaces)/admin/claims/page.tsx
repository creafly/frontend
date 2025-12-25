"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyContent } from "@/components/ui/empty";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useClaims, useCreateClaim, useDeleteClaim } from "@/hooks/use-api";
import { useTranslations } from "@/providers/i18n-provider";
import { usePermissions, PERMISSIONS } from "@/providers/permissions-provider";
import { IconPlus, IconTrash, IconKey, IconSearch } from "@tabler/icons-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { BlurFade } from "@/components/ui/blur-fade";
import Container from "@/components/container";
import {
	TypographyH3,
	TypographyP,
	TypographyError,
	TypographyMuted,
	Icon,
} from "@/components/typography";
import type { Claim } from "@/types";

export default function ClaimsPage() {
	const [currentPage, setCurrentPage] = useState(0);
	const [pageSize] = useState(10);

	const { data, isLoading, error } = useClaims(currentPage * pageSize, pageSize);
	const createClaim = useCreateClaim();
	const deleteClaim = useDeleteClaim();
	const { hasPermission } = usePermissions();

	const canCreate = hasPermission(PERMISSIONS.CLAIMS_MANAGE);
	const canDelete = hasPermission(PERMISSIONS.CLAIMS_MANAGE);

	const [searchQuery, setSearchQuery] = useState("");
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
	const [formData, setFormData] = useState({ type: "", value: "" });

	const t = useTranslations();

	const filteredClaims = useMemo(() => {
		return (
			data?.claims?.filter(
				(claim: Claim) =>
					(claim.type?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
					(claim.value?.toLowerCase() || "").includes(searchQuery.toLowerCase())
			) || []
		);
	}, [data?.claims, searchQuery]);

	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		setCurrentPage(0);
	};

	const handleCreate = async () => {
		if (!formData.type.trim() || !formData.value.trim()) return;

		try {
			await createClaim.mutateAsync({
				type: formData.type,
				value: formData.value,
			});
			toast.success(t.admin.claimCreated);
			setCreateDialogOpen(false);
			setFormData({ type: "", value: "" });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.createFailed);
		}
	};

	const handleDelete = async () => {
		if (!selectedClaim) return;

		try {
			await deleteClaim.mutateAsync(selectedClaim.id);
			toast.success(t.admin.claimDeleted);
			setDeleteDialogOpen(false);
			setSelectedClaim(null);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.errors.deleteFailed);
		}
	};

	const openDeleteDialog = (claim: Claim) => {
		setSelectedClaim(claim);
		setDeleteDialogOpen(true);
	};

	if (error) {
		return (
			<Container>
				<div className="flex items-center justify-center h-64">
					<TypographyError>{error.message}</TypographyError>
				</div>
			</Container>
		);
	}

	return (
		<div className="space-y-6">
			<Container className="p-0 max-w-full">
				<BlurFade delay={0.1}>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div>
							<TypographyH3>{t.admin.claims}</TypographyH3>
							<TypographyP className="mt-1 text-muted-foreground">
								{t.admin.claimsDescription}
							</TypographyP>
						</div>
						{canCreate && (
							<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
								<Button
									onClick={() => setCreateDialogOpen(true)}
									className="shadow-lg shadow-primary/20"
								>
									<Icon icon={IconPlus} size="sm" className="mr-2" />
									{t.admin.createClaim}
								</Button>
							</motion.div>
						)}
					</div>
				</BlurFade>
			</Container>

			<Container className="p-0 max-w-full">
				<BlurFade delay={0.15}>
					<div className="relative mb-4">
						<Icon
							icon={IconSearch}
							size="sm"
							className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
						/>
						<Input
							placeholder={t.admin.searchPlaceholder}
							value={searchQuery}
							onChange={(e) => handleSearchChange(e.target.value)}
							className="pl-10"
						/>
					</div>
				</BlurFade>

				{isLoading ? (
					<div className="border rounded-md">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t.admin.claimValue}</TableHead>
									<TableHead className="w-25">{t.common.actions}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{[...Array(5)].map((_, i) => (
									<TableRow key={i}>
										<TableCell>
											<Skeleton className="h-5 w-32" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-8 w-8" />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				) : data?.claims && filteredClaims.length > 0 ? (
					<div className="space-y-4">
						<div className="border rounded-md">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t.admin.claimValue}</TableHead>
										<TableHead className="w-25">{t.common.actions}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredClaims.map((claim: Claim) => (
										<TableRow key={claim.id}>
											<TableCell className="font-medium">{claim.value}</TableCell>
											<TableCell>
												{canDelete && (
													<Button
														variant="ghost"
														size="icon-sm"
														className="text-destructive hover:text-destructive"
														onClick={() => openDeleteDialog(claim)}
													>
														<Icon icon={IconTrash} size="sm" />
													</Button>
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						<div className="flex flex-wrap items-center justify-between gap-2">
							<TypographyMuted>
								{t.common.showing} {data.offset + 1}-{data.offset + (filteredClaims?.length || 0)}{" "}
								of page {currentPage + 1}
							</TypographyMuted>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
									disabled={currentPage === 0}
								>
									Previous
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage(currentPage + 1)}
									disabled={!filteredClaims || filteredClaims.length < pageSize}
								>
									Next
								</Button>
							</div>
						</div>
					</div>
				) : (
					<BlurFade delay={0.2}>
						<Empty>
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<Icon icon={IconKey} size="xl" className="text-muted-foreground" />
								</EmptyMedia>
								<EmptyTitle>{t.admin.noClaims}</EmptyTitle>
							</EmptyHeader>
							{canCreate && (
								<EmptyContent>
									<Button onClick={() => setCreateDialogOpen(true)}>
										<Icon icon={IconPlus} size="sm" className="mr-2" />
										{t.admin.createClaim}
									</Button>
								</EmptyContent>
							)}
						</Empty>
					</BlurFade>
				)}
			</Container>

			<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t.admin.createClaim}</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>{t.admin.claimType}</Label>
							<Input
								value={formData.type}
								onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
								placeholder="permission"
							/>
						</div>
						<div className="space-y-2">
							<Label>{t.admin.claimValue}</Label>
							<Input
								value={formData.value}
								onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
								placeholder="users:read"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
							{t.common.cancel}
						</Button>
						<Button onClick={handleCreate} disabled={createClaim.isPending}>
							{createClaim.isPending ? t.common.creating : t.common.create}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t.common.delete}</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete claim &quot;{selectedClaim?.type}:
							{selectedClaim?.value}&quot;?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
							{t.common.cancel}
						</Button>
						<Button variant="destructive" onClick={handleDelete} disabled={deleteClaim.isPending}>
							{deleteClaim.isPending ? t.common.deleting : t.common.delete}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
