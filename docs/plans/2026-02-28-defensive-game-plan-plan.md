# Defensive Game Plan Tool — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an interactive 5-step wizard that helps a basketball coach create opponent-specific defensive game plans, saved locally in the browser.

**Architecture:** Single HTML file (`defensive-game-plan.html`) with embedded CSS and JS. Express server updated to serve it at `/game-plan`. Wizard state managed via a single JS object, persisted to localStorage.

**Tech Stack:** Vanilla HTML/CSS/JS, Google Fonts (Inter), Express.js for serving.

---

### Task 1: Create HTML Shell with CSS Foundation

**Files:**
- Create: `defensive-game-plan.html`

**Step 1: Create the HTML file with base structure**

Create `defensive-game-plan.html` with:
- DOCTYPE, head with meta tags, Google Fonts import (Inter weights 300-800)
- CSS custom properties matching the design doc colors:
  - `--bg: #0F1219` (deep navy-charcoal)
  - `--surface: #161B25`
  - `--surface2: #1E2433`
  - `--border: rgba(255,255,255,0.08)`
  - `--text: #E2E5EB`
  - `--text-dim: #8891A0`
  - `--text-muted: #555D6E`
  - `--heading: #ffffff`
  - `--crimson: #CC1735` (DU crimson accent)
  - `--gold: #CFB87C` (DU gold accent)
  - `--crimson-glow: rgba(204,23,53,0.15)`
  - `--radius: 12px`
- Global reset (`* { margin:0; padding:0; box-sizing:border-box }`)
- Body styles: dark bg, Inter font, min-height 100vh
- Empty `<div id="app"></div>` in body
- Empty `<script>` tag at end of body

**Step 2: Add the page header and progress bar CSS**

CSS for:
- `.header` — top bar with tool title "DU Defensive Game Plan" and a "Load Plan" / "New Plan" button group
- `.progress-bar` — horizontal 5-step indicator, flex row, each step is a numbered circle + label
- `.progress-step` — base style (muted circle), `.progress-step.active` (crimson fill), `.progress-step.visited` (gold outline)
- `.progress-line` — connecting lines between steps, filled when visited

**Step 3: Add wizard container and step panel CSS**

CSS for:
- `.wizard-container` — centered max-width 900px, padding
- `.step-panel` — each wizard step's content area, hidden by default, `.step-panel.active` shown with fadeUp animation
- `.step-title` — large heading for each step
- `.step-subtitle` — description text below title
- `.nav-buttons` — bottom bar with Back/Next buttons, flex with space-between
- `.btn-next` / `.btn-back` — styled buttons, Next is crimson, Back is ghost/outline

**Step 4: Add interactive element CSS**

CSS for:
- `.card-selector` — grid of selectable cards (for defense types), `.card-selector .card.selected` with crimson border glow
- `.chip-group` — flex-wrap container for tendency tag chips
- `.chip` — pill-shaped selectable chip, `.chip.selected` with gold background
- `.chip-custom` — chip with input for custom tags
- `.player-row` — flex row for opponent player entry (name, number, position, tags, notes)
- `.player-add-btn` — "+" button to add player rows
- `.matchup-row` — row for assigning DU player to opponent player
- `.textarea-field` / `.input-field` — styled dark inputs with border, focus glow
- `.accordion` — collapsible section for summary, `.accordion.open` shows content
- `.threat-badge` — small red badge for flagging primary threats
- `.save-bar` — bottom bar on summary step with Save/Load/New buttons

**Step 5: Verify the file renders**

Run: `node server.js` and open the page in browser.
Expected: Dark empty page loads without errors.

**Step 6: Commit**

```bash
git add -f defensive-game-plan.html
git commit -m "feat: add defensive game plan HTML shell with CSS foundation"
```

---

### Task 2: Update Express Server

**Files:**
- Modify: `server.js`

**Step 1: Add route for the game plan page**

Add a new route to `server.js`:

```javascript
app.get('/game-plan', (req, res) => {
  res.sendFile(path.join(__dirname, 'defensive-game-plan.html'));
});
```

Add it after the existing `/` route, before `app.listen`.

**Step 2: Verify both routes work**

Run: `node server.js`
- Navigate to `http://localhost:3000/` — Brand Builder loads
- Navigate to `http://localhost:3000/game-plan` — Game Plan page loads

**Step 3: Commit**

```bash
git add server.js
git commit -m "feat: add /game-plan route to Express server"
```

---

### Task 3: Build Wizard Engine (JS State + Navigation)

**Files:**
- Modify: `defensive-game-plan.html` (script section)

**Step 1: Define the game plan state object**

In the `<script>` tag, create:

```javascript
const STEPS = ['identity', 'scouting', 'matchups', 'situations', 'summary'];
const STEP_LABELS = ['Defensive Identity', 'Opponent Scouting', 'Matchup Assignments', 'Situations', 'Game Plan Summary'];

let currentStep = 0;
let visitedSteps = new Set([0]);

let gamePlan = {
  identity: {
    baseDefense: '',
    secondaryDefense: '',
    transitionStyle: '',
    playersBack: 3,
    reboundingPhilosophy: '',
    boxOutNotes: ''
  },
  scouting: {
    opponentName: '',
    gameDate: '',
    players: [],
    pace: '',
    primaryActions: [],
    strengths: '',
    weaknesses: ''
  },
  matchups: [],
  situations: {
    lateClock: '',
    atoPlays: '',
    foulRules: '',
    endOfPeriod: '',
    pressBreak: ''
  }
};
```

**Step 2: Build the render engine**

Write a `render()` function that:
1. Clears `#app`
2. Calls `renderHeader()` — tool title + Load/New buttons
3. Calls `renderProgressBar()` — 5 steps with current/visited state
4. Calls `renderStep(currentStep)` — dispatches to step-specific render function
5. Calls `renderNavButtons()` — Back/Next at bottom

Write `goToStep(index)` that updates `currentStep`, adds to `visitedSteps`, calls `render()`.

**Step 3: Render the header**

`renderHeader()` returns HTML string for:
- Tool title "DU Defensive Game Plan"
- Button group: "Load Plan" dropdown + "New Plan" button (wire up later in Task 8)

**Step 4: Render the progress bar**

`renderProgressBar()` returns HTML string for the 5-step progress bar:
- Each step: numbered circle (1-5) + label from `STEP_LABELS`
- Apply `.active` class to current step
- Apply `.visited` class to visited steps
- Connecting lines between steps, filled if next step is visited
- Click handler on visited steps to jump: `onclick="goToStep(${i})"`

**Step 5: Render nav buttons**

`renderNavButtons()` returns HTML string:
- "Back" button (hidden on step 0), calls `goToStep(currentStep - 1)`
- "Next" button (label changes to "View Summary" on step 3, hidden on step 4), calls `goToStep(currentStep + 1)`

**Step 6: Add placeholder step renderers**

Create 5 functions that return placeholder HTML:
- `renderIdentityStep()` — "Step 1: Defensive Identity" heading
- `renderScoutingStep()` — "Step 2: Opponent Scouting" heading
- `renderMatchupsStep()` — "Step 3: Matchup Assignments" heading
- `renderSituationsStep()` — "Step 4: Situation Adjustments" heading
- `renderSummaryStep()` — "Step 5: Game Plan Summary" heading

Wire `renderStep()` to call the right one based on index.

**Step 7: Initialize**

Add `render()` call at end of script to boot the app.

**Step 8: Verify navigation works**

Run the server, open `/game-plan`:
- Progress bar shows 5 steps, step 1 highlighted
- Next button advances through all 5 steps
- Back button goes back
- Visited steps are clickable in progress bar
- Each step shows its placeholder heading

**Step 9: Commit**

```bash
git add defensive-game-plan.html
git commit -m "feat: add wizard navigation engine with progress bar"
```

---

### Task 4: Build Step 1 — Defensive Identity

**Files:**
- Modify: `defensive-game-plan.html` (script section)

**Step 1: Implement `renderIdentityStep()`**

Replace the placeholder with full UI:

**Base Defense selector** — card grid (2 columns on desktop, 1 on mobile) with these options:
- Man-to-Man
- 2-3 Zone
- 3-2 Zone
- 1-3-1 Zone
- Matchup Zone
- 1-2-2 Press
- Full Court Man Press

Each card shows the defense name. Clicking selects it (`gamePlan.identity.baseDefense = value`) and adds `.selected` class. Pre-select from state if already set.

**Secondary Defense** — same card options but smaller cards, labeled "Change-Up Defense (Optional)". Store in `gamePlan.identity.secondaryDefense`.

**Transition Defense** — two-option toggle:
- "Get Back" — prioritize getting back in transition
- "Scramble" — aggressive, gamble for steals

Plus a small number input: "Players back on shot: " with a number input (1-5, default 3). Store in `gamePlan.identity.transitionStyle` and `gamePlan.identity.playersBack`.

**Rebounding Philosophy** — two-option toggle:
- "Crash the Boards" — send 3-4 to rebound
- "Get Back" — limit to 1-2, prioritize transition D

Plus a textarea: "Box-out assignment notes" for free text. Store in `gamePlan.identity.reboundingPhilosophy` and `gamePlan.identity.boxOutNotes`.

**Step 2: Wire up data binding**

All selections immediately update `gamePlan.identity`. Use `onclick` handlers on cards and toggles. Use `oninput` on text fields.

**Step 3: Verify step 1 renders and persists**

- All cards render and are clickable
- Selecting a card highlights it with crimson border
- Navigating to step 2 and back preserves selections
- Text inputs retain their values on re-render

**Step 4: Commit**

```bash
git add defensive-game-plan.html
git commit -m "feat: build Step 1 — defensive identity selection"
```

---

### Task 5: Build Step 2 — Opponent Scouting

**Files:**
- Modify: `defensive-game-plan.html` (script section)

**Step 1: Implement opponent info header**

Top of step 2:
- Text input: "Opponent Team Name" — stores to `gamePlan.scouting.opponentName`
- Date input: "Game Date" — stores to `gamePlan.scouting.gameDate`

**Step 2: Implement player entry list**

Below the header, a dynamic list of player entries:
- "Add Player" button at top (max 10 players)
- Each player row has:
  - Text input: Name
  - Number input: Jersey # (1-99)
  - Select dropdown: Position (PG, SG, SF, PF, C)
  - Tendency chip selector (see Step 3)
  - Small textarea: Scouting notes
  - "X" delete button to remove the row

Store each player in `gamePlan.scouting.players[]` as `{ name, number, position, tendencies: [], notes: '' }`.

**Step 3: Implement tendency tag chips**

Pre-defined tendency tags as clickable chips:
- "Elite Shooter"
- "Weak Ball Handler"
- "Post Threat"
- "Transition Scorer"
- "PnR Ball Handler"
- "Slasher"
- "Spot-Up Shooter"
- "Rim Protector"
- "Poor Free Throw"
- "Left Hand Dominant"

Plus a custom chip input: small text field + "Add" button to create a custom tag.

Chips toggle on/off. Selected chips get gold background. Store selected tags in the player's `tendencies` array.

**Step 4: Implement team tendencies section**

Below the player list:
- **Pace**: 3-option card selector (Fast / Moderate / Slow)
- **Primary Actions**: multi-select chip group (PnR, Motion, Post-Ups, Isolation, Transition, DHO, Horns, Flex)
- **Strengths**: textarea
- **Weaknesses**: textarea

Store in `gamePlan.scouting.pace`, `.primaryActions`, `.strengths`, `.weaknesses`.

**Step 5: Verify step 2**

- Can add/remove players (up to 10)
- Tendency chips toggle on and off
- Custom tags can be added
- All data persists when navigating away and back
- Team tendency section works

**Step 6: Commit**

```bash
git add defensive-game-plan.html
git commit -m "feat: build Step 2 — opponent scouting with player tendencies"
```

---

### Task 6: Build Step 3 — Matchup Assignments

**Files:**
- Modify: `defensive-game-plan.html` (script section)

**Step 1: Implement `renderMatchupsStep()`**

If `gamePlan.scouting.players.length === 0`, show a message: "Add opponent players in Step 2 first" with a button to go back.

Otherwise, render a list of matchup rows. For each opponent player from `gamePlan.scouting.players`:
- Left side: opponent player name, number, position, and their tendency tags displayed as small read-only chips
- Right side:
  - Text input: "DU Defender" (name of the DU player assigned)
  - Text input: "Defensive Instruction" (e.g. "force left", "deny catch")
  - Checkbox/toggle: "Primary Threat" flag (shows crimson `.threat-badge`)

Store matchups in `gamePlan.matchups[]` as `{ opponentIndex, defender, instruction, isPrimaryThreat }`.

Initialize matchups array from scouting players if empty or if player count changed.

**Step 2: Verify step 3**

- Shows opponent players from step 2
- Can assign defenders and instructions
- Primary threat toggle works
- Navigating back to step 2, adding a player, then returning to step 3 shows the new player

**Step 3: Commit**

```bash
git add defensive-game-plan.html
git commit -m "feat: build Step 3 — matchup assignments with threat flagging"
```

---

### Task 7: Build Step 4 — Situation Adjustments

**Files:**
- Modify: `defensive-game-plan.html` (script section)

**Step 1: Implement `renderSituationsStep()`**

Five sections, each with a label and a textarea:

1. **Late Shot Clock Defense**
   - Label: "What do we do when the shot clock is under 8 seconds?"
   - Placeholder: "e.g. Switch everything, no help, contest all shots..."
   - Stores to `gamePlan.situations.lateClock`

2. **After Timeout / Set Plays (ATO/BLOB/SLOB)**
   - Label: "How do we defend their after-timeout and out-of-bounds plays?"
   - Placeholder: "e.g. Switch on all screens, deny inbound to #23..."
   - Stores to `gamePlan.situations.atoPlays`

3. **Foul Situation Rules**
   - Label: "When do we foul? When do we avoid fouls?"
   - Placeholder: "e.g. No fouls on 3pt shooters, foul on drives under 2 min..."
   - Stores to `gamePlan.situations.foulRules`

4. **End of Half / End of Game**
   - Label: "Defensive approach in final 2 minutes of each half?"
   - Placeholder: "e.g. Full court press if down, protect paint if ahead..."
   - Stores to `gamePlan.situations.endOfPeriod`

5. **Press Moments**
   - Label: "When do we press? When do we pull back?"
   - Placeholder: "e.g. Press after made baskets in 2nd half, pull back if they break it twice in a row..."
   - Stores to `gamePlan.situations.pressBreak`

**Step 2: Verify step 4**

- All 5 textareas render with labels and placeholders
- Text persists when navigating away and back

**Step 3: Commit**

```bash
git add defensive-game-plan.html
git commit -m "feat: build Step 4 — situation adjustments"
```

---

### Task 8: Build Step 5 — Game Plan Summary + Save/Load

**Files:**
- Modify: `defensive-game-plan.html` (script section)

**Step 1: Implement `renderSummaryStep()`**

Display the full game plan as collapsible accordion sections:

1. **Defensive Identity** accordion — shows base defense, secondary, transition, rebounding
2. **Opponent Overview** accordion — team name, date, pace, primary actions, strengths/weaknesses
3. **Opponent Players** accordion — table/list of all players with their tendencies
4. **Matchup Assignments** accordion — list of matchups, primary threats highlighted with crimson badge
5. **Situation Rules** accordion — all 5 situation text fields

Each accordion section:
- Click header to expand/collapse (chevron icon rotates)
- "Edit" button in header that calls `goToStep(N)` to jump to the relevant step
- Starts expanded by default

**Step 2: Implement accordion toggle**

Write `toggleAccordion(id)` function. Each accordion section has a unique ID. Clicking the header toggles `.open` class which shows/hides the content with a CSS transition.

**Step 3: Implement save/load system**

Save functions:
- `saveGamePlan()` — serializes `gamePlan` to JSON, saves to localStorage with key `du-game-plan-${opponentName}-${gameDate}`. Shows a brief "Saved!" toast/flash message.
- `loadGamePlan(key)` — loads from localStorage, parses JSON into `gamePlan`, calls `render()`.
- `getSavedPlans()` — returns array of saved plan keys from localStorage (filter keys starting with `du-game-plan-`).
- `newGamePlan()` — confirms with user ("Start a new game plan? Unsaved changes will be lost."), resets `gamePlan` to defaults, resets `currentStep` to 0, calls `render()`.
- `deleteSavedPlan(key)` — confirms, removes from localStorage, refreshes the load list.

**Step 4: Wire save/load into the UI**

On the summary step, add a save bar at the bottom:
- "Save Game Plan" button (crimson) — calls `saveGamePlan()`
- Toast message area for "Saved!" feedback

In the header (from Task 3), wire up:
- "Load Plan" button — shows a dropdown/modal listing saved plans from `getSavedPlans()`, click one to load
- "New Plan" button — calls `newGamePlan()`

**Step 5: Verify save/load**

- Fill out a complete game plan through all steps
- Click "Save Game Plan" — see confirmation toast
- Click "New Plan" — form resets, back to step 1
- Click "Load Plan" — see the saved plan listed
- Click the saved plan — all data restored correctly
- Save a second plan with different opponent — both appear in load list

**Step 6: Commit**

```bash
git add defensive-game-plan.html
git commit -m "feat: build Step 5 — summary view with save/load system"
```

---

### Task 9: Polish & Responsive Design

**Files:**
- Modify: `defensive-game-plan.html` (CSS section)

**Step 1: Add transitions and animations**

- Step transitions: fade-in animation when switching steps (already have `fadeUp` keyframe, reuse it)
- Card selection: subtle scale + glow transition on select
- Chip selection: background color transition
- Accordion: smooth max-height transition for open/close
- Toast: fade in, hold 2s, fade out
- Progress bar step transitions: fill animation on the connecting lines

**Step 2: Add responsive breakpoints**

Media queries:
- `@media (max-width: 768px)`:
  - Card grids go to 1 column
  - Progress bar labels hide, show only numbered circles
  - Header padding reduces
  - Player rows stack vertically
  - Wizard container padding reduces
- `@media (max-width: 480px)`:
  - Further padding reduction
  - Font size adjustments
  - Nav buttons go full width stacked

**Step 3: Add hover/focus states**

- Cards: subtle border glow on hover
- Buttons: brightness shift on hover
- Inputs: crimson border glow on focus
- Chips: slight scale on hover
- Accordion headers: background lighten on hover

**Step 4: Verify on different screen sizes**

Check at 1440px, 768px, and 480px widths:
- Layout adapts properly
- All interactions still work
- Nothing overflows or breaks

**Step 5: Commit**

```bash
git add defensive-game-plan.html
git commit -m "feat: add polish, transitions, and responsive design"
```

---

### Task 10: Final Integration Verification

**Files:**
- All files

**Step 1: Full flow test**

Walk through the complete wizard:
1. Open `/game-plan` — dark page loads, step 1 shows
2. Select Man-to-Man, Scramble transition, Crash rebounding, add box-out notes
3. Next to step 2 — enter opponent "Colorado State", add 5 players with tendencies
4. Next to step 3 — assign DU defenders to each, flag 2 primary threats
5. Next to step 4 — fill in all 5 situation fields
6. Next to step 5 — verify all data displays in accordions
7. Save the plan
8. Click New Plan — verify reset
9. Load the saved plan — verify all data restored
10. Navigate between steps — verify data persists

**Step 2: Verify both tools coexist**

- `http://localhost:3000/` — Brand Builder works as before
- `http://localhost:3000/game-plan` — Game Plan tool works
- No interference between the two

**Step 3: Commit any final fixes**

```bash
git add -A
git commit -m "feat: finalize defensive game plan tool"
```
