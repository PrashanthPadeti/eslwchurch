# Brand & Design System

Derived from the supplied logo by sampling its actual pixels, then validated for
WCAG 2.1 AA contrast. Every colour below is measured from the emblem, not
invented.

---

## 1. Palette

### Blues — from the "LIVING WATERS" wordmark and the river

| Token | Hex | Sampled from | Use |
|---|---|---|---|
| `blue-900` | `#041B54` | deepest wordmark stroke | Headings, footer ground, dark sections |
| `blue-700` | `#0A2E7A` | wordmark body (`#001878`–`#003090`) | Primary brand colour, links, nav |
| `blue-500` | `#1D4FA8` | wordmark highlight | Hover states, secondary fills |
| `blue-300` | `#6090C0` | river water | Decorative only — see contrast rules |

### Golds — from the ring and lettering

| Token | Hex | Sampled from | Use |
|---|---|---|---|
| `gold-600` | `#A87400` | ring shadow | Large text on light, icon strokes |
| `gold-500` | `#C8921F` | ring body (`#C09018`) | Accent, button fill, rules, dividers |
| `gold-300` | `#D8A830` | ring highlight | Accents **on dark only** |
| `gold-100` | `#F5E6C0` | ring inner glow | Soft fills, dark-section body text |

### Neutrals and accent

| Token | Hex | Use |
|---|---|---|
| `ground` | `#FAF8F4` | Page background, warm off-white |
| `surface` | `#FFFFFF` | Cards |
| `ink` | `#16202E` | Body text |
| `ink-muted` | `#5A6675` | Secondary text, captions |
| `accent-red` | `#7A1F14` | From the cross drape. Reserve for Easter/Communion only. |

---

## 2. Contrast rules — non-negotiable

Measured ratios:

| Combination | Ratio | Verdict |
|---|---|---|
| `ink` on `ground` | 15.47:1 | AAA |
| `blue-900` on `ground` | 15.35:1 | AAA |
| `blue-700` on `ground` | 11.75:1 | AAA |
| white on `blue-900` | 16.28:1 | AAA |
| white on `blue-700` | 12.46:1 | AAA |
| `gold-100` on `blue-900` | 13.15:1 | AAA |
| `gold-300` on `blue-900` | 7.41:1 | AAA |
| `gold-500` on `blue-900` | 5.88:1 | AA |
| `blue-900` on `gold-500` | 5.88:1 | AA |
| `gold-600` on `ground` | 3.83:1 | **Large text only** |
| `blue-300` on `ground` | 3.17:1 | **Decorative only** |
| `gold-500` on `ground` | 2.61:1 | **FAILS — never for text** |

**The rule that follows:** the logo's gold is a *dark-background* colour. It is
beautiful on navy and unreadable on cream.

- ✅ Gold text on navy sections
- ✅ Navy text on a gold button fill
- ✅ Gold as rules, borders, icon strokes and ornament on light backgrounds
- ❌ Gold as body text, links, or small labels on light backgrounds
- ❌ `blue-300` for any text

This is why the design leans on **navy sections with gold accents** for emphasis
rather than gold-on-cream, which is the obvious-looking choice that fails.

---

## 3. Typography

| Role | Face | Notes |
|---|---|---|
| Display / headings | **Fraunges** or **Lora** | Serif. Echoes the logo's engraved lettering. |
| Body | **Inter** | 17–18px minimum. Many readers are over 50. |
| Scripture quotes | Body serif, italic, `blue-700` | Set apart with a gold left rule |
| Second language | TBC — depends on script | Indic/CJK needs a matched Noto subset |

Scale: 1.25 modular. Line length capped at 68 characters. Line height 1.6 for
body, 1.2 for display.

---

## 4. Logo assets

Delivered in `assets/logo/`:

| File | Size | Notes |
|---|---|---|
| `logo-master.png` | 980×980 | Transparent, antialiased circular mask |
| `logo-1024/512/256/128/64.png` | as named | Transparent |
| `logo-original-flat.jpg` | 1536×1024 | Untouched extract, `#F7F7F7` background |

Background removal used a supersampled circular alpha mask rather than colour
keying, so the white areas *inside* the emblem — the dove, the foam, the sky —
stay intact.

### Legibility ceiling — important

The emblem is a photographic raster with fine detail (dove feathers, river
rapids, distant hills) and two rings of small lettering. Tested at small sizes:

| Size | Result |
|---|---|
| 128px+ | Reads well |
| 64px | "LIVING WATERS" readable; "EL SHADDAI" and "CHURCH" marginal |
| 48px | Illegible |
| 32px / 16px | An unidentifiable coloured blob |

**Consequences:**

1. **Site header** — use the emblem at 56–64px **beside a typeset wordmark**,
   never the emblem alone. The type carries the name; the emblem carries the
   identity.
2. **Favicon** — the emblem cannot be used. A simplified mark is required:
   a gold ring enclosing a minimal cross-and-wave, drawn as SVG. I will produce
   this unless you would rather commission it.
3. **Hero, footer, print** — the emblem at 200–400px, where it genuinely looks
   good.
4. **No vector source exists.** Redrawing the emblem as SVG costs roughly
   A$150–350 from a freelance illustrator and would future-proof it for signage,
   banners and embroidery. Not needed for launch.

### File weights (why format matters)

| Size | PNG | WebP q82 | AVIF q60 |
|---|---|---|---|
| 512px | 444 KB | 55 KB | 37 KB |
| 256px | 126 KB | 21 KB | 14 KB |
| 128px | 36 KB | 8 KB | 6 KB |

The build will serve AVIF with WebP fallback. A 256px header emblem costs about
14 KB — comfortably inside the 250 KB page budget. Shipping the raw PNG would
spend nearly half the budget on the logo alone.

---

## 5. Visual motifs from the emblem

Elements worth carrying into the site so it feels of a piece with the logo:

- **The gold ring** → thin gold rules between sections; circular photo crops
- **Flowing water** → a subtle wave divider between page sections
- **Sunrise warmth** → the warm off-white ground, not a cold grey
- **The dove** → simplified as a small SVG for section markers and the favicon

Used sparingly. The emblem is already ornate; the page around it should be calm.
