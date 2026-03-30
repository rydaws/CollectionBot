# Changelog

## [Unreleased] - 2026-03-29 - Codebase Modernization

### Config & Dependencies
- Removed unused dependencies: `pg`, `@types/pg`, `drizzle-kit`, `axios`, `@discordjs/rest`, `chalk`
- Moved `typescript` and `@types/node` from dependencies to devDependencies
- Added `engines` field requiring Node.js >= 18.0.0
- Updated npm scripts: `"build": "tsc"`, `"start": "node build/index.js"`, added `"dev": "tsc --watch"`
- Cleaned `tsconfig.json`: removed all commented lines, upgraded target from `es2016` to `ES2022`
- Removed unused Tailwind plugin from `.prettierrc`
- Created `eslint.config.mjs` with flat ESLint config for TypeScript
- Deleted `build.js` (replaced by direct `tsc`) and `dbtest.ts`

### TypeScript Migration
- Converted all 19 remaining `.js` files to `.ts` (12 slash commands, 7 button components)
- Fixed mixed `module.exports` / `export` patterns in Traps.ts, Amplifiers.ts, ItemList.ts, EmbedUtil.ts, StringUtil.ts, ItemUtil.ts
- Cleaned up `types.d.ts`: removed mongoose references, added correct `ProcessEnv` fields (`DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`, `DATABASE_URL`)
- All files now use proper ES module `import`/`export` syntax with TypeScript types

### Prisma Migration
- Created `src/util/prisma.ts` Prisma Client singleton
- Replaced all raw SQL queries across 11 command files with type-safe Prisma Client calls
- Eliminated SQL injection vulnerabilities from string-interpolated queries
- Removed `src/util/QueryUtil.ts` and all `pg` Client usage

### Global State Fixes
- `catch.ts`: Replaced module-level `let` variables with `Map<string, CatchState>` keyed by user ID for concurrent safety
- `ViewBox.ts`: Same Map-based pattern with `BoxState` for pagination state
- `Team.ts`, `Quest.ts`, `Backpack.ts`, `showMonster.ts`, `levelMonster.ts`, `addMonster.ts`, `dbfetch.ts`, `ViewShop.ts`: Moved all module-level mutable variables to local function scope
- `apifetchtest.ts`: Moved hardcoded API key to `process.env.RAPIDAPI_KEY`

### Bug Fixes
- Fixed `bot.ts` referencing undefined `fs` variable (was using `fs.readdirSync` but only imported `readdirSync`)
- Fixed `EmbedUtil.ts` embed functions accepting raw `res.rows[0]` format; now accept direct monster objects
- Fixed `ViewShop.ts` not returning early after failed purchase check, causing multiple replies
- Fixed `UpdateShop.ts` error reply not using ephemeral flag
