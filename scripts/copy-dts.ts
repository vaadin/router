import { constants, copyFile, mkdir } from 'node:fs/promises';
import { glob } from 'glob';

const root = new URL('../', import.meta.url);
const src = new URL('./src/', root);
const dist = new URL('./dist/', root);

await mkdir(dist, { recursive: true });

const files = await glob(['**/*.d.ts'], { cwd: src });
await Promise.all(
  files.map(async (f) => {
    const file = new URL(f, dist);
    await mkdir(new URL('./', file), { recursive: true });
    return await copyFile(new URL(f, src), file, constants.COPYFILE_FICLONE);
  }),
);
