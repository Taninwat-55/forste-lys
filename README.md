# Første Lys

A website for a café on the quay in Nordhavn that does not exist. It opens at 05:30 for the people who are up
before the city, and closes at 13:00 or when the buns run out. The name is Danish for "first light". It is a
design concept, built to show what one strong scroll moment can do for a small café.

## What it is

One page:

- **Hero.** The quay at first light, with the opening time set huge. The photo brightens as the page loads.
- **The Day**, the signature moment. Scroll is the clock. It ticks from 05:30 to 13:00 while the room changes
  colour (night blue, roast brown, gold, cream, then flat at closing), sunlight through the window crosses the
  stage, and the counter board updates: porridge comes off at 09:30, the buns are gone by 10:28. At 13:00 the
  photo is an empty chair and an empty cup, and the line reads "Back at 05:30."
- **Menu**, grouped by the hour each thing appears, with prices.
- **Who's up this early**, the invented regulars as an arrival log.
- **Save a bun.** A working pre-order form for tomorrow's first tray. It knows the café is closed on Mondays,
  that Saturday's tray is always fully saved, and how many buns are left on other mornings (made up, but the
  same date always gives the same answer). It sends nothing and says so.
- **Visit.** Where, when, getting there, access.

## Stack

- Plain HTML, CSS and JavaScript. No framework, no bundler, no `npm install`.
- **GSAP 3.12.5** with **ScrollTrigger** from a CDN, for the one scrubbed timeline.
- **Bodoni Moda** (the hours) and **Schibsted Grotesk** (the text), self-hosted in `assets/fonts`.
- Photos in `assets/img` as AVIF and WebP at 640, 1280 and 1920 px wide.

The page's own code (HTML, CSS and JS together) is about 12 KB gzipped.

## Running it

```sh
python3 -m http.server 4321
```

Then open <http://127.0.0.1:4321>.

## Adding a photo

```sh
sh tools/images.sh ~/Downloads/photo.jpg name
```

This writes `assets/img/name-{640,1280,1920}.{avif,webp}`. It needs `ffmpeg` with SVT-AV1 and `cwebp`.

## Notes

- **Motion is an extra.** Without JavaScript, or with reduced motion turned on, The Day is a plain list of the
  hours, each in its own light, followed by the counter board. Nothing pins.
- **The hero entrance is pure CSS**, so it never waits on the CDN. There is no loader.
- **The address is a real promenade with no house number**, and the footer says the café is invented.

## Credits

Photos from Unsplash: Jesper Giortz-Behrens (Nordhavn), Kaylee Stoll (cup), Marie G. (filter), Diego Arenas de
Rodrigo (rye), Markus Spiske (buns), David Moorhouse (window), shibani Mishra (soup), Philipp Hubert (chair),
Phil Hearing (bun).

The café, the regulars and the menu are invented.
