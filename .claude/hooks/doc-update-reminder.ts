#!/usr/bin/env node
/**
 * Documentation Update Reminder Hook
 *
 * PostToolUse hook that detects file modifications and prompts Claude to
 * update the corresponding doc in docs/, per the Documentation Sync Rule
 * in this project's CLAUDE.md.
 *
 * Adapted for brand-AId: points at docs/*.md (this project's actual doc
 * structure) instead of the .claude-project/plans/ layout used elsewhere.
 */

import { readFileSync, existsSync, mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';

interface HookInput {
    session_id: string;
    tool_name: string;
    tool_input: {
        file_path?: string;
        edits?: Array<{ file_path: string }>;
    };
}

interface DocMapping {
    pattern: RegExp;
    docFile: string;
    category: string;
    description: string;
}

const DOC_MAPPINGS: DocMapping[] = [
    {
        pattern: /backend\/app\/routes\/.*\.py$/,
        docFile: 'docs/architecture.md (API contract) + docs/current_status.md',
        category: 'backend-route',
        description: 'Backend route (API endpoint)',
    },
    {
        pattern: /backend\/app\/services\/.*\.py$/,
        docFile: 'docs/architecture.md (pipeline stage) + docs/decisions.md if the approach changed',
        category: 'backend-service',
        description: 'Backend AI pipeline service',
    },
    {
        pattern: /backend\/app\/models\/schemas\.py$/,
        docFile: 'docs/architecture.md (API contract)',
        category: 'backend-schema',
        description: 'Pydantic schema',
    },
    {
        pattern: /frontend\/src\/pages\/.*\.tsx$/,
        docFile: 'docs/current_status.md',
        category: 'frontend-page',
        description: 'Frontend page',
    },
    {
        pattern: /frontend\/src\/lib\/api\.ts$/,
        docFile: 'docs/architecture.md (API contract)',
        category: 'frontend-api-client',
        description: 'Frontend API client',
    },
];

function getCacheDir(sessionId: string): string {
    const home = process.env.USERPROFILE || process.env.HOME || process.cwd();
    return join(home, '.claude', 'doc-reminder-cache', sessionId);
}

function getCacheFile(sessionId: string): string {
    return join(getCacheDir(sessionId), 'reminded-docs.txt');
}

function hasBeenReminded(sessionId: string, category: string): boolean {
    const cacheFile = getCacheFile(sessionId);
    if (!existsSync(cacheFile)) return false;
    return readFileSync(cacheFile, 'utf-8').split('\n').includes(category);
}

function markAsReminded(sessionId: string, category: string): void {
    const cacheDir = getCacheDir(sessionId);
    if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });
    appendFileSync(getCacheFile(sessionId), category + '\n');
}

function getFilePaths(data: HookInput): string[] {
    const paths: string[] = [];
    if (data.tool_name === 'MultiEdit' && data.tool_input.edits) {
        data.tool_input.edits.forEach((edit) => {
            if (edit.file_path) paths.push(edit.file_path);
        });
    } else if (data.tool_input.file_path) {
        paths.push(data.tool_input.file_path);
    }
    return paths.map((p) => p.replace(/\\/g, '/'));
}

function matchFileToDoc(filePath: string): DocMapping | null {
    for (const mapping of DOC_MAPPINGS) {
        if (mapping.pattern.test(filePath)) return mapping;
    }
    return null;
}

function getShortPath(filePath: string): string {
    const parts = filePath.split('/');
    return parts.slice(-3).join('/');
}

function main() {
    try {
        const input = readFileSync(0, 'utf-8');
        const data: HookInput = JSON.parse(input);

        const sessionId = data.session_id || 'default';
        const filePaths = getFilePaths(data);
        if (filePaths.length === 0) process.exit(0);

        const docsToUpdate = new Map<
            string,
            { mapping: DocMapping; files: string[] }
        >();

        for (const filePath of filePaths) {
            const mapping = matchFileToDoc(filePath);
            if (!mapping) continue;
            if (hasBeenReminded(sessionId, mapping.category)) continue;

            if (!docsToUpdate.has(mapping.category)) {
                docsToUpdate.set(mapping.category, { mapping, files: [] });
            }
            docsToUpdate.get(mapping.category)!.files.push(filePath);
        }

        if (docsToUpdate.size === 0) process.exit(0);

        let output = '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        output += '📝 DOCUMENTATION UPDATE REMINDER\n';
        output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
        output += "You modified files that this project's doc-sync rule covers:\n\n";

        for (const [category, info] of docsToUpdate) {
            const { mapping, files } = info;
            output += `📁 ${mapping.description} changes:\n`;
            files.forEach((f) => {
                output += `   • ${getShortPath(f)}\n`;
            });
            output += `\n   📄 UPDATE: ${mapping.docFile}\n\n`;
            markAsReminded(sessionId, category);
        }

        output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        output += '⚡ Also remember: never end a session with meaningful work\n';
        output += '   without updating docs/current_status.md.\n';
        output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

        console.log(output);
        process.exit(0);
    } catch {
        process.exit(0);
    }
}

main();
