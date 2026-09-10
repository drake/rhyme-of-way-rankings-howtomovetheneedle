#!/usr/bin/env python3
"""Recompute rhyme types/scores.

Mosaic is only for pairs where at least one aligned word *before* the last
word also rhymes (Flim Flam & Bim Bam). Last-word-only rhymes like
Cherry Laurel & Wood Sorrell are Perfect/Double/Triple from the CMUdict tail.
"""
from __future__ import annotations

import json
import math
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index.html"
CMUDICT = Path("/Users/TheDrake/nltk_data/corpora/cmudict/cmudict")
VOWELS = set("aeiouy")


def load_cmu(path: Path) -> dict[str, list[list[str]]]:
    cmu: dict[str, list[list[str]]] = defaultdict(list)
    for line in path.read_text(errors="replace").splitlines():
        if not line or line.startswith(";;;"):
            continue
        parts = line.split()
        if len(parts) < 3:
            continue
        if parts[1].isdigit():
            word = re.sub(r"\(\d+\)$", "", parts[0]).lower()
            cmu[word].append(parts[2:])
        else:
            word = re.sub(r"\(\d+\)$", "", parts[0]).lower()
            cmu[word].append(parts[1:])
    return cmu


CMU = load_cmu(CMUDICT)


def tokens(name: str) -> list[str]:
    return [t for t in re.split(r"[\s\-]+", name.strip()) if t]


def norm(word: str) -> str:
    return re.sub(r"[^a-z]", "", word.lower())


def last_stress_tail(phones: list[str]) -> tuple[str, ...]:
    idx = None
    for i, p in enumerate(phones):
        if p[-1:] == "1":
            idx = i
    if idx is None:
        for i, p in enumerate(phones):
            if p[-1:] in "12":
                idx = i
    return tuple(phones[idx:] if idx is not None else phones)


def spelling_nucleus(word: str) -> str:
    w = norm(word)
    i = 0
    while i < len(w) and w[i] not in VOWELS:
        i += 1
    return w[i:]


def lookup(word: str) -> list[list[str]]:
    w = norm(word)
    if not w:
        return []
    if w in CMU:
        return CMU[w]
    if w.endswith("s") and w[:-1] in CMU:
        return CMU[w[:-1]]
    return []


def words_rhyme(a: str, b: str) -> bool:
    pa = {last_stress_tail(p) for p in lookup(a)}
    pb = {last_stress_tail(p) for p in lookup(b)}
    if pa and pb and pa & pb:
        return True
    sa, sb = spelling_nucleus(a), spelling_nucleus(b)
    return bool(sa) and sa == sb and len(sa) >= 2


def tail_syllables(tail: str) -> int:
    left = tail.split("~")[0]
    return sum(1 for p in left.split() if any(c.isdigit() for c in p))


def tail_phones(tail: str) -> int:
    left = tail.split("~")[0]
    return sum(1 for p in left.split() if p and p[0].isalpha())


def last_word_type(tail: str) -> str:
    n = tail_syllables(tail)
    if n >= 3:
        return "Triple"
    if n >= 2:
        return "Double"
    return "Perfect"


def extra_mosaic_pairs(na: str, nb: str) -> int:
    """Count rhyming aligned words *before* the last word."""
    a, b = tokens(na), tokens(nb)
    n = min(len(a), len(b))
    if n < 2:
        return 0
    extra = 0
    for i in range(1, n):
        wa, wb = a[-1 - i], b[-1 - i]
        if norm(wa) == norm(wb):
            continue
        if words_rhyme(wa, wb):
            extra += 1
    return extra


def levenshtein(a: str, b: str) -> int:
    if a == b:
        return 0
    if not a:
        return len(b)
    if not b:
        return len(a)
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def demoted_score(row: dict, fam: int, new_type: str) -> float:
    phones = tail_phones(row["tail"])
    sylls = max(1, tail_syllables(row["tail"]))
    if new_type == "Triple":
        score = 84 + 2 * max(0, phones - 3)
    elif new_type == "Double":
        score = 76 + 3 * max(0, phones - 2)
    else:
        score = 62 + 4 * max(0, phones - 1)
    if fam >= 2:
        score -= min(28.0, 3.2 * math.log2(fam))
    ta, tb = tokens(row["na"]), tokens(row["nb"])
    if ta and tb and norm(ta[0]) == norm(tb[0]) and len(ta) + len(tb) > 2:
        score -= 10
    la, lb = norm(ta[-1]), norm(tb[-1])
    if la and lb and la != lb and levenshtein(la, lb) <= 1:
        score -= 8
    score = max(20.0, min(90.0, score))
    return round(score * 2) / 2


def rescore(rows: list[dict]) -> list[dict]:
    fam = Counter()
    for r in rows:
        a, b = sorted([norm(tokens(r["na"])[-1]), norm(tokens(r["nb"])[-1])])
        fam[(a, b)] += 1

    out = []
    for r in rows:
        extra = extra_mosaic_pairs(r["na"], r["nb"])
        row = dict(r)
        a, b = sorted([norm(tokens(r["na"])[-1]), norm(tokens(r["nb"])[-1])])
        nfam = fam[(a, b)]
        if extra >= 1:
            row["t"] = "Mosaic"
            if r["t"] != "Mosaic":
                row["s"] = min(99.5, max(float(r["s"]) + 12, 94.0))
        else:
            new_t = last_word_type(r["tail"])
            row["t"] = new_t
            if r["t"] == "Mosaic":
                row["s"] = demoted_score(r, nfam, new_t)
        out.append(row)

    out.sort(key=lambda r: (-float(r["s"]), r["na"], r["nb"], r["city"]))
    for i, r in enumerate(out, 1):
        r["r"] = i
    return out


def replace_data(html: str, rows: list[dict]) -> str:
    start = html.index("const DATA = ")
    end = html.index("\nlet sortKey")
    payload = json.dumps(rows, separators=(",", ":"), ensure_ascii=False)
    return html[:start] + "const DATA = " + payload + ";" + html[end:]


def main() -> None:
    html = HTML.read_text()
    m = re.search(r"const DATA = (\[.*?\]);", html)
    if not m:
        raise SystemExit("DATA not found")
    rows = json.loads(m.group(1))
    new_rows = rescore(rows)
    HTML.write_text(replace_data(html, new_rows))

    def show(pred, n=15):
        hits = [r for r in new_rows if pred(r)]
        for r in hits[:n]:
            print(f"{r['r']:4} {r['s']:5.1f} {r['t']:8} {r['na']} & {r['nb']}")
        return hits

    print("types", Counter(r["t"] for r in new_rows))
    print("\nTOP 20")
    show(lambda r: True, 20)
    print("\nCherry Laurel")
    show(lambda r: r["na"] == "Cherry Laurel" and r["nb"] == "Wood Sorrell")
    print("\nTrue mosaics")
    show(lambda r: r["t"] == "Mosaic", 25)
    print("\nFlim Flam")
    show(lambda r: "Flim" in r["na"] or "Flim" in r["nb"])


if __name__ == "__main__":
    main()
