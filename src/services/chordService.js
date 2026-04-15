import {
  CHORD_LIBRARY,
  PITCH_CLASS_TO_SEMITONE,
  SEMITONE_TO_FLAT,
  SEMITONE_TO_SHARP
} from "../config";

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

function createChordLibraryLookup(chordLibrary = CHORD_LIBRARY) {
  const lookup = new Map();
  Object.keys(chordLibrary).forEach((chordId) => {
    const normalized = normalizeChordSymbolForLookup(chordId);
    if (!normalized || lookup.has(normalized)) {
      return;
    }
    lookup.set(normalized, chordId);
  });
  return lookup;
}

const chordLibraryLookup = createChordLibraryLookup();

function findChordIdByDisplaySymbol(chordSymbol, lookup = chordLibraryLookup) {
  const normalized = normalizeChordSymbolForLookup(chordSymbol);
  if (!normalized) {
    return null;
  }
  return lookup.get(normalized) ?? null;
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

export {
  createChordLibraryLookup,
  findChordIdByDisplaySymbol,
  getPitchClassSemitone,
  normalizeChordSymbolForLookup,
  normalizePitchClassToken,
  transposeChordSymbol,
  transposeNote,
  transposePitchClass
};
