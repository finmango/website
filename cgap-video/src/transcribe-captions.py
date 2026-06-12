#!/usr/bin/env python3
"""
Whisper-based caption timing.

Transcribes whatever speech assets exist (camera segments + VO) with word
timestamps, then aligns the *reference script* caption units (the cleaned
source of truth — names like FinMango/CGAP mis-transcribe) against the
whisper word stream to produce per-unit [t0, t1] timings. Also extracts the
segment-3 stat cue times from key phrases.

Output: src/captions-timed.json — picked up automatically by
prepare-timeline.mjs on the next build. Without this file the build falls
back to proportional timings.

Usage: python3 src/transcribe-captions.py [--model base|small]
"""
import json
import os
import re
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda *p: os.path.join(ROOT, "assets", *p)
SRC = lambda *p: os.path.join(ROOT, "src", *p)

MODEL = "small" if "--model" in sys.argv and "small" in sys.argv else "base"

SOURCES = {
    "s1": A("camera-open.mp4"),
    "s2": A("vo-segment2.m4a"),
    "s3": A("vo-segment3.m4a"),
    "s4": A("camera-close.mp4"),
}

# spoken forms whisper will likely produce for tokens written numerically
NUMERIC_EQUIV = {
    "100,000": ["100,000", "100000", "one", "hundred", "thousand"],
    "13": ["13", "thirteen"],
    "12": ["12", "twelve"],
    "419": ["419", "four", "hundred", "nineteen"],
    "11": ["11", "eleven"],
    "60": ["60", "sixty"],
}


def norm(w: str) -> str:
    return re.sub(r"[^a-z0-9]", "", w.lower())


def extract_audio(path: str) -> str:
    """mp4 camera files -> wav for whisper."""
    if path.endswith(".mp4"):
        tmp = tempfile.mktemp(suffix=".wav")
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-i", path, "-vn", "-ar", "16000", "-ac", "1", tmp],
            check=True,
        )
        return tmp
    return path


def align(units, words):
    """Greedy fuzzy alignment of reference caption units onto whisper words.

    words: list of dicts {word, start, end}. Returns [(t0, t1)] per unit.
    """
    wnorm = [norm(w["word"]) for w in words]
    out = []
    wi = 0
    for unit in units:
        toks = [t for t in re.split(r"\s+", unit) if t]
        first_hit = None
        last_hit = None
        for tok in toks:
            cands = NUMERIC_EQUIV.get(tok.strip(".,:;!?"), None)
            tnorm = norm(tok)
            if not tnorm and not cands:
                continue
            # search a small window ahead for this token
            found = None
            for j in range(wi, min(wi + 14, len(words))):
                if not wnorm[j]:
                    continue
                if cands and any(wnorm[j] == norm(c) for c in cands):
                    found = j
                    break
                if wnorm[j] == tnorm or (
                    len(tnorm) > 3 and (wnorm[j].startswith(tnorm) or tnorm.startswith(wnorm[j]))
                ):
                    found = j
                    break
            if found is not None:
                if first_hit is None:
                    first_hit = found
                last_hit = found
                wi = found + 1
        if first_hit is None:
            out.append(None)  # resolved in a second pass
        else:
            out.append((words[first_hit]["start"], words[last_hit]["end"]))
    # second pass: fill gaps by interpolating neighbours
    for i, span in enumerate(out):
        if span is None:
            prev_end = out[i - 1][1] if i > 0 and out[i - 1] else 0.0
            nxt = next((s for s in out[i + 1 :] if s), None)
            nxt_start = nxt[0] if nxt else prev_end + 2.0
            out[i] = (prev_end, max(nxt_start, prev_end + 0.8))
    # make windows contiguous-ish: extend each unit until the next one starts
    fixed = []
    for i, (t0, t1) in enumerate(out):
        nxt_start = out[i + 1][0] if i + 1 < len(out) else t1 + 0.6
        fixed.append((float(round(t0, 2)), float(round(max(t1, nxt_start - 0.05), 2))))
    return fixed


def main():
    import whisper  # deferred so --help works without the package

    script = json.load(open(SRC("reference-script.json")))
    model = whisper.load_model(MODEL)
    result = {"model": MODEL, "captions": {}, "statCues": {}}

    for seg, path in SOURCES.items():
        if not os.path.exists(path):
            print(f"[whisper] {seg}: {os.path.relpath(path, ROOT)} missing — skipped")
            continue
        wav = extract_audio(path)
        print(f"[whisper] {seg}: transcribing {os.path.basename(path)} ({MODEL})…")
        tr = model.transcribe(wav, language="en", word_timestamps=True)
        words = []
        for s in tr["segments"]:
            for w in s.get("words", []):
                words.append({"word": w["word"], "start": w["start"], "end": w["end"]})
        spans = align(script[seg], words)
        result["captions"][seg] = [
            {"t0": t0, "t1": t1, "text": u} for (t0, t1), u in zip(spans, script[seg])
        ]
        print(f"[whisper] {seg}: {len(spans)} caption units timed")

        if seg == "s3":
            # stat cues: the moment each key phrase is spoken
            cues = {}
            keys = {
                # (needles, fallback caption-unit keyword)
                "students": (["100,000", "100000", "100", "hundred", "thousand"], "100,000"),
                "countries": (["13", "thirteen"], "13"),
                "research": (["who"], "WHO"),
                "barometer": (["baromet"], "Barometer"),
            }

            def word_hit(wn, needles):
                for n in needles:
                    nn = norm(n)
                    if wn == nn or (len(nn) >= 5 and wn.startswith(nn)):
                        return True
                return False

            for name, (needles, unit_kw) in keys.items():
                hit = next(
                    (w["start"] for w in words if word_hit(norm(w["word"]), needles)), None
                )
                if hit is None:
                    # fall back to the start of the caption unit containing it
                    for (t0, _), u in zip(spans, script[seg]):
                        if unit_kw.lower() in u.lower():
                            hit = t0
                            break
                if hit is not None:
                    cues[name] = float(round(hit, 2))
            result["statCues"] = cues
            print(f"[whisper] s3 stat cues: {cues}")

    with open(SRC("captions-timed.json"), "w") as f:
        json.dump(result, f, indent=2)
    print("[whisper] wrote src/captions-timed.json — re-run ./build.sh to apply")


if __name__ == "__main__":
    main()
