import * as cheerio from "cheerio";
import { chromium } from "playwright";

export interface ScrapedProblem {
	title: string;
	url: string;
	difficulty: string;
	description: string;
	category?: string;
	notes?: string;
}

/**
 * Normalizes a LeetCode problem URL to a canonical format.
 */
export function normalizeLeetCodeUrl(url: string): string | null {
	try {
		const cleaned = url.trim();
		let absoluteUrl = cleaned;
		if (cleaned.startsWith("/")) {
			absoluteUrl = `https://leetcode.com${cleaned}`;
		} else if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
			absoluteUrl = `https://${cleaned}`;
		}

		const parsed = new URL(absoluteUrl);
		if (!/leetcode\.(com|cn)/.test(parsed.hostname)) {
			return null;
		}

		if (parsed.pathname === "/link/" || parsed.pathname === "/link") {
			const targetParam = parsed.searchParams.get("target");
			if (targetParam) {
				return normalizeLeetCodeUrl(decodeURIComponent(targetParam));
			}
		}

		const match = parsed.pathname.match(/\/problems\/([a-zA-Z0-9-]+)/);
		if (match && match[1]) {
			return `https://leetcode.com/problems/${match[1]}/`;
		}
	} catch {
		// Ignore invalid URLs
	}
	return null;
}

/**
 * Extracts LeetCode problem URLs from an article URL using fetch and cheerio,
 * falling back to Playwright if needed (e.g. dynamic rendering).
 */
export async function extractProblemUrls(articleUrl: string): Promise<string[]> {
	const urls: Set<string> = new Set();

	console.log(`[Link Extraction] Fetching page content from: ${articleUrl}`);

	// 1. Try simple fetch + cheerio first (fastest)
	try {
		const res = await fetch(articleUrl, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			},
		});
		if (res.ok) {
			const html = await res.text();
			const $ = cheerio.load(html);
			$("a").each((_, elem) => {
				const href = $(elem).attr("href");
				if (href) {
					const normalized = normalizeLeetCodeUrl(href);
					if (normalized) {
						urls.add(normalized);
					}
				}
			});
			console.log(
				`[Link Extraction] Fetch + Cheerio extracted ${urls.size} LeetCode problem links.`,
			);
		} else {
			console.log(
				`[Link Extraction] Fetch returned status ${res.status}. Falling back to Playwright.`,
			);
		}
	} catch (err) {
		console.error("[Link Extraction] Fetch + Cheerio failed, falling back to Playwright:", err);
	}

	// 2. Fallback to Playwright if no URLs found or fetch failed
	if (urls.size === 0) {
		let browser;
		try {
			console.log(`[Link Extraction] Launching Playwright to render JS...`);
			browser = await chromium.launch({ headless: true });
			const context = await browser.newContext({
				userAgent:
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			});
			const page = await context.newPage();
			try {
				await page.goto(articleUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
			} catch (err) {
				console.log(
					`[Link Extraction] page.goto completed with warning/timeout: ${(err as Error).message}`,
				);
			}

			// Wait for client-side JS hydration and dynamic rendering (e.g. GraphQL data fetch)
			await page.waitForTimeout(5000);

			const content = await page.content();
			const $ = cheerio.load(content);
			$("a").each((_, elem) => {
				const href = $(elem).attr("href");
				if (href) {
					const normalized = normalizeLeetCodeUrl(href);
					if (normalized) {
						urls.add(normalized);
					}
				}
			});
			console.log(
				`[Link Extraction] Playwright extracted ${urls.size} LeetCode problem links.`,
			);
		} catch (err) {
			console.error("[Link Extraction] Playwright execution failed:", err);
		} finally {
			if (browser) {
				await browser.close();
			}
		}
	}

	return Array.from(urls);
}

/**
 * Scrapes problem details (title, difficulty, content) for a given slug.
 * Uses GraphQL first (extremely fast), falling back to Playwright if needed.
 */
export async function scrapeProblemDetails(url: string): Promise<ScrapedProblem | null> {
	const slugMatch = url.match(/\/problems\/([a-zA-Z0-9-]+)/);
	if (!slugMatch || !slugMatch[1]) {
		console.warn(`[Detail Scraper] Could not parse slug from URL: ${url}`);
		return null;
	}
	const slug = slugMatch[1];

	console.log(`[Detail Scraper] Scraping details for: ${slug}...`);

	// 1. Try GraphQL API (fastest, cleanest, returns HTML content)
	try {
		const res = await fetch("https://leetcode.com/graphql", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Referer: url,
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			},
			body: JSON.stringify({
				query: `
          query questionContent($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
              title
              difficulty
              content
            }
          }
        `,
				variables: {
					titleSlug: slug,
				},
			}),
		});
		if (res.ok) {
			const json = await res.json();
			const q = json.data?.question;
			if (q) {
				console.log(
					`[Detail Scraper] GraphQL successfully fetched details for "${q.title}" (${q.difficulty}).`,
				);
				return {
					title: q.title || slug,
					url,
					difficulty: q.difficulty || "Medium",
					description: q.content || "",
					category: "General",
					notes: "",
				};
			}
		} else {
			console.log(`[Detail Scraper] GraphQL endpoint returned status ${res.status}.`);
		}
	} catch (err) {
		console.error(
			`[Detail Scraper] GraphQL scrape failed for ${slug}, falling back to Playwright:`,
			err,
		);
	}

	// 2. Playwright fallback
	let browser;
	try {
		console.log(`[Detail Scraper] Launching Playwright for: ${url}`);
		browser = await chromium.launch({ headless: true });
		const context = await browser.newContext({
			userAgent:
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
		});
		const page = await context.newPage();
		await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });

		await page
			.waitForSelector('.elfjS, [class*="question-content"], [data-cy="question-title"]', {
				timeout: 10000,
			})
			.catch(() => {});

		const pageTitle = await page.title();
		const title = pageTitle.replace(" - LeetCode", "").trim() || slug;

		const difficulty = await page.evaluate(() => {
			const diffElement = document.querySelector(
				'.text-difficulty-easy, .text-difficulty-medium, .text-difficulty-hard, [class*="text-brand-orange"], [class*="text-yellow"], [class*="text-pink"], [class*="text-green"]',
			);
			if (diffElement) {
				const txt = diffElement.textContent?.trim() || "";
				if (/easy/i.test(txt)) return "Easy";
				if (/medium/i.test(txt)) return "Medium";
				if (/hard/i.test(txt)) return "Hard";
			}
			const bodyText = document.body.innerText;
			if (/Difficulty:\s*Easy/i.test(bodyText)) return "Easy";
			if (/Difficulty:\s*Medium/i.test(bodyText)) return "Medium";
			if (/Difficulty:\s*Hard/i.test(bodyText)) return "Hard";

			return "Medium";
		});

		const description = await page.evaluate(() => {
			const descElement = document.querySelector('.elfjS, [class*="question-content"]');
			return descElement ? descElement.innerHTML : "";
		});

		console.log(
			`[Detail Scraper] Playwright successfully scraped details for "${title}" (${difficulty}).`,
		);
		return {
			title,
			url,
			difficulty,
			description,
			category: "General",
			notes: "",
		};
	} catch (err) {
		console.error(`[Detail Scraper] Playwright fallback failed for ${slug}:`, err);
		return null;
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}
