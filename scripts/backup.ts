/*
path :           scripts/backup.ts
tag :            ["script", "backup", "restore", "blog", "security"]
projectId:       new-genesis
type :           helper
generic:         false

role:            Script CLI pnpm backup / pnpm restore. backup copie
                 data/blog.json vers data/backups/blog.[YYYYMMDD-HHmmss].json
                 avec création du dossier. Flag --prune conserve les 10
                 derniers backups. restore --file=<timestamp> restaure
                 un backup après confirmation (ou --yes). Les backups
                 sont ignorés par git via .gitignore.

flow:            main() → parse args (backup | restore | --prune | --file
                 | --yes) → si backup : read file → mkdir backups →
                 write timestamp.json → si --prune : supprime les plus
                 anciens au-delà de 10 → console.log(path).
                 si restore : find file → read → si !--yes : prompt
                 stdin (y/N) → write atomiquement vers data/blog.json
                 → console.log.

ecosystem:       Scripts = [
                   "data/fixtures/blog.seed.json",
                   "scripts/backup.ts",
                   "scripts/export-prisma.ts",
                   "scripts/seed.ts",
                 ]

relatedFiles:    ["@/app/blog/lib/validations.ts"]

imports:         ["node:fs/promises", "node:path", "node:readline/promises",
                  "node:process",
                  "@/app/blog/lib/validations"]

exports:         []

useBy:           []

userStories:     ["us1100017"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { mkdir, readFile, readdir, rename, stat, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { blogDocumentSchema } from "../app/blog/lib/validations";

const ROOT = process.cwd();
const SRC = join(ROOT, "data", "blog.json");
const BACKUP_DIR = join(ROOT, "data", "backups");
const MAX_KEEP = 10;

function timestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "-")
    .replace("Z", "");
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function readValidated(path: string): Promise<string> {
  const raw = await readFile(path, "utf-8");
  blogDocumentSchema.parse(JSON.parse(raw));
  return raw;
}

async function backup(prune: boolean): Promise<string> {
  if (!(await fileExists(SRC))) {
    throw new Error(`Fichier source introuvable : ${SRC}`);
  }
  const raw = await readValidated(SRC);
  await mkdir(BACKUP_DIR, { recursive: true });
  const target = join(BACKUP_DIR, `blog-${timestamp()}.json`);
  await writeFile(target, raw, "utf-8");
  if (prune) await pruneBackups();
  return target;
}

async function pruneBackups(): Promise<void> {
  const entries = (await readdir(BACKUP_DIR))
    .filter((name) => name.startsWith("blog-") && name.endsWith(".json"))
    .sort();
  const excess = entries.length - MAX_KEEP;
  if (excess <= 0) return;
  for (const name of entries.slice(0, excess)) {
    await unlink(join(BACKUP_DIR, name));
  }
}

async function restore(fileArg: string | undefined, yes: boolean): Promise<void> {
  if (!fileArg) throw new Error("--file=<timestamp> requis pour restore.");
  const candidate = fileArg.endsWith(".json")
    ? fileArg
    : join(BACKUP_DIR, `blog-${fileArg}.json`);
  if (!(await fileExists(candidate))) {
    throw new Error(`Backup introuvable : ${candidate}`);
  }
  const raw = await readValidated(candidate);
  if (!yes) {
    const rl = createInterface({ input, output });
    const answer = await rl.question(`Restaurer ${candidate} vers data/blog.json ? [y/N] `);
    rl.close();
    if (answer.trim().toLowerCase() !== "y") {
      console.log("Annulé.");
      return;
    }
  }
  const tmp = `${SRC}.tmp`;
  await mkdir(dirname(SRC), { recursive: true });
  await writeFile(tmp, raw, "utf-8");
  await rename(tmp, SRC);
  console.log(`✔ Restauré : ${candidate} → ${SRC}`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const mode = args[0];
  const prune = args.includes("--prune");
  const yes = args.includes("--yes");
  const fileArg = args
    .find((a) => a.startsWith("--file="))
    ?.slice("--file=".length);

  if (mode === "backup") {
    const path = await backup(prune);
    console.log(`✔ Backup : ${path}`);
    return;
  }
  if (mode === "restore") {
    await restore(fileArg, yes);
    return;
  }

  console.log(
    "Usage :\n  pnpm backup            → backup horodaté\n" +
      "  pnpm backup --prune    → backup + garde 10 derniers\n" +
      "  pnpm restore --file=<timestamp> [--yes]",
  );
}

main().catch((error) => {
  console.error("[backup] Échec :", error);
  process.exit(1);
});