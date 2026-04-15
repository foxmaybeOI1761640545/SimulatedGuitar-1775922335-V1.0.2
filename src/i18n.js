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

function translate(language, key, params = {}) {
  const normalizedLanguage = normalizeLanguage(language);
  const currentCatalog = I18N[normalizedLanguage] ?? I18N[LANGUAGE_EN_US];
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

export {
  DEFAULT_LANGUAGE,
  LANGUAGE_EN_US,
  LANGUAGE_ZH_CN,
  formatKeyLabel,
  normalizeLanguage,
  translate
};