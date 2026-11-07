import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
/**
 * Nearest ancestor containing `.git`, or the workspace directory itself.
 * Matches skill-filesystem's project root so the copy lands where discovery looks.
 * @param workspaceDir - session working directory.
 * @returns the project root.
 */
export async function projectRootFor(workspaceDir) {
    let current = resolve(workspaceDir);
    const start = current;
    for (;;) {
        try {
            await stat(join(current, '.git'));
            return current;
        }
        catch {
            const parent = resolve(current, '..');
            if (parent === current)
                return start;
            current = parent;
        }
    }
}
/**
 * Directory names under the packaged `skills/` tree that contain `SKILL.md`.
 * Used by sync and unsync so only Writer-owned skill folders are touched.
 * @param sourceDir - packaged skills directory.
 * @returns sorted skill directory names.
 */
export async function packagedSkillNames(sourceDir) {
    const names = [];
    const entries = await readdir(sourceDir, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isDirectory())
            continue;
        try {
            const skill = await stat(join(sourceDir, entry.name, 'SKILL.md'));
            if (!skill.isFile())
                continue;
        }
        catch {
            continue;
        }
        names.push(entry.name);
    }
    names.sort();
    return names;
}
/**
 * Copy packaged skill directories into `<project>/.agents/skills/<name>`.
 * An existing destination is left in place unless `force` is set.
 * @param options - source tree, workspace directory, and whether to replace existing skills.
 * @returns which skill names were copied or skipped.
 */
export async function syncWriterSkills(options) {
    const root = await projectRootFor(options.workspaceDir);
    const destination = join(root, '.agents', 'skills');
    await mkdir(destination, { recursive: true });
    const copied = [];
    const skipped = [];
    const names = await packagedSkillNames(options.sourceDir);
    for (const name of names) {
        const source = join(options.sourceDir, name);
        const target = join(destination, name);
        if (target !== destination && !target.startsWith(destination + sep))
            continue;
        let exists = false;
        try {
            exists = (await stat(target)).isDirectory();
        }
        catch {
            exists = false;
        }
        if (exists && !options.force) {
            skipped.push(name);
            continue;
        }
        if (exists)
            await rm(target, { recursive: true, force: true });
        await cp(source, target, { recursive: true });
        copied.push(name);
    }
    copied.sort();
    skipped.sort();
    return { root, destination, copied, skipped };
}
/**
 * Remove packaged Writer skill directories from `<project>/.agents/skills/<name>`.
 * Only deletes names that exist under the packaged `skills/` tree; other project skills stay.
 * @param options - source tree (for the name allowlist) and workspace directory.
 * @returns which skill names were removed or already missing.
 */
export async function unsyncWriterSkills(options) {
    const root = await projectRootFor(options.workspaceDir);
    const destination = join(root, '.agents', 'skills');
    const removed = [];
    const missing = [];
    const names = await packagedSkillNames(options.sourceDir);
    for (const name of names) {
        const target = join(destination, name);
        if (target !== destination && !target.startsWith(destination + sep))
            continue;
        let exists = false;
        try {
            exists = (await stat(target)).isDirectory();
        }
        catch {
            exists = false;
        }
        if (!exists) {
            missing.push(name);
            continue;
        }
        await rm(target, { recursive: true, force: true });
        removed.push(name);
    }
    removed.sort();
    missing.sort();
    return { root, destination, removed, missing };
}
//# sourceMappingURL=sync-skills.js.map