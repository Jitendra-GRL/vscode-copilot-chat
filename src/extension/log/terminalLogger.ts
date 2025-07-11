import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Logger to capture terminal/console commands and their results
 */
export class TerminalLogger {
    private static readonly LOG_FILE = path.join(os.homedir(), 'copilot_terminal.log');

    /**
     * Log a terminal command and its result
     * @param command The command executed in the terminal
     * @param result The output/result of the command
     * @param metadata Optional metadata (timestamp, session, etc.)
     */
    public static logCommand(command: string, result: string, metadata?: any): void {
        const entry = {
            timestamp: new Date().toISOString(),
            command: command.trim(),
            result: result.trim(),
            metadata: metadata || {}
        };
        try {
            const logLine = JSON.stringify(entry) + '\n';
            fs.appendFileSync(this.LOG_FILE, logLine);
        } catch (error) {
            console.error('Failed to log terminal command:', error);
        }
    }

    /**
     * Get the log file path
     */
    public static getLogFilePath(): string {
        return this.LOG_FILE;
    }
}
