import * as Tone from "tone";
import { Soundfont } from "smplr";
import "./style.css";

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
const CHORD_LIBRARY_LOOKUP = createChordLibraryLookup();

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

const KEY_LABELS = {
  " ": "Space",
  arrowup: "ArrowUp",
  arrowdown: "ArrowDown",
  arrowleft: "ArrowLeft",
  arrowright: "ArrowRight"
};

const LANGUAGE_ZH_CN = "zh-CN";
const LANGUAGE_EN_US = "en-US";
const DEFAULT_LANGUAGE = resolveDefaultLanguage();
const SUPPORTED_LANGUAGES = [LANGUAGE_ZH_CN, LANGUAGE_EN_US];

const I18N = {
  [LANGUAGE_EN_US]: {
    openSettingsAriaLabel: "Open settings",
    currentChordLabel: "Current Chord",
    backToPlay: "Back To Play",
    settingsTitle: "Settings",
    settingsSubtitle: "Manage chord order and combinations here.",
    languageTitle: "Language",
    languageLabel: "Interface language",
    languageHint: "Changes apply immediately and are saved automatically.",
    languageOptionZh: "Chinese",
    languageOptionEn: "English",
    keyTitle: "Key",
    keyLabel: "Current key",
    keyHint: "Changing the key transposes all chord names and string notes.",
    toneLabel: "Built-in tone",
    toneHint: "Choose a tone from the built-in library. Changes apply immediately after loading.",
    previewToneButton: "Preview tone",
    previewToneHint: "Uses the same chord-free 8-beat preview as key preview: 6->1 single notes, then downstrum and upstrum.",
    tonePresetAcousticSteel: "Acoustic Steel",
    tonePresetAcousticNylon: "Acoustic Nylon",
    tonePresetElectricClean: "Electric Clean",
    tonePresetElectricJazz: "Electric Jazz",
    tonePresetPluckBright: "Pluck Bright",
    tonePresetPluckWarm: "Pluck Warm",
    previewChordButton: "Preview key",
    previewChordHint: "Switching key auto-plays a chord-free preview, and you can also preview manually.",
    previewButton: "Preview",
    voicingModeLabel: "Chord mode",
    voicingModeHint: "Choose between strict transposition and guitar-shape priority playback.",
    voicingModeOptionTranspose: "Strict transpose",
    voicingModeOptionGuitar: "Guitar shape priority",
    chordOrderTitle: "Chord Order",
    strumControlsTitle: "Strum Controls",
    guideTitle: "Guide",
    resetButton: "Reset",
    sampleLoadFailedFallback: "Sample load failed, using synth fallback.",
    sampleLoadFailedReload: "Acoustic samples failed to load. Check network and reload.",
    enableAudioHint: "Tap or press a key to enable audio",
    loadingSamplesWithPercent: ({ percent, tone }) => `Loading ${tone} samples... ${percent}%`,
    loadingSamples: ({ tone }) => `Loading ${tone} samples...`,
    audioReady: "Audio ready",
    allBuiltInChordsEnabled: "All built-in chords are enabled",
    addChordLabel: "Add chord:",
    addChordHint: ({ key, mode }) => `Key: ${key}, mode: ${mode}. Unavailable chords stay visible with reasons.`,
    addChordReasonAlreadyAdded: "Already in the chord order.",
    addChordReasonNoGuitarShape: ({ key }) =>
      `No built-in guitar-shape voicing for this key (${key}). Switch to Strict transpose mode.`,
    addChordReasonMissingVoicing: "Chord voicing is incomplete in the current library.",
    addChordReasonUnavailable: "Unavailable under current settings.",
    addButtonPrefix: "+",
    moveUpButton: "Up",
    moveDownButton: "Down",
    removeButton: "Remove",
    arpeggioTitle: "Auto arpeggio",
    arpeggioStartButton: "Start",
    arpeggioStopButton: "Stop",
    arpeggioStopNowButton: "Stop now",
    arpeggioStatusOn: "Running",
    arpeggioStatusStopping: "Stopping after current phrase",
    arpeggioStatusOff: "Stopped",
    arpeggioPatternLabel: "Pattern",
    arpeggioStepLabel: "Step (ms)",
    arpeggioImmediatePauseLabel: "Pause immediately (don't finish current phrase)",
    arpeggioHint: ({ key }) => `Toggle with ${key} on play page.`,
    arpeggioPatternFlow8: "Flow 8",
    arpeggioPatternPima8: "PIMA 8",
    arpeggioPatternAlternate8: "Alternate 8",
    arpeggioPatternWaltz6: "Waltz 6",
    arpeggioPatternBassRoll8: "Bass Roll 8",
    arpeggioPatternTravis8: "Travis 8",
    arpeggioPatternFolkPop8: "Folk Pop 8",
    arpeggioPatternPedalHigh8: "Pedal High 8",
    arpeggioPatternCross8: "Cross Pick 8",
    arpeggioPatternWave12: "Wave 12",
    arpeggioPatternBallad16: "Ballad 16",
    arpeggioLibraryTitle: "Arpeggio Library",
    arpeggioLibraryHint: ({ selected, total }) => `Select which patterns appear on play page (${selected}/${total}).`,
    arpeggioLibrarySequence: "Sequence",
    leftPanelExpandButton: "Show panel",
    leftPanelCollapseButton: "Hide panel",
    leftPanelExpandAriaLabel: "Expand left panel",
    leftPanelCollapseAriaLabel: "Collapse left panel",
    strumDelayLabel: "Hold key before continuous strum (ms)",
    strumAppliesTo: ({ keys }) => `Applies to ${keys}.`,
    stringGlobalDelayLabel: "Global hold delay before string repeat (ms)",
    perStringOverrideTitle: "Per-string override",
    perStringOverrideHint: "Leave an override blank to use the global delay. Per-string values have higher priority.",
    stringOverrideLabel: ({ stringNo, keyLabel }) => `String ${stringNo} (${keyLabel}) override (ms)`,
    useGlobalPlaceholder: "Use global",
    guideLine1: ({ cycleKey }) => `1. On the play page, press ${cycleKey} or tap the round button to switch chords.`,
    guideLine2: "2. All settings are saved automatically in your local browser.",
    guideLine3: "3. In Key settings, switching key runs a chord-free preview for quick comparison.",
    guideLine4: "4. In Chord Order and Add chord areas, use Preview to audition specific chords.",
    messageAddedChord: ({ chord }) => `Added ${chord}`,
    messageStrumDelaySet: ({ delay }) => `Continuous strum delay set to ${delay} ms.`,
    messageGlobalStringDelaySet: ({ delay }) => `Global string-key delay set to ${delay} ms.`,
    messageStringFollowGlobal: ({ stringNo, delay }) => `String ${stringNo} now follows global delay (${delay} ms).`,
    messageStringOverrideSet: ({ stringNo, delay }) => `String ${stringNo} override delay set to ${delay} ms.`,
    messageKeepAtLeastOneChord: "Keep at least one chord.",
    messageSettingsReset: "Settings reset to defaults.",
    messageLanguageUpdated: "Language updated.",
    messageKeyUpdated: ({ key }) => `Key set to ${key}.`,
    messageKeyPreviewPlayed: "Previewed key/tone.",
    messageToneLoading: ({ tone }) => `Loading ${tone}...`,
    messageToneUpdated: ({ tone }) => `Tone set to ${tone}.`,
    messageToneLoadFailed: ({ tone }) => `Failed to load ${tone}, switched to synth fallback.`,
    messageVoicingModeUpdated: ({ mode }) => `Chord mode set to ${mode}.`,
    messagePreviewPlayed: ({ chord }) => `Previewed ${chord}.`,
    messagePreviewFailed: "Could not start audio preview yet. Interact with the page and try again.",
    messageAddChordUnavailable: ({ chord, reason }) => `Cannot add ${chord}: ${reason}`,
    messageArpeggioOn: "Auto arpeggio enabled.",
    messageArpeggioOff: "Auto arpeggio disabled.",
    messageArpeggioNeedOneVisible: "Keep at least one arpeggio pattern visible on play page.",
    messageArpeggioVisibleUpdated: ({ count }) => `Play page now shows ${count} arpeggio pattern(s).`
  },
  [LANGUAGE_ZH_CN]: {
    openSettingsAriaLabel: "打开设置",
    currentChordLabel: "当前和弦",
    backToPlay: "返回演奏",
    settingsTitle: "设置",
    settingsSubtitle: "在这里管理和弦顺序与组合。",
    languageTitle: "语言",
    languageLabel: "界面语言",
    languageHint: "切换后立即生效，并自动保存。",
    languageOptionZh: "中文",
    languageOptionEn: "English",
    keyTitle: "调性",
    keyLabel: "当前调性",
    keyHint: "切换调性会转调和弦名称与每根弦的音符。",
    toneLabel: "内置音色",
    toneHint: "可从内置音色库选择，加载完成后立即生效。",
    previewToneButton: "试音音色",
    previewToneHint: "与调性试音一致：无和弦 8 拍试音，6->1 单弦后下扫、上扫。",
    tonePresetAcousticSteel: "原声钢弦",
    tonePresetAcousticNylon: "原声尼龙弦",
    tonePresetElectricClean: "电吉他清音",
    tonePresetElectricJazz: "电吉他爵士",
    tonePresetPluckBright: "明亮拨弦",
    tonePresetPluckWarm: "温暖拨弦",
    previewChordButton: "试音调性",
    previewChordHint: "切换调性会自动进行无和弦试音，也可点击按钮手动试音。",
    previewButton: "试音",
    voicingModeLabel: "和弦模式",
    voicingModeHint: "可选择严格转调，或优先保留吉他形状的播放模式。",
    voicingModeOptionTranspose: "严格转调",
    voicingModeOptionGuitar: "吉他形状优先",
    chordOrderTitle: "和弦顺序",
    strumControlsTitle: "拨弦控制",
    guideTitle: "使用说明",
    resetButton: "重置",
    sampleLoadFailedFallback: "采样加载失败，已切换到合成器备用音色。",
    sampleLoadFailedReload: "木吉他采样加载失败，请检查网络后刷新页面。",
    enableAudioHint: "点击屏幕或按下按键以启用音频",
    loadingSamplesWithPercent: ({ percent, tone }) => `正在加载 ${tone} 采样... ${percent}%`,
    loadingSamples: ({ tone }) => `正在加载 ${tone} 采样...`,
    audioReady: "音频已就绪",
    allBuiltInChordsEnabled: "内置和弦已全部启用",
    addChordLabel: "添加和弦：",
    addChordHint: ({ key, mode }) => `当前调性：${key}，模式：${mode}。不可用和弦会显示并标注原因。`,
    addChordReasonAlreadyAdded: "已在当前和弦顺序中。",
    addChordReasonNoGuitarShape: ({ key }) =>
      `当前调性（${key}）没有内置吉他指型。请切换到“严格转调”模式。`,
    addChordReasonMissingVoicing: "当前和弦库缺少完整的六弦发声配置。",
    addChordReasonUnavailable: "在当前设置下不可用。",
    addButtonPrefix: "+",
    moveUpButton: "上移",
    moveDownButton: "下移",
    removeButton: "移除",
    arpeggioTitle: "自动分解和弦",
    arpeggioStartButton: "启动",
    arpeggioStopButton: "停止",
    arpeggioStopNowButton: "\u7acb\u5373\u505c\u6b62",
    arpeggioStatusOn: "运行中",
    arpeggioStatusStopping: "\u64ad\u5b8c\u5f53\u524d\u8f6e\u540e\u505c\u6b62",
    arpeggioStatusOff: "已停止",
    arpeggioPatternLabel: "模板",
    arpeggioStepLabel: "步长 (ms)",
    arpeggioImmediatePauseLabel: "\u7acb\u5373\u6682\u505c\uff08\u4e0d\u7b49\u5f85\u5f53\u524d\u65cb\u5f8b\u64ad\u653e\u5b8c\uff09",
    arpeggioHint: ({ key }) => `在演奏页按 ${key} 可切换。`,
    arpeggioPatternFlow8: "流动 8",
    arpeggioPatternPima8: "PIMA 8",
    arpeggioPatternAlternate8: "交替 8",
    arpeggioPatternWaltz6: "华尔兹 6",
    arpeggioPatternBassRoll8: "低音滚奏 8",
    arpeggioPatternTravis8: "特拉维斯 8",
    arpeggioPatternFolkPop8: "民谣流行 8",
    arpeggioPatternPedalHigh8: "高音踏板 8",
    arpeggioPatternCross8: "交叉拨弦 8",
    arpeggioPatternWave12: "波浪 12",
    arpeggioPatternBallad16: "抒情 16",
    arpeggioLibraryTitle: "分解模板库",
    arpeggioLibraryHint: ({ selected, total }) => `选择要在演奏页显示的模板（${selected}/${total}）。`,
    arpeggioLibrarySequence: "序列",
    leftPanelExpandButton: "展开",
    leftPanelCollapseButton: "收起",
    leftPanelExpandAriaLabel: "展开左侧面板",
    leftPanelCollapseAriaLabel: "收起左侧面板",
    strumDelayLabel: "按住后进入连续扫弦的延时 (ms)",
    strumAppliesTo: ({ keys }) => `作用于 ${keys}。`,
    stringGlobalDelayLabel: "按住后进入连续拨弦的全局延时 (ms)",
    perStringOverrideTitle: "单弦覆盖延时",
    perStringOverrideHint: "留空表示使用全局延时；单弦覆盖值优先于全局值。",
    stringOverrideLabel: ({ stringNo, keyLabel }) => `弦 ${stringNo}（${keyLabel}）覆盖延时 (ms)`,
    useGlobalPlaceholder: "使用全局值",
    guideLine1: ({ cycleKey }) => `1. 在演奏页按 ${cycleKey} 或点击圆形按钮可切换和弦。`,
    guideLine2: "2. 所有设置都会自动保存到浏览器本地。",
    guideLine3: "3. 在调性设置中切换调性会自动进行无和弦试音，方便快速对比。",
    guideLine4: "4. 在和弦顺序与添加和弦区域可单独试音目标和弦。",
    messageAddedChord: ({ chord }) => `已添加 ${chord}`,
    messageStrumDelaySet: ({ delay }) => `连续扫弦延时已设置为 ${delay} ms。`,
    messageGlobalStringDelaySet: ({ delay }) => `全局字符串长按延时已设置为 ${delay} ms。`,
    messageStringFollowGlobal: ({ stringNo, delay }) => `弦 ${stringNo} 已改为使用全局延时（${delay} ms）。`,
    messageStringOverrideSet: ({ stringNo, delay }) => `弦 ${stringNo} 覆盖延时已设置为 ${delay} ms。`,
    messageKeepAtLeastOneChord: "至少保留一个和弦。",
    messageSettingsReset: "设置已恢复默认值。",
    messageLanguageUpdated: "语言已切换。",
    messageKeyUpdated: ({ key }) => `已切换到 ${key}。`,
    messageKeyPreviewPlayed: "已完成调性/音色试音。",
    messageToneLoading: ({ tone }) => `正在加载 ${tone}...`,
    messageToneUpdated: ({ tone }) => `音色已切换为 ${tone}。`,
    messageToneLoadFailed: ({ tone }) => `${tone} 加载失败，已切换到合成器后备音色。`,
    messageVoicingModeUpdated: ({ mode }) => `和弦模式已切换为：${mode}。`,
    messagePreviewPlayed: ({ chord }) => `已试音 ${chord}。`,
    messagePreviewFailed: "暂时无法启动试音音频，请先与页面交互后重试。",
    messageAddChordUnavailable: ({ chord, reason }) => `无法添加 ${chord}：${reason}`,
    messageArpeggioOn: "自动分解和弦已开启。",
    messageArpeggioOff: "自动分解和弦已关闭。",
    messageArpeggioNeedOneVisible: "演奏页至少保留一个可见分解模板。",
    messageArpeggioVisibleUpdated: ({ count }) => `演奏页当前显示 ${count} 个分解模板。`
  }
};

const state = {
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

const synths = new Map();
const acousticRouting = {
  sourceBus: null,
  dryBus: null,
  bodySend: null,
  ambienceSend: null
};
const releaseTimers = new Map();
const holdTimers = new Map();
const activeKeyHolds = new Map();
const activePointerHolds = new Map();
let toneLoadRequestId = 0;
let activePreviewRunId = 0;
let previewUnlockTimerId = null;
let arpeggioIntervalId = null;
let arpeggioStepCursor = 0;
let arpeggioLastChordId = null;
let arpeggioStopPending = false;
const refs = {};
const app = document.querySelector("#app");

if (!app) {
  throw new Error("#app not found");
}

loadSettings();
try {
  createSynths();
} catch (error) {
  console.error("Audio engine bootstrap failed, fallback to pluck synth.", error);
  const routing = createAcousticRouting();
  state.instrumentLoadError = true;
  state.instrumentReady = true;
  createFallbackSynths(routing);
}
bootstrapRoute();

window.addEventListener("hashchange", renderRoute);
window.addEventListener("keydown", handleGlobalKeydown);
window.addEventListener("keyup", handleGlobalKeyup);
window.addEventListener("blur", handleWindowBlur);
window.addEventListener("focus", handleWindowFocus);
window.addEventListener("resize", handleViewportResize);
window.addEventListener(
  "pointerdown",
  () => {
    void ensureAudioStarted();
  },
  { once: true }
);

function bootstrapRoute() {
  if (location.hash !== ROUTE_PLAY && location.hash !== ROUTE_SETTINGS) {
    location.hash = ROUTE_PLAY;
  }
  renderRoute();
}

function renderRoute() {
  stopAllStringHolds();
  clearRefs();

  const route = getRoute();
  updateBodyRouteClass(route);

  if (route === ROUTE_SETTINGS) {
    renderSettingsPage();
    syncArpeggioPlayback();
    return;
  }
  renderPlayPage();
  syncArpeggioPlayback();
}

function renderPlayPage() {
  ensureValidArpeggioPatternSelection();
  const visiblePatterns = getVisibleArpeggioPatterns();
  app.innerHTML = `
    <div class="play-root">
      <div class="play-frame">
        <button id="openSettingsBtn" class="menu-button" type="button" aria-label="${t("openSettingsAriaLabel")}">
          <span></span><span></span><span></span>
        </button>

        <div class="play-grid play-grid-drawer">
          <section id="leftColumn" class="left-column">
            <button id="leftPanelToggleBtn" class="left-panel-toggle-btn mini-btn" type="button"></button>
            <article class="chord-card">
              <p class="card-label">${t("currentChordLabel")}</p>
              <h1 id="currentChordName" class="chord-name">C</h1>
              <p id="currentChordNotes" class="chord-notes"></p>
              <p id="playHint" class="play-hint"></p>
              <p id="audioStatus" class="audio-status"></p>
              <div class="arpeggio-panel">
                <p class="arpeggio-title">${t("arpeggioTitle")}</p>
                <div class="arpeggio-head">
                  <button id="arpeggioToggleBtn" class="mini-btn" type="button"></button>
                  <span id="arpeggioStatusText" class="muted-text arpeggio-status"></span>
                </div>
                <label class="setting-line arpeggio-line" for="arpeggioPatternSelect">
                  <span>${t("arpeggioPatternLabel")}</span>
                  <select id="arpeggioPatternSelect" class="key-input key-select arpeggio-select">
                    ${visiblePatterns.map((pattern) => `
                      <option value="${pattern.id}" ${state.arpeggioPatternId === pattern.id ? "selected" : ""}>
                        ${t(pattern.labelKey)}
                      </option>
                    `).join("")}
                  </select>
                </label>
                <label class="setting-line arpeggio-line" for="arpeggioStepInput">
                  <span>${t("arpeggioStepLabel")}</span>
                  <input
                    id="arpeggioStepInput"
                    class="key-input arpeggio-step-input"
                    type="number"
                    min="${MIN_ARPEGGIO_STEP_MS}"
                    max="${MAX_ARPEGGIO_STEP_MS}"
                    step="5"
                    value="${state.arpeggioStepMs}"
                  />
                </label>
                <label class="setting-line arpeggio-line" for="arpeggioImmediatePauseCheckbox">
                  <span>${t("arpeggioImmediatePauseLabel")}</span>
                  <input id="arpeggioImmediatePauseCheckbox" type="checkbox" ${state.arpeggioPauseImmediate ? "checked" : ""} />
                </label>
                <p class="muted-text">${t("arpeggioHint", { key: `<kbd>${formatKeyLabel(ARPEGGIO_TOGGLE_KEY)}</kbd>` })}</p>
              </div>
            </article>

            <div class="cycle-zone">
              <button id="cycleButton" class="cycle-button" type="button">
                <span class="cycle-key" id="cycleButtonKey">A</span>
              </button>
            </div>
          </section>

          <section class="strings-panel">
            <div id="stringBoard" class="string-board"></div>
          </section>
        </div>
      </div>
    </div>
  `;

  refs.openSettingsBtn = document.getElementById("openSettingsBtn");
  refs.currentChordName = document.getElementById("currentChordName");
  refs.currentChordNotes = document.getElementById("currentChordNotes");
  refs.playHint = document.getElementById("playHint");
  refs.audioStatus = document.getElementById("audioStatus");
  refs.leftColumn = document.getElementById("leftColumn");
  refs.leftPanelToggleBtn = document.getElementById("leftPanelToggleBtn");
  refs.arpeggioToggleBtn = document.getElementById("arpeggioToggleBtn");
  refs.arpeggioStatusText = document.getElementById("arpeggioStatusText");
  refs.arpeggioPatternSelect = document.getElementById("arpeggioPatternSelect");
  refs.arpeggioStepInput = document.getElementById("arpeggioStepInput");
  refs.arpeggioImmediatePauseCheckbox = document.getElementById("arpeggioImmediatePauseCheckbox");
  refs.cycleButton = document.getElementById("cycleButton");
  refs.cycleButtonKey = document.getElementById("cycleButtonKey");
  refs.stringBoard = document.getElementById("stringBoard");

  refs.openSettingsBtn?.addEventListener("click", () => {
    location.hash = ROUTE_SETTINGS;
  });
  refs.cycleButton?.addEventListener("click", cycleChord);
  refs.leftPanelToggleBtn?.addEventListener("click", handleLeftPanelToggleClick);
  refs.arpeggioToggleBtn?.addEventListener("click", handleArpeggioToggleClick);
  refs.arpeggioPatternSelect?.addEventListener("change", handleArpeggioPatternChange);
  refs.arpeggioStepInput?.addEventListener("change", handleArpeggioStepChange);
  refs.arpeggioImmediatePauseCheckbox?.addEventListener("change", handleArpeggioImmediatePauseChange);

  refs.stringBoard?.addEventListener("pointerdown", handleStringBoardPointerDown);
  refs.stringBoard?.addEventListener("pointermove", handleStringBoardPointerMove);
  refs.stringBoard?.addEventListener("pointerup", handleStringBoardPointerEnd);
  refs.stringBoard?.addEventListener("pointercancel", handleStringBoardPointerEnd);
  refs.stringBoard?.addEventListener("lostpointercapture", handleStringBoardPointerEnd);

  renderCurrentChord();
  renderStringBoard();
  renderPlayHint();
  renderAudioStatus();
  renderArpeggioControls();
  renderLeftPanelLayout();
}

function renderSettingsPage() {
  app.innerHTML = `
    <div class="settings-root">
      <div class="settings-shell">
        <header class="settings-header">
          <button id="backToPlayBtn" class="back-button" type="button">${t("backToPlay")}</button>
          <h1>${t("settingsTitle")}</h1>
        </header>
        <p class="settings-subtitle">${t("settingsSubtitle")}</p>

        <section class="settings-card">
          <h2>${t("languageTitle")}</h2>
          <div id="languageSettings"></div>
        </section>

        <section class="settings-card">
          <h2>${t("keyTitle")}</h2>
          <div id="keySettings"></div>
        </section>

        <section class="settings-card">
          <h2>${t("chordOrderTitle")}</h2>
          <ul id="chordOrderList" class="chord-order-list"></ul>
          <div id="availableChords" class="available-chords"></div>
        </section>

        <section class="settings-card">
          <h2>${t("strumControlsTitle")}</h2>
          <div id="strumSettings"></div>
        </section>

        <section class="settings-card">
          <h2>${t("arpeggioLibraryTitle")}</h2>
          <div id="arpeggioSettings"></div>
        </section>

        <section class="settings-card">
          <h2>${t("guideTitle")}</h2>
          <div id="guideContent" class="guide-content"></div>
        </section>

        <div class="settings-footer">
          <button id="resetBtn" class="reset-btn" type="button">${t("resetButton")}</button>
          <span id="settingMessage" class="setting-message"></span>
        </div>
      </div>
    </div>
  `;

  refs.backToPlayBtn = document.getElementById("backToPlayBtn");
  refs.languageSettings = document.getElementById("languageSettings");
  refs.keySettings = document.getElementById("keySettings");
  refs.chordOrderList = document.getElementById("chordOrderList");
  refs.availableChords = document.getElementById("availableChords");
  refs.strumSettings = document.getElementById("strumSettings");
  refs.arpeggioSettings = document.getElementById("arpeggioSettings");
  refs.guideContent = document.getElementById("guideContent");
  refs.resetBtn = document.getElementById("resetBtn");
  refs.settingMessage = document.getElementById("settingMessage");

  refs.backToPlayBtn?.addEventListener("click", () => {
    location.hash = ROUTE_PLAY;
  });
  refs.languageSettings?.addEventListener("change", handleLanguageSettingsChange);
  refs.keySettings?.addEventListener("change", handleKeySettingsChange);
  refs.keySettings?.addEventListener("click", handleKeySettingsClick);
  refs.chordOrderList?.addEventListener("click", handleChordOrderClick);
  refs.availableChords?.addEventListener("click", handleAvailableChordClick);
  refs.strumSettings?.addEventListener("change", handleStrumSettingsChange);
  refs.arpeggioSettings?.addEventListener("change", handleArpeggioSettingsChange);
  refs.resetBtn?.addEventListener("click", handleReset);

  renderSettingsContent();
}

function renderSettingsContent() {
  renderLanguageSettings();
  renderKeySettings();
  renderChordOrderList();
  renderAvailableChords();
  renderStrumSettings();
  renderArpeggioSettings();
  renderGuide();
  syncPreviewButtonDisabledState();
}

function syncPreviewButtonDisabledState() {
  if (!app) {
    return;
  }
  const disabled = state.previewInProgress;
  const previewButtons = app.querySelectorAll(
    'button[data-action="preview"], button[data-action="preview-tone"], button[data-action="preview-chord"]'
  );
  previewButtons.forEach((button) => {
    if (button instanceof HTMLButtonElement) {
      button.disabled = disabled;
    }
  });
}

function setPreviewInProgress(nextInProgress) {
  if (state.previewInProgress === nextInProgress) {
    return;
  }
  state.previewInProgress = nextInProgress;
  syncPreviewButtonDisabledState();
}

function tryStartPreviewRun() {
  if (state.previewInProgress) {
    return null;
  }
  if (previewUnlockTimerId !== null) {
    clearTimeout(previewUnlockTimerId);
    previewUnlockTimerId = null;
  }
  const previewRunId = ++activePreviewRunId;
  setPreviewInProgress(true);
  return previewRunId;
}

function finishPreviewRun(previewRunId) {
  if (previewRunId !== activePreviewRunId) {
    return;
  }
  if (previewUnlockTimerId !== null) {
    clearTimeout(previewUnlockTimerId);
    previewUnlockTimerId = null;
  }
  setPreviewInProgress(false);
}

function schedulePreviewRunCompletion(previewRunId, durationMs) {
  if (previewRunId !== activePreviewRunId) {
    return;
  }
  if (previewUnlockTimerId !== null) {
    clearTimeout(previewUnlockTimerId);
  }
  const safeDurationMs = Math.max(0, durationMs) + PREVIEW_LOCK_TAIL_MS;
  previewUnlockTimerId = setTimeout(() => {
    if (previewRunId !== activePreviewRunId) {
      return;
    }
    previewUnlockTimerId = null;
    setPreviewInProgress(false);
  }, safeDurationMs);
}

function renderCurrentChord() {
  if (!refs.currentChordName || !refs.currentChordNotes) {
    return;
  }
  const chordId = getCurrentChord();
  refs.currentChordName.textContent = getDisplayChordLabel(chordId);
  refs.currentChordNotes.textContent = getChordNotes(chordId).join(" \u00B7 ");
}

function renderStringBoard() {
  if (!refs.stringBoard) {
    return;
  }

  const chord = getCurrentChord();
  refs.stringBoard.innerHTML = DISPLAY_STRING_ORDER.map((stringNo) => {
    const note = getStringNote(chord, stringNo);
    const thickness = (1 + stringNo * 0.85).toFixed(2);
    return `
      <button class="string-row" type="button" data-string="${stringNo}" style="--string-size:${thickness}px">
        <span class="string-number">${stringNo}</span>
        <span class="string-line"></span>
        <span class="string-note">${note}</span>
      </button>
    `;
  }).join("");
}

function renderPlayHint() {
  if (!refs.playHint || !refs.cycleButtonKey) {
    return;
  }

  refs.cycleButtonKey.textContent = formatKeyLabel(state.cycleKey);
  refs.playHint.textContent = "";
}

function renderAudioStatus() {
  if (!refs.audioStatus) {
    return;
  }

  if (state.instrumentLoadError) {
    refs.audioStatus.textContent = state.instrumentReady
      ? t("sampleLoadFailedFallback")
      : t("sampleLoadFailedReload");
    return;
  }

  if (!state.audioReady) {
    refs.audioStatus.textContent = t("enableAudioHint");
    return;
  }

  if (!state.instrumentReady) {
    const tone = getTonePresetLabel(state.tonePresetId);
    const progress = state.instrumentLoadProgress;
    if (progress && progress.total > 0) {
      const percent = Math.min(100, Math.round((progress.loaded / progress.total) * 100));
      refs.audioStatus.textContent = t("loadingSamplesWithPercent", { percent, tone });
      return;
    }
    refs.audioStatus.textContent = t("loadingSamples", { tone });
    return;
  }

  refs.audioStatus.textContent = t("audioReady");
}

function renderArpeggioControls() {
  if (!refs.arpeggioToggleBtn || !refs.arpeggioPatternSelect || !refs.arpeggioStepInput || !refs.arpeggioStatusText) {
    return;
  }
  ensureValidArpeggioPatternSelection();

  if (state.arpeggioEnabled) {
    refs.arpeggioToggleBtn.textContent = arpeggioStopPending
      ? t("arpeggioStopNowButton")
      : t("arpeggioStopButton");
    refs.arpeggioStatusText.textContent = arpeggioStopPending
      ? t("arpeggioStatusStopping")
      : t("arpeggioStatusOn");
  } else {
    refs.arpeggioToggleBtn.textContent = t("arpeggioStartButton");
    refs.arpeggioStatusText.textContent = t("arpeggioStatusOff");
  }
  refs.arpeggioPatternSelect.value = state.arpeggioPatternId;
  refs.arpeggioStepInput.value = String(state.arpeggioStepMs);
  if (refs.arpeggioImmediatePauseCheckbox instanceof HTMLInputElement) {
    refs.arpeggioImmediatePauseCheckbox.checked = state.arpeggioPauseImmediate;
  }
}

function isCompactPlayLayout() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(MOBILE_PLAY_LAYOUT_QUERY).matches;
}

function renderLeftPanelLayout() {
  if (!refs.leftColumn || !refs.leftPanelToggleBtn || getRoute() !== ROUTE_PLAY) {
    return;
  }

  const compactLayout = isCompactPlayLayout();
  const collapsed = compactLayout && state.leftPanelCollapsed;
  refs.leftColumn.classList.toggle("collapsed", collapsed);
  refs.leftPanelToggleBtn.hidden = !compactLayout;
  refs.leftPanelToggleBtn.textContent = collapsed ? ">" : "<";
  refs.leftPanelToggleBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
  refs.leftPanelToggleBtn.setAttribute(
    "aria-label",
    collapsed ? t("leftPanelExpandAriaLabel") : t("leftPanelCollapseAriaLabel")
  );
  refs.leftPanelToggleBtn.setAttribute(
    "title",
    collapsed ? t("leftPanelExpandButton") : t("leftPanelCollapseButton")
  );
}

function getArpeggioPattern(patternId) {
  return ARPEGGIO_PATTERN_BY_ID.get(normalizeArpeggioPatternId(patternId)) ?? ARPEGGIO_PATTERNS[0];
}

function normalizeArpeggioPatternId(patternId) {
  if (typeof patternId !== "string" || !patternId) {
    return DEFAULT_ARPEGGIO_PATTERN_ID;
  }
  return ARPEGGIO_PATTERN_BY_ID.has(patternId) ? patternId : DEFAULT_ARPEGGIO_PATTERN_ID;
}

function normalizeArpeggioVisiblePatternIds(patternIds) {
  if (!Array.isArray(patternIds)) {
    return [...DEFAULT_ARPEGGIO_VISIBLE_PATTERN_IDS];
  }

  const normalized = [];
  const seen = new Set();
  patternIds.forEach((patternId) => {
    if (typeof patternId !== "string" || !ARPEGGIO_PATTERN_BY_ID.has(patternId) || seen.has(patternId)) {
      return;
    }
    seen.add(patternId);
    normalized.push(patternId);
  });

  if (normalized.length > 0) {
    return normalized;
  }
  return [...DEFAULT_ARPEGGIO_VISIBLE_PATTERN_IDS];
}

function getVisibleArpeggioPatterns() {
  const visibleIds = normalizeArpeggioVisiblePatternIds(state.arpeggioVisiblePatternIds);
  return visibleIds
    .map((patternId) => ARPEGGIO_PATTERN_BY_ID.get(patternId))
    .filter((pattern) => Boolean(pattern));
}

function ensureValidArpeggioPatternSelection() {
  state.arpeggioVisiblePatternIds = normalizeArpeggioVisiblePatternIds(state.arpeggioVisiblePatternIds);
  const visibleIdSet = new Set(state.arpeggioVisiblePatternIds);
  if (visibleIdSet.has(state.arpeggioPatternId)) {
    return;
  }
  state.arpeggioPatternId = state.arpeggioVisiblePatternIds[0];
}

function normalizeArpeggioStepMs(value) {
  return normalizeDelayMs(
    value,
    DEFAULT_ARPEGGIO_STEP_MS,
    MIN_ARPEGGIO_STEP_MS,
    MAX_ARPEGGIO_STEP_MS
  );
}

function stopArpeggioPlayback() {
  if (arpeggioIntervalId !== null) {
    clearInterval(arpeggioIntervalId);
    arpeggioIntervalId = null;
  }
}

function requestArpeggioStop(options = {}) {
  const { showMessage = false } = options;
  if (!state.arpeggioEnabled) {
    return;
  }

  if (state.arpeggioPauseImmediate || arpeggioStopPending) {
    setArpeggioEnabled(false, { showMessage });
    return;
  }

  arpeggioStopPending = true;
  renderArpeggioControls();
}

function toggleArpeggioPlaybackFromInput(options = {}) {
  if (state.arpeggioEnabled) {
    requestArpeggioStop(options);
    return;
  }
  setArpeggioEnabled(true, options);
}

function triggerArpeggioStep() {
  if (!state.arpeggioEnabled) {
    return;
  }

  const chord = getCurrentChord();
  if (chord !== arpeggioLastChordId) {
    arpeggioStepCursor = 0;
    arpeggioLastChordId = chord;
  }

  const pattern = getArpeggioPattern(state.arpeggioPatternId);
  const stepSequence = Array.isArray(pattern.sequence) ? pattern.sequence : [];
  if (stepSequence.length === 0) {
    return;
  }

  const stepPosition = arpeggioStepCursor % stepSequence.length;
  const stopAfterCurrentStep = arpeggioStopPending && stepPosition === stepSequence.length - 1;
  const stringNo = stepSequence[stepPosition];
  arpeggioStepCursor += 1;
  if (!STRING_ORDER.includes(stringNo)) {
    if (stopAfterCurrentStep) {
      setArpeggioEnabled(false, { showMessage: false });
    }
    return;
  }

  const note = getStringNote(chord, stringNo);
  if (!note) {
    if (stopAfterCurrentStep) {
      setArpeggioEnabled(false, { showMessage: false });
    }
    return;
  }

  const triggerTime = Tone.now() + ARPEGGIO_LOOKAHEAD_SECONDS;
  const stepMs = normalizeArpeggioStepMs(state.arpeggioStepMs);
  const noteDurationSeconds = Math.max(0.04, (stepMs / 1000) * ARPEGGIO_NOTE_RATIO);
  const highlightDurationMs = Math.max(70, Math.min(170, Math.round(stepMs * 0.9)));
  scheduleStringAttack(
    stringNo,
    triggerTime,
    ARPEGGIO_LOOKAHEAD_SECONDS * 1000,
    note,
    noteDurationSeconds,
    highlightDurationMs
  );
  if (stopAfterCurrentStep) {
    setArpeggioEnabled(false, { showMessage: false });
  }
}

async function startArpeggioPlayback() {
  stopArpeggioPlayback();
  if (!state.arpeggioEnabled || getRoute() !== ROUTE_PLAY) {
    return;
  }

  try {
    await ensureAudioStarted();
  } catch {
    return;
  }

  arpeggioStepCursor = 0;
  arpeggioLastChordId = getCurrentChord();
  triggerArpeggioStep();

  const stepMs = normalizeArpeggioStepMs(state.arpeggioStepMs);
  arpeggioIntervalId = setInterval(() => {
    triggerArpeggioStep();
  }, stepMs);
}

function syncArpeggioPlayback() {
  if (state.arpeggioEnabled && getRoute() === ROUTE_PLAY) {
    void startArpeggioPlayback();
    return;
  }
  stopArpeggioPlayback();
}

function setArpeggioEnabled(nextEnabled, options = {}) {
  const { showMessage = false } = options;
  const normalized = Boolean(nextEnabled);
  if (state.arpeggioEnabled === normalized) {
    return;
  }

  arpeggioStopPending = false;
  state.arpeggioEnabled = normalized;
  saveSettings();
  renderArpeggioControls();
  syncArpeggioPlayback();

  if (!showMessage) {
    return;
  }
  setSettingMessage(
    normalized ? t("messageArpeggioOn") : t("messageArpeggioOff"),
    "ok"
  );
}

function handleArpeggioToggleClick() {
  toggleArpeggioPlaybackFromInput({ showMessage: false });
}

function handleArpeggioPatternChange(event) {
  const select = event.target;
  if (!(select instanceof HTMLSelectElement) || select.id !== "arpeggioPatternSelect") {
    return;
  }

  const nextPatternId = select.value;
  if (!ARPEGGIO_PATTERN_BY_ID.has(nextPatternId)) {
    select.value = state.arpeggioPatternId;
    return;
  }

  if (!state.arpeggioVisiblePatternIds.includes(nextPatternId)) {
    select.value = state.arpeggioPatternId;
    return;
  }

  select.value = nextPatternId;
  if (nextPatternId === state.arpeggioPatternId) {
    return;
  }

  state.arpeggioPatternId = nextPatternId;
  saveSettings();
  renderArpeggioControls();
  if (state.arpeggioEnabled) {
    void startArpeggioPlayback();
  }
}

function handleArpeggioStepChange(event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.id !== "arpeggioStepInput") {
    return;
  }

  const rawStep = Number(input.value);
  if (!Number.isFinite(rawStep)) {
    input.value = String(state.arpeggioStepMs);
    return;
  }

  const nextStep = normalizeArpeggioStepMs(rawStep);
  input.value = String(nextStep);
  if (nextStep === state.arpeggioStepMs) {
    return;
  }

  state.arpeggioStepMs = nextStep;
  saveSettings();
  renderArpeggioControls();
  if (state.arpeggioEnabled) {
    void startArpeggioPlayback();
  }
}

function handleArpeggioImmediatePauseChange(event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.id !== "arpeggioImmediatePauseCheckbox") {
    return;
  }

  const nextValue = Boolean(input.checked);
  if (nextValue === state.arpeggioPauseImmediate) {
    return;
  }

  state.arpeggioPauseImmediate = nextValue;
  saveSettings();
  renderArpeggioControls();
}

function renderLanguageSettings() {
  if (!refs.languageSettings) {
    return;
  }

  refs.languageSettings.innerHTML = `
    <label class="setting-line" for="languageSelect">
      <span>${t("languageLabel")}</span>
      <select id="languageSelect" class="key-input language-select">
        <option value="${LANGUAGE_ZH_CN}" ${state.language === LANGUAGE_ZH_CN ? "selected" : ""}>${t("languageOptionZh")}</option>
        <option value="${LANGUAGE_EN_US}" ${state.language === LANGUAGE_EN_US ? "selected" : ""}>${t("languageOptionEn")}</option>
      </select>
    </label>
    <p class="muted-text">${t("languageHint")}</p>
  `;
}

function renderKeySettings() {
  if (!refs.keySettings) {
    return;
  }
  const previewDisabledAttr = state.previewInProgress ? "disabled" : "";

  refs.keySettings.innerHTML = `
    <label class="setting-line" for="keySignatureSelect">
      <span>${t("keyLabel")}</span>
      <select id="keySignatureSelect" class="key-input key-select">
        ${AVAILABLE_KEY_SIGNATURES.map((keySignature) => `
          <option value="${keySignature}" ${state.keySignature === keySignature ? "selected" : ""}>
            ${formatKeySignatureLabel(keySignature)}
          </option>
        `).join("")}
      </select>
    </label>
    <p class="muted-text">${t("keyHint")}</p>

    <label class="setting-line" for="chordVoicingModeSelect">
      <span>${t("voicingModeLabel")}</span>
      <select id="chordVoicingModeSelect" class="key-input key-select">
        ${AVAILABLE_CHORD_VOICING_MODES.map((mode) => `
          <option value="${mode}" ${state.chordVoicingMode === mode ? "selected" : ""}>
            ${getChordVoicingModeLabel(mode)}
          </option>
        `).join("")}
      </select>
    </label>
    <p class="muted-text">${t("voicingModeHint")}</p>

    <label class="setting-line" for="tonePresetSelect">
      <span>${t("toneLabel")}</span>
      <select id="tonePresetSelect" class="key-input key-select">
        ${TONE_PRESETS.map((preset) => `
          <option value="${preset.id}" ${state.tonePresetId === preset.id ? "selected" : ""}>
            ${getTonePresetLabel(preset.id)}
          </option>
        `).join("")}
      </select>
    </label>
    <p class="muted-text">${t("toneHint")}</p>

    <button class="mini-btn" type="button" data-action="preview-tone" ${previewDisabledAttr}>${t("previewToneButton")}</button>
    <p class="muted-text">${t("previewToneHint")}</p>

    <button class="mini-btn" type="button" data-action="preview-chord" ${previewDisabledAttr}>${t("previewChordButton")}</button>
    <p class="muted-text">${t("previewChordHint")}</p>
  `;
}

function renderChordOrderList() {
  if (!refs.chordOrderList) {
    return;
  }
  const previewDisabledAttr = state.previewInProgress ? "disabled" : "";

  refs.chordOrderList.innerHTML = state.sequence.map((chord, index) => {
    return `
      <li class="chord-order-item">
        <span>${index + 1}. ${getDisplayChordLabel(chord)}</span>
        <div class="item-actions">
          <button class="mini-btn" type="button" data-action="preview" data-index="${index}" ${previewDisabledAttr}>${t("previewButton")}</button>
          <button class="mini-btn" type="button" data-action="up" data-index="${index}">${t("moveUpButton")}</button>
          <button class="mini-btn" type="button" data-action="down" data-index="${index}">${t("moveDownButton")}</button>
          <button class="mini-btn danger" type="button" data-action="remove" data-index="${index}">${t("removeButton")}</button>
        </div>
      </li>
    `;
  }).join("");
}

function renderAvailableChords() {
  if (!refs.availableChords) {
    return;
  }
  const previewDisabledAttr = state.previewInProgress ? "disabled" : "";
  const allChords = getSortedChordCatalog();
  if (allChords.length === 0) {
    refs.availableChords.innerHTML = `<span class="muted-text">${t("allBuiltInChordsEnabled")}</span>`;
    return;
  }

  const modeLabel = getChordVoicingModeLabel(state.chordVoicingMode);
  const keyLabel = formatKeySignatureLabel(state.keySignature);

  refs.availableChords.innerHTML = `
    <p class="muted-text available-chords-title">${t("addChordLabel")}</p>
    <p class="muted-text">${t("addChordHint", { key: keyLabel, mode: modeLabel })}</p>
    <div class="available-chords-list">
      ${allChords.map((chord) => {
        const displayChord = getDisplayChordLabel(chord);
        const availability = evaluateAddableChord(chord);
        const addDisabledAttr = availability.canAdd ? "" : "disabled";
        const unavailableClass = availability.canAdd ? "" : " unavailable";
        const reason = availability.reasonKey ? t(availability.reasonKey, availability.reasonParams ?? {}) : "";
        return `
          <div class="available-chord-row${unavailableClass}">
            <div class="available-chord-meta">
              <span class="available-chord-name">${displayChord}</span>
              ${reason ? `<span class="available-chord-reason muted-text">${reason}</span>` : ""}
            </div>
            <div class="available-chord-actions">
              <button class="mini-btn add-btn" type="button" data-action="preview" data-chord="${chord}" ${previewDisabledAttr}>
                ${t("previewButton")}
              </button>
              <button class="mini-btn add-btn" type="button" data-action="add" data-chord="${chord}" ${addDisabledAttr}>
                ${t("addButtonPrefix")} ${displayChord}
              </button>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function getStringHoldDelayOverrideValue(stringNo) {
  const override = state.stringHoldDelayOverridesMs[stringNo];
  return Number.isFinite(override) ? String(override) : "";
}

function getStringOverrideLabelParts(stringNo, keyLabel) {
  if (state.language === LANGUAGE_ZH_CN) {
    return {
      stringText: `弦 ${stringNo}`,
      keyText: `（${keyLabel}）`,
      delayText: "覆盖延时 (ms)"
    };
  }
  return {
    stringText: `String ${stringNo}`,
    keyText: `(${keyLabel})`,
    delayText: "override (ms)"
  };
}

function renderStrumSettings() {
  if (!refs.strumSettings) {
    return;
  }

  const overrideRows = STRING_ORDER.map((stringNo) => {
    const keyLabel = formatKeyLabel(state.stringKeys[stringNo]);
    const labelParts = getStringOverrideLabelParts(stringNo, keyLabel);
    return `
      <label class="setting-line setting-line-compact string-override-line" for="stringHoldDelayOverrideInput-${stringNo}">
        <span class="string-override-label">
          <span class="string-override-string">${labelParts.stringText}</span>
          <span class="string-override-key">${labelParts.keyText}</span>
          <span class="string-override-delay-text">${labelParts.delayText}</span>
        </span>
        <input
          id="stringHoldDelayOverrideInput-${stringNo}"
          class="key-input string-override-input"
          type="number"
          min="${MIN_STRING_HOLD_DELAY_MS}"
          max="${MAX_STRING_HOLD_DELAY_MS}"
          step="10"
          data-string-hold-delay="${stringNo}"
          placeholder="${t("useGlobalPlaceholder")}"
          aria-label="${t("stringOverrideLabel", { stringNo, keyLabel })}"
          value="${getStringHoldDelayOverrideValue(stringNo)}"
        />
      </label>
    `;
  }).join("");

  const strumKeys = `<kbd>${formatKeyLabel(STRUM_DOWN_KEY)}</kbd> / <kbd>${formatKeyLabel(STRUM_UP_KEY)}</kbd>`;
  const stringKeys = STRING_ORDER.map((stringNo) => `<kbd>${formatKeyLabel(state.stringKeys[stringNo])}</kbd>`).join(" / ");

  refs.strumSettings.innerHTML = `
    <div class="strum-settings-grid">
      <label class="setting-line" for="strumHoldDelayInput">
        <span>${t("strumDelayLabel")}</span>
        <input
          id="strumHoldDelayInput"
          class="key-input"
          type="number"
          min="${MIN_STRUM_HOLD_DELAY_MS}"
          max="${MAX_STRUM_HOLD_DELAY_MS}"
          step="10"
          value="${state.strumHoldDelayMs}"
        />
      </label>
      <p class="muted-text">${t("strumAppliesTo", { keys: strumKeys })}</p>

      <label class="setting-line" for="stringHoldDelayGlobalInput">
        <span>${t("stringGlobalDelayLabel")}</span>
        <input
          id="stringHoldDelayGlobalInput"
          class="key-input"
          type="number"
          min="${MIN_STRING_HOLD_DELAY_MS}"
          max="${MAX_STRING_HOLD_DELAY_MS}"
          step="10"
          value="${state.stringHoldDelayMs}"
        />
      </label>
      <p class="muted-text">${t("strumAppliesTo", { keys: stringKeys })}</p>

      <p class="strum-setting-title">${t("perStringOverrideTitle")}</p>
      <div class="strum-override-list">
        ${overrideRows}
      </div>
      <p class="muted-text">${t("perStringOverrideHint")}</p>
    </div>
  `;
}

function renderArpeggioSettings() {
  if (!refs.arpeggioSettings) {
    return;
  }

  const visibleIds = normalizeArpeggioVisiblePatternIds(state.arpeggioVisiblePatternIds);
  const visibleIdSet = new Set(visibleIds);
  const selectedCount = visibleIds.length;
  const totalCount = ARPEGGIO_PATTERNS.length;

  refs.arpeggioSettings.innerHTML = `
    <div class="arpeggio-settings-grid">
      <p class="muted-text">${t("arpeggioLibraryHint", { selected: selectedCount, total: totalCount })}</p>
      <div class="arpeggio-pattern-list">
        ${ARPEGGIO_PATTERNS.map((pattern) => {
          const checked = visibleIdSet.has(pattern.id);
          const disabled = checked && selectedCount <= 1;
          return `
            <label class="arpeggio-pattern-row" for="arpeggioVisiblePattern-${pattern.id}">
              <span class="arpeggio-pattern-main">
                <input
                  id="arpeggioVisiblePattern-${pattern.id}"
                  type="checkbox"
                  data-arpeggio-visible-id="${pattern.id}"
                  ${checked ? "checked" : ""}
                  ${disabled ? "disabled" : ""}
                />
                <span class="arpeggio-pattern-name">${t(pattern.labelKey)}</span>
              </span>
              <span class="muted-text arpeggio-pattern-seq">${t("arpeggioLibrarySequence")}: ${pattern.sequence.join(" - ")}</span>
            </label>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderGuide() {
  if (!refs.guideContent) {
    return;
  }

  refs.guideContent.innerHTML = `
    <p>${t("guideLine1", { cycleKey: `<kbd>${formatKeyLabel(state.cycleKey)}</kbd>` })}</p>
    <p>${t("guideLine2")}</p>
    <p>${t("guideLine3")}</p>
    <p>${t("guideLine4")}</p>
  `;
}

function normalizeSequenceState() {
  const sourceSequence = Array.isArray(state.sequence) ? state.sequence : [];
  const normalizedSequence = [];
  const seen = new Set();

  sourceSequence.forEach((chord) => {
    if (!CHORD_LIBRARY[chord] || seen.has(chord)) {
      return;
    }
    seen.add(chord);
    normalizedSequence.push(chord);
  });

  state.sequence = normalizedSequence.length > 0 ? normalizedSequence : [...DEFAULT_SEQUENCE];

  const rawIndex = Number.isInteger(state.currentIndex) ? state.currentIndex : 0;
  state.currentIndex = Math.min(Math.max(rawIndex, 0), state.sequence.length - 1);

  if (!CHORD_LIBRARY[state.sequence[state.currentIndex]]) {
    state.currentIndex = 0;
  }
}

function cycleChord() {
  normalizeSequenceState();
  state.currentIndex = (state.currentIndex + 1) % state.sequence.length;
  saveSettings();
  renderCurrentChord();
  renderStringBoard();
  renderPlayHint();
  pulseChordName();
}

function getCurrentChord() {
  normalizeSequenceState();
  return state.sequence[state.currentIndex];
}

function getDisplayChordName(chord) {
  const semitoneShift = getKeyTransposeSemitoneOffset();
  const preferFlats = FLAT_KEY_SIGNATURES.has(state.keySignature);
  return transposeChordSymbol(chord, semitoneShift, preferFlats);
}

function formatChordLabelForUi(chordSymbol) {
  if (typeof chordSymbol !== "string" || !chordSymbol) {
    return "";
  }

  const [mainPart, bassPartRaw] = chordSymbol.split("/");
  const rootMatch = /^([A-G](?:#|b)?)(.*)$/.exec(mainPart);
  if (!rootMatch) {
    return chordSymbol;
  }

  const [, rootPitchClass, suffixRaw] = rootMatch;
  const formattedSuffix = suffixRaw
    .replace(/(add\d+)/g, " $1")
    .replace(/(sus[24])/g, " $1")
    .trim();
  const mainLabel = `${rootPitchClass}${formattedSuffix ? ` ${formattedSuffix}` : ""}`;
  if (typeof bassPartRaw !== "string") {
    return mainLabel;
  }
  return `${mainLabel}/${bassPartRaw}`;
}

function getDisplayChordLabel(chord) {
  return formatChordLabelForUi(getDisplayChordName(chord));
}

function getSortedChordCatalog() {
  return Object.keys(CHORD_LIBRARY).sort((leftChord, rightChord) => {
    const leftLabel = getDisplayChordLabel(leftChord);
    const rightLabel = getDisplayChordLabel(rightChord);
    return leftLabel.localeCompare(rightLabel, "en", { numeric: true, sensitivity: "base" });
  });
}

function evaluateAddableChord(chord) {
  if (!chord || !CHORD_LIBRARY[chord]) {
    return {
      canAdd: false,
      reasonKey: "addChordReasonMissingVoicing",
      reasonParams: {}
    };
  }

  if (state.sequence.includes(chord)) {
    return {
      canAdd: false,
      reasonKey: "addChordReasonAlreadyAdded",
      reasonParams: {}
    };
  }

  const notes = getChordNotes(chord);
  if (notes.length !== STRING_ORDER.length || notes.some((note) => !note)) {
    return {
      canAdd: false,
      reasonKey: "addChordReasonMissingVoicing",
      reasonParams: {}
    };
  }

  if (state.chordVoicingMode === CHORD_VOICING_MODE_GUITAR) {
    const displaySymbol = getDisplayChordName(chord);
    const preferredChordId = findChordIdByDisplaySymbol(displaySymbol);
    if (!preferredChordId) {
      return {
        canAdd: false,
        reasonKey: "addChordReasonNoGuitarShape",
        reasonParams: {
          key: formatKeySignatureLabel(state.keySignature)
        }
      };
    }
  }

  return {
    canAdd: true,
    reasonKey: "",
    reasonParams: {}
  };
}

function getChordNotes(chord) {
  const notes = CHORD_LIBRARY[chord];
  if (!Array.isArray(notes)) {
    return [];
  }

  if (state.chordVoicingMode === CHORD_VOICING_MODE_GUITAR) {
    const preferredNotes = getPreferredGuitarShapeNotes(chord);
    if (preferredNotes.length > 0) {
      return preferredNotes;
    }
  }

  return getTransposedChordNotes(chord);
}

function getTransposedChordNotes(chord) {
  const notes = CHORD_LIBRARY[chord];
  if (!Array.isArray(notes)) {
    return [];
  }

  const semitoneShift = getKeyTransposeSemitoneOffset();
  const preferFlats = FLAT_KEY_SIGNATURES.has(state.keySignature);
  return notes.map((note) => transposeNote(note, semitoneShift, preferFlats) ?? note);
}

function getPreferredGuitarShapeNotes(chord) {
  const targetChordSymbol = getDisplayChordName(chord);
  const preferredChordId = findChordIdByDisplaySymbol(targetChordSymbol);
  if (!preferredChordId) {
    return [];
  }

  const preferredNotes = CHORD_LIBRARY[preferredChordId];
  if (!Array.isArray(preferredNotes)) {
    return [];
  }
  return [...preferredNotes];
}

function getStringNote(chord, stringNo) {
  const notes = getChordNotes(chord);
  const index = STRING_ORDER.indexOf(stringNo);
  return notes[index];
}

function getKeyTransposeSemitoneOffset() {
  const semitone = getPitchClassSemitone(state.keySignature);
  if (!Number.isInteger(semitone)) {
    return 0;
  }
  return semitone > 6 ? semitone - 12 : semitone;
}

function formatKeySignatureLabel(keySignature) {
  if (state.language === LANGUAGE_ZH_CN) {
    return `${keySignature} 大调`;
  }
  return `${keySignature} Major`;
}

function getChordVoicingModeLabel(mode) {
  if (mode === CHORD_VOICING_MODE_GUITAR) {
    return t("voicingModeOptionGuitar");
  }
  return t("voicingModeOptionTranspose");
}

function normalizeKeySignature(value) {
  if (typeof value !== "string" || !value) {
    return DEFAULT_KEY_SIGNATURE;
  }
  const trimmed = value.trim();
  if (!AVAILABLE_KEY_SIGNATURES.includes(trimmed)) {
    return DEFAULT_KEY_SIGNATURE;
  }
  return trimmed;
}

function normalizeChordVoicingMode(value) {
  if (typeof value !== "string" || !value) {
    return DEFAULT_CHORD_VOICING_MODE;
  }
  if (!AVAILABLE_CHORD_VOICING_MODES.includes(value)) {
    return DEFAULT_CHORD_VOICING_MODE;
  }
  return value;
}

function normalizeTonePresetId(value) {
  if (typeof value !== "string" || !value) {
    return DEFAULT_TONE_PRESET_ID;
  }
  return TONE_PRESET_BY_ID.has(value) ? value : DEFAULT_TONE_PRESET_ID;
}

function getTonePreset(presetId) {
  return TONE_PRESET_BY_ID.get(normalizeTonePresetId(presetId)) ?? TONE_PRESET_BY_ID.get(DEFAULT_TONE_PRESET_ID);
}

function getTonePresetLabel(presetId) {
  const preset = getTonePreset(presetId);
  return t(preset?.labelKey ?? "tonePresetAcousticSteel");
}

function getPitchClassSemitone(pitchClass) {
  return PITCH_CLASS_TO_SEMITONE[pitchClass] ?? null;
}

function normalizePitchClassToken(token) {
  if (typeof token !== "string" || !token) {
    return null;
  }

  const trimmed = token.trim();
  if (!trimmed) {
    return null;
  }

  if (/^[#b][A-G]$/.test(trimmed)) {
    return `${trimmed[1]}${trimmed[0]}`;
  }

  if (/^[A-G](?:#|b)?$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

function normalizeChordSymbolForLookup(chordSymbol) {
  if (typeof chordSymbol !== "string" || !chordSymbol) {
    return null;
  }

  const [mainPartRaw, bassPartRaw] = chordSymbol.trim().split("/");
  const rootMatch = /^([A-G](?:#|b)?)(.*)$/.exec(mainPartRaw);
  if (!rootMatch) {
    return null;
  }

  const [, rootPitchClass, suffix] = rootMatch;
  const normalizedRoot = normalizePitchClassToken(rootPitchClass);
  if (!normalizedRoot) {
    return null;
  }

  let normalized = `${normalizedRoot}${suffix}`;
  if (typeof bassPartRaw !== "string") {
    return normalized;
  }

  const normalizedBass = normalizePitchClassToken(bassPartRaw.trim());
  normalized += normalizedBass ? `/${normalizedBass}` : `/${bassPartRaw.trim()}`;
  return normalized;
}

function createChordLibraryLookup() {
  const lookup = new Map();
  Object.keys(CHORD_LIBRARY).forEach((chordId) => {
    const normalized = normalizeChordSymbolForLookup(chordId);
    if (!normalized || lookup.has(normalized)) {
      return;
    }
    lookup.set(normalized, chordId);
  });
  return lookup;
}

function findChordIdByDisplaySymbol(chordSymbol) {
  const normalized = normalizeChordSymbolForLookup(chordSymbol);
  if (!normalized) {
    return null;
  }
  return CHORD_LIBRARY_LOOKUP.get(normalized) ?? null;
}

function transposePitchClass(pitchClass, semitoneShift, preferFlats) {
  const normalizedPitchClass = normalizePitchClassToken(pitchClass);
  if (!normalizedPitchClass) {
    return null;
  }

  const semitone = getPitchClassSemitone(normalizedPitchClass);
  if (!Number.isInteger(semitone)) {
    return null;
  }

  const nextIndex = ((semitone + semitoneShift) % 12 + 12) % 12;
  const table = preferFlats ? SEMITONE_TO_FLAT : SEMITONE_TO_SHARP;
  return table[nextIndex];
}

function transposeChordSymbol(chordSymbol, semitoneShift, preferFlats) {
  if (typeof chordSymbol !== "string" || !chordSymbol) {
    return chordSymbol;
  }

  const [mainPart, bassPartRaw] = chordSymbol.split("/");
  const rootMatch = /^([A-G](?:#|b)?)(.*)$/.exec(mainPart);
  if (!rootMatch) {
    return chordSymbol;
  }

  const [, rootPitchClass, suffix] = rootMatch;
  const transposedRoot = transposePitchClass(rootPitchClass, semitoneShift, preferFlats);
  if (!transposedRoot) {
    return chordSymbol;
  }

  let transposedSymbol = `${transposedRoot}${suffix}`;
  if (typeof bassPartRaw !== "string") {
    return transposedSymbol;
  }

  const transposedBass = transposePitchClass(bassPartRaw, semitoneShift, preferFlats);
  if (transposedBass) {
    transposedSymbol += `/${transposedBass}`;
    return transposedSymbol;
  }

  const normalizedBass = normalizePitchClassToken(bassPartRaw);
  transposedSymbol += normalizedBass ? `/${normalizedBass}` : `/${bassPartRaw}`;
  return transposedSymbol;
}

function transposeNote(noteWithOctave, semitoneShift, preferFlats) {
  if (typeof noteWithOctave !== "string" || !noteWithOctave) {
    return null;
  }

  const match = /^([A-G](?:#|b)?)(-?\d+)$/.exec(noteWithOctave);
  if (!match) {
    return null;
  }

  const [, pitchClass, octaveRaw] = match;
  const semitone = getPitchClassSemitone(pitchClass);
  if (!Number.isInteger(semitone)) {
    return null;
  }

  const octave = Number(octaveRaw);
  if (!Number.isInteger(octave)) {
    return null;
  }

  const midiValue = (octave + 1) * 12 + semitone;
  const shiftedMidiValue = midiValue + semitoneShift;
  const pitchClassIndex = ((shiftedMidiValue % 12) + 12) % 12;
  const nextOctave = Math.floor(shiftedMidiValue / 12) - 1;
  const table = preferFlats ? SEMITONE_TO_FLAT : SEMITONE_TO_SHARP;
  return `${table[pitchClassIndex]}${nextOctave}`;
}

function getStringAttackVelocity(stringNo) {
  const normalized = (stringNo - 1) / (STRING_ORDER.length - 1);
  return Math.round(82 + normalized * 20);
}

function getStringDecaySeconds(stringNo) {
  const normalized = (stringNo - 1) / (STRING_ORDER.length - 1);
  return 1.3 + normalized * 0.75;
}

function scheduleStringAttack(
  stringNo,
  triggerTime,
  highlightDelayMs = 0,
  noteOverride = null,
  durationOverrideSeconds = null,
  highlightDurationMs = DEFAULT_STRING_HIGHLIGHT_DURATION_MS
) {
  const note = noteOverride ?? getStringNote(getCurrentChord(), stringNo);
  const synth = synths.get(stringNo);
  if (!note || !synth) {
    return;
  }

  if (state.instrumentReady) {
    const velocity = getStringAttackVelocity(stringNo);
    const detune = (Math.random() - 0.5) * 6;
    const attackDuration = Number.isFinite(durationOverrideSeconds)
      ? Math.max(0.04, durationOverrideSeconds)
      : getStringDecaySeconds(stringNo);
    if (typeof synth.start === "function") {
      try {
        synth.start({
          note,
          time: triggerTime,
          velocity,
          detune,
          duration: attackDuration
        });
      } catch {
        // Skip failed triggers when a sample is temporarily unavailable.
      }
    } else if (typeof synth.triggerAttackRelease === "function") {
      try {
        const normalizedVelocity = Math.min(1, velocity / 127);
        if (Number.isFinite(durationOverrideSeconds) && Number.isFinite(synth.release)) {
          const originalRelease = synth.release;
          const previewRelease = Math.max(0.03, Math.min(originalRelease, attackDuration * PREVIEW_PLUCK_RELEASE_RATIO));
          synth.release = previewRelease;
          synth.triggerAttackRelease(note, attackDuration, triggerTime, normalizedVelocity);
          synth.release = originalRelease;
        } else {
          synth.triggerAttackRelease(note, attackDuration, triggerTime, normalizedVelocity);
        }
      } catch {
        // Skip failed triggers when a sample is temporarily unavailable.
      }
    } else if (typeof synth.triggerAttack === "function") {
      synth.triggerAttack(note, triggerTime, Math.min(1, velocity / 127));
    }
  }

  if (highlightDelayMs <= 0) {
    activateStringRow(stringNo, highlightDurationMs);
    return;
  }
  setTimeout(() => {
    activateStringRow(stringNo, highlightDurationMs);
  }, highlightDelayMs);
}

async function pluckString(stringNo, offsetSeconds = 0) {
  await ensureAudioStarted();

  const safeOffsetSeconds = Math.max(0, offsetSeconds);
  const triggerTime = Tone.now() + safeOffsetSeconds;
  scheduleStringAttack(stringNo, triggerTime, safeOffsetSeconds * 1000);
}

async function ensureAudioStarted() {
  if (state.audioReady) {
    return;
  }
  await Tone.start();
  state.audioReady = true;
  renderAudioStatus();
}

function createGuitarBodyImpulseBuffer(audioContext, durationSeconds = 0.14) {
  const sampleRate = audioContext.sampleRate;
  const frameLength = Math.max(1, Math.floor(durationSeconds * sampleRate));
  const buffer = audioContext.createBuffer(1, frameLength, sampleRate);
  const data = buffer.getChannelData(0);

  const modes = [
    { frequency: 112, gain: 1, damping: 24 },
    { frequency: 210, gain: 0.82, damping: 21 },
    { frequency: 420, gain: 0.56, damping: 29 },
    { frequency: 660, gain: 0.32, damping: 38 },
    { frequency: 960, gain: 0.2, damping: 44 }
  ];
  const phases = modes.map(() => Math.random() * Math.PI * 2);
  let peak = 0;

  for (let index = 0; index < frameLength; index += 1) {
    const t = index / sampleRate;
    let sample = 0;

    modes.forEach((mode, modeIndex) => {
      sample += mode.gain * Math.sin(t * Math.PI * 2 * mode.frequency + phases[modeIndex]) * Math.exp(-t * mode.damping);
    });

    sample += (Math.random() * 2 - 1) * Math.exp(-t * 120) * 0.04;
    data[index] = sample;
    peak = Math.max(peak, Math.abs(sample));
  }

  if (peak > 0) {
    const normalize = 0.95 / peak;
    for (let index = 0; index < frameLength; index += 1) {
      data[index] *= normalize;
    }
  }

  return buffer;
}

function createAcousticRouting() {
  if (acousticRouting.sourceBus && acousticRouting.dryBus && acousticRouting.bodySend && acousticRouting.ambienceSend) {
    return acousticRouting;
  }
  try {
    const sourceBus = new Tone.Gain(1);
    const dryBus = new Tone.Gain(1);
    const bodySend = new Tone.Gain(0.36);
    const ambienceSend = new Tone.Gain(0.2);

    sourceBus.connect(dryBus);
    sourceBus.connect(bodySend);
    sourceBus.connect(ambienceSend);

    const lowCut = new Tone.Filter({
      type: "highpass",
      frequency: 70,
      rolloff: -12
    });
    const bodyResonanceLow = new Tone.Filter({
      type: "peaking",
      frequency: 195,
      Q: 1.15,
      gain: 2.8
    });
    const bodyResonanceMid = new Tone.Filter({
      type: "peaking",
      frequency: 420,
      Q: 1.35,
      gain: 1.8
    });
    const pickHarshCut = new Tone.Filter({
      type: "peaking",
      frequency: 3050,
      Q: 1.25,
      gain: -2.6
    });
    const highShelf = new Tone.Filter({
      type: "highshelf",
      frequency: 6500,
      gain: -2
    });
    const glueCompressor = new Tone.Compressor({
      threshold: -22,
      ratio: 2.2,
      attack: 0.006,
      release: 0.2
    });
    const dryOutput = new Tone.Gain(0.78).toDestination();
    dryBus.chain(lowCut, bodyResonanceLow, bodyResonanceMid, pickHarshCut, highShelf, glueCompressor, dryOutput);

    const rawContext = Tone.getContext().rawContext;
    const bodyConvolver = new Tone.Convolver(createGuitarBodyImpulseBuffer(rawContext));
    bodyConvolver.normalize = true;

    const bodyPreShape = new Tone.Filter({
      type: "lowpass",
      frequency: 5000,
      rolloff: -12
    });
    const bodyPostLift = new Tone.Filter({
      type: "peaking",
      frequency: 230,
      Q: 1.05,
      gain: 4.2
    });
    const bodyPostCut = new Tone.Filter({
      type: "peaking",
      frequency: 2950,
      Q: 1.35,
      gain: -2.2
    });
    const bodyOutput = new Tone.Gain(0.24).toDestination();
    bodySend.chain(bodyPreShape, bodyConvolver, bodyPostLift, bodyPostCut, bodyOutput);

    const ambienceTone = new Tone.Filter({
      type: "lowpass",
      frequency: 4500,
      rolloff: -12
    });
    const earlyReflections = new Tone.FeedbackDelay({
      delayTime: 0.042,
      feedback: 0.11,
      wet: 1
    });
    const roomReverb = new Tone.Reverb({
      decay: 1.7,
      preDelay: 0.009,
      wet: 1
    });
    void roomReverb.generate().catch(() => {
      // Keep default IR when generation is unavailable.
    });

    const ambienceOutput = new Tone.Gain(0.14).toDestination();
    ambienceSend.chain(ambienceTone, earlyReflections, roomReverb, ambienceOutput);

    acousticRouting.sourceBus = sourceBus;
    acousticRouting.dryBus = dryBus;
    acousticRouting.bodySend = bodySend;
    acousticRouting.ambienceSend = ambienceSend;
    return acousticRouting;
  } catch (error) {
    console.error("Acoustic routing init failed, fallback to simple output.", error);

    const sourceBus = new Tone.Gain(1);
    const simpleOutput = new Tone.Gain(0.92).toDestination();
    sourceBus.connect(simpleOutput);

    acousticRouting.sourceBus = sourceBus;
    acousticRouting.dryBus = sourceBus;
    acousticRouting.bodySend = new Tone.Gain(0);
    acousticRouting.ambienceSend = new Tone.Gain(0);
    return acousticRouting;
  }
}

function disposeSynthEngine(engine) {
  if (!engine || typeof engine.dispose !== "function") {
    return;
  }
  try {
    engine.dispose();
  } catch {
    // Ignore dispose errors from partially loaded engines.
  }
}

function disposeAllSynths() {
  const uniqueSynths = new Set(synths.values());
  synths.clear();
  uniqueSynths.forEach((engine) => {
    disposeSynthEngine(engine);
  });
}

function createFallbackSynths(routing, profile = DEFAULT_PLUCK_PROFILE) {
  const toneProfile = {
    ...DEFAULT_PLUCK_PROFILE,
    ...(profile ?? {})
  };
  disposeAllSynths();

  const centerIndex = (STRING_ORDER.length - 1) / 2;
  STRING_ORDER.forEach((stringNo, index) => {
    const synth = new Tone.PluckSynth({
      attackNoise: toneProfile.attackNoiseBase + index * toneProfile.attackNoiseStep,
      dampening: toneProfile.dampeningBase + index * toneProfile.dampeningStep,
      resonance: toneProfile.resonanceBase + index * toneProfile.resonanceStep
    });

    const panner = new Tone.Panner((index - centerIndex) / toneProfile.panSpread);
    synth.connect(panner);
    panner.connect(routing.sourceBus);
    synths.set(stringNo, synth);
  });
}

function createSynths(presetId = state.tonePresetId, options = {}) {
  const { showMessage = false, previewAfterLoad = false } = options;
  const nextTonePresetId = normalizeTonePresetId(presetId);
  const tonePreset = getTonePreset(nextTonePresetId);
  const toneLabel = getTonePresetLabel(nextTonePresetId);
  const routing = createAcousticRouting();
  const requestId = ++toneLoadRequestId;

  state.tonePresetId = nextTonePresetId;
  state.instrumentReady = false;
  state.instrumentLoadProgress = null;
  state.instrumentLoadError = false;
  renderAudioStatus();
  disposeAllSynths();

  if (showMessage) {
    setSettingMessage(t("messageToneLoading", { tone: toneLabel }), "ok");
  }

  if (tonePreset.engine === TONE_PRESET_ENGINE_PLUCK) {
    createFallbackSynths(routing, tonePreset.pluckProfile);
    if (requestId !== toneLoadRequestId) {
      return;
    }
    state.instrumentReady = true;
    state.instrumentLoadError = false;
    renderAudioStatus();
    if (showMessage) {
      setSettingMessage(t("messageToneUpdated", { tone: toneLabel }), "ok");
    }
    if (previewAfterLoad) {
      void previewKeySettings();
    }
    return;
  }

  const context = Tone.getContext().rawContext;
  let synth;
  try {
    synth = new Soundfont(context, {
      kit: "MusyngKite",
      instrument: tonePreset.instrument,
      // Keep smplr inside its native graph to avoid cross-lib node wrapping issues.
      destination: context.destination,
      onLoadProgress: (progress) => {
        if (requestId !== toneLoadRequestId) {
          return;
        }
        state.instrumentLoadProgress = progress;
        renderAudioStatus();
      }
    });
  } catch (error) {
    console.error("Soundfont init failed, fallback to synth.", error);
    if (requestId !== toneLoadRequestId) {
      return;
    }
    state.instrumentLoadError = true;
    state.instrumentReady = true;
    createFallbackSynths(routing);
    renderAudioStatus();
    if (showMessage) {
      setSettingMessage(t("messageToneLoadFailed", { tone: toneLabel }), "warn");
    }
    return;
  }

  STRING_ORDER.forEach((stringNo) => {
    synths.set(stringNo, synth);
  });

  void synth.load
    .then(() => {
      if (requestId !== toneLoadRequestId) {
        disposeSynthEngine(synth);
        return;
      }
      state.instrumentReady = true;
      state.instrumentLoadError = false;
      renderAudioStatus();
      if (showMessage) {
        setSettingMessage(t("messageToneUpdated", { tone: toneLabel }), "ok");
      }
      if (previewAfterLoad) {
        void previewKeySettings();
      }
    })
    .catch(() => {
      if (requestId !== toneLoadRequestId) {
        disposeSynthEngine(synth);
        return;
      }
      state.instrumentLoadError = true;
      state.instrumentReady = true;
      createFallbackSynths(routing);
      renderAudioStatus();
      if (showMessage) {
        setSettingMessage(t("messageToneLoadFailed", { tone: toneLabel }), "warn");
      }
      if (previewAfterLoad) {
        void previewKeySettings();
      }
    });
}

function activateStringRow(stringNo, activeDurationMs = DEFAULT_STRING_HIGHLIGHT_DURATION_MS) {
  if (!refs.stringBoard) {
    return;
  }
  const row = refs.stringBoard.querySelector(`[data-string="${stringNo}"]`);
  if (!row) {
    return;
  }

  row.classList.add("active");
  const oldTimer = releaseTimers.get(stringNo);
  if (oldTimer) {
    clearTimeout(oldTimer);
  }

  const timer = setTimeout(() => {
    row.classList.remove("active");
  }, Math.max(30, activeDurationMs));
  releaseTimers.set(stringNo, timer);
}

function pulseChordName() {
  if (!refs.currentChordName) {
    return;
  }
  refs.currentChordName.classList.remove("pulse");
  void refs.currentChordName.offsetWidth;
  refs.currentChordName.classList.add("pulse");
}

function getStringNoByKey(key) {
  for (const stringNo of STRING_ORDER) {
    if (state.stringKeys[stringNo] === key) {
      return stringNo;
    }
  }
  return null;
}

function getStringNoByCode(code) {
  if (!code || !DEFAULT_STRING_KEY_BY_CODE[code]) {
    return null;
  }
  return DEFAULT_STRING_KEY_BY_CODE[code];
}

function getStringNoByKeyboardEvent(event, key) {
  const byKey = getStringNoByKey(key);
  if (byKey) {
    return byKey;
  }
  return getStringNoByCode(event.code);
}

function getStrumDirectionByKeyboardEvent(event, key) {
  if (key === STRUM_DOWN_KEY || event.code === "KeyL") {
    return "down";
  }
  if (key === STRUM_UP_KEY || event.code === "KeyP") {
    return "up";
  }
  return null;
}

function getKeyboardHoldToken(event, key) {
  if (event.code && event.code !== "Unidentified") {
    return `code:${event.code}`;
  }
  if (!key) {
    return null;
  }
  return `key:${key}`;
}

function getStringRepeatStartDelayMs(stringNo) {
  const override = state.stringHoldDelayOverridesMs[stringNo];
  if (Number.isFinite(override)) {
    return override;
  }
  return state.stringHoldDelayMs;
}

function startRepeatTimer(holdId, triggerAction, repeatIntervalMs, repeatDelayMs = 0) {
  const normalizedDelayMs = normalizeDelayMs(repeatDelayMs, 0, MIN_STRING_HOLD_DELAY_MS, MAX_STRING_HOLD_DELAY_MS);
  if (normalizedDelayMs <= 0) {
    const intervalId = setInterval(triggerAction, repeatIntervalMs);
    holdTimers.set(holdId, { intervalId, timeoutId: null });
    return;
  }

  const timeoutId = setTimeout(() => {
    const holdState = holdTimers.get(holdId);
    if (!holdState || holdState.timeoutId !== timeoutId) {
      return;
    }

    triggerAction();
    const intervalId = setInterval(triggerAction, repeatIntervalMs);
    holdTimers.set(holdId, { intervalId, timeoutId: null });
  }, normalizedDelayMs);

  holdTimers.set(holdId, { intervalId: null, timeoutId });
}

function startStringHold(holdId, stringNo, options = {}) {
  const { immediate = true, repeatDelayMs = 0 } = options;
  stopStringHold(holdId);

  const triggerString = () => {
    void pluckString(stringNo);
  };

  if (immediate) {
    triggerString();
  }

  startRepeatTimer(holdId, triggerString, HOLD_REPEAT_INTERVAL_MS, repeatDelayMs);
}

function startStrumHold(holdId, direction) {
  stopStringHold(holdId);
  const triggerStrum = () => {
    void strumStrings(direction);
  };
  triggerStrum();
  startRepeatTimer(holdId, triggerStrum, STRUM_REPEAT_INTERVAL_MS, state.strumHoldDelayMs);
}

function stopStringHold(holdId) {
  const timer = holdTimers.get(holdId);
  if (!timer) {
    return;
  }
  if (timer.intervalId !== null) {
    clearInterval(timer.intervalId);
  }
  if (timer.timeoutId !== null) {
    clearTimeout(timer.timeoutId);
  }
  holdTimers.delete(holdId);
}

function stopPointerHold(pointerId) {
  const pointerState = activePointerHolds.get(pointerId);
  if (!pointerState) {
    return;
  }
  activePointerHolds.delete(pointerId);
  stopStringHold(pointerState.holdId);
}

function stopAllStringHolds() {
  holdTimers.forEach((timer) => {
    if (timer.intervalId !== null) {
      clearInterval(timer.intervalId);
    }
    if (timer.timeoutId !== null) {
      clearTimeout(timer.timeoutId);
    }
  });
  holdTimers.clear();
  activeKeyHolds.clear();
  activePointerHolds.clear();
}

async function strumStrings(direction, stepDelayMs = STRUM_STEP_DELAY_MS) {
  await ensureAudioStarted();

  const order = direction === "down" ? [...STRING_ORDER] : [...STRING_ORDER].reverse();
  const baseTime = Tone.now();

  order.forEach((stringNo, index) => {
    const offsetMs = index * stepDelayMs;
    const triggerTime = baseTime + offsetMs / 1000;
    scheduleStringAttack(stringNo, triggerTime, offsetMs);
  });
}

async function strumChord(chord, direction, stepDelayMs = STRUM_STEP_DELAY_MS) {
  if (!chord || !CHORD_LIBRARY[chord]) {
    return;
  }

  await ensureAudioStarted();

  const order = direction === "down" ? [...STRING_ORDER] : [...STRING_ORDER].reverse();
  const baseTime = Tone.now();

  order.forEach((stringNo, index) => {
    const note = getStringNote(chord, stringNo);
    if (!note) {
      return;
    }

    const offsetMs = index * stepDelayMs;
    const triggerTime = baseTime + offsetMs / 1000;
    scheduleStringAttack(stringNo, triggerTime, offsetMs, note);
  });
}

function schedulePreviewPasses(getNoteByStringNo) {
  const baseTime = Tone.now();
  const schedulePreviewPass = (direction, stepDelayMs, startOffsetMs, options = {}) => {
    const {
      noteDurationSeconds = null,
      highlightDurationMs = DEFAULT_STRING_HIGHLIGHT_DURATION_MS
    } = options;
    const order = direction === "down" ? [...STRING_ORDER] : [...STRING_ORDER].reverse();
    order.forEach((stringNo, index) => {
      const note = getNoteByStringNo(stringNo);
      if (!note) {
        return;
      }

      const offsetMs = startOffsetMs + index * stepDelayMs;
      const triggerTime = baseTime + offsetMs / 1000;
      scheduleStringAttack(
        stringNo,
        triggerTime,
        offsetMs,
        note,
        noteDurationSeconds,
        highlightDurationMs
      );
    });
  };

  schedulePreviewPass("down", PREVIEW_SINGLE_STRING_STEP_DELAY_MS, 0, {
    noteDurationSeconds: PREVIEW_SINGLE_NOTE_DURATION_SECONDS
  });
  schedulePreviewPass("down", PREVIEW_STRUM_STEP_DELAY_MS, PREVIEW_SINGLE_STRING_PASS_DURATION_MS, {
    noteDurationSeconds: PREVIEW_STRUM_NOTE_DURATION_SECONDS,
    highlightDurationMs: PREVIEW_STRUM_HIGHLIGHT_DURATION_MS
  });
  schedulePreviewPass(
    "up",
    PREVIEW_STRUM_STEP_DELAY_MS,
    PREVIEW_SINGLE_STRING_PASS_DURATION_MS +
      PREVIEW_STRUM_PASS_DURATION_MS +
      PREVIEW_STRUM_TRANSITION_GAP_MS,
    {
      noteDurationSeconds: PREVIEW_STRUM_NOTE_DURATION_SECONDS,
      highlightDurationMs: PREVIEW_STRUM_HIGHLIGHT_DURATION_MS
    }
  );

  return PREVIEW_TOTAL_DURATION_MS;
}

function getNeutralPreviewNote(stringNo) {
  const baseNote = NEUTRAL_PREVIEW_STRING_NOTES[stringNo];
  if (!baseNote) {
    return null;
  }

  const semitoneShift = getKeyTransposeSemitoneOffset();
  const preferFlats = FLAT_KEY_SIGNATURES.has(state.keySignature);
  return transposeNote(baseNote, semitoneShift, preferFlats) ?? baseNote;
}

async function previewChord(chord, options = {}) {
  const { showMessage = false } = options;
  if (!chord || !CHORD_LIBRARY[chord]) {
    return false;
  }

  const previewRunId = tryStartPreviewRun();
  if (previewRunId === null) {
    return false;
  }

  try {
    await ensureAudioStarted();
    const previewDurationMs = schedulePreviewPasses((stringNo) => getStringNote(chord, stringNo));
    schedulePreviewRunCompletion(previewRunId, previewDurationMs);

    if (showMessage) {
      setSettingMessage(
        t("messagePreviewPlayed", { chord: getDisplayChordLabel(chord) }),
        "ok"
      );
    }
    return true;
  } catch (error) {
    finishPreviewRun(previewRunId);
    console.error("Chord preview failed.", error);
    if (showMessage) {
      setSettingMessage(t("messagePreviewFailed"), "warn");
    }
    return false;
  }
}

async function previewKeySettings(options = {}) {
  const { showMessage = false } = options;
  const previewRunId = tryStartPreviewRun();
  if (previewRunId === null) {
    return false;
  }

  try {
    await ensureAudioStarted();
    const previewDurationMs = schedulePreviewPasses(getNeutralPreviewNote);
    schedulePreviewRunCompletion(previewRunId, previewDurationMs);

    if (showMessage) {
      setSettingMessage(t("messageKeyPreviewPlayed"), "ok");
    }
    return true;
  } catch (error) {
    finishPreviewRun(previewRunId);
    console.error("Key/tone preview failed.", error);
    if (showMessage) {
      setSettingMessage(t("messagePreviewFailed"), "warn");
    }
    return false;
  }
}

async function previewCurrentChord(options = {}) {
  await previewChord(getCurrentChord(), options);
}

async function sweepAcrossStrings(fromStringNo, toStringNo) {
  await ensureAudioStarted();

  const fromIndex = DISPLAY_STRING_ORDER.indexOf(fromStringNo);
  const toIndex = DISPLAY_STRING_ORDER.indexOf(toStringNo);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return;
  }

  const step = fromIndex < toIndex ? 1 : -1;
  const baseTime = Tone.now();
  let offsetMs = 0;

  for (let index = fromIndex + step; ; index += step) {
    const stringNo = DISPLAY_STRING_ORDER[index];
    const triggerTime = baseTime + offsetMs / 1000;
    scheduleStringAttack(stringNo, triggerTime, offsetMs);

    if (index === toIndex) {
      break;
    }
    offsetMs += SWIPE_SWEEP_STEP_DELAY_MS;
  }
}

function getStringNoFromTarget(target) {
  if (!(target instanceof Element)) {
    return null;
  }

  const row = target.closest("[data-string]");
  if (!row) {
    return null;
  }

  const stringNo = Number(row.dataset.string);
  if (!STRING_ORDER.includes(stringNo)) {
    return null;
  }
  return stringNo;
}

function getStringNoFromBoardY(clientY) {
  if (!refs.stringBoard) {
    return null;
  }

  const rect = refs.stringBoard.getBoundingClientRect();
  if (clientY < rect.top || clientY > rect.bottom || rect.height <= 0) {
    return null;
  }

  const ratio = (clientY - rect.top) / rect.height;
  const index = Math.max(0, Math.min(DISPLAY_STRING_ORDER.length - 1, Math.floor(ratio * DISPLAY_STRING_ORDER.length)));
  return DISPLAY_STRING_ORDER[index];
}

function getStringNoFromPoint(clientX, clientY) {
  const target = document.elementFromPoint(clientX, clientY);
  return getStringNoFromTarget(target) ?? getStringNoFromBoardY(clientY);
}

function getStringNoFromPointerEvent(event) {
  return getStringNoFromTarget(event.target) ?? getStringNoFromPoint(event.clientX, event.clientY);
}

function handleGlobalKeydown(event) {
  if (getRoute() !== ROUTE_PLAY || isTextInput(event.target)) {
    return;
  }

  const key = normalizeKey(event.key);
  const holdToken = getKeyboardHoldToken(event, key);
  if (!key || !holdToken) {
    return;
  }

  if (key === state.cycleKey && !event.repeat) {
    event.preventDefault();
    cycleChord();
    return;
  }

  if (key === ARPEGGIO_TOGGLE_KEY && !event.repeat) {
    event.preventDefault();
    toggleArpeggioPlaybackFromInput({ showMessage: false });
    return;
  }

  if (activeKeyHolds.has(holdToken)) {
    event.preventDefault();
    return;
  }

  const strumDirection = getStrumDirectionByKeyboardEvent(event, key);
  if (strumDirection) {
    event.preventDefault();
    const holdId = `key:${holdToken}`;
    activeKeyHolds.set(holdToken, holdId);
    startStrumHold(holdId, strumDirection);
    return;
  }

  const stringNo = getStringNoByKeyboardEvent(event, key);
  if (!stringNo) {
    return;
  }

  event.preventDefault();
  const holdId = `key:${holdToken}`;
  activeKeyHolds.set(holdToken, holdId);
  startStringHold(holdId, stringNo, { repeatDelayMs: getStringRepeatStartDelayMs(stringNo) });
}

function handleGlobalKeyup(event) {
  const key = normalizeKey(event.key);
  const holdToken = getKeyboardHoldToken(event, key);
  if (!holdToken) {
    return;
  }

  const holdId = activeKeyHolds.get(holdToken);
  if (!holdId) {
    return;
  }

  activeKeyHolds.delete(holdToken);
  stopStringHold(holdId);
}

function handleWindowBlur() {
  stopAllStringHolds();
  stopArpeggioPlayback();
}

function handleWindowFocus() {
  syncArpeggioPlayback();
}

function handleViewportResize() {
  renderLeftPanelLayout();
}

function handleLeftPanelToggleClick() {
  state.leftPanelCollapsed = !state.leftPanelCollapsed;
  saveSettings();
  renderLeftPanelLayout();
}

function handleStringBoardPointerDown(event) {
  if (event.pointerType === "mouse" && event.button !== 0) {
    return;
  }

  const stringNo = getStringNoFromPointerEvent(event);
  if (!stringNo) {
    return;
  }

  event.preventDefault();
  const pointerId = event.pointerId;
  if (activePointerHolds.has(pointerId)) {
    return;
  }

  const holdId = `pointer:${pointerId}`;
  activePointerHolds.set(pointerId, { holdId, stringNo });

  if (event.currentTarget && event.currentTarget.setPointerCapture) {
    try {
      event.currentTarget.setPointerCapture(pointerId);
    } catch {
      // Keep behavior when capture is unavailable.
    }
  }

  startStringHold(holdId, stringNo, { repeatDelayMs: getStringRepeatStartDelayMs(stringNo) });
}

function handleStringBoardPointerMove(event) {
  const pointerState = activePointerHolds.get(event.pointerId);
  if (!pointerState) {
    return;
  }

  if (event.pointerType === "mouse" && (event.buttons & 1) !== 1) {
    stopPointerHold(event.pointerId);
    return;
  }

  const nextStringNo = getStringNoFromPointerEvent(event);
  if (!nextStringNo || nextStringNo === pointerState.stringNo) {
    return;
  }

  event.preventDefault();
  void sweepAcrossStrings(pointerState.stringNo, nextStringNo);
  pointerState.stringNo = nextStringNo;
  startStringHold(pointerState.holdId, nextStringNo, {
    immediate: false,
    repeatDelayMs: getStringRepeatStartDelayMs(nextStringNo)
  });
}

function handleStringBoardPointerEnd(event) {
  const pointerState = activePointerHolds.get(event.pointerId);
  if (pointerState) {
    const endStringNo = getStringNoFromPointerEvent(event);
    if (endStringNo && endStringNo !== pointerState.stringNo) {
      void sweepAcrossStrings(pointerState.stringNo, endStringNo);
      pointerState.stringNo = endStringNo;
    }
  }
  stopPointerHold(event.pointerId);
}

function handleChordOrderClick(event) {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const index = Number(button.dataset.index);
  if (Number.isNaN(index)) {
    return;
  }

  const chord = state.sequence[index];
  if (!chord || !CHORD_LIBRARY[chord]) {
    return;
  }

  if (action === "preview") {
    void previewChord(chord, { showMessage: true });
  } else if (action === "up") {
    moveChord(index, index - 1);
  } else if (action === "down") {
    moveChord(index, index + 1);
  } else if (action === "remove") {
    removeChord(index);
  }
}

function handleAvailableChordClick(event) {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const chord = button.dataset.chord;
  if (!chord || !CHORD_LIBRARY[chord]) {
    return;
  }

  if (action === "preview") {
    void previewChord(chord, { showMessage: true });
    return;
  }

  if (action !== "add") {
    return;
  }

  const availability = evaluateAddableChord(chord);
  if (!availability.canAdd) {
    const displayChord = getDisplayChordLabel(chord);
    const reason = availability.reasonKey
      ? t(availability.reasonKey, availability.reasonParams ?? {})
      : t("addChordReasonUnavailable");
    setSettingMessage(t("messageAddChordUnavailable", { chord: displayChord, reason }), "warn");
    return;
  }

  state.sequence.push(chord);
  saveSettings();
  renderSettingsContent();
  setSettingMessage(t("messageAddedChord", { chord: getDisplayChordLabel(chord) }), "ok");
}

function handleLanguageSettingsChange(event) {
  const select = event.target;
  if (!(select instanceof HTMLSelectElement) || select.id !== "languageSelect") {
    return;
  }

  const nextLanguage = normalizeLanguage(select.value);
  if (nextLanguage === state.language) {
    select.value = state.language;
    return;
  }

  state.language = nextLanguage;
  saveSettings();
  renderRoute();
  setSettingMessage(t("messageLanguageUpdated"), "ok");
}

function handleKeySettingsClick(event) {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const { action } = button.dataset;
  if (action !== "preview-chord" && action !== "preview-tone") {
    return;
  }

  event.preventDefault();
  void previewKeySettings({ showMessage: true });
}

function handleKeySettingsChange(event) {
  const select = event.target;
  if (!(select instanceof HTMLSelectElement)) {
    return;
  }

  if (select.id === "keySignatureSelect") {
    const nextKeySignature = normalizeKeySignature(select.value);
    if (nextKeySignature === state.keySignature) {
      select.value = state.keySignature;
      return;
    }

    state.keySignature = nextKeySignature;
    saveSettings();
    renderSettingsContent();
    renderCurrentChord();
    renderStringBoard();
    setSettingMessage(
      t("messageKeyUpdated", { key: formatKeySignatureLabel(nextKeySignature) }),
      "ok"
    );
    void previewKeySettings();
    return;
  }

  if (select.id === "tonePresetSelect") {
    const nextTonePresetId = normalizeTonePresetId(select.value);
    if (nextTonePresetId === state.tonePresetId) {
      select.value = state.tonePresetId;
      return;
    }

    stopAllStringHolds();
    state.tonePresetId = nextTonePresetId;
    saveSettings();
    renderSettingsContent();
    createSynths(nextTonePresetId, { showMessage: true, previewAfterLoad: true });
    return;
  }

  if (select.id !== "chordVoicingModeSelect") {
    return;
  }

  const nextMode = normalizeChordVoicingMode(select.value);
  if (nextMode === state.chordVoicingMode) {
    select.value = state.chordVoicingMode;
    return;
  }

  state.chordVoicingMode = nextMode;
  saveSettings();
  renderSettingsContent();
  renderCurrentChord();
  renderStringBoard();
  setSettingMessage(
    t("messageVoicingModeUpdated", { mode: getChordVoicingModeLabel(nextMode) }),
    "ok"
  );
  void previewKeySettings();
}

function handleStrumSettingsChange(event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) {
    return;
  }

  if (input.id === "strumHoldDelayInput") {
    const rawDelay = Number(input.value);
    if (!Number.isFinite(rawDelay)) {
      input.value = String(state.strumHoldDelayMs);
      return;
    }

    const nextDelay = normalizeStrumHoldDelay(rawDelay);
    input.value = String(nextDelay);
    if (nextDelay === state.strumHoldDelayMs) {
      return;
    }

    state.strumHoldDelayMs = nextDelay;
    saveSettings();
    setSettingMessage(t("messageStrumDelaySet", { delay: nextDelay }), "ok");
    return;
  }

  if (input.id === "stringHoldDelayGlobalInput") {
    const rawDelay = Number(input.value);
    if (!Number.isFinite(rawDelay)) {
      input.value = String(state.stringHoldDelayMs);
      return;
    }

    const nextDelay = normalizeStringHoldDelay(rawDelay);
    input.value = String(nextDelay);
    if (nextDelay === state.stringHoldDelayMs) {
      return;
    }

    state.stringHoldDelayMs = nextDelay;
    saveSettings();
    renderStrumSettings();
    setSettingMessage(t("messageGlobalStringDelaySet", { delay: nextDelay }), "ok");
    return;
  }

  const stringNo = Number(input.dataset.stringHoldDelay);
  if (!STRING_ORDER.includes(stringNo)) {
    return;
  }

  const rawOverride = input.value.trim();
  if (!rawOverride) {
    if (state.stringHoldDelayOverridesMs[stringNo] === null) {
      return;
    }

    state.stringHoldDelayOverridesMs[stringNo] = null;
    saveSettings();
    setSettingMessage(
      t("messageStringFollowGlobal", { stringNo, delay: state.stringHoldDelayMs }),
      "ok"
    );
    return;
  }

  const overrideDelay = Number(rawOverride);
  if (!Number.isFinite(overrideDelay)) {
    input.value = getStringHoldDelayOverrideValue(stringNo);
    return;
  }

  const nextOverride = normalizeStringHoldDelay(overrideDelay);
  input.value = String(nextOverride);
  if (state.stringHoldDelayOverridesMs[stringNo] === nextOverride) {
    return;
  }

  state.stringHoldDelayOverridesMs[stringNo] = nextOverride;
  saveSettings();
  setSettingMessage(t("messageStringOverrideSet", { stringNo, delay: nextOverride }), "ok");
}

function handleArpeggioSettingsChange(event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== "checkbox") {
    return;
  }

  const patternId = input.dataset.arpeggioVisibleId;
  if (!patternId || !ARPEGGIO_PATTERN_BY_ID.has(patternId)) {
    return;
  }

  const nextVisibleIds = new Set(normalizeArpeggioVisiblePatternIds(state.arpeggioVisiblePatternIds));
  if (input.checked) {
    nextVisibleIds.add(patternId);
  } else {
    nextVisibleIds.delete(patternId);
    if (nextVisibleIds.size === 0) {
      input.checked = true;
      setSettingMessage(t("messageArpeggioNeedOneVisible"), "warn");
      return;
    }
  }

  state.arpeggioVisiblePatternIds = normalizeArpeggioVisiblePatternIds([...nextVisibleIds]);
  ensureValidArpeggioPatternSelection();
  saveSettings();
  renderArpeggioSettings();
  renderArpeggioControls();
  setSettingMessage(
    t("messageArpeggioVisibleUpdated", { count: state.arpeggioVisiblePatternIds.length }),
    "ok"
  );
}

function moveChord(from, to) {
  if (from === to || to < 0 || to >= state.sequence.length) {
    return;
  }

  const current = getCurrentChord();
  const next = [...state.sequence];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);

  state.sequence = next;
  state.currentIndex = Math.max(0, state.sequence.indexOf(current));

  saveSettings();
  renderSettingsContent();
}

function removeChord(index) {
  if (state.sequence.length === 1) {
    setSettingMessage(t("messageKeepAtLeastOneChord"), "warn");
    return;
  }

  const current = getCurrentChord();
  state.sequence.splice(index, 1);
  const nextIndex = state.sequence.indexOf(current);
  state.currentIndex = nextIndex === -1 ? 0 : nextIndex;

  saveSettings();
  renderSettingsContent();
}

function handleReset() {
  state.cycleKey = DEFAULT_CYCLE_KEY;
  state.stringKeys = { ...DEFAULT_STRING_KEYS };
  state.sequence = [...DEFAULT_SEQUENCE];
  state.currentIndex = 0;
  state.keySignature = DEFAULT_KEY_SIGNATURE;
  state.chordVoicingMode = DEFAULT_CHORD_VOICING_MODE;
  state.tonePresetId = DEFAULT_TONE_PRESET_ID;
  state.arpeggioEnabled = false;
  state.arpeggioPatternId = DEFAULT_ARPEGGIO_PATTERN_ID;
  state.arpeggioVisiblePatternIds = [...DEFAULT_ARPEGGIO_VISIBLE_PATTERN_IDS];
  state.arpeggioStepMs = DEFAULT_ARPEGGIO_STEP_MS;
  state.arpeggioPauseImmediate = DEFAULT_ARPEGGIO_PAUSE_IMMEDIATE;
  state.leftPanelCollapsed = true;
  state.strumHoldDelayMs = DEFAULT_STRUM_HOLD_DELAY_MS;
  state.stringHoldDelayMs = DEFAULT_STRING_HOLD_DELAY_MS;
  state.stringHoldDelayOverridesMs = { ...DEFAULT_STRING_HOLD_DELAY_OVERRIDES_MS };

  stopArpeggioPlayback();
  arpeggioStopPending = false;
  saveSettings();
  renderSettingsContent();
  renderPlayHint();
  renderArpeggioControls();
  createSynths(state.tonePresetId);
  setSettingMessage(t("messageSettingsReset"), "ok");
}

function setSettingMessage(text, type) {
  if (!refs.settingMessage) {
    return;
  }
  refs.settingMessage.textContent = text;
  refs.settingMessage.dataset.type = type;
}

function clearSettingMessage() {
  if (!refs.settingMessage) {
    return;
  }
  refs.settingMessage.textContent = "";
  refs.settingMessage.dataset.type = "";
}

function isTextInput(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

function normalizeKey(key) {
  if (!key) {
    return null;
  }
  if (key === " ") {
    return " ";
  }
  return key.toLowerCase();
}

function normalizeLanguage(language) {
  if (typeof language !== "string" || !language) {
    return LANGUAGE_EN_US;
  }
  const normalized = language.toLowerCase();
  if (normalized.startsWith("zh")) {
    return LANGUAGE_ZH_CN;
  }
  if (normalized.startsWith("en")) {
    return LANGUAGE_EN_US;
  }
  return LANGUAGE_EN_US;
}

function resolveDefaultLanguage() {
  if (typeof navigator === "undefined" || typeof navigator.language !== "string") {
    return LANGUAGE_EN_US;
  }
  return normalizeLanguage(navigator.language);
}

function t(key, params = {}) {
  const currentLanguage = SUPPORTED_LANGUAGES.includes(state.language) ? state.language : LANGUAGE_EN_US;
  const currentCatalog = I18N[currentLanguage] ?? I18N[LANGUAGE_EN_US];
  const fallbackCatalog = I18N[LANGUAGE_EN_US];
  const value = currentCatalog[key] ?? fallbackCatalog[key];
  if (typeof value === "function") {
    return value(params);
  }
  return typeof value === "string" ? value : key;
}

function formatKeyLabel(key) {
  if (!key) {
    return "-";
  }
  if (KEY_LABELS[key]) {
    return KEY_LABELS[key];
  }
  if (key.length === 1) {
    return key.toUpperCase();
  }
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function normalizeDelayMs(value, fallback, min, max) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  const rounded = Math.round(value);
  return Math.min(max, Math.max(min, rounded));
}

function normalizeStrumHoldDelay(value) {
  return normalizeDelayMs(
    value,
    DEFAULT_STRUM_HOLD_DELAY_MS,
    MIN_STRUM_HOLD_DELAY_MS,
    MAX_STRUM_HOLD_DELAY_MS
  );
}

function normalizeStringHoldDelay(value) {
  return normalizeDelayMs(
    value,
    DEFAULT_STRING_HOLD_DELAY_MS,
    MIN_STRING_HOLD_DELAY_MS,
    MAX_STRING_HOLD_DELAY_MS
  );
}

function getRoute() {
  return location.hash === ROUTE_SETTINGS ? ROUTE_SETTINGS : ROUTE_PLAY;
}

function updateBodyRouteClass(route) {
  document.body.classList.toggle("route-play", route === ROUTE_PLAY);
  document.body.classList.toggle("route-settings", route === ROUTE_SETTINGS);
}

function clearRefs() {
  Object.keys(refs).forEach((key) => {
    delete refs[key];
  });
}

function saveSettings() {
  normalizeSequenceState();
  ensureValidArpeggioPatternSelection();

  const payload = {
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
    leftPanelCollapsed: state.leftPanelCollapsed,
    strumHoldDelayMs: state.strumHoldDelayMs,
    stringHoldDelayMs: state.stringHoldDelayMs,
    stringHoldDelayOverridesMs: state.stringHoldDelayOverridesMs
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadSettings() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
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
    localStorage.removeItem(STORAGE_KEY);
  }
}
