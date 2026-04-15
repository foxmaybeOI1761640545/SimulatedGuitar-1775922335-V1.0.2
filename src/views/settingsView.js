function bindSettingsRefs(refs) {
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
}

function bindSettingsEvents(refs, handlers) {
  refs.backToPlayBtn?.addEventListener("click", handlers.onBackToPlay);
  refs.languageSettings?.addEventListener("change", handlers.onLanguageSettingsChange);
  refs.keySettings?.addEventListener("change", handlers.onKeySettingsChange);
  refs.keySettings?.addEventListener("click", handlers.onKeySettingsClick);
  refs.chordOrderList?.addEventListener("click", handlers.onChordOrderClick);
  refs.availableChords?.addEventListener("click", handlers.onAvailableChordClick);
  refs.strumSettings?.addEventListener("change", handlers.onStrumSettingsChange);
  refs.arpeggioSettings?.addEventListener("change", handlers.onArpeggioSettingsChange);
  refs.resetBtn?.addEventListener("click", handlers.onReset);
}

function renderSettingsView({
  root,
  refs,
  t,
  handlers
}) {
  root.innerHTML = `
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

  bindSettingsRefs(refs);
  bindSettingsEvents(refs, handlers);
}

export {
  renderSettingsView
};
