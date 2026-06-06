import { promises as fs } from "fs";
import {
	db,
	users,
	questions,
	playlists,
	playlistQuestions,
	centralProblems,
	centralPlaylists,
	centralPlaylistProblems,
	eq,
	and,
} from "@repo/db";
import type { ScrapedProblem } from "./scraper";

export async function importQuestions(
	jsonPath: string,
	userEmail: string,
	playlistName?: string,
): Promise<void> {
	console.log(`[Importer] Reading JSON file from: ${jsonPath}`);

	let rawData: string;
	try {
		rawData = await fs.readFile(jsonPath, "utf-8");
	} catch (err) {
		console.error(`[Importer] Error reading file: ${(err as Error).message}`);
		return;
	}

	let items: ScrapedProblem[];
	try {
		items = JSON.parse(rawData);
		if (!Array.isArray(items)) {
			throw new Error("JSON root element is not an array");
		}
	} catch (err) {
		console.error(`[Importer] Error parsing JSON: ${(err as Error).message}`);
		return;
	}

	console.log(`[Importer] Found ${items.length} questions to process.`);

	// 1. Resolve User
	console.log(`[Importer] Looking up user in database by email: ${userEmail}`);
	const [user] = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);

	if (!user) {
		console.error(`[Importer] Error: User with email "${userEmail}" not found in database.`);
		return;
	}

	console.log(`[Importer] Found user: ${user.displayName || "User"} (ID: ${user.id})`);

	// 2. Resolve or Create Playlist if provided
	let playlistId: number | null = null;
	if (playlistName) {
		const trimmedPlaylist = playlistName.trim();
		console.log(`[Importer] Playlist specified: "${trimmedPlaylist}"`);

		const [existingPlaylist] = await db
			.select()
			.from(playlists)
			.where(and(eq(playlists.userId, user.id), eq(playlists.name, trimmedPlaylist)))
			.limit(1);

		if (existingPlaylist) {
			playlistId = existingPlaylist.id;
			console.log(
				`[Importer] Found existing playlist "${trimmedPlaylist}" (ID: ${playlistId})`,
			);
		} else {
			const [newPlaylist] = await db
				.insert(playlists)
				.values({
					userId: user.id,
					name: trimmedPlaylist,
					theory: `Imported via CLI LeetCode Scraper`,
				})
				.returning();
			if (!newPlaylist) {
				throw new Error("Failed to create playlist");
			}
			playlistId = newPlaylist.id;
			console.log(`[Importer] Created new playlist "${trimmedPlaylist}" (ID: ${playlistId})`);
		}
	}

	// 3. Import problems
	let importedCount = 0;
	let skippedCount = 0;
	let playlistLinkedCount = 0;

	for (const item of items) {
		if (!item.url || !item.title) {
			console.warn(
				`[Importer] Skipping invalid entry (missing url or title): ${JSON.stringify(item)}`,
			);
			skippedCount++;
			continue;
		}

		try {
			// Check if question already exists for this user
			const [existingQuestion] = await db
				.select()
				.from(questions)
				.where(and(eq(questions.userId, user.id), eq(questions.leetcodeUrl, item.url)))
				.limit(1);

			let questionId: number;

			if (existingQuestion) {
				questionId = existingQuestion.id;
				console.log(
					`[Importer] Question "${item.title}" already exists (ID: ${questionId}). Skipping insert.`,
				);
				skippedCount++;
			} else {
				const [newQuestion] = await db
					.insert(questions)
					.values({
						userId: user.id,
						leetcodeUrl: item.url,
						title: item.title,
						description: item.description,
						difficultyLevel: item.difficulty || "Medium",
						category: item.category || "General",
						notes: item.notes || "",
						completed: false,
					})
					.returning();

				if (!newQuestion) {
					throw new Error("Failed to create question");
				}
				questionId = newQuestion.id;
				console.log(
					`[Importer] Successfully imported "${item.title}" (ID: ${questionId}).`,
				);
				importedCount++;
			}

			// Link to playlist if specified
			if (playlistId !== null) {
				const [existingLink] = await db
					.select()
					.from(playlistQuestions)
					.where(
						and(
							eq(playlistQuestions.playlistId, playlistId),
							eq(playlistQuestions.questionId, questionId),
						),
					)
					.limit(1);

				if (existingLink) {
					console.log(
						`[Importer] Question (ID: ${questionId}) is already in playlist. Skipping link.`,
					);
				} else {
					await db.insert(playlistQuestions).values({
						playlistId: playlistId,
						questionId: questionId,
					});
					console.log(`[Importer] Linked question "${item.title}" to playlist.`);
					playlistLinkedCount++;
				}
			}
		} catch (err) {
			console.error(`[Importer] Failed to import "${item.title}": ${(err as Error).message}`);
		}
	}

	console.log("\n[Importer] --- Import Summary ---");
	console.log(`- New questions imported: ${importedCount}`);
	console.log(`- Questions skipped/already existing: ${skippedCount}`);
	if (playlistName) {
		console.log(`- Questions linked to playlist "${playlistName}": ${playlistLinkedCount}`);
	}
	console.log("---------------------------------\n");
}

export async function importCentralQuestions(
	jsonPath: string,
	playlistName: string,
): Promise<void> {
	console.log(`[Importer] Reading JSON file from: ${jsonPath}`);

	let rawData: string;
	try {
		rawData = await fs.readFile(jsonPath, "utf-8");
	} catch (err) {
		console.error(`[Importer] Error reading file: ${(err as Error).message}`);
		return;
	}

	let items: ScrapedProblem[];
	try {
		items = JSON.parse(rawData);
		if (!Array.isArray(items)) {
			throw new Error("JSON root element is not an array");
		}
	} catch (err) {
		console.error(`[Importer] Error parsing JSON: ${(err as Error).message}`);
		return;
	}

	console.log(`[Importer] Found ${items.length} questions to process for central database.`);

	// 1. Resolve or Create Central Playlist
	let playlistId: number | null = null;
	const trimmedPlaylist = playlistName.trim();
	console.log(`[Importer] Central playlist specified: "${trimmedPlaylist}"`);

	const [existingPlaylist] = await db
		.select()
		.from(centralPlaylists)
		.where(eq(centralPlaylists.name, trimmedPlaylist))
		.limit(1);

	if (existingPlaylist) {
		playlistId = existingPlaylist.id;
		console.log(
			`[Importer] Found existing central playlist "${trimmedPlaylist}" (ID: ${playlistId})`,
		);
	} else {
		const [newPlaylist] = await db
			.insert(centralPlaylists)
			.values({
				name: trimmedPlaylist,
				description: "Imported central playlist",
				theory: `Imported via CLI LeetCode Scraper`,
			})
			.returning();
		if (!newPlaylist) {
			throw new Error("Failed to create central playlist");
		}
		playlistId = newPlaylist.id;
		console.log(`[Importer] Created new central playlist "${trimmedPlaylist}" (ID: ${playlistId})`);
	}

	// 2. Import problems
	let importedCount = 0;
	let skippedCount = 0;
	let playlistLinkedCount = 0;

	for (const item of items) {
		if (!item.url || !item.title) {
			console.warn(
				`[Importer] Skipping invalid entry (missing url or title): ${JSON.stringify(item)}`,
			);
			skippedCount++;
			continue;
		}

		try {
			// Check if central question already exists
			const [existingQuestion] = await db
				.select()
				.from(centralProblems)
				.where(eq(centralProblems.leetcodeUrl, item.url))
				.limit(1);

			let questionId: number;

			if (existingQuestion) {
				questionId = existingQuestion.id;
				console.log(
					`[Importer] Central problem "${item.title}" already exists (ID: ${questionId}). Skipping insert.`,
				);
				skippedCount++;
			} else {
				const [newQuestion] = await db
					.insert(centralProblems)
					.values({
						leetcodeUrl: item.url,
						title: item.title,
						description: item.description,
						difficultyLevel: item.difficulty || "Medium",
						category: item.category || "General",
					})
					.returning();

				if (!newQuestion) {
					throw new Error("Failed to create central question");
				}
				questionId = newQuestion.id;
				console.log(
					`[Importer] Successfully imported central problem "${item.title}" (ID: ${questionId}).`,
				);
				importedCount++;
			}

			// Link to playlist
			if (playlistId !== null) {
				const [existingLink] = await db
					.select()
					.from(centralPlaylistProblems)
					.where(
						and(
							eq(centralPlaylistProblems.playlistId, playlistId),
							eq(centralPlaylistProblems.problemId, questionId),
						),
					)
					.limit(1);

				if (existingLink) {
					console.log(
						`[Importer] Central problem (ID: ${questionId}) is already in central playlist. Skipping link.`,
					);
				} else {
					await db.insert(centralPlaylistProblems).values({
						playlistId: playlistId,
						problemId: questionId,
					});
					console.log(`[Importer] Linked central problem "${item.title}" to central playlist.`);
					playlistLinkedCount++;
				}
			}
		} catch (err) {
			console.error(`[Importer] Failed to import central problem "${item.title}": ${(err as Error).message}`);
		}
	}

	console.log("\n[Importer] --- Central Import Summary ---");
	console.log(`- New central problems imported: ${importedCount}`);
	console.log(`- Problems skipped/already existing: ${skippedCount}`);
	console.log(`- Problems linked to central playlist "${playlistName}": ${playlistLinkedCount}`);
	console.log("---------------------------------\n");
}

