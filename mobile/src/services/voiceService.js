/**
 * voiceService.js — Hybrid Voice Processing Orchestrator
 *
 * Wraps the existing aiService.processVoiceHealthInput() with:
 *   1. Connectivity gate (isOnline check before calling Gemini)
 *   2. Timeout protection (8-second max wait)
 *   3. Audio file persistence (copies recording to durable storage)
 *   4. Structured result with source tag for UX differentiation
 *
 * aiService.js is NOT modified — it remains the inner Gemini call engine.
 * If this wrapper is removed, AudioRecorder can revert to calling aiService directly.
 */

import * as FileSystem from 'expo-file-system';
import { isOnline } from './connectivityService';
import { processVoiceHealthInput } from './aiService';
import { VOICE_AUDIO_DIR } from '../constants/appConfig';

// ─── Configuration ──────────────────────────────────────────────────────────────

const AI_TIMEOUT_MS = 8000; // Max wait for Gemini before falling back

// ─── Persistent audio storage ───────────────────────────────────────────────────

/**
 * Ensure the voice recordings directory exists.
 * Returns the absolute directory path.
 */
async function ensureAudioDir() {
  const dir = `${FileSystem.documentDirectory}${VOICE_AUDIO_DIR}`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

/**
 * Copy a temporary recording to persistent storage.
 * Returns the new durable URI.
 *
 * @param {string} tempUri - Temp URI from expo-av recording
 * @returns {Promise<string>} Persistent URI
 */
async function persistAudioFile(tempUri) {
  try {
    const dir = await ensureAudioDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `visit_${timestamp}.m4a`;
    const destUri = `${dir}${filename}`;
    await FileSystem.copyAsync({ from: tempUri, to: destUri });
    return destUri;
  } catch (err) {
    console.warn('[voiceService] Failed to persist audio:', err.message);
    // Return original URI as fallback — at least don't crash
    return tempUri;
  }
}

// ─── Timeout utility ────────────────────────────────────────────────────────────

/**
 * Race a promise against a timeout.
 * @param {Promise} promise
 * @param {number} ms
 * @returns {Promise}
 */
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI_TIMEOUT')), ms)
    ),
  ]);
}

// ─── Main export ────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} VoiceResult
 * @property {'ai'|'offline'|'failed'|'timeout'} source — how the result was produced
 * @property {object|null} data — sanitized field object (same shape as aiService output), or null
 * @property {string} audioUri — persistent URI of the saved audio file
 * @property {string} message — human-readable status for AudioRecorder UI
 */

/**
 * Process a voice recording through the hybrid pipeline.
 *
 * 1. Persist audio file to durable storage (always)
 * 2. If offline → return immediately with source:'offline'
 * 3. If online → call aiService with timeout protection
 * 4. On success → return AI result with source:'ai'
 * 5. On failure/timeout → return null data with source:'failed'/'timeout'
 *
 * @param {string} tempAudioUri - Temp file URI from expo-av Recording.getURI()
 * @param {string} [mimeType='audio/mp4'] - MIME type
 * @returns {Promise<VoiceResult>}
 */
export async function processRecording(tempAudioUri, mimeType = 'audio/mp4') {
  // Step 1: Always persist the audio file
  const audioUri = await persistAudioFile(tempAudioUri);

  // Step 2: Connectivity gate
  if (!isOnline()) {
    return {
      source: 'offline',
      data: null,
      audioUri,
      message: '📴 Recording saved offline. Type a note below for instant extraction.',
    };
  }

  // Step 3: Online path — read base64 + call existing aiService with timeout
  try {
    const base64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const aiResult = await withTimeout(
      processVoiceHealthInput(base64, mimeType),
      AI_TIMEOUT_MS
    );

    // Validate result is meaningful (not just an empty mock)
    if (aiResult && Object.keys(aiResult).length > 0 && aiResult.raw_note) {
      return {
        source: 'ai',
        data: aiResult,
        audioUri,
        message: '✅ AI health data extracted successfully!',
      };
    }

    // AI returned empty/mock — treat as failure
    return {
      source: 'failed',
      data: aiResult && Object.keys(aiResult).length > 0 ? aiResult : null,
      audioUri,
      message: '⚠️ AI could not extract data. Type a note for local extraction.',
    };
  } catch (err) {
    const isTimeout = err.message === 'AI_TIMEOUT';
    console.warn(`[voiceService] ${isTimeout ? 'Timeout' : 'Error'}:`, err.message);

    return {
      source: isTimeout ? 'timeout' : 'failed',
      data: null,
      audioUri,
      message: isTimeout
        ? '⏱️ AI timed out. Recording saved — type a note for instant extraction.'
        : '⚠️ AI processing failed. Recording saved — type a note below.',
    };
  }
}
