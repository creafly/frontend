export async function generateFingerprint(): Promise<string> {
	if (typeof window === "undefined") {
		return "";
	}

	const components: string[] = [
		navigator.userAgent,
		navigator.language,
		`${screen.width}x${screen.height}`,
		String(screen.colorDepth),
		String(new Date().getTimezoneOffset()),
		String(navigator.hardwareConcurrency || ""),
		navigator.platform || "",
	];

	const data = components.join("|");

	try {
		const encoder = new TextEncoder();
		const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	} catch {
		return btoa(data)
			.replace(/[^a-zA-Z0-9]/g, "")
			.slice(0, 64);
	}
}

let cachedFingerprint: string | null = null;

export async function getFingerprint(): Promise<string> {
	if (cachedFingerprint === null) {
		cachedFingerprint = await generateFingerprint();
	}
	return cachedFingerprint;
}

export function clearFingerprintCache(): void {
	cachedFingerprint = null;
}
