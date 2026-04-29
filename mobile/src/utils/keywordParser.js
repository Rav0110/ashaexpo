/**
 * Offline Hindi / Hinglish keyword parser.
 * Extracts structured health fields from typed notes.
 * Works entirely offline — no AI, no ML, no network.
 *
 * Patterns from implementation plan Section 4.
 */

/**
 * Parse a raw note and extract structured health data.
 * @param {string} note - Raw Hindi/Hinglish/English note
 * @returns {object} extracted fields
 */
export function parseNote(note) {
  if (!note || typeof note !== 'string') return {};

  const text = note.toLowerCase().trim();
  const extracted = {};

  // --- BP extraction ---
  // Pattern: "BP 150/95", "bp 130/80", "बीपी 140/90"
  const bpMatch = text.match(/(?:bp|बीपी|बी\.पी\.?)\s*(\d{2,3})\s*[\/\\]\s*(\d{2,3})/i);
  if (bpMatch) {
    extracted.bp_systolic = parseInt(bpMatch[1], 10);
    extracted.bp_diastolic = parseInt(bpMatch[2], 10);
  }

  // BP flag keywords: "bp high", "uchha bp", "उच्च बीपी"
  if (/(?:bp\s*high|high\s*bp|uchha\s*bp|उच्च\s*बीपी|बीपी\s*ज़्यादा|bp\s*zyada|bp\s*badha)/i.test(text)) {
    extracted.bp_flag = true;
    // If no numeric BP extracted, set elevated default
    if (!extracted.bp_systolic) {
      extracted.bp_systolic = 150;
      extracted.bp_diastolic = 95;
    }
  }

  // --- Fever ---
  // Pattern: "bukhar", "fever", "बुखार", "tez bukhar"
  const tempMatch = text.match(/(?:temp|temperature|तापमान)\s*(\d{2,3}(?:\.\d)?)/i);
  if (tempMatch) {
    extracted.temperature_c = parseFloat(tempMatch[1]);
  }

  if (/(?:bukhar|bukhaar|fever|बुखार|ज्वर|tez\s*bukhar)/i.test(text)) {
    extracted.fever_flag = true;
    if (!extracted.temperature_c) {
      extracted.temperature_c = 38.5; // default fever temp
    }
  }

  if (/(?:tez\s*bukhar|bahut\s*bukhar|high\s*fever|तेज़?\s*बुखार)/i.test(text)) {
    extracted.danger_fever_flag = true;
    if (!extracted.temperature_c || extracted.temperature_c < 39.5) {
      extracted.temperature_c = 39.5;
    }
  }

  // --- Bleeding ---
  // Pattern: "khoon", "bleeding", "रक्त", "khoon aa raha"
  if (/(?:khoon|khun|bleeding|bleed|रक्त|रक्तस्राव|खून)/i.test(text)) {
    extracted.bleeding = 1;
  }

  // --- Seizure ---
  // Pattern: "dora", "seizure", "fits", "दौरा"
  if (/(?:dora|dauraa?|seizure|fits|mirgi|दौरा|मिर्गी)/i.test(text)) {
    extracted.seizure = 1;
  }

  // --- Breathlessness ---
  // Pattern: "sans nahi", "breathless", "saans fool"
  if (/(?:sans?\s*(?:nahi|nhi|fool|phool)|breathless|saans?\s*(?:nahi|nhi|fool|phool)|साँस|श्वास)/i.test(text)) {
    extracted.breathlessness = 1;
  }

  // --- Cough / TB ---
  // Pattern: "3 hafte se khansi", "2 week cough"
  const coughMatch = text.match(/(\d+)\s*(?:hafte?|hafton?|week|saptah|हफ्ते?)\s*(?:se\s*)?(?:khansi|khasi|cough|खाँसी|खांसी)/i);
  if (coughMatch) {
    extracted.tb_cough_weeks = parseInt(coughMatch[1], 10);
  }
  // Reverse pattern: "khansi 3 hafte se"
  const coughMatch2 = text.match(/(?:khansi|khasi|cough|खाँसी|खांसी)\s*(\d+)\s*(?:hafte?|hafton?|week|saptah|हफ्ते?)/i);
  if (coughMatch2 && !extracted.tb_cough_weeks) {
    extracted.tb_cough_weeks = parseInt(coughMatch2[1], 10);
  }

  // --- TB follow-up missed ---
  // Pattern: "TB nahi aaya", "follow up miss"
  if (/(?:tb\s*(?:nahi|nhi)\s*(?:aaya|aay)|tb\s*miss|follow\s*up\s*miss|टीबी\s*नहीं)/i.test(text)) {
    extracted.tb_followup_missed = 1;
  }

  // --- Vaccination due ---
  // Pattern: "tika baaki", "टीका बाकी", "vaccine due"
  if (/(?:tika\s*(?:baaki|baki)|टीका\s*बाकी|vaccine?\s*due|vaccination?\s*due)/i.test(text)) {
    extracted.vaccination_due = 1;
  }

  // --- Vaccination given ---
  // Pattern: "tika diya", "टीका दिया", "vaccine given"
  if (/(?:tika\s*(?:diya|de\s*diya)|टीका\s*(?:दिया|दे\s*दिया)|vaccine?\s*given|vaccination?\s*(?:given|done|complete))/i.test(text)) {
    extracted.vaccination_given = 1;
  }

  // --- MUAC ---
  // Pattern: "MUAC 10.5", "muac 11"
  const muacMatch = text.match(/(?:muac|एम\.?यू\.?ए\.?सी\.?)\s*(\d{1,2}(?:\.\d)?)/i);
  if (muacMatch) {
    extracted.muac_cm = parseFloat(muacMatch[1]);
  }

  return extracted;
}

/**
 * Get a human-readable summary of extracted fields (Hindi + English).
 */
export function getExtractionSummary(extracted) {
  const lines = [];

  if (extracted.bp_systolic && extracted.bp_diastolic) {
    lines.push(`BP: ${extracted.bp_systolic}/${extracted.bp_diastolic} mmHg`);
  }
  if (extracted.bp_flag) {
    lines.push('BP High (बीपी ज़्यादा)');
  }
  if (extracted.temperature_c) {
    lines.push(`Temperature: ${extracted.temperature_c}°C`);
  }
  if (extracted.fever_flag) {
    lines.push('Fever (बुखार)');
  }
  if (extracted.danger_fever_flag) {
    lines.push('High Fever (तेज़ बुखार)');
  }
  if (extracted.bleeding) {
    lines.push('Bleeding (खून)');
  }
  if (extracted.seizure) {
    lines.push('Seizure (दौरा)');
  }
  if (extracted.breathlessness) {
    lines.push('Breathlessness (साँस की तकलीफ़)');
  }
  if (extracted.tb_cough_weeks) {
    lines.push(`Cough: ${extracted.tb_cough_weeks} weeks (${extracted.tb_cough_weeks} हफ्ते खाँसी)`);
  }
  if (extracted.tb_followup_missed) {
    lines.push('TB Follow-up Missed (टीबी फॉलो-अप छूटा)');
  }
  if (extracted.vaccination_due) {
    lines.push('Vaccination Due (टीका बाकी)');
  }
  if (extracted.vaccination_given) {
    lines.push('Vaccination Given (टीका दिया)');
  }
  if (extracted.muac_cm) {
    lines.push(`MUAC: ${extracted.muac_cm} cm`);
  }

  return lines;
}
