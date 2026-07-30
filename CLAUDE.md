# Frontend styling rules

These rules govern all UI work in this app. Follow them for new pages and when touching existing ones.

## Buttons

Always use Skeleton's `btn` classes with a `preset-*` variant, never bespoke gradient/color buttons.

```html
<button type="button" class="btn preset-filled-success-500">Create</button>
<button type="button" class="btn preset-filled-warning-500">Cancel</button>
<button type="button" class="btn preset-filled-error-500">Delete</button>
<button type="button" class="btn preset-tonal-success" disabled>Disabled</button>
```

Color-to-intent mapping:

- **success** — creation / save / confirm actions
- **warning** — abort / cancel actions
- **error** — delete / destructive actions
- **primary** — neutral actions (when there's no create/cancel/delete semantic)

Variant rule: enabled action buttons always use `preset-filled-*`. Never `preset-outlined-*`. `preset-tonal-*` is reserved exclusively for disabled buttons — never use tonal for an enabled/clickable button.

Form action rows (Abbrechen/Speichern etc.): Abbrechen (cancel) is left-aligned, the save/submit button is right-aligned — use `flex justify-between`, not `flex justify-end`.

## Shadows

No shadows anywhere — don't add `shadow-*` classes to buttons, cards, or any other element.

## Color

Stick to Tailwind's built-in palette and Skeleton's theme tokens. No custom colors (no custom `@theme` color tokens, no arbitrary hex values). This includes removing the `brand-navy-*` / `brand-lavender-*` tokens introduced during the earlier retheme — backgrounds/surfaces should use Skeleton's `surface-*` tokens instead.

## Typography

Don't set explicit font colors — the theme's defaults already handle this correctly: dark text in light mode, white text in dark mode.

No custom text sizes. Never use `text-xs`, `text-sm`, `text-lg`, `text-[10px]`, or any other size utility — all body text stays at the default size. Headings (`h1`/`h2`/`h3` or elements clearly acting as a heading/title) are the only exception and may be sized differently.

Never use `uppercase` (or `lowercase`/`capitalize`). Text is shown as written/cased in the data.

## Icons

Always use custom inline SVGs (as already done throughout the app). Don't pull in an icon library.

## Layout

Mobile-first. Design and test the small viewport first, then scale up.

## Accessibility / usability

The app must be easy to understand for older/non-technical users: clear labels, generous tap targets, avoid icon-only controls without a text label or tooltip, avoid jargon.
