/**
 * Ad Job State Machine — persists pipeline progress in Firestore.
 *
 * Flow:
 *   PENDING → CAMPAIGN_CREATED → ADGROUPS_CREATED → ADS_CREATED → DONE
 *                                                              ↘ PENDING_RETRY
 *                                                              ↘ FAILED
 *
 * Usage:
 *   const job = await AdJobState.create(userId, { businessName: "Acme" });
 *   await job.advance("CAMPAIGN_CREATED", { campaignId: "123" });
 *   await job.advance("ADGROUPS_CREATED", { adGroupIds: ["a", "b", "c"] });
 *   await job.advance("ADS_CREATED", { adIds: ["x", "y"] });
 *   await job.advance("DONE");
 *
 *   // On failure:
 *   await job.fail("Error al crear anuncio: imagen no encontrada", { imageId: "bad" });
 *   // or retry later:
 *   await job.retry("Reintentando con nueva imagen");
 */

import { createDoc, readDoc, updateDoc } from "@/lib/firestoreRest";

export type AdJobStatus =
  | "PENDING"
  | "CAMPAIGN_CREATED"
  | "ADGROUPS_CREATED"
  | "ADS_CREATED"
  | "DONE"
  | "PENDING_RETRY"
  | "FAILED";

export interface AdJobRecord {
  userId: string;
  status: AdJobStatus;
  retries: number;
  createdAt: string;
  updatedAt: string;
  meta: Record<string, unknown>;
  lastError?: string;
  campaignId?: string;
  adGroupIds?: string[];
  adIds?: string[];
}

const COLLECTION = "ad_jobs";
const MAX_AUTO_RETRIES = 3;

export class AdJobState {
  private constructor(
    public readonly jobId: string,
    private record: AdJobRecord,
    private readonly authToken?: string
  ) {}

  /** Create a new job and persist it. Returns an AdJobState instance. */
  static async create(
    userId: string,
    meta: Record<string, unknown> = {},
    authToken?: string
  ): Promise<AdJobState> {
    const jobId = `${userId}_${Date.now()}`;
    const now = new Date().toISOString();
    const record: AdJobRecord = {
      userId,
      status: "PENDING",
      retries: 0,
      createdAt: now,
      updatedAt: now,
      meta,
    };
    await createDoc(COLLECTION, jobId, record as unknown as Record<string, unknown>, authToken);
    return new AdJobState(jobId, record, authToken);
  }

  /** Load an existing job from Firestore. Returns null if not found. */
  static async load(jobId: string, authToken?: string): Promise<AdJobState | null> {
    const doc = await readDoc(COLLECTION, jobId, authToken);
    if (!doc) return null;
    return new AdJobState(jobId, doc.data as unknown as AdJobRecord, authToken);
  }

  /** Advance to the next status, optionally merging in new data. */
  async advance(
    status: AdJobStatus,
    data: Partial<Pick<AdJobRecord, "campaignId" | "adGroupIds" | "adIds">> = {}
  ): Promise<void> {
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { status, updatedAt: now, ...data };
    await updateDoc(COLLECTION, this.jobId, patch, this.authToken);
    Object.assign(this.record, patch);
  }

  /**
   * Mark the job as FAILED with a technical error message.
   * Once FAILED, the job will not retry automatically.
   */
  async fail(errorMessage: string, context: Record<string, unknown> = {}): Promise<void> {
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = {
      status: "FAILED",
      lastError: errorMessage,
      updatedAt: now,
      failureContext: context,
    };
    await updateDoc(COLLECTION, this.jobId, patch, this.authToken);
    Object.assign(this.record, patch);
    console.error(`[AdJobState:${this.jobId}] FAILED — ${errorMessage}`, context);
  }

  /**
   * Mark the job as PENDING_RETRY if under the retry limit.
   * If the limit is exceeded, marks as FAILED instead.
   */
  async retry(reason: string): Promise<boolean> {
    const newRetries = this.record.retries + 1;
    const now = new Date().toISOString();

    if (newRetries > MAX_AUTO_RETRIES) {
      await this.fail(`Max retries (${MAX_AUTO_RETRIES}) exceeded. Last reason: ${reason}`);
      return false;
    }

    const patch: Record<string, unknown> = {
      status: "PENDING_RETRY",
      retries: newRetries,
      lastError: reason,
      updatedAt: now,
    };
    await updateDoc(COLLECTION, this.jobId, patch, this.authToken);
    Object.assign(this.record, patch);
    console.warn(`[AdJobState:${this.jobId}] PENDING_RETRY (${newRetries}/${MAX_AUTO_RETRIES}) — ${reason}`);
    return true;
  }

  get status(): AdJobStatus {
    return this.record.status;
  }

  get retries(): number {
    return this.record.retries;
  }

  get data(): AdJobRecord {
    return this.record;
  }
}
