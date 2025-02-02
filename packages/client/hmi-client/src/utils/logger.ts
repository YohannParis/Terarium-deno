import { LogBuffer } from '@/utils/log-buffer';
// HMI-Client logger service
import { useToastService } from '@/services/toast';

// TODO: add logic for different modes
const isProduction = process.env.NODE_ENV === 'production';

const toast = useToastService();

/**
 * @enum {string}
 */
enum LogLevels {
	INFO = 'info',
	ERROR = 'error',
	WARN = 'warn',
	DEBUG = 'debug'
}

/**
 * @interface LoggerMessageOptionsType
 */
interface LoggerMessageOptionsType {
	showToast?: boolean;
	toastTitle?: string;
	silent?: boolean; // do not transmit to backend
}

/**
 * @interface LoggerHooksOptionsType
 */
interface LoggerHooksOptionsType {
	before?: (level: string, message: string, callerInfo?: string) => void;
	after?: (level: string, message: string, callerInfo?: string) => void;
}

/**
 * @interface LoggerOptionsType
 */
interface LoggerOptionsType {
	consoleEnabled: boolean;
	callerInfoEnabled: boolean;
	showToast: boolean;
	hooks?: LoggerHooksOptionsType;
}

const defaultOptions: LoggerOptionsType = {
	consoleEnabled: !isProduction,
	callerInfoEnabled: false,
	showToast: false
};

/**
 * Main system logger class
 *
 * @class Logger
 */
class Logger {
	private options: LoggerOptionsType;

	private callerInfo: string;

	private logBuffer: LogBuffer;

	constructor(options: LoggerOptionsType = defaultOptions) {
		this.options = { ...defaultOptions, ...options };
		this.callerInfo = '';
		this.logBuffer = new LogBuffer();
		this.logBuffer.startService();
	}

	/**
	 * Get the caller info as a string
	 *
	 * @private
	 * @return {*}  {string}
	 * @memberof Logger
	 */
	private getCallerInfo(): string {
		if (!this.options.callerInfoEnabled) {
			return '';
		}

		try {
			throw new Error();
		} catch (error: any) {
			const stack = error.stack.split('\n');
			const callerLine = stack[3];
			return callerLine;
		}
	}
	/**
	 *
	 * @param {string} level "info" | "warn" | "error" | "debug"
	 * @param {string} message message to
	 * @param {LoggerMessageOptionsType} [messageOptions]
	 * @memberof Logger
	 */

	log(
		level: string,
		message: string,
		messageOptions?: LoggerMessageOptionsType,
		...optionalParams: any[]
	): void {
		if (this.options.hooks?.before) {
			this.options.hooks.before(level, message, this.callerInfo);
		}

		if (this.options.consoleEnabled) {
			console[level](`[${level}] ${message} ${this.callerInfo}`, ...optionalParams);
		}

		if (this.options.showToast && messageOptions?.showToast) {
			this.displayToast(level, message, messageOptions);
		} else if (this.options.showToast && messageOptions?.showToast !== false) {
			this.displayToast(level, message, messageOptions);
		}
		if (this.options.hooks?.after && messageOptions?.silent !== true) {
			this.options.hooks.after(level, message, this.callerInfo);
		}

		this.queueLogs(level, message);
	}

	/**
	 *
	 * @param {string} level
	 * @param {*} message
	 */
	async queueLogs(level: string, message: any) {
		this.logBuffer.add({ level, message });
	}

	/**
	 *
	 * @param {*} message
	 * @param {LoggerMessageOptionsType} [messageOptions]
	 * @memberof Logger
	 */
	info(message: any, messageOptions?: LoggerMessageOptionsType, ...optionalParams: any[]): void {
		this.callerInfo = this.getCallerInfo();
		this.log(LogLevels.INFO, message, messageOptions, optionalParams);
	}

	/**
	 *
	 * @param {string} message message to
	 * @param {LoggerMessageOptionsType} [messageOptions]
	 * @memberof Logger
	 */
	warn(message: any, messageOptions?: LoggerMessageOptionsType, ...optionalParams: any[]) {
		this.callerInfo = this.getCallerInfo();
		this.log(LogLevels.WARN, message, messageOptions, optionalParams);
	}

	/**
	 *
	 *
	 * @param {string} message message to
	 * @param {LoggerMessageOptionsType} [messageOptions]
	 * @memberof Logger
	 */
	debug(message: any, messageOptions?: LoggerMessageOptionsType, ...optionalParams: any[]) {
		this.callerInfo = this.getCallerInfo();
		this.log(LogLevels.DEBUG, message, messageOptions, optionalParams);
	}

	/**
	 *
	 *
	 * @param {string} message message to
	 * @param {LoggerMessageOptionsType} [messageOptions]
	 * @memberof Logger
	 */
	error(message: any, messageOptions?: LoggerMessageOptionsType, ...optionalParams: any[]) {
		this.callerInfo = this.getCallerInfo();
		this.log(LogLevels.ERROR, message, messageOptions, optionalParams);
	}

	/**
	 *
	 * @private
	 * @param {string} level
	 * @param {string} message
	 * @param {LoggerMessageOptionsType} [messageOptions]
	 * @memberof Logger
	 */
	private displayToast(level: string, message: string, messageOptions?: LoggerMessageOptionsType) {
		switch (level) {
			case LogLevels.INFO:
				toast.info(messageOptions?.toastTitle, message);
				break;
			case LogLevels.ERROR:
				toast.error(messageOptions?.toastTitle, message);
				break;
			case LogLevels.WARN:
				toast.warn(messageOptions?.toastTitle, message);
				break;
			default:
				toast.info(messageOptions?.toastTitle, message);
		}
	}
}

export const logger = new Logger({
	consoleEnabled: !isProduction,
	callerInfoEnabled: true,
	showToast: true
});
