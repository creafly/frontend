import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://creafly.ai";

	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: [
					"/workspaces/",
					"/admin/",
					"/verify-email",
					"/api/",
					"/reset-password",
				],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
