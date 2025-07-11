/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

/**
 * Simple logger to capture Copilot prompt and response pairs
 */
export class CopilotLogger {
    private static readonly LOG_FILE = path.join(os.homedir(), 'copilot_prompts.log');
    private static autoCommitEnabled = false;

    /**
     * Log a chat interaction
     * @param prompt The user's prompt/message
     * @param response The Copilot response
     * @param metadata Additional metadata like session ID, agent, etc.
     */
    public static logChat(prompt: string, response: string, metadata?: any): void {
        // Extract model from metadata for top-level access, but remove it from metadata copy to avoid duplication
        const model = metadata && metadata.model ? metadata.model : (metadata && metadata.chatEndpoint && metadata.chatEndpoint.model ? metadata.chatEndpoint.model : undefined);
        // Create a clean metadata copy without the model field to avoid duplication
        const cleanMetadata = metadata ? { ...metadata } : {};
        if (cleanMetadata.model) {
            delete cleanMetadata.model;
        }

        // Extract plain text from response if possible
        let plainResponse = response;
        try {
            const respObj = typeof response === 'string' ? JSON.parse(response) : response;
            if (respObj && respObj.metadata && Array.isArray(respObj.metadata.renderedUserMessage)) {
                plainResponse = respObj.metadata.renderedUserMessage.map((msg: any) => msg.text).join('\n');
            }
        } catch {
            // If parsing fails, fallback to original response
        }

        const entry = {
            timestamp: new Date().toISOString(),
            prompt: prompt.trim(),
            response: plainResponse ? plainResponse.trim() : '',
            model: model,
            metadata: cleanMetadata
        };

        try {
            const logLine = JSON.stringify(entry) + '\n';
            fs.appendFileSync(this.LOG_FILE, logLine);

            if (this.autoCommitEnabled) {
                this.autoCommit();
            }
        } catch (error) {
            console.error('Failed to log chat interaction:', error);
        }
    }

    /**
     * Set auto-commit functionality
     * @param enabled Whether to auto-commit after each chat log
     */
    public static setAutoCommit(enabled: boolean): void {
        this.autoCommitEnabled = enabled;
    }

    /**
     * Automatically commit logged chats to git (if in a git repository)
     */
    private static autoCommit(): void {
        try {
            const { execSync } = require('child_process');
            const logDir = path.dirname(this.LOG_FILE);

            // Check if we're in a git repository
            try {
                execSync('git rev-parse --git-dir', { cwd: logDir, stdio: 'ignore' });
            } catch {
                // Not in a git repository, skip commit
                return;
            }

            // Add and commit the log file
            execSync(`git add "${this.LOG_FILE}"`, { cwd: logDir, stdio: 'ignore' });
            execSync(`git commit -m "Auto-commit: Copilot chat log update ${new Date().toISOString()}"`, {
                cwd: logDir,
                stdio: 'ignore'
            });
        } catch (error) {
            // Silently fail auto-commit to avoid disrupting chat functionality
            console.debug('Auto-commit failed:', error);
        }
    }

    /**
     * Get the log file path
     */
    public static getLogFilePath(): string {
        return this.LOG_FILE;
    }
}
