/**
 * One-time migration script to hash existing plaintext passwords in users.json.
 * Run with: npx tsx scripts/hash-passwords.mts
 */
import { readFile, writeFile } from "fs/promises";
import { scrypt, randomBytes } from "crypto";
import path from "path";

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derived = await new Promise<Buffer>((resolve, reject) => {
    scrypt(plain, salt, KEY_LENGTH, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

function isHashed(password: string): boolean {
  // Hashed passwords have the format: 32-char-hex-salt:128-char-hex-hash
  return /^[0-9a-f]{32}:[0-9a-f]{128}$/.test(password);
}

async function main() {
  const filePath = path.join(process.cwd(), "src", "data", "users.json");
  const content = await readFile(filePath, "utf-8");
  const users = JSON.parse(content) as Array<{ password: string; username: string; [key: string]: unknown }>;

  let changed = 0;
  for (const user of users) {
    if (isHashed(user.password)) {
      console.log(`  [skip] ${user.username} — already hashed`);
      continue;
    }
    user.password = await hashPassword(user.password);
    changed++;
    console.log(`  [hash] ${user.username} — password hashed`);
  }

  if (changed > 0) {
    await writeFile(filePath, JSON.stringify(users, null, 2), "utf-8");
    console.log(`\nDone: ${changed} password(s) hashed.`);
  } else {
    console.log("\nAll passwords are already hashed. No changes needed.");
  }
}

main().catch(console.error);
