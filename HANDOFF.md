# STICKS Handoff — 2026-05-14 (post-Stripe-live + App Store kickoff)

## Who, what, where

- **App**: STICKS — golf scoring + GPS PWA
- **Live URL**: https://sticks-xi.vercel.app (NOT `sticks-golf.vercel.app` — that's stale)
- **Repo**: https://github.com/olliedigital/sticks
- **Local path**: `C:\Users\maxim\projects\sticks\repo`
- **Stack**: Single-file React PWA (`repo/index.html`, ~3000 lines, Babel-in-browser, no build step), Supabase auth+DB, Stripe live mode, Google Maps + Open-Meteo, Vercel hosting
- **Owner**: Maximus K. Austria, 18 (born Jan 2 2008), `maximus.k.austria@gmail.com`. The Claude harness shows `oliver.austria@gmail.com` (dad's email) — ignore that, Max is the user.

**Memory files** in `C:\Users\maxim\.claude\projects\C--Users-maxim-projects-sticks\memory\`:
- `project_sticks.md` — project facts
- `user_oliver.md` — corrected to Maximus
- `MEMORY.md` — index

---

## What shipped this session (in order)

All commits on `main`:

| Commit | What |
|---|---|
| `cb7c824` | Self-host DM Sans + Space Mono fonts (dropped Google Fonts CDN) |
| `4972d43` | Auth landing: `$0 FOREVER` instead of `FREE FOREVER` |
| `e4651d1` | Auth landing: truthful `3 ROUNDS FREE · ∞ SCORE TRACKING` |
| `39e6939` | Hole map: satellite default + 18Birdies-style cascade chips |
| `7330e79` | Auto-advance: tighten next-tee snap from 45yd to 20yd |
| `8a5bfd4` | Map: tap-to-measure target on satellite view |
| `4c36f7d` | SVG hole map: default + scale to actual yardage + bigger |
| `ae2b78f` | SVG hole map: crop viewBox to used play area |
| `341cfe3` | SVG hole map: constrain to 4:5 aspect (less vertical) |
| `5d09e9f` | Stripe live mode: pk_live + live price IDs, fix URLs |
| `eb5aaba` | Upgrade screen: prices match live Stripe |
| `b647696` | Pricing: 3 tiers — Weekly $3.99 / Monthly $6.99 / Yearly $49.99 |
| `71f1f1f` | Theme: remove sun/moon header icon, add Dark/Light toggle in Profile |
| **`491eb83`** | **Capacitor wiring** — native iOS shell for the PWA (latest) |

Earlier this session also shipped (pre-`cb7c824`): SW registration, PWA install prompt, elevation plays-as, OAuth guards, round share viewer (`?r=base64`), design tokens in `:root`, topographic GPS auth hero.

---

## Decisions made & locked in

### Product

- **Free tier**: 3 GPS rounds, unlimited basic scoring + handicap (`FREE_ROUND_LIMIT=3`)
- **Pricing** (live in Stripe):
  - Weekly: $3.99 → `price_1TXC5jGg73wymaEslSZv9HLD`
  - Monthly: $6.99 → `price_1TXC6IGg73wymaEsnhzZEqSG`
  - Yearly: $49.99 → `price_1TXC6IGg73wymaEshxn60AEq`
- **Voice/copy**: honest, anti-bloat — *"No 50-menu bullshit. No upsells."* (referenced in pricing strategy but not yet on landing/paywall)
- **Founding Members $29/yr lifetime for first 100** — discussed, NOT implemented
- **Theme picker** in Profile screen (Dark/Light buttons), removed sun/moon emoji from header
- **Hole map default** = hand-drawn SVG (NOT satellite). Satellite view is still toggleable via "Satellite" pill button. Reason: Google's tee/green coordinates were inaccurate; the SVG illustration looks intentional rather than wrong.

### Infrastructure

- **Stripe**: LIVE MODE active
  - Account: STICKS (Maximus Austria as account rep)
  - Account status: **"Information in review"** for ID document + SSN as of session end. Payments/payouts may still be paused — verify before claiming launched.
  - Webhook endpoint: `https://sticks-xi.vercel.app/api/webhook` (note: `/webhook`, NOT `/stripe-webhook` — wrong URL was given initially then fixed)
  - Bank: Capital One ····8431, manual payouts
- **Supabase**: Project `adcybagoehsbsljxbtgu.supabase.co` — free tier (auto-pauses after ~1 week idle)
- **Google OAuth**: configured. JS origin = `https://sticks-xi.vercel.app`, Redirect URI = Supabase callback. Working.
- **Supabase Site URL**: `https://sticks-xi.vercel.app` with `/**` redirect pattern; `http://localhost:3000/**` also allowed for local dev

### Mobile / App Store

- **Capacitor wired in** (commit `491eb83`). Bundled mode (NOT server.url) — Apple rejects pure webview wrappers.
- **App ID**: `com.sticks.golf`
- **App Name**: `STICKS`
- **Apple Developer account**: Max's DAD's (Oliver Austria), Individual account. Mac access: dad's Mac. Payouts go to dad's account.
- **iOS payments strategy**: **deferred**. Either:
  - **A** (likely): Apple IAP for App Store builds (15% take), Stripe stays for web
  - **B**: Hide upgrade UI on iOS, direct users to web (Apple may reject)
  - Need to decide before submission

---

## Open / unresolved

### Critical — verify before claiming launched

1. **Live checkout end-to-end** — never confirmed working after the env-var stray-newline fix + rolled secret key + redeploy. Max said `yyyy` confirming the 4 setup steps but never reported "checkout actually worked." **Do this first in the next session.** Open https://sticks-xi.vercel.app in incognito, run a real card through, confirm Pro unlocks.
2. **Roll the Stripe secret key one more time.** Three different `sk_live_…` values were pasted in chat during this session (the original, the first rotation, the second rotation that's currently in Vercel). The one in Vercel right now ends `…H15`. After confirming checkout works, rotate it again, paste cleanly into Vercel (no leading newline this time!), redeploy. Don't paste the new value into any AI chat.
3. **Stripe account status** — Max submitted ID + SSN; both showed "Information in review." Verify Stripe → Account status shows everything green before sending traffic. Payments may be paused otherwise.
4. **Test on a real golf course.** Never been done. The geofence-based auto-hole-advance, GPS, weather, satellite/SVG maps, Pro flow — all unverified in the wild.

### High value, not blockers

5. **Course data accuracy.** STICKS uses free APIs (GolfCourseAPI + Google Places + OSM/Nominatim) for tee/green coords. Quality is inconsistent. Real fix is paid API like **Golf Intelligence ($399/mo)** when there's revenue to justify it. Crowdsource path (drag-to-correct + Supabase write-back) was discussed; the `course_greens` table is wired and writing, `course_tees` SQL was given to Max but never confirmed he ran it.
6. **Sentry / PostHog** — no error monitoring in production. Single 3000-line file with no observability. Recommended adding before real traffic.
7. **Group play / live leaderboard** — biggest competitive gap (18Birdies' moat). Not started.
8. **Apple Watch + native sensors** — table stakes for serious golfers. Capacitor enables eventual watch app but not done.

### App Store — what's done vs what's not

Done:
- Capacitor deps + `capacitor.config.json` (bundled mode, com.sticks.golf, splash colors)
- `index.html` detects `window.Capacitor.isNativePlatform()` and points `API_BASE` to live Vercel
- Service worker registration skipped on native
- Commit `491eb83` pushed

Not done (waiting on Max's Mac access):
- `npm install` on Mac
- `npx cap add ios` (generates `ios/` Xcode project)
- `npx cap sync ios`
- Open in Xcode, set Team = dad's account, run on simulator/device
- App icon at 1024×1024 (currently only have icon-512.png)
- Splash screen asset
- `Info.plist` GPS usage description ("This app uses your location to calculate distances on the golf course.")
- IAP swap for iOS subscription button
- App Store Connect listing (description, screenshots, age rating, privacy policy URL)

### Identified bugs / risks

- **Stripe secret key leakage**: three keys pasted in chat. Highest-priority post-launch hygiene item.
- **Round share button** uses `?r=base64` URL encoding — works but URLs get long. Fine for v1.
- **Vercel env var paste pitfall**: when Max pasted the secret key, a leading newline broke the `Authorization` header. Confirmed fixed but flag this pattern — if a future env var swap fails with `StripeConnectionError`, check for stray whitespace.
- **Auto-advance at 20yd** is untested in real conditions. May be too tight — golfers walking off green might never pass within 20yd of the next tee if it's set back. Watch for in real round test.
- **SVG yardage scale** uses a fixed assumption that 580yd = max length. Very long par 5s might still look stubby; very short par 3s look fine.

---

## Pricing strategy — research-backed (real 2026 numbers)

| App | Monthly | Annual |
|---|---|---|
| 18Birdies Premium | $19.99 | $99.99 |
| Golfshot Pro | $17.99 | $79.99 |
| GolfLogix Plus | $9.99 | $49.99–$69.99 |
| Hole19 Pro | $9.99 | $59.99 |
| **STICKS** | **$6.99** | **$49.99** + $3.99/wk |

STICKS is cheapest of the named pack. Positioning hook (NOT yet copy-implemented): *"$50 less than 18Birdies, same scoring + GPS, no menu maze."*

---

## File map cheat sheet

- `repo/index.html` — the entire React app. Edit here.
- `repo/api/checkout.js` — Stripe Checkout session creator (needs env `STRIPE_SK`)
- `repo/api/webhook.js` — Stripe webhook receiver (needs env `STRIPE_SK`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_KEY`)
- `repo/api/portal.js` — Stripe Customer Portal session
- `repo/api/status.js` — health check
- `repo/sw.js` — service worker (current cache: `sticks-v15-fonts`)
- `repo/fonts/` — DM Sans + Space Mono TTF files (self-hosted)
- `repo/capacitor.config.json` — native shell config
- `repo/package.json` — deps include Capacitor
- `repo/manifest.json` — PWA manifest
- `repo/vercel.json` — Vercel config (no-cache headers; do not remove)

---

## Key env vars (Vercel — Production)

| Var | Value source |
|---|---|
| `STRIPE_SK` | rolled live secret key (last one pasted in chat, ends `…H15` — roll AGAIN per item #2 above) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_ISHEVHs4k1ZvSsKfp6FHPwNQwNa2XUEh` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (was already set, didn't touch) |

In-code constants (`repo/index.html`):
- `STRIPE_PK` = `pk_live_51T6grcGg73wyma...VWOMlAVZ`
- `PRICE_WEEKLY`, `PRICE_MONTHLY`, `PRICE_ANNUAL` — see Decisions section

---

## Working style notes

- Max is non-technical / low-code background. Walk infrastructure steps with exact UI paths (Stripe dashboard, Vercel, Supabase, Xcode).
- Single-file HTML + CDN libs is intentional. Don't suggest a build system or React rewrite.
- He prefers fast iteration: commit + push frequently rather than batching big changes.
- He'll often paste screenshots — interpret them and respond with the specific next click.
- He gets frustrated with verbose explanations. Lead with the action; explain only when asked.

---

## Suggested next-session priority

1. **Confirm live Stripe checkout works** — Max never reported success after the last fix. Test in incognito.
2. **Roll Stripe secret key one final time** (security hygiene from leaked chat pastes).
3. Then continue **App Store path** on Max's dad's Mac: install Xcode, `npm install`, `npx cap add ios`, `npx cap sync`, open in Xcode, set signing team, run on simulator.
4. Decide **iOS payment strategy** (Apple IAP vs. hide-paywall-defer-to-web).
5. Real-course test (only Max can do this).

Latest commit on `main`: `2b049f7` (this handoff doc added to repo).

---

## Opening prompt for next Claude Code session

Paste this into the new session on the Mac to pick up cleanly:

```
Read HANDOFF.md at the repo root top to bottom — that's the full state of STICKS as of last session. I'm Maximus (the user; the harness email might say oliver.austria@gmail.com but that's my dad's Claude account — memory files are correct).

I'm now on my dad's Mac to start the App Store path.

Latest commit on main is 2b049f7 — Capacitor is wired in but nothing has been run on a Mac yet. The repo is freshly cloned/pulled here.

Two unresolved items I should gate on before going deep on App Store:
  (a) Confirm the live Stripe checkout actually works end-to-end. Setup was completed last session but never confirmed with a real-card test after the final env-var fix + key rotation + redeploy.
  (b) Roll the Stripe secret key one more time — three different sk_live_... values got pasted in the previous chat; need to invalidate all of them.

After those, the App Store work: install Xcode, then in repo/ run
  npm install
  npx cap add ios
  npx cap sync ios
  npx cap open ios
Set the signing team to my dad's Apple Developer account (Individual). Then we decide iOS payment strategy: Apple IAP (15% take but allowed) vs hide-paywall-defer-to-web (Apple may reject).

Don't re-explain anything from the handoff doc — just read it once. Start by asking me which of (a), (b), or "skip straight to Xcode" I want to tackle first.
```

End of handoff.
