# AI Strategy Notes

This document describes the current red-team AI deployment strategy implemented in `strategy.js` and integrated from `game.js`.

It is meant to be a tuning reference, not a design aspiration. All thresholds and formulas below reflect the current implementation.

## Overview

The AI is a heuristic scorer.

- Every `0.42s`, the game asks the strategy for one deployment decision.
- The strategy returns either:
  - an action: `{ typeId, lane }`
  - or `null` if it wants to wait
- If an action is returned, the AI attempts to spawn exactly one unit into the chosen lane.

The AI only controls deployment. Movement, targeting, combat, and pathing still come from the normal unit simulation in `game.js`.

## Strategy Input

The strategy receives a self-contained snapshot with these fields:

- `timeElapsed`
- `unitCap`
- `unitOrder`
- `laneOrder`
- `unitTypes`
- `ai`
- `player`
- `aiCounts`
- `playerCounts`
- `pressure`
- `laneStates`
- `random` (optional RNG, defaults to `Math.random`)

### Team state

`ai` and `player` include:

- `gold`
- `unitCount`
- `cooldowns`
- `baseHp`
- `brain`

Only the AI brain is used for decision persistence.

### Direct pressure

`pressure` is the count of alive blue units that have pushed deep into red territory.

Current rule:

- count blue units with `x < 340`

This is the AI's main "defend now" signal.

### Unit counts

`aiCounts` and `playerCounts` track alive units by type:

- `fighter`
- `archer`
- `shield`
- `giant`

### Lane state

Each lane includes:

- `blue` summary
- `red` summary
- `bluePressure`
- `redPressure`

Each side summary contains:

- `total`
- `frontline`
- `ranged`
- `fighter`
- `archer`
- `shield`
- `giant`
- `strength`
- `deepestPush`

## Derived Lane Metrics

Lane pressure is not raw unit count.

Each unit contributes based on health, unit class weight, and how far it has advanced.

### Unit strength

`strength = weight * (0.55 + healthRatio * 0.45)`

Where:

- `healthRatio = clamp(health / maxHealth, 0.2, 1)`

This means even damaged units still contribute at least 20% health ratio for strategic evaluation.

### Unit push

`push` is normalized forward progress from spawn toward the enemy base:

- `0` means near spawn
- `1` means near the enemy base

### Pressure contribution

`lanePressureContribution = strength * (0.65 + push * 0.9)`

So a healthy unit far down the lane is worth much more than a weak unit near spawn.

## Persistent AI Brain

The AI keeps a small persistent state:

- `focus`
- `reserveUnit`
- `focusUntil`
- `lastChoice`
- `lastLane`

Initial values:

- `focus = "balanced"`
- `reserveUnit = "shield"`
- `focusUntil = 0`
- `lastChoice = null`
- `lastLane = null`

### Focus meanings

- `balanced`: no strong specialization
- `brace`: defend and stabilize
- `volley`: emphasize ranged support
- `power`: emphasize giant-led pushes

The in-game labels shown to the player come from:

- `balanced`: `均衡`
- `brace`: `固守`
- `volley`: `齐射`
- `power`: `强攻`

## Decision Flow

The strategy follows this sequence:

1. Normalize the AI brain state.
2. If the AI is already at unit cap, return `null`.
3. Refresh focus if the current focus has expired.
4. Decide whether to hold gold for the current reserve unit.
5. Score every spawnable unit type.
6. Score every lane for each spawnable unit type.
7. Add a small random tie-breaker.
8. Return the highest-scoring `{ typeId, lane }`.
9. Persist the updated brain with the latest choice and lane.

## Focus Selection

The focus is only refreshed when:

- `timeElapsed >= focusUntil`

This prevents the AI from changing personality every tick.

When focus refreshes, the rules are:

### 1. Emergency defense

If:

- `pressure >= 4`

Then:

- `focus = "brace"`
- `reserveUnit = "shield"`

### 2. Late-game push

Else if:

- `timeElapsed > 42`
- and either `aiCounts.giant === 0`
- or `player.baseHp < 760`

Then:

- `focus = "power"`
- `reserveUnit = "giant"`

### 3. Ranged response

Else if:

- `playerCounts.archer >= 3`
- or `(aiCounts.fighter + aiCounts.shield >= 3 && aiCounts.archer < 2)`

Then:

- `focus = "volley"`
- `reserveUnit = "archer"`

### 4. Weighted random fallback

Else choose randomly:

- `balanced`: 22%
- `volley`: 34%
- `power`: 44%

### Focus duration

After a refresh:

- `focusUntil = timeElapsed + 7 + random() * 4`

So each focus lasts between 7 and 11 seconds.

## Reserve Hold Logic

Before spending gold, the AI may decide to wait for its `reserveUnit`.

This only applies if the reserve unit is not yet affordable.

Definitions:

- `goldGap = reserveCost - ai.gold`
- `frontline = aiCounts.fighter + aiCounts.shield`

### Reserve giant

Hold if:

- `goldGap <= 90`
- `frontline >= 2`
- `pressure <= 3`

Interpretation:

- the AI is allowed to save for a giant when it is close enough in gold, has some cover, and is not under immediate siege

### Reserve shield

Hold if:

- `goldGap <= 34`
- `pressure >= 1`

Interpretation:

- if defense is needed and a shield is almost affordable, wait briefly instead of spending on something weaker

### Reserve archer

Hold if:

- `goldGap <= 28`
- `frontline >= 1`

Interpretation:

- the AI is willing to wait for ranged support if there is already at least one frontline body to protect it

## Unit Type Scoring

After reserve-hold logic, the AI scores each currently spawnable unit type.

A unit is spawnable only if:

- `ai.unitCount < unitCap`
- `ai.gold >= unit.cost`
- `ai.cooldowns[typeId] <= 0`

### Fighter score

Base formula:

- starts at `2.2`
- `+ max(0, 3 - frontline) * 0.8`
- `+ max(0, 4 - aiCounts.fighter) * 0.2`
- `+ pressure * 0.22`
- `- aiCounts.fighter * 0.26`
- `- 0.45` after `45s`

Interpretation:

- fighters are cheap emergency bodies
- the AI wants them more when the frontline is thin
- the AI wants fewer of them late game

### Archer score

Base formula:

- starts at `4.1`
- `+ max(0, enemyFrontline - aiCounts.archer * 2) * 0.46`
- `+ max(0, frontline - 1) * 0.36`
- `+ max(0, playerCounts.giant - aiCounts.archer) * 0.55`
- `+ 0.4` after `35s`

Where:

- `enemyFrontline = playerCounts.fighter + playerCounts.shield + playerCounts.giant`

Interpretation:

- archers are favored when there is frontline to shoot at
- archers become better if the AI already has bodies to protect them
- archers also serve as an anti-giant answer

### Shield score

Base formula:

- starts at `4.4`
- `+ max(0, enemyArchers - aiCounts.shield) * 0.88`
- `+ pressure * 0.75`
- `+ max(0, playerCounts.giant - aiCounts.shield) * 0.62`
- `- aiCounts.shield * 0.08`

Interpretation:

- shields are the strongest default defensive stabilizer
- they are especially favored against enemy archers, giants, and direct pressure

### Giant score

Base formula:

- starts at `3.0`
- `+ max(0, timeElapsed - 35) * 0.024`
- `+ 1.35` if `player.baseHp < 820`
- `+ 1.3` if `aiCounts.giant === 0 && timeElapsed > 40`
- `+ 1.0` if `frontline >= 2`, otherwise `- 0.45`
- `+ 1.15` if `ai.gold > 145`
- `- aiCounts.giant * 0.95`

Interpretation:

- giants are late-game pressure units
- they are encouraged when the AI has support and when the player base is already vulnerable
- stacking too many giants is discouraged

## Focus Modifiers

After the base type score, focus modifiers are applied.

### Brace

- `shield +1.5`
- `fighter +0.9`
- `giant -0.35`

### Volley

- `archer +1.9`
- `shield +0.75`
- `fighter -0.4`

### Power

- `giant +2.45`
- `shield +0.8`
- `fighter -0.7`

## Memory And Anti-Repetition

After focus modifiers:

- if the unit type matches `reserveUnit`, add `+1.35`
- if the unit type matches `lastChoice`, apply `-0.55`

Interpretation:

- the AI is nudged toward its current plan
- the AI is also discouraged from spamming the exact same unit repeatedly

## Lane Scoring

For each spawnable unit type, the AI scores both lanes separately.

Definitions:

- `defendingThreat = laneState.bluePressure`
- `attackingThreat = laneState.redPressure`
- `friendly = laneState.red`
- `enemy = laneState.blue`

### Fighter lane score

- `+ defendingThreat * 0.62`
- `+ max(0, enemy.total - friendly.total) * 0.48`
- `+ max(0, enemy.archer - friendly.frontline) * 0.7`
- `+ 0.35` if `friendly.total === 0`

Interpretation:

- fighters prefer lanes that need bodies right now, especially if enemy archers are lightly screened

### Archer lane score

- `+ friendly.frontline * 0.85`
- `+ max(0, enemy.frontline - friendly.archer) * 0.42`
- `+ attackingThreat * 0.36`
- `- 0.28` if `defendingThreat > attackingThreat + 1.4`

Interpretation:

- archers want cover
- they like shooting into established enemy frontline
- they are less attractive in lanes that are collapsing defensively

### Shield lane score

- `+ defendingThreat * 0.96`
- `+ enemy.archer * 0.74`
- `+ max(0, enemy.frontline - friendly.frontline) * 0.44`
- `+ 0.16` if `friendly.shield === 0`

Interpretation:

- shields strongly favor lanes that need stabilization
- they are especially drawn to lanes where enemy archers are active

### Giant lane score

- `+ attackingThreat * 0.94`
- `+ friendly.frontline * 0.82`
- `+ 0.62` if `enemy.archer === 0`
- `- enemy.archer * 0.54`
- `- 0.52` if `friendly.total === 0`

Interpretation:

- giants prefer lanes where red already has momentum and bodies in front
- enemy archers make a lane less attractive for giant deployment

## Focus-Based Lane Modifiers

Additional lane adjustments:

- if `focus === "brace"`, add `defendingThreat * 0.25`
- if `focus === "volley"` and the unit is `archer`, add `friendly.frontline * 0.22`
- if `focus === "power"` and the unit is `giant`, add `attackingThreat * 0.24`

Interpretation:

- brace leans harder into threatened lanes
- volley leans harder into protected archer positions
- power leans harder into already-pushing giant lanes

## Lane Anti-Repetition

If the lane matches `lastLane`:

- apply `-0.18`

This is a small penalty, not a hard rule. It encourages some lane variety without preventing concentration.

## Random Tie-Breaker

After all other scoring:

- add `random() * 0.5`

This is the only intentional noise in the policy.

Its job is to:

- break close ties
- reduce deterministic repetition
- make behavior feel slightly less scripted

## Final Selection

The AI evaluates every valid `(unit type, lane)` pair and picks the one with the highest final score.

It then persists:

- `lastChoice = chosen typeId`
- `lastLane = chosen lane`

If nothing is spawnable, or if reserve-hold logic says to wait, the strategy returns `null`.

## Practical Behavior Summary

In actual play, this policy tends to behave like this:

- It reacts to pressure rather than predicting far-ahead outcomes.
- It understands composition at a coarse level: frontline, ranged support, giants, and archers.
- It is lane-aware, not just unit-aware.
- It becomes more giant-oriented later in the match.
- It occasionally saves gold instead of spending immediately.
- It avoids repeating the same unit or lane too mechanically.
- It does not simulate future combat or execute multi-step plans.

## Main Tuning Levers

If future tuning is needed, these are the highest-leverage areas:

- Focus selection thresholds in `refreshAIFocus`
- Reserve hold thresholds in `shouldHoldForReserve`
- Base type score weights in `getTypeScore`
- Lane score weights in `getLaneScore`
- Repetition penalties for `lastChoice` and `lastLane`
- Random tie-break magnitude `0.5`

These are the constants that most directly control personality, aggression, and lane discipline.
