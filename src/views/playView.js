function bindPlayRefs(refs) {
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
}

function bindPlayEvents(refs, handlers) {
  refs.openSettingsBtn?.addEventListener("click", handlers.onOpenSettings);
  refs.cycleButton?.addEventListener("click", handlers.onCycleChord);
  refs.leftPanelToggleBtn?.addEventListener("click", handlers.onToggleLeftPanel);
  refs.arpeggioToggleBtn?.addEventListener("click", handlers.onToggleArpeggio);
  refs.arpeggioPatternSelect?.addEventListener("change", handlers.onArpeggioPatternChange);
  refs.arpeggioStepInput?.addEventListener("change", handlers.onArpeggioStepChange);
  refs.arpeggioImmediatePauseCheckbox?.addEventListener("change", handlers.onArpeggioImmediatePauseChange);

  refs.stringBoard?.addEventListener("pointerdown", handlers.onStringBoardPointerDown);
  refs.stringBoard?.addEventListener("pointermove", handlers.onStringBoardPointerMove);
  refs.stringBoard?.addEventListener("pointerup", handlers.onStringBoardPointerEnd);
  refs.stringBoard?.addEventListener("pointercancel", handlers.onStringBoardPointerEnd);
  refs.stringBoard?.addEventListener("lostpointercapture", handlers.onStringBoardPointerEnd);
}

function renderPlayView({
  root,
  refs,
  state,
  visiblePatterns,
  t,
  formatKeyLabel,
  arpeggioToggleKey,
  minArpeggioStepMs,
  maxArpeggioStepMs,
  handlers
}) {
  root.innerHTML = `
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
                    min="${minArpeggioStepMs}"
                    max="${maxArpeggioStepMs}"
                    step="5"
                    value="${state.arpeggioStepMs}"
                  />
                </label>
                <label class="setting-line arpeggio-line" for="arpeggioImmediatePauseCheckbox">
                  <span>${t("arpeggioImmediatePauseLabel")}</span>
                  <input id="arpeggioImmediatePauseCheckbox" type="checkbox" ${state.arpeggioPauseImmediate ? "checked" : ""} />
                </label>
                <p class="muted-text">${t("arpeggioHint", { key: `<kbd>${formatKeyLabel(arpeggioToggleKey)}</kbd>` })}</p>
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

  bindPlayRefs(refs);
  bindPlayEvents(refs, handlers);
}

export {
  renderPlayView
};
