function renderStringBoardRows({
  displayStringOrder,
  chord,
  getStringNote
}) {
  return displayStringOrder.map((stringNo) => {
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

export {
  renderStringBoardRows
};
