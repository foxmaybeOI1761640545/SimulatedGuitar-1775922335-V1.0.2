import {
  CHORD_LIBRARY,
  STORAGE_KEY,
  STRING_ORDER,
  STRUM_DOWN_KEY,
  STRUM_UP_KEY
} from "../config";
import { normalizeLanguage } from "../i18n";
import { normalizeKey } from "../utils/input";

function buildSettingsPayload(state) {
  return {
    cycleKey: state.cycleKey,
    stringKeys: state.stringKeys,
    sequence: state.sequence,
    currentIndex: state.currentIndex,
    keySignature: state.keySignature,
    chordVoicingMode: state.chordVoicingMode,
    tonePresetId: state.tonePresetId,
    language: state.language,
    arpeggioEnabled: state.arpeggioEnabled,
    arpeggioPatternId: state.arpeggioPatternId,
    arpeggioVisiblePatternIds: state.arpeggioVisiblePatternIds,
    arpeggioStepMs: state.arpeggioStepMs,
    arpeggioPauseImmediate: state.arpeggioPauseImmediate,
    arpeggioChordSwitchImmediate: state.arpeggioChordSwitchImmediate,
    leftPanelCollapsed: state.leftPanelCollapsed,
    strumHoldDelayMs: state.strumHoldDelayMs,
    stringHoldDelayMs: state.stringHoldDelayMs,
    stringHoldDelayOverridesMs: state.stringHoldDelayOverridesMs
  };
}

function saveSettingsToStorage(
  state,
  {
    normalizeSequenceState,
    ensureValidArpeggioPatternSelection,
    storage = localStorage
  }
) {
  try {
    normalizeSequenceState();
    ensureValidArpeggioPatternSelection();
    storage.setItem(STORAGE_KEY, JSON.stringify(buildSettingsPayload(state)));
  } catch (error) {
    console.warn("Save settings failed.", error);
  }
}

function loadSettingsFromStorage(
  state,
  {
    normalizeKeySignature,
    normalizeChordVoicingMode,
    normalizeTonePresetId,
    normalizeArpeggioPatternId,
    normalizeArpeggioVisiblePatternIds,
    normalizeArpeggioStepMs,
    normalizeStrumHoldDelay,
    normalizeStringHoldDelay,
    normalizeSequenceState,
    ensureValidArpeggioPatternSelection,
    storage = localStorage
  }
) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);

    if (typeof parsed.cycleKey === "string" && parsed.cycleKey) {
      const cycleKey = normalizeKey(parsed.cycleKey);
      if (cycleKey && cycleKey !== STRUM_DOWN_KEY && cycleKey !== STRUM_UP_KEY) {
        state.cycleKey = cycleKey;
      }
    }

    if (parsed.stringKeys && typeof parsed.stringKeys === "object") {
      for (const stringNo of STRING_ORDER) {
        const rawKey = parsed.stringKeys[stringNo];
        if (typeof rawKey !== "string" || !rawKey) {
          continue;
        }

        const normalized = normalizeKey(rawKey);
        if (!normalized || normalized === STRUM_DOWN_KEY || normalized === STRUM_UP_KEY) {
          continue;
        }
        state.stringKeys[stringNo] = normalized;
      }
    }

    if (Array.isArray(parsed.sequence)) {
      const uniqueSequence = parsed.sequence.filter((chord, index, list) => {
        return CHORD_LIBRARY[chord] && list.indexOf(chord) === index;
      });

      if (uniqueSequence.length > 0) {
        state.sequence = uniqueSequence;
      }
    }

    if (Number.isInteger(parsed.currentIndex)) {
      state.currentIndex = Math.max(0, Math.min(parsed.currentIndex, state.sequence.length - 1));
    }

    if (typeof parsed.keySignature === "string" && parsed.keySignature) {
      state.keySignature = normalizeKeySignature(parsed.keySignature);
    }

    if (typeof parsed.chordVoicingMode === "string" && parsed.chordVoicingMode) {
      state.chordVoicingMode = normalizeChordVoicingMode(parsed.chordVoicingMode);
    }

    if (typeof parsed.tonePresetId === "string" && parsed.tonePresetId) {
      state.tonePresetId = normalizeTonePresetId(parsed.tonePresetId);
    }

    if (typeof parsed.language === "string" && parsed.language) {
      state.language = normalizeLanguage(parsed.language);
    }

    if (typeof parsed.arpeggioEnabled === "boolean") {
      state.arpeggioEnabled = parsed.arpeggioEnabled;
    }

    if (typeof parsed.arpeggioPatternId === "string" && parsed.arpeggioPatternId) {
      state.arpeggioPatternId = normalizeArpeggioPatternId(parsed.arpeggioPatternId);
    }

    if (Array.isArray(parsed.arpeggioVisiblePatternIds)) {
      state.arpeggioVisiblePatternIds = normalizeArpeggioVisiblePatternIds(parsed.arpeggioVisiblePatternIds);
    }

    const rawArpeggioStepMs = Number(parsed.arpeggioStepMs);
    if (Number.isFinite(rawArpeggioStepMs)) {
      state.arpeggioStepMs = normalizeArpeggioStepMs(rawArpeggioStepMs);
    }

    if (typeof parsed.arpeggioPauseImmediate === "boolean") {
      state.arpeggioPauseImmediate = parsed.arpeggioPauseImmediate;
    }

    if (typeof parsed.arpeggioChordSwitchImmediate === "boolean") {
      state.arpeggioChordSwitchImmediate = parsed.arpeggioChordSwitchImmediate;
    }

    if (typeof parsed.leftPanelCollapsed === "boolean") {
      state.leftPanelCollapsed = parsed.leftPanelCollapsed;
    }

    const rawStrumHoldDelay = Number(parsed.strumHoldDelayMs);
    if (Number.isFinite(rawStrumHoldDelay)) {
      state.strumHoldDelayMs = normalizeStrumHoldDelay(rawStrumHoldDelay);
    }

    const rawStringHoldDelay = Number(parsed.stringHoldDelayMs);
    if (Number.isFinite(rawStringHoldDelay)) {
      state.stringHoldDelayMs = normalizeStringHoldDelay(rawStringHoldDelay);
    }

    if (parsed.stringHoldDelayOverridesMs && typeof parsed.stringHoldDelayOverridesMs === "object") {
      for (const stringNo of STRING_ORDER) {
        const rawOverride = parsed.stringHoldDelayOverridesMs[stringNo];
        if (rawOverride === null || typeof rawOverride === "undefined" || rawOverride === "") {
          state.stringHoldDelayOverridesMs[stringNo] = null;
          continue;
        }

        const overrideDelay = Number(rawOverride);
        if (!Number.isFinite(overrideDelay)) {
          continue;
        }
        state.stringHoldDelayOverridesMs[stringNo] = normalizeStringHoldDelay(overrideDelay);
      }
    }

    normalizeSequenceState();
    ensureValidArpeggioPatternSelection();
  } catch {
    try {
      storage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage cleanup failures.
    }
  }
}

export {
  loadSettingsFromStorage,
  saveSettingsToStorage
};
