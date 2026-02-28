# Defensive Game Plan Tool — Design Doc

**Date:** 2026-02-28
**Status:** Approved
**Purpose:** Interactive defensive game prep worksheet for Denver University basketball coach Spenser

## Overview

A guided wizard-flow web tool that walks a coach through building a defensive game plan — from team identity down to opponent-specific matchups and situational adjustments. Plans are interactive on-screen (laptop/tablet), saved locally in the browser, and can be loaded/edited across sessions.

## Architecture

- Single HTML file (`defensive-game-plan.html`) — vanilla HTML/CSS/JS, no framework
- Express server (`server.js`) updated to serve both Brand Builder and Game Plan tools
- localStorage for save/load persistence
- No external dependencies beyond Google Fonts
- Wizard state stored in a single JS object, serialized to localStorage on save

## Wizard Steps

### Step 1 — Team Defensive Identity

- **Base defense selector:** Man-to-Man, 2-3 Zone, 3-2 Zone, 1-3-1 Zone, Matchup Zone, 1-2-2 Press, Full Court Man Press
- **Secondary/change-up defense:** Optional second pick
- **Transition defense:** Get back vs. scramble, number of players back
- **Rebounding philosophy:** Crash vs. get back, box-out assignments

### Step 2 — Opponent Scouting

- Opponent team name + game date
- Up to 10 opponent players, each with:
  - Name, number, position
  - Tendency tags (pre-defined chips + custom): "elite shooter", "weak ball handler", "post threat", "transition scorer", "PnR ball handler", etc.
  - Free-form scouting notes
- Team-level tendencies:
  - Pace: fast / moderate / slow
  - Primary actions: PnR, motion, post-ups, isolation, transition
  - Strengths and weaknesses (free text)

### Step 3 — Matchup Assignments

- Lists opponent players from Step 2
- Assign a DU roster player to each opponent + short defensive instruction (e.g. "force left", "deny catch", "go over screens")
- Flag 1-2 primary scoring threats

### Step 4 — Situation Adjustments

Text fields for defensive rules in specific situations:
- Late shot clock defense
- After timeout / out-of-bounds plays (ATO/BLOB/SLOB)
- Foul situation rules
- End of half/game scenarios
- Press break moments (when to press, when to fall back)

### Step 5 — Game Plan Summary

- Full interactive view of all entered data
- Expandable/collapsible accordion sections
- Click any section to jump back and edit
- Save / Load / New Game Plan controls
- Saved plans listed by opponent name + date

## Visual Design

- **Theme:** Dark, professional coaching software aesthetic
- **Colors:** Deep navy/charcoal background, Denver University crimson/gold accents
- **Typography:** Inter or similar clean sans-serif via Google Fonts
- **Wizard nav:** Progress bar across top (5 steps), current step highlighted, clickable after first visit
- **Step transitions:** Smooth slide/fade between steps, Next/Back buttons at bottom

### Interactive Elements

- Defense types as selectable visual cards with highlighted borders
- Opponent players as an add/remove list ("+" to add, "x" to remove)
- Tendency tags as clickable chip selectors (pre-defined + custom input)
- Matchup assignments as list with dropdowns
- Summary sections as collapsible accordions

### Save/Load

- "Save Game Plan" on summary step
- localStorage keyed by opponent name + date
- "Load Game Plan" dropdown accessible from any step
- "New Game Plan" to start fresh
- Confirmation prompt before overwriting existing saves
