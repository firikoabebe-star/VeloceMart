import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  GoogleGenerativeAIFetchError,
  GoogleGenerativeAIAbortError,
} from '@google/generative-ai';

interface CacheEntry {
  text: string;
  cachedAt: number;
}

const DEFAULT_MODEL = 'gemini-2.0-flash';
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_CACHE_TTL_MS = 10 * 60 * 1000; // 10 min

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name);
  private genAI!: GoogleGenerativeAI;
  private model!: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;
  private apiKey = '';
  private timeout = DEFAULT_TIMEOUT_MS;
  private cacheTtl = DEFAULT_CACHE_TTL_MS;
  private cache = new Map<string, CacheEntry>();

  constructor(private config: ConfigService) {}

  onModuleInit() {
    this.apiKey = this.config.get<string>('GEMINI_API_KEY') ?? '';
    this.timeout =
      this.config.get<number>('GEMINI_TIMEOUT_MS') ?? DEFAULT_TIMEOUT_MS;
    this.cacheTtl =
      this.config.get<number>('GEMINI_CACHE_TTL_MS') ?? DEFAULT_CACHE_TTL_MS;

    if (!this.apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY is not set — AI features will be unavailable',
      );
      return;
    }

    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: this.config.get<string>('GEMINI_MODEL') ?? DEFAULT_MODEL,
    });
    this.logger.log(
      `Gemini client initialized (model: ${this.config.get<string>('GEMINI_MODEL') ?? DEFAULT_MODEL})`,
    );
  }

  /**
   * Generate content from a prompt. Returns the text response or null on failure.
   * Results are cached in memory keyed by SHA-256 hash of the prompt.
   */
  async generateContent(prompt: string): Promise<string | null> {
    if (!this.apiKey) {
      this.logger.warn('generateContent called but GEMINI_API_KEY is not set');
      return null;
    }

    const hash = await this.sha256(prompt);
    const cached = this.getFromCache(hash);
    if (cached !== null) {
      this.logger.debug(`Cache hit for prompt hash ${hash.slice(0, 12)}…`);
      return cached;
    }

    try {
      const result = await this.model.generateContent(prompt, {
        timeout: this.timeout,
      });
      const text = result.response.text();

      this.setCache(hash, text);

      return text;
    } catch (error: unknown) {
      if (error instanceof GoogleGenerativeAIAbortError) {
        this.logger.error(`Gemini request timed out after ${this.timeout}ms`);
        return null;
      }

      if (error instanceof GoogleGenerativeAIFetchError) {
        const status = error.status ?? 'unknown';
        if (status === 429) {
          this.logger.warn('Gemini rate limit exceeded (429)');
        } else {
          this.logger.error(`Gemini API error: ${status} — ${error.message}`);
        }
        return null;
      }

      this.logger.error(
        'Unexpected Gemini error',
        error instanceof Error ? error.stack : '',
      );
      return null;
    }
  }

  /**
   * Verify the API key is valid by issuing a minimal request.
   * Returns { ok, message, model }.
   */
  async healthCheck(): Promise<{
    ok: boolean;
    message: string;
    model: string;
  }> {
    const model = this.config.get<string>('GEMINI_MODEL') ?? DEFAULT_MODEL;

    if (!this.apiKey) {
      return { ok: false, message: 'GEMINI_API_KEY is not configured', model };
    }

    try {
      const result = await this.model.generateContent('Reply with only "ok".', {
        timeout: this.timeout,
      });
      const text = result.response.text();
      return { ok: true, message: text.trim(), model };
    } catch (error: unknown) {
      if (error instanceof GoogleGenerativeAIAbortError) {
        return { ok: false, message: `Timeout after ${this.timeout}ms`, model };
      }
      if (error instanceof GoogleGenerativeAIFetchError) {
        const status = error.status ?? 'unknown';
        return {
          ok: false,
          message: `API error ${status}: ${error.message}`,
          model,
        };
      }
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        model,
      };
    }
  }

  /** Clear the entire in-memory cache. */
  clearCache() {
    this.cache.clear();
  }

  // ── internal ──────────────────────────────────────────────

  private getFromCache(hash: string): string | null {
    const entry = this.cache.get(hash);
    if (!entry) return null;
    if (Date.now() - entry.cachedAt > this.cacheTtl) {
      this.cache.delete(hash);
      return null;
    }
    return entry.text;
  }

  private setCache(hash: string, text: string) {
    // Evict oldest entries when cache grows past 500 entries
    if (this.cache.size >= 500) {
      const oldest: string | undefined = this.cache.keys().next().value as
        string | undefined;
      if (oldest !== undefined) {
        this.cache.delete(oldest);
      }
    }
    this.cache.set(hash, { text, cachedAt: Date.now() });
  }

  private async sha256(input: string): Promise<string> {
    const data = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
}
