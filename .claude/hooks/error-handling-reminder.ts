#!/usr/bin/env node
/**
 * Error Handling Self-Check Hook
 *
 * PostToolUse hook (Edit|MultiEdit|Write) that reminds Claude to double-check
 * error handling when it touches risky code paths: FastAPI routes/services
 * on the backend, API calls on the frontend.
 *
 * Adapted for brand-AId's stack: Python/FastAPI backend, React/Vite frontend.
 * (Original claude-base version targeted a NestJS/Prisma backend.)
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

function getFileCategory(filePath: string): 'backend' | 'frontend' | 'other' {
    if (filePath.includes('backend/app/')) return 'backend';
    if (filePath.includes('frontend/src/')) return 'frontend';
    return 'other';
}

function shouldCheck(filePath: string): boolean {
    if (filePath.match(/\.(test|spec)\.(ts|tsx|py)$/)) return false;
    if (filePath.includes('/types/')) return false;
    if (filePath.match(/\.(d)\.ts$/)) return false;
    return filePath.match(/\.(py|ts|tsx|js|jsx)$/) !== null;
}

function analyzeFileContent(filePath: string): {
    hasTryExcept: boolean;
    hasAsync: boolean;
    hasRoute: boolean;
    hasApiCall: boolean;
    hasRaise: boolean;
} {
    if (!existsSync(filePath)) {
        return {
            hasTryExcept: false,
            hasAsync: false,
            hasRoute: false,
            hasApiCall: false,
            hasRaise: false,
        };
    }

    const content = readFileSync(filePath, 'utf-8');

    return {
        hasTryExcept: /try\s*:|try\s*\{/.test(content),
        hasAsync: /async\s+(def|function)/.test(content),
        hasRoute: /@router\.(get|post|put|delete|patch)|APIRouter\(/.test(
            content,
        ),
        hasApiCall: /fetch\(|axios\.|apiClient\./i.test(content),
        hasRaise: /raise\s+HTTPException|raise\s+\w+Error/.test(content),
    };
}

function getCacheDir(sessionId: string): string {
    const home =
        process.env.USERPROFILE || process.env.HOME || process.cwd();
    return join(home, '.claude', 'error-reminder-cache', sessionId);
}

function getCacheFile(sessionId: string): string {
    return join(getCacheDir(sessionId), 'reminded-categories.txt');
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

function main() {
    try {
        if (process.env.SKIP_ERROR_REMINDER) {
            process.exit(0);
        }

        const input = readFileSync(0, 'utf-8');
        const data: HookInput = JSON.parse(input);
        const sessionId = data.session_id || 'default';

        const filePaths = getFilePaths(data).filter(shouldCheck);
        if (filePaths.length === 0) process.exit(0);

        const backendFiles: string[] = [];
        const frontendFiles: string[] = [];
        let anyRisk = false;

        for (const path of filePaths) {
            const category = getFileCategory(path);
            const analysis = analyzeFileContent(path);
            const risky =
                analysis.hasTryExcept ||
                analysis.hasAsync ||
                analysis.hasRoute ||
                analysis.hasApiCall ||
                analysis.hasRaise;

            if (!risky) continue;
            anyRisk = true;

            if (category === 'backend') backendFiles.push(path);
            if (category === 'frontend') frontendFiles.push(path);
        }

        if (!anyRisk) process.exit(0);

        const showBackend =
            backendFiles.length > 0 && !hasBeenReminded(sessionId, 'backend');
        const showFrontend =
            frontendFiles.length > 0 &&
            !hasBeenReminded(sessionId, 'frontend');

        if (!showBackend && !showFrontend) process.exit(0);

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 ERROR HANDLING SELF-CHECK');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        if (showBackend) {
            console.log('⚠️  Backend (FastAPI) changes detected');
            console.log(`   ${backendFiles.length} file(s) edited\n`);
            console.log('   ❓ Are exceptions caught and turned into HTTPException with a useful status/detail?');
            console.log('   ❓ Do route handlers validate input via Pydantic schemas (app/models/schemas.py)?');
            console.log('   ❓ Will a failure in one AI pipeline stage degrade gracefully instead of crashing the whole simulation?\n');
            markAsReminded(sessionId, 'backend');
        }

        if (showFrontend) {
            console.log('💡 Frontend (React) changes detected');
            console.log(`   ${frontendFiles.length} file(s) edited\n`);
            console.log('   ❓ Do api.ts calls handle non-2xx responses with a user-visible error state?');
            console.log('   ❓ Is there a loading/error state shown instead of a blank screen?\n');
            markAsReminded(sessionId, 'frontend');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('💡 TIP: Disable with SKIP_ERROR_REMINDER=1');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch {
        process.exit(0);
    }
}

main();
