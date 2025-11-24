# Logic-Based Scoring System

## Rule Weights
| Rule | Weight | Description |
| --- | --- | --- |
| Traversal | 0.40 | Base credit for clearing a pipe pair, scaled by vertical velocity and difficulty modifier. |
| Stability | 0.15 | Rewards maintaining altitude near the midline with low variance in the last 60 frames. |
| Precision | 0.15 | Scores how centered the bird is when entering gaps (|offset| \u2192 0 equals 100%). |
| Streak | 0.20 | Logarithmic bonus for consecutive clears without collision/boundary events. |
| Risk | 0.05 | Incentivizes threading narrow openings by comparing gap size to bird hitbox. |
| Penalties | -0.15 | Deductions for collisions, boundary hits, or idling. |

## Formula Highlights
Let $w_r$ be the weight for rule $r$ and $F_r$ the normalized evaluation. Total contribution per event is:
$$ \Delta score = \sum_r w_r \times F_r \times 100 $$

- **Traversal:** $F_\text{trav} = 0.9 + v_n \times 0.6$, where $v_n$ is normalized vertical velocity magnitude.
- **Stability:** $F_\text{stab} = 1 - \min(1, 12 \times variance(altitude_{60}))$.
- **Precision:** $F_\text{prec} = 1 - |offset|$ with `offset` normalized to [-1, 1].
- **Streak:** $F_\text{streak} = \log_2(streak + 1) + 1$.
- **Risk:** $F_\text{risk} = 1 - \frac{gap - 2*bird}{gap}$ (bounded to [0,1]).
- **Penalties:** Fixed deductions scaled to severity (collision > boundary > idle).

## Examples
1. **Perfect Run (Balanced difficulty)**
   - 5 straight clears, centered entries, steady altitude.
   - Approximate contributions: Traversal 270, Stability 80, Precision 70, Streak 120, Risk 15, Penalties 0.
   - **Total:** ~555 points.

2. **Chaotic Run (Hardcore difficulty)**
   - 3 clears, large oscillations, one boundary scrape.
   - Contributions: Traversal 250, Stability 20, Precision 35, Streak 40, Risk 30, Penalty -90.
   - **Total:** ~285 points.

3. **Edge Case: Idle Hover**
   - Player stalls without flapping; idle warnings trigger every ~2.5s.
   - Penalties grow while other rules produce no gain, preventing AFK farming.

## Extensibility
- Add new rule modules that export `{ id, weight, evaluate(eventContext) }` and register within `scoringRules`.
- Difficulty presets adjust `difficultyModifier`, letting modes reward riskier physics.
- Tests in `tests/scoreEngine.test.js` lock critical invariants (monotonic streak bonus, penalties reduce totals, etc.).
