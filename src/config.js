const CHORD_LIBRARY = {
  // Core triads
  C: ["C3", "E3", "G3", "C4", "E4", "G4"],
  Cm: ["C3", "Eb3", "G3", "C4", "Eb4", "G4"],
  Caug: ["C3", "E3", "G#3", "C4", "E4", "G#4"],
  Cdim: ["C3", "Eb3", "Gb3", "C4", "Eb4", "Gb4"],
  D: ["D3", "A3", "D4", "F#4", "A4", "D5"],
  Dm: ["D3", "A3", "D4", "F4", "A4", "D5"],
  E: ["E2", "B2", "E3", "G#3", "B3", "E4"],
  Em: ["E2", "B2", "E3", "G3", "B3", "E4"],
  F: ["F2", "C3", "F3", "A3", "C4", "F4"],
  Fm: ["F2", "C3", "F3", "Ab3", "C4", "F4"],
  G: ["G2", "B2", "D3", "G3", "B3", "G4"],
  Gm: ["G2", "Bb2", "D3", "G3", "Bb3", "G4"],
  A: ["A2", "E3", "A3", "C#4", "E4", "A4"],
  Am: ["A2", "E3", "A3", "C4", "E4", "A4"],
  B: ["B2", "F#3", "B3", "D#4", "F#4", "B4"],
  Bm: ["B2", "F#3", "B3", "D4", "F#4", "B4"],
  Bdim: ["B2", "F3", "B3", "D4", "F4", "B4"],

  // Sevenths
  Cmaj7: ["C3", "E3", "G3", "B3", "E4", "G4"],
  C7: ["C3", "E3", "G3", "Bb3", "E4", "G4"],
  Cm7: ["C3", "Eb3", "G3", "Bb3", "Eb4", "G4"],
  Dmaj7: ["D3", "A3", "C#4", "F#4", "A4", "D5"],
  D7: ["D3", "A3", "C4", "F#4", "A4", "D5"],
  Dm7: ["D3", "A3", "C4", "F4", "A4", "D5"],
  Em7: ["E2", "B2", "D3", "G3", "B3", "E4"],
  E7: ["E2", "B2", "D3", "G#3", "B3", "E4"],
  Fmaj7: ["F2", "C3", "E3", "A3", "C4", "F4"],
  F7: ["F2", "C3", "Eb3", "A3", "C4", "F4"],
  Fm7: ["F2", "C3", "Eb3", "Ab3", "C4", "F4"],
  Gmaj7: ["G2", "B2", "D3", "F#3", "B3", "G4"],
  G7: ["G2", "B2", "D3", "F3", "B3", "G4"],
  Gm7: ["G2", "Bb2", "D3", "F3", "Bb3", "G4"],
  Am7: ["A2", "E3", "G3", "C4", "E4", "A4"],
  A7: ["A2", "E3", "G3", "C#4", "E4", "A4"],
  Bm7: ["B2", "F#3", "A3", "D4", "F#4", "B4"],
  B7: ["B2", "F#3", "A3", "D#4", "F#4", "B4"],
  Bm7b5: ["B2", "F3", "A3", "D4", "F4", "B4"],

  // Add/sus colors
  Cadd9: ["C3", "E3", "G3", "D4", "E4", "G4"],
  Csus2: ["C3", "D3", "G3", "C4", "D4", "G4"],
  Csus4: ["C3", "F3", "G3", "C4", "F4", "G4"],
  Dadd9: ["D3", "A3", "D4", "E4", "A4", "D5"],
  Dsus2: ["D3", "A3", "D4", "E4", "A4", "D5"],
  Dsus4: ["D3", "A3", "D4", "G4", "A4", "D5"],
  Eadd9: ["E2", "B2", "F#3", "G#3", "B3", "E4"],
  Esus4: ["E2", "B2", "E3", "A3", "B3", "E4"],
  Fadd9: ["F2", "C3", "G3", "A3", "C4", "F4"],
  Fsus2: ["F2", "C3", "F3", "G3", "C4", "F4"],
  Gadd9: ["G2", "B2", "D3", "A3", "B3", "G4"],
  Gsus2: ["G2", "D3", "G3", "A3", "D4", "G4"],
  Gsus4: ["G2", "C3", "D3", "G3", "C4", "G4"],
  Aadd9: ["A2", "E3", "B3", "C#4", "E4", "A4"],
  Asus2: ["A2", "E3", "A3", "B3", "E4", "A4"],
  Asus4: ["A2", "E3", "A3", "D4", "E4", "A4"],

  // Slash chords and common passing voicings
  "D/#F": ["F#2", "A2", "D3", "F#3", "A3", "D4"],
  "C/E": ["E2", "G2", "C3", "E3", "G3", "C4"],
  "G/B": ["B2", "D3", "G3", "B3", "D4", "G4"],
  "F/C": ["C3", "F3", "A3", "C4", "F4", "A4"],
  "Am/C": ["C3", "E3", "A3", "C4", "E4", "A4"]
};

const DEFAULT_SEQUENCE = ["C", "G", "Am", "F", "Dm", "Em", "E", "A"];
const DEFAULT_KEY_SIGNATURE = "C";
const AVAILABLE_KEY_SIGNATURES = ["C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"];
const CHORD_VOICING_MODE_TRANSPOSE = "transpose";
const CHORD_VOICING_MODE_GUITAR = "guitar";
const DEFAULT_CHORD_VOICING_MODE = CHORD_VOICING_MODE_TRANSPOSE;
const AVAILABLE_CHORD_VOICING_MODES = [
  CHORD_VOICING_MODE_TRANSPOSE,
  CHORD_VOICING_MODE_GUITAR
];
const TONE_PRESET_ENGINE_SOUNDFONT = "soundfont";
const TONE_PRESET_ENGINE_PLUCK = "pluck";
const DEFAULT_TONE_PRESET_ID = "acoustic_steel";
const DEFAULT_PLUCK_PROFILE = {
  attackNoiseBase: 1.05,
  attackNoiseStep: 0.05,
  dampeningBase: 2400,
  dampeningStep: 260,
  resonanceBase: 0.95,
  resonanceStep: 0.005,
  panSpread: 3
};
const TONE_PRESETS = [
  {
    id: "acoustic_steel",
    labelKey: "tonePresetAcousticSteel",
    engine: TONE_PRESET_ENGINE_SOUNDFONT,
    instrument: "acoustic_guitar_steel"
  },
  {
    id: "acoustic_nylon",
    labelKey: "tonePresetAcousticNylon",
    engine: TONE_PRESET_ENGINE_SOUNDFONT,
    instrument: "acoustic_guitar_nylon"
  },
  {
    id: "electric_clean",
    labelKey: "tonePresetElectricClean",
    engine: TONE_PRESET_ENGINE_SOUNDFONT,
    instrument: "electric_guitar_clean"
  },
  {
    id: "electric_jazz",
    labelKey: "tonePresetElectricJazz",
    engine: TONE_PRESET_ENGINE_SOUNDFONT,
    instrument: "electric_guitar_jazz"
  },
  {
    id: "pluck_bright",
    labelKey: "tonePresetPluckBright",
    engine: TONE_PRESET_ENGINE_PLUCK,
    pluckProfile: {
      attackNoiseBase: 1.18,
      attackNoiseStep: 0.055,
      dampeningBase: 2050,
      dampeningStep: 240,
      resonanceBase: 0.96,
      resonanceStep: 0.004,
      panSpread: 2.6
    }
  },
  {
    id: "pluck_warm",
    labelKey: "tonePresetPluckWarm",
    engine: TONE_PRESET_ENGINE_PLUCK,
    pluckProfile: {
      attackNoiseBase: 0.92,
      attackNoiseStep: 0.035,
      dampeningBase: 2800,
      dampeningStep: 290,
      resonanceBase: 0.94,
      resonanceStep: 0.003,
      panSpread: 3.4
    }
  }
];
const TONE_PRESET_BY_ID = new Map(TONE_PRESETS.map((preset) => [preset.id, preset]));
const FLAT_KEY_SIGNATURES = new Set(["F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"]);
const PITCH_CLASS_TO_SEMITONE = {
  C: 0,
  "B#": 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  F: 5,
  "E#": 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
  Cb: 11
};
const SEMITONE_TO_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const SEMITONE_TO_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const STRING_ORDER = [6, 5, 4, 3, 2, 1];
const DISPLAY_STRING_ORDER = [1, 2, 3, 4, 5, 6];
const DEFAULT_STRING_KEYS = {
  6: "n",
  5: "m",
  4: "k",
  3: "j",
  2: "i",
  1: "o"
};

const DEFAULT_CYCLE_KEY = "a";
const STRUM_DOWN_KEY = "l";
const STRUM_UP_KEY = "p";
const ARPEGGIO_TOGGLE_KEY = "r";

const ARPEGGIO_PATTERNS = [
  {
    id: "flow_8",
    labelKey: "arpeggioPatternFlow8",
    sequence: [6, 4, 3, 2, 3, 4, 2, 1]
  },
  {
    id: "pima_8",
    labelKey: "arpeggioPatternPima8",
    sequence: [6, 3, 2, 1, 2, 3, 2, 1]
  },
  {
    id: "alternate_8",
    labelKey: "arpeggioPatternAlternate8",
    sequence: [6, 5, 4, 3, 2, 1, 2, 3]
  },
  {
    id: "waltz_6",
    labelKey: "arpeggioPatternWaltz6",
    sequence: [6, 3, 2, 3, 1, 3]
  },
  {
    id: "bass_roll_8",
    labelKey: "arpeggioPatternBassRoll8",
    sequence: [6, 3, 2, 1, 5, 3, 2, 1]
  },
  {
    id: "travis_8",
    labelKey: "arpeggioPatternTravis8",
    sequence: [6, 3, 4, 2, 5, 3, 4, 1]
  },
  {
    id: "folk_pop_8",
    labelKey: "arpeggioPatternFolkPop8",
    sequence: [6, 4, 3, 2, 4, 3, 2, 1]
  },
  {
    id: "pedal_high_8",
    labelKey: "arpeggioPatternPedalHigh8",
    sequence: [6, 2, 3, 2, 5, 2, 3, 1]
  },
  {
    id: "cross_8",
    labelKey: "arpeggioPatternCross8",
    sequence: [6, 3, 5, 2, 4, 2, 3, 1]
  },
  {
    id: "wave_12",
    labelKey: "arpeggioPatternWave12",
    sequence: [6, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2]
  },
  {
    id: "ballad_16",
    labelKey: "arpeggioPatternBallad16",
    sequence: [6, 3, 2, 1, 3, 2, 4, 2, 5, 3, 2, 1, 3, 2, 4, 2]
  }
];
const ARPEGGIO_PATTERN_BY_ID = new Map(ARPEGGIO_PATTERNS.map((pattern) => [pattern.id, pattern]));
const DEFAULT_ARPEGGIO_PATTERN_ID = ARPEGGIO_PATTERNS[0].id;
const DEFAULT_ARPEGGIO_VISIBLE_PATTERN_IDS = [
  "flow_8",
  "pima_8",
  "alternate_8",
  "waltz_6",
  "bass_roll_8",
  "travis_8"
];
const DEFAULT_ARPEGGIO_STEP_MS = 120;
const DEFAULT_ARPEGGIO_PAUSE_IMMEDIATE = false;
const DEFAULT_ARPEGGIO_CHORD_SWITCH_IMMEDIATE = false;
const MIN_ARPEGGIO_STEP_MS = 70;
const MAX_ARPEGGIO_STEP_MS = 420;
const ARPEGGIO_NOTE_RATIO = 0.82;
const ARPEGGIO_LOOKAHEAD_SECONDS = 0.02;

const HOLD_REPEAT_INTERVAL_MS = 110;
const DEFAULT_STRUM_HOLD_DELAY_MS = 320;
const DEFAULT_STRING_HOLD_DELAY_MS = 0;
const STRUM_REPEAT_INTERVAL_MS = 320;
const STRUM_STEP_DELAY_MS = 24;
const DEFAULT_STRING_HIGHLIGHT_DURATION_MS = 180;
const PREVIEW_BEAT_DURATION_MS = 800;
const PREVIEW_SINGLE_STRING_PASS_DURATION_MS = PREVIEW_BEAT_DURATION_MS * STRING_ORDER.length;
const PREVIEW_STRUM_PASS_DURATION_MS = PREVIEW_BEAT_DURATION_MS;
const PREVIEW_STRUM_TRANSITION_GAP_MS = PREVIEW_BEAT_DURATION_MS;
const PREVIEW_TOTAL_DURATION_MS =
  PREVIEW_SINGLE_STRING_PASS_DURATION_MS +
  PREVIEW_STRUM_PASS_DURATION_MS * 2 +
  PREVIEW_STRUM_TRANSITION_GAP_MS;
const PREVIEW_SINGLE_STRING_STEP_DELAY_MS = PREVIEW_BEAT_DURATION_MS;
const PREVIEW_STRUM_STEP_DELAY_MS = PREVIEW_BEAT_DURATION_MS / STRING_ORDER.length;
const PREVIEW_SINGLE_NOTE_DURATION_SECONDS = (PREVIEW_BEAT_DURATION_MS / 1000) * 0.9;
const PREVIEW_STRUM_NOTE_DURATION_SECONDS = (PREVIEW_STRUM_STEP_DELAY_MS / 1000) * 0.38;
const PREVIEW_STRUM_HIGHLIGHT_DURATION_MS = 80;
const PREVIEW_PLUCK_RELEASE_RATIO = 0.32;
const PREVIEW_LOCK_TAIL_MS = 40;
const SWIPE_SWEEP_STEP_DELAY_MS = 16;
const MIN_STRUM_HOLD_DELAY_MS = 0;
const MAX_STRUM_HOLD_DELAY_MS = 2000;
const MIN_STRING_HOLD_DELAY_MS = 0;
const MAX_STRING_HOLD_DELAY_MS = 2000;
const DEFAULT_STRING_HOLD_DELAY_OVERRIDES_MS = {
  6: null,
  5: null,
  4: null,
  3: null,
  2: null,
  1: null
};
const NEUTRAL_PREVIEW_STRING_NOTES = {
  6: "E2",
  5: "A2",
  4: "D3",
  3: "G3",
  2: "B3",
  1: "E4"
};

const STORAGE_KEY = "simulated-guitar-settings-v1";
const DEFAULT_STRING_KEY_BY_CODE = {
  KeyN: 6,
  KeyM: 5,
  KeyK: 4,
  KeyJ: 3,
  KeyI: 2,
  KeyO: 1
};

const ROUTE_PLAY = "#/play";
const ROUTE_SETTINGS = "#/settings";
const MOBILE_PLAY_LAYOUT_QUERY = "(max-width: 960px), (max-width: 1366px) and (hover: none) and (pointer: coarse)";

export {
  CHORD_LIBRARY,
  DEFAULT_SEQUENCE,
  DEFAULT_KEY_SIGNATURE,
  AVAILABLE_KEY_SIGNATURES,
  CHORD_VOICING_MODE_TRANSPOSE,
  CHORD_VOICING_MODE_GUITAR,
  DEFAULT_CHORD_VOICING_MODE,
  AVAILABLE_CHORD_VOICING_MODES,
  TONE_PRESET_ENGINE_SOUNDFONT,
  TONE_PRESET_ENGINE_PLUCK,
  DEFAULT_TONE_PRESET_ID,
  DEFAULT_PLUCK_PROFILE,
  TONE_PRESETS,
  TONE_PRESET_BY_ID,
  FLAT_KEY_SIGNATURES,
  PITCH_CLASS_TO_SEMITONE,
  SEMITONE_TO_SHARP,
  SEMITONE_TO_FLAT,
  STRING_ORDER,
  DISPLAY_STRING_ORDER,
  DEFAULT_STRING_KEYS,
  DEFAULT_CYCLE_KEY,
  STRUM_DOWN_KEY,
  STRUM_UP_KEY,
  ARPEGGIO_TOGGLE_KEY,
  ARPEGGIO_PATTERNS,
  ARPEGGIO_PATTERN_BY_ID,
  DEFAULT_ARPEGGIO_PATTERN_ID,
  DEFAULT_ARPEGGIO_VISIBLE_PATTERN_IDS,
  DEFAULT_ARPEGGIO_STEP_MS,
  DEFAULT_ARPEGGIO_PAUSE_IMMEDIATE,
  DEFAULT_ARPEGGIO_CHORD_SWITCH_IMMEDIATE,
  MIN_ARPEGGIO_STEP_MS,
  MAX_ARPEGGIO_STEP_MS,
  ARPEGGIO_NOTE_RATIO,
  ARPEGGIO_LOOKAHEAD_SECONDS,
  HOLD_REPEAT_INTERVAL_MS,
  DEFAULT_STRUM_HOLD_DELAY_MS,
  DEFAULT_STRING_HOLD_DELAY_MS,
  STRUM_REPEAT_INTERVAL_MS,
  STRUM_STEP_DELAY_MS,
  DEFAULT_STRING_HIGHLIGHT_DURATION_MS,
  PREVIEW_BEAT_DURATION_MS,
  PREVIEW_SINGLE_STRING_PASS_DURATION_MS,
  PREVIEW_STRUM_PASS_DURATION_MS,
  PREVIEW_STRUM_TRANSITION_GAP_MS,
  PREVIEW_TOTAL_DURATION_MS,
  PREVIEW_SINGLE_STRING_STEP_DELAY_MS,
  PREVIEW_STRUM_STEP_DELAY_MS,
  PREVIEW_SINGLE_NOTE_DURATION_SECONDS,
  PREVIEW_STRUM_NOTE_DURATION_SECONDS,
  PREVIEW_STRUM_HIGHLIGHT_DURATION_MS,
  PREVIEW_PLUCK_RELEASE_RATIO,
  PREVIEW_LOCK_TAIL_MS,
  SWIPE_SWEEP_STEP_DELAY_MS,
  MIN_STRUM_HOLD_DELAY_MS,
  MAX_STRUM_HOLD_DELAY_MS,
  MIN_STRING_HOLD_DELAY_MS,
  MAX_STRING_HOLD_DELAY_MS,
  DEFAULT_STRING_HOLD_DELAY_OVERRIDES_MS,
  NEUTRAL_PREVIEW_STRING_NOTES,
  STORAGE_KEY,
  DEFAULT_STRING_KEY_BY_CODE,
  ROUTE_PLAY,
  ROUTE_SETTINGS,
  MOBILE_PLAY_LAYOUT_QUERY
};
