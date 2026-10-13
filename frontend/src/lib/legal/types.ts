/**
 * Shared, typed structures for the legal documents (Privacy Policy and Terms of
 * Service). Keeping the copy as data lets the pages share one accessible
 * document layout and lets us flag sections that still need an owner decision.
 */

export interface LegalSubsection {
  title: string;
  paragraphs?: string[];
  list?: string[];
}

export interface LegalSection {
  /** URL-safe anchor id, e.g. "information-we-collect". */
  id: string;
  title: string;
  paragraphs?: string[];
  list?: string[];
  subsections?: LegalSubsection[];
  /**
   * When present, the section contains a commercial/legal decision that has not
   * been confirmed by the project owner. Rendered as a visible "Owner review
   * required" callout instead of publishing an invented policy. The callout is
   * development-only: it is stripped from production builds so these internal
   * notes are never shown to customers.
   */
  ownerReview?: string;
}

export interface LegalDocument {
  title: string;
  /** Short description shown under the title and used as the meta description. */
  intro: string;
  /** Human-readable revision date, e.g. "October 13, 2026". */
  lastUpdated: string;
  sections: LegalSection[];
}
