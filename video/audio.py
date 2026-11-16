"""
Synthesises the soundtrack for the intro film: an upbeat 116 BPM pop loop plus UI sound effects
(taps, swipes, match chimes) placed from video/out/sfx-<lang>.json, which render.mjs writes.

    python video/audio.py [lang]      lang = en (default) | zh  -> video/out/audio-<lang>.wav
"""
import json
import sys
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44100
DUR = 80.0
BPM = 116
BEAT = 60 / BPM
BAR = 4 * BEAT
OUT = Path(__file__).resolve().parent / 'out'
LANG = sys.argv[1] if len(sys.argv) > 1 else 'en'
rng = np.random.default_rng(7)

N = int(DUR * SR)
music = np.zeros((N, 2))
sfx = np.zeros((N, 2))


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def add(buf, start, sig, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N or i + len(sig) <= 0:
        return
    sig = sig[: N - i]
    l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    buf[i : i + len(sig), 0] += sig * gain * l
    buf[i : i + len(sig), 1] += sig * gain * r


def bandpass(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], btype='band', fs=SR, output='sos'), x)


def highpass(x, f):
    return sosfilt(butter(2, f, btype='high', fs=SR, output='sos'), x)


def lowpass(x, f):
    return sosfilt(butter(2, f, btype='low', fs=SR, output='sos'), x)


# ───────── instruments ─────────
def pad(freqs, dur, bright=1.0):
    t = tt(dur)
    s = np.zeros_like(t)
    for f in freqs:
        for det in (-0.004, 0.004):
            for h in range(1, 7):
                s += np.sin(2 * np.pi * f * (1 + det) * h * t + h) / h ** (1.6 - 0.4 * bright)
    env = np.minimum(1, t / 0.35) * np.minimum(1, (dur - t) / 0.45)
    return s * env / (len(freqs) * 6)


def pluck(f, dur=0.45):
    t = tt(dur)
    s = sum(np.sin(2 * np.pi * f * h * t) / h ** 2 * (1 if h % 2 else 0.35) for h in range(1, 6))
    return s * np.exp(-t / 0.13) * np.minimum(1, t / 0.004)


def bass(f, dur=0.3):
    t = tt(dur)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    return s * np.exp(-t / 0.22) * np.minimum(1, t / 0.006)


def kick():
    t = tt(0.4)
    f = 45 + 85 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / 0.16) + 0.25 * np.exp(-t / 0.004) * rng.standard_normal(len(t))


def clap():
    t = tt(0.25)
    n = bandpass(rng.standard_normal(len(t)), 900, 5000)
    env = np.exp(-t / 0.07) * (1 + 0.6 * np.exp(-((t - 0.012) % 0.012) / 0.003) * (t < 0.036))
    return n * env * 0.6


def hat(open_=False):
    t = tt(0.25 if open_ else 0.06)
    return highpass(rng.standard_normal(len(t)), 7000) * np.exp(-t / (0.08 if open_ else 0.018)) * 0.5


def noise_sweep(dur, lo=400, hi=6000, rise=0.5):
    """filtered-noise whoosh whose band moves up and back down"""
    t = tt(dur)
    n = rng.standard_normal(len(t))
    out = np.zeros_like(t)
    seg = int(0.02 * SR)
    for i in range(0, len(t), seg):
        p = i / len(t)
        c = lo + (hi - lo) * (np.sin(np.pi * p) ** 1.5)
        out[i : i + seg] = bandpass(n[i : i + seg + 64], c * 0.7, min(c * 1.4, SR / 2 - 100))[:seg][: len(out[i : i + seg])]
    env = np.where(t < dur * rise, (t / (dur * rise)) ** 2, np.exp(-(t - dur * rise) / (dur * 0.18)))
    return out * env


def bell(f, dur=1.4):
    t = tt(dur)
    s = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.25) + 0.2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / 0.1)
    return s * np.exp(-t / 0.55) * np.minimum(1, t / 0.003)


# ───────── arrangement ─────────
# I – V – vi – IV in C
CHORDS = [
    (48, [60, 64, 67, 74]),
    (43, [59, 62, 67, 74]),
    (45, [57, 60, 64, 71]),
    (41, [57, 60, 65, 72]),
]
ARP = [0, 1, 2, 3, 2, 1, 2, 3]
n_bars = int(np.ceil(DUR / BAR))
DROP1, BREAK, DROP2, END = 6, 25, 27, 36  # bar numbers

for b in range(n_bars):
    t0 = b * BAR
    root, notes = CHORDS[b % 4]
    full = DROP1 <= b < BREAK or DROP2 <= b < END
    intro = b < DROP1
    brk = BREAK <= b < DROP2
    end = b >= END

    if end:
        if b == END:
            add(music, t0, pad([midi(n) for n in [60, 64, 67, 72, 76]], 6.0, 0.8), 0.55)
            add(music, t0, bass(midi(36), 2.5), 0.5)
            add(music, t0, kick(), 0.8)
            add(music, t0, highpass(rng.standard_normal(int(2.5 * SR)), 5000) * np.exp(-tt(2.5) / 0.6) * 0.3, 1.0)
        continue

    add(music, t0, pad([midi(n) for n in notes], BAR + 0.3, 0.5 if intro else 1.0), 0.32 if intro else 0.26)

    # plucked arpeggio, gently panned
    for i, k in enumerate(ARP):
        if intro and b < 2 and i % 2:
            continue
        add(music, t0 + i * BEAT / 2, pluck(midi(notes[k] + 12)), 0.12 if intro else 0.1, pan=-0.35 if i % 2 else 0.35)

    if full:
        for beat in range(4):
            bt = t0 + beat * BEAT
            add(music, bt, kick(), 0.9)
            if beat in (1, 3):
                add(music, bt, clap(), 0.35, pan=0.05)
            add(music, bt + BEAT / 2, hat(open_=beat == 3), 0.22, pan=0.3)
            add(music, bt, hat(), 0.1, pan=0.3)
            for half in (0, 1):
                add(music, bt + half * BEAT / 2, bass(midi(root - 12 + (12 if half and beat % 2 else 0))), 0.45)
    elif intro and b >= 4:
        for beat in range(4):
            add(music, t0 + beat * BEAT + BEAT / 2, hat(), 0.12, pan=0.3)
    elif brk and b == DROP2 - 1:
        # riser into the second drop
        add(music, t0, noise_sweep(BAR, 300, 9000, rise=0.97), 0.25)
        for i in range(8):
            add(music, t0 + BAR / 2 + i * BEAT / 4, clap(), 0.05 + 0.03 * i)

# sidechain-style pumping on everything but the drums is approximated on the whole bus
pump = np.ones(N)
for b in range(n_bars):
    if DROP1 <= b < BREAK or DROP2 <= b < END:
        for beat in range(4):
            i = int((b * BAR + beat * BEAT) * SR)
            seg = np.arange(min(int(BEAT * SR), N - i)) / SR
            pump[i : i + len(seg)] = 1 - 0.35 * np.exp(-seg / 0.09)
music *= pump[:, None]
music[:, 0] = lowpass(music[:, 0], 14000)
music[:, 1] = lowpass(music[:, 1], 14000)

# ───────── sound effects ─────────
events = json.loads((OUT / f'sfx-{LANG}.json').read_text())
for e in events:
    t, kind = e['t'], e['type']
    if kind == 'tap':
        x = tt(0.03)
        add(sfx, t, np.sin(2 * np.pi * (1500 - 12000 * x) * x) * np.exp(-x / 0.008), 0.22)
    elif kind == 'swipe':
        add(sfx, t - 0.08, noise_sweep(0.45, 500, 5000, rise=0.35), 0.5)
    elif kind in ('whoosh',):
        add(sfx, t - 0.1, noise_sweep(0.7, 250, 3500, rise=0.5), 0.35)
    elif kind == 'pop':
        x = tt(0.14)
        f = 260 + 520 * np.exp(-x / 0.03)
        add(sfx, t, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / 0.05), 0.45)
    elif kind == 'tick':
        x = tt(0.09)
        f = 500 + 700 * np.exp(-x / 0.02)
        add(sfx, t, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / 0.03), 0.3)
    elif kind in ('match', 'chime'):
        base = 84 if kind == 'match' else 72
        for i, m in enumerate([0, 4, 7, 12]):
            add(sfx, t + i * 0.075, bell(midi(base + m)), 0.16, pan=-0.3 + 0.2 * i)

# ───────── master ─────────
mix = 0.62 * music + sfx
fade_in = np.minimum(1, np.arange(N) / (0.4 * SR))
fade_out = np.clip((DUR - 0.2 - np.arange(N) / SR) / 1.4, 0, 1)
mix *= (fade_in * fade_out)[:, None]
mix = np.tanh(1.3 * mix / np.max(np.abs(mix))) / np.tanh(1.3)
mix *= 0.89 / np.max(np.abs(mix))
wavfile.write(OUT / f'audio-{LANG}.wav', SR, (mix * 32767).astype(np.int16))
print('wrote', OUT / f'audio-{LANG}.wav', f'{len(events)} sfx')
