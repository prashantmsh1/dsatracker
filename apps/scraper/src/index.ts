import { extractProblemUrls, scrapeProblemDetails } from "./scraper";
import { importQuestions, importCentralQuestions } from "./importer";
import { promises as fs } from "fs";
import * as path from "path";

async function main() {
	const args = process.argv.slice(2);
	const command = args[0];

	if (!command) {
		printHelpAndExit();
	}

	if (command === "scrape") {
		const articleUrl = args[1];
		let outputFile = args[2] || "scraped_problems.json";

		if (!articleUrl) {
			console.error("Error: Please provide an article URL.");
			console.error(
				"Usage: bun run apps/scraper/src/index.ts scrape <articleUrl> [outputJsonFile]",
			);
			process.exit(1);
		}

		try {
			const urls = await extractProblemUrls(articleUrl);
			if (urls.length === 0) {
				console.log("No LeetCode problem URLs found in the article.");
				process.exit(0);
			}

			console.log(
				`Found ${urls.length} LeetCode URLs. Starting to scrape metadata for each problem...`,
			);

			const problems = [];
			for (let i = 0; i < urls.length; i++) {
				const url = urls[i]!;
				console.log(`[Scraper] [${i + 1}/${urls.length}] Scraping details for ${url}...`);
				const details = await scrapeProblemDetails(url);
				if (details) {
					problems.push(details);
				}
				await new Promise((resolve) => setTimeout(resolve, 500));
			}

			const resolvedPath = path.resolve(process.cwd(), outputFile);
			await fs.writeFile(resolvedPath, JSON.stringify(problems, null, 2), "utf-8");

			console.log(`\nSuccessfully scraped ${problems.length} problems!`);
			console.log(`Saved output JSON to: ${resolvedPath}`);
			console.log(
				`You can now inspect/modify this file and import it using the 'import' command.`,
			);
		} catch (err) {
			console.error("Scrape command failed:", err);
			process.exit(1);
		}
	} else if (command === "import") {
		const jsonFile = args[1];
		const userEmail = args[2];
		const playlistName = args[3];

		if (!jsonFile || !userEmail) {
			console.error("Error: Please provide both the JSON file path and the user's email.");
			console.error(
				"Usage: bun run apps/scraper/src/index.ts import <jsonFile> <userEmail> [playlistName]",
			);
			process.exit(1);
		}

		try {
			const resolvedPath = path.resolve(process.cwd(), jsonFile);
			await importQuestions(resolvedPath, userEmail, playlistName);
			process.exit(0);
		} catch (err) {
			console.error("Import command failed:", err);
			process.exit(1);
		}
	} else if (command === "import-central") {
		const jsonFile = args[1];
		const playlistName = args[2];

		if (!jsonFile || !playlistName) {
			console.error("Error: Please provide both the JSON file path and the playlist name.");
			console.error(
				"Usage: bun run apps/scraper/src/index.ts import-central <jsonFile> <playlistName>",
			);
			process.exit(1);
		}

		try {
			const resolvedPath = path.resolve(process.cwd(), jsonFile);
			await importCentralQuestions(resolvedPath, playlistName);
			process.exit(0);
		} catch (err) {
			console.error("Import central command failed:", err);
			process.exit(1);
		}
	} else {
		console.error(`Unknown command: "${command}"`);
		printHelpAndExit();
	}
}

function printHelpAndExit() {
	console.log("LeetCode Article Scraper CLI");
	console.log("============================");
	console.log("Usage:");
	console.log("  bun run apps/scraper/src/index.ts scrape <articleUrl> [outputJsonFile]");
	console.log(
		"    Scrapes all LeetCode problems from the article URL and writes them to a JSON file.",
	);
	console.log("    Defaults to saving in 'scraped_problems.json'.");
	console.log("");
	console.log("  bun run apps/scraper/src/index.ts import <jsonFile> <userEmail> [playlistName]");
	console.log(
		"    Imports the JSON question list into the database for the specified user email.",
	);
	console.log("    Optionally creates a playlist and links all imported problems to it.");
	console.log("");
	console.log("  bun run apps/scraper/src/index.ts import-central <jsonFile> <playlistName>");
	console.log(
		"    Imports the JSON question list into the centralized problem set and links it to a central playlist.",
	);
	process.exit(0);
}


main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
