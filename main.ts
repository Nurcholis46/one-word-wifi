import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

// One word: the funniest and most accurate description of your Wi-Fi.
// Chosen against the judge's brief, in its own order: it is squarely
// about Wi-Fi as the entrant lives it — "Buffering" is the word every
// home Wi-Fi user has stared at, the spinning wheel that appears exactly
// when the show, the call, or the game matters most; the laugh lands at
// once, because naming your network "Buffering" is a confession and a
// joke in a single word — guests join it and instantly understand why
// nothing loads; it is true to how home Wi-Fi actually behaves, since
// the buffer wheel is the universal symptom of a weak, crowded or
// far-from-the-router signal, not an exotic failure; it avoids the words
// everyone reaches for ("Slow", "Weak", "DeadZone") and instead names the
// experience itself, a surprising angle on a familiar annoyance; and it
// works as a single word with no context needed — spelled the way every
// viewer reads it on screen, it doubles as a perfect network name, which
// is what the winning word becomes.
// Alternatives weighed and set aside: "Lagging" is true but flat — it
// describes the symptom without the joke, and as a network name it reads
// as a complaint rather than a punchline; "Ghosting" is clever (the
// signal vanishes without explanation) but it points at a person
// disappearing, not at Wi-Fi, so it needs a moment of translation;
// "OneBar" is honest about the bathroom dead zone but it is a status
// report, not a laugh, and it loses to any word that is actually funny.
// "Buffering" is the word everyone already says out loud at their router,
// so it wins on truth and on the laugh at the same time.
const text = "Buffering";

// The gate: /output/entry.txt must be UTF-8 text of 1 to 20 characters,
// not only white space. The entry is one word: fail loudly instead of
// writing an entry the judge would refuse. Letters only — no whitespace
// at all, no punctuation, no digits, no control characters (including
// U+2028/U+2029), no leading or trailing padding.
const codePoints = [...text].length;
if (codePoints < 1 || codePoints > 20 || text.trim().length === 0) {
  throw new Error(
    `entry must be 1-20 characters of non-blank text, got ${codePoints}`,
  );
}
if (!/^[A-Za-z]+$/.test(text)) {
  throw new Error("entry must be exactly one word, letters only");
}
if (/[\u0000-\u001f\u007f\u2028\u2029]/.test(text)) {
  throw new Error("entry must not contain control characters");
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", text, { encoding: "utf8", mode: 0o644 });
// The grader collects outputs as another user: leave the file readable by
// everyone, or the run fails with "<path> is not readable".
chmodSync("/output/entry.txt", 0o644);

// Read it back and prove the file on disk is exactly the word: a write
// that silently truncated, re-encoded or padded the entry would otherwise
// ship a different text to the judge than the one gated above.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== text) {
  throw new Error("entry file does not match the gated word");
}
// Byte-length check: the gate counts characters, the judge reads bytes.
// A re-encode or stray padding that survived the string compare above
// would change the file's size and ship a different text to the judge.
if (Buffer.byteLength(written, "utf8") !== Buffer.byteLength(text, "utf8")) {
  throw new Error("entry file byte length does not match the gated word");
}
