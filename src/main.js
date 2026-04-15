import * as Tone from "tone";
import { Soundfont } from "smplr";
import "./assets/styles/style.css";
import {
  ARPEGGIO_LOOKAHEAD_SECONDS,
  ARPEGGIO_NOTE_RATIO,
  ARPEGGIO_PATTERNS,
  ARPEGGIO_PATTERN_BY_ID,
  ARPEGGIO_TOGGLE_KEY,
  AVAILABLE_CHORD_VOICING_MODES,
  AVAILABLE_KEY_SIGNATURES,
  CHORD_LIBRARY,
  CHORD_VOICING_MODE_GUITAR,
  CHORD_VOICING_MODE_TRANSPOSE,
  DEFAULT_ARPEGGIO_CHORD_SWITCH_IMMEDIATE,
  DEFAULT_ARPEGGIO_PAUSE_IMMEDIATE,
  DEFAULT_ARPEGGIO_PATTERN_ID,
  DEFAULT_ARPEGGIO_STEP_MS,
  DEFAULT_ARPEGGIO_VISIBLE_PATTERN_IDS,
  DEFAULT_CHORD_VOICING_MODE,
  DEFAULT_CYCLE_KEY,
  DEFAULT_KEY_SIGNATURE,
  DEFAULT_PLUCK_PROFILE,
  DEFAULT_SEQUENCE,
  DEFAULT_STRING_HIGHLIGHT_DURATION_MS,
  DEFAULT_STRING_HOLD_DELAY_MS,
  DEFAULT_STRING_HOLD_DELAY_OVERRIDES_MS,
  DEFAULT_STRING_KEY_BY_CODE,
  DEFAULT_STRING_KEYS,
  DEFAULT_STRUM_HOLD_DELAY_MS,
  DEFAULT_TONE_PRESET_ID,
  DISPLAY_STRING_ORDER,
  FLAT_KEY_SIGNATURES,
  HOLD_REPEAT_INTERVAL_MS,
  MAX_ARPEGGIO_STEP_MS,
  MAX_STRING_HOLD_DELAY_MS,
  MAX_STRUM_HOLD_DELAY_MS,
  MIN_ARPEGGIO_STEP_MS,
  MIN_STRING_HOLD_DELAY_MS,
  MIN_STRUM_HOLD_DELAY_MS,
  MOBILE_PLAY_LAYOUT_QUERY,
  NEUTRAL_PREVIEW_STRING_NOTES,
  PREVIEW_BEAT_DURATION_MS,
  PREVIEW_LOCK_TAIL_MS,
  PREVIEW_PLUCK_RELEASE_RATIO,
  PREVIEW_SINGLE_NOTE_DURATION_SECONDS,
  PREVIEW_SINGLE_STRING_PASS_DURATION_MS,
  PREVIEW_SINGLE_STRING_STEP_DELAY_MS,
  PREVIEW_STRUM_HIGHLIGHT_DURATION_MS,
  PREVIEW_STRUM_NOTE_DURATION_SECONDS,
  PREVIEW_STRUM_PASS_DURATION_MS,
  PREVIEW_STRUM_STEP_DELAY_MS,
  PREVIEW_STRUM_TRANSITION_GAP_MS,
  PREVIEW_TOTAL_DURATION_MS,
  ROUTE_PLAY,
  ROUTE_SETTINGS,
  STRING_ORDER,
  STRUM_DOWN_KEY,
  STRUM_REPEAT_INTERVAL_MS,
  STRUM_STEP_DELAY_MS,
  STRUM_UP_KEY,
  SWIPE_SWEEP_STEP_DELAY_MS,
  TONE_PRESETS,
  TONE_PRESET_BY_ID,
  TONE_PRESET_ENGINE_PLUCK,
  TONE_PRESET_ENGINE_SOUNDFONT
} from "./config";
import { LANGUAGE_EN_US, LANGUAGE_ZH_CN, formatKeyLabel, normalizeLanguage, translate } from "./i18n";
import { bootstrapHashRoute, getHashRoute, updateBodyRouteClass } from "./router/hashRouter";
import { findChordIdByDisplaySymbol, getPitchClassSemitone, transposeChordSymbol, transposeNote } from "./services/chordService";
import { loadSettingsFromStorage, saveSettingsToStorage } from "./services/settingsStorage";
import { createAppState, createRuntimeCollections } from "./stores/appState";
import { isTextInput, normalizeKey } from "./utils/input";
import { normalizeDelayMs } from "./utils/number";
import { renderStringBoardRows } from "./components/stringBoard";
import { renderPlayView } from "./views/playView";
import { renderSettingsView } from "./views/settingsView";

const state = createAppState();
const {
  synths,
  acousticRouting,
  releaseTimers,
  holdTimers,
  activeKeyHolds,
  activePointerHolds,
  refs
} = createRuntimeCollections();
let toneLoadRequestId = 0;
let activePreviewRunId = 0;
let previewUnlockTimerId = null;
let arpeggioIntervalId = null;
let arpeggioStepCursor = 0;
let arpeggioLastChordId = null;
let arpeggioStopPending = false;
let arpeggioPendingChordIndex = null;
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
  bootstrapHashRoute({
    playRoute: ROUTE_PLAY,
    settingsRoute: ROUTE_SETTINGS,
    onRouteChange: renderRoute
  });
}

function renderRoute() {
  stopAllStringHolds();
  clearRefs();

  const route = getRoute();
  updateBodyRouteClass(document.body, route, ROUTE_PLAY, ROUTE_SETTINGS);

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
  renderPlayView({
    root: app,
    refs,
    state,
    visiblePatterns,
    t,
    formatKeyLabel,
    arpeggioToggleKey: ARPEGGIO_TOGGLE_KEY,
    minArpeggioStepMs: MIN_ARPEGGIO_STEP_MS,
    maxArpeggioStepMs: MAX_ARPEGGIO_STEP_MS,
    handlers: {
      onOpenSettings: () => {
        location.hash = ROUTE_SETTINGS;
      },
      onCycleChord: cycleChord,
      onToggleLeftPanel: handleLeftPanelToggleClick,
      onToggleArpeggio: handleArpeggioToggleClick,
      onArpeggioPatternChange: handleArpeggioPatternChange,
      onArpeggioStepChange: handleArpeggioStepChange,
      onArpeggioImmediatePauseChange: handleArpeggioImmediatePauseChange,
      onArpeggioImmediateChordSwitchChange: handleArpeggioImmediateChordSwitchChange,
      onStringBoardPointerDown: handleStringBoardPointerDown,
      onStringBoardPointerMove: handleStringBoardPointerMove,
      onStringBoardPointerEnd: handleStringBoardPointerEnd
    }
  });

  renderCurrentChord();
  renderStringBoard();
  renderPlayHint();
  renderAudioStatus();
  renderArpeggioControls();
  renderLeftPanelLayout();
}

function renderSettingsPage() {
  renderSettingsView({
    root: app,
    refs,
    t,
    handlers: {
      onBackToPlay: () => {
        location.hash = ROUTE_PLAY;
      },
      onLanguageSettingsChange: handleLanguageSettingsChange,
      onKeySettingsChange: handleKeySettingsChange,
      onKeySettingsClick: handleKeySettingsClick,
      onChordOrderClick: handleChordOrderClick,
      onAvailableChordClick: handleAvailableChordClick,
      onStrumSettingsChange: handleStrumSettingsChange,
      onArpeggioSettingsChange: handleArpeggioSettingsChange,
      onReset: handleReset
    }
  });

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
  refs.stringBoard.innerHTML = renderStringBoardRows({
    displayStringOrder: DISPLAY_STRING_ORDER,
    chord,
    getStringNote
  });
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
  if (refs.arpeggioImmediateChordSwitchCheckbox instanceof HTMLInputElement) {
    refs.arpeggioImmediateChordSwitchCheckbox.checked = state.arpeggioChordSwitchImmediate;
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

function normalizePendingArpeggioChordIndex() {
  if (!Number.isInteger(arpeggioPendingChordIndex)) {
    return null;
  }
  if (state.sequence.length === 0) {
    return null;
  }
  return Math.min(Math.max(arpeggioPendingChordIndex, 0), state.sequence.length - 1);
}

function applyPendingArpeggioChordSwitch() {
  const nextIndex = normalizePendingArpeggioChordIndex();
  arpeggioPendingChordIndex = null;
  if (!Number.isInteger(nextIndex) || nextIndex === state.currentIndex) {
    return;
  }

  state.currentIndex = nextIndex;
  saveSettings();
  renderCurrentChord();
  renderStringBoard();
  renderPlayHint();
  pulseChordName();
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
  const phraseEnded = stepPosition === stepSequence.length - 1;
  const stopAfterCurrentStep = arpeggioStopPending && phraseEnded;
  const stringNo = stepSequence[stepPosition];
  arpeggioStepCursor += 1;
  if (!STRING_ORDER.includes(stringNo)) {
    if (phraseEnded) {
      applyPendingArpeggioChordSwitch();
    }
    if (stopAfterCurrentStep) {
      setArpeggioEnabled(false, { showMessage: false });
    }
    return;
  }

  const note = getStringNote(chord, stringNo);
  if (!note) {
    if (phraseEnded) {
      applyPendingArpeggioChordSwitch();
    }
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
  if (phraseEnded) {
    applyPendingArpeggioChordSwitch();
  }
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

  arpeggioPendingChordIndex = null;
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

  arpeggioPendingChordIndex = null;
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

function handleArpeggioImmediateChordSwitchChange(event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.id !== "arpeggioImmediateChordSwitchCheckbox") {
    return;
  }

  const nextValue = Boolean(input.checked);
  if (nextValue === state.arpeggioChordSwitchImmediate) {
    return;
  }

  state.arpeggioChordSwitchImmediate = nextValue;
  if (nextValue) {
    arpeggioPendingChordIndex = null;
  }
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
  const shouldQueueSwitch =
    state.arpeggioEnabled &&
    getRoute() === ROUTE_PLAY &&
    !state.arpeggioChordSwitchImmediate;
  if (shouldQueueSwitch) {
    const baseIndex = normalizePendingArpeggioChordIndex() ?? state.currentIndex;
    arpeggioPendingChordIndex = (baseIndex + 1) % state.sequence.length;
    return;
  }

  arpeggioPendingChordIndex = null;
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
  state.arpeggioChordSwitchImmediate = DEFAULT_ARPEGGIO_CHORD_SWITCH_IMMEDIATE;
  state.leftPanelCollapsed = true;
  state.strumHoldDelayMs = DEFAULT_STRUM_HOLD_DELAY_MS;
  state.stringHoldDelayMs = DEFAULT_STRING_HOLD_DELAY_MS;
  state.stringHoldDelayOverridesMs = { ...DEFAULT_STRING_HOLD_DELAY_OVERRIDES_MS };

  stopArpeggioPlayback();
  arpeggioStopPending = false;
  arpeggioPendingChordIndex = null;
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

function t(key, params = {}) {
  return translate(state.language, key, params);
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
  return getHashRoute(location.hash, ROUTE_PLAY, ROUTE_SETTINGS);
}

function clearRefs() {
  Object.keys(refs).forEach((key) => {
    delete refs[key];
  });
}

function saveSettings() {
  saveSettingsToStorage(state, {
    normalizeSequenceState,
    ensureValidArpeggioPatternSelection
  });
}

function loadSettings() {
  loadSettingsFromStorage(state, {
    normalizeKeySignature,
    normalizeChordVoicingMode,
    normalizeTonePresetId,
    normalizeArpeggioPatternId,
    normalizeArpeggioVisiblePatternIds,
    normalizeArpeggioStepMs,
    normalizeStrumHoldDelay,
    normalizeStringHoldDelay,
    normalizeSequenceState,
    ensureValidArpeggioPatternSelection
  });
}
