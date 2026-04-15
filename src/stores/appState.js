import {
  DEFAULT_ARPEGGIO_CHORD_SWITCH_IMMEDIATE,
  DEFAULT_ARPEGGIO_PAUSE_IMMEDIATE,
  DEFAULT_ARPEGGIO_PATTERN_ID,
  DEFAULT_ARPEGGIO_STEP_MS,
  DEFAULT_ARPEGGIO_VISIBLE_PATTERN_IDS,
  DEFAULT_CHORD_VOICING_MODE,
  DEFAULT_CYCLE_KEY,
  DEFAULT_KEY_SIGNATURE,
  DEFAULT_SEQUENCE,
  DEFAULT_STRING_HOLD_DELAY_MS,
  DEFAULT_STRING_HOLD_DELAY_OVERRIDES_MS,
  DEFAULT_STRING_KEYS,
  DEFAULT_STRUM_HOLD_DELAY_MS,
  DEFAULT_TONE_PRESET_ID
} from "../config";
import { DEFAULT_LANGUAGE } from "../i18n";

function createAppState() {
  return {
    cycleKey: DEFAULT_CYCLE_KEY,
    stringKeys: { ...DEFAULT_STRING_KEYS },
    sequence: [...DEFAULT_SEQUENCE],
    currentIndex: 0,
    keySignature: DEFAULT_KEY_SIGNATURE,
    chordVoicingMode: DEFAULT_CHORD_VOICING_MODE,
    tonePresetId: DEFAULT_TONE_PRESET_ID,
    language: DEFAULT_LANGUAGE,
    arpeggioEnabled: false,
    arpeggioPatternId: DEFAULT_ARPEGGIO_PATTERN_ID,
    arpeggioVisiblePatternIds: [...DEFAULT_ARPEGGIO_VISIBLE_PATTERN_IDS],
    arpeggioStepMs: DEFAULT_ARPEGGIO_STEP_MS,
    arpeggioPauseImmediate: DEFAULT_ARPEGGIO_PAUSE_IMMEDIATE,
    arpeggioChordSwitchImmediate: DEFAULT_ARPEGGIO_CHORD_SWITCH_IMMEDIATE,
    leftPanelCollapsed: true,
    strumHoldDelayMs: DEFAULT_STRUM_HOLD_DELAY_MS,
    stringHoldDelayMs: DEFAULT_STRING_HOLD_DELAY_MS,
    stringHoldDelayOverridesMs: { ...DEFAULT_STRING_HOLD_DELAY_OVERRIDES_MS },
    audioReady: false,
    instrumentReady: false,
    instrumentLoadProgress: null,
    instrumentLoadError: false,
    previewInProgress: false
  };
}

function createRuntimeCollections() {
  return {
    synths: new Map(),
    acousticRouting: {
      sourceBus: null,
      dryBus: null,
      bodySend: null,
      ambienceSend: null
    },
    releaseTimers: new Map(),
    holdTimers: new Map(),
    activeKeyHolds: new Map(),
    activePointerHolds: new Map(),
    refs: {}
  };
}

export {
  createAppState,
  createRuntimeCollections
};
