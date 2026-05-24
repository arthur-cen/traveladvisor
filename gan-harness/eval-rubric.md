# Evaluation Rubric — Adventurer UI Design

## Weights

### Design Quality (weight: 0.35)
Does the UI feel like a premium adventure travel brand? Dark luxury, expedition journal, NatGeo meets SaaS. Not a generic form app. Award points for:
- Intentional use of forest greens, amber/gold, parchment, charcoal
- Grain/texture overlay present and tasteful
- Every section feels art-directed, not just "styled"

### Originality (weight: 0.30)
Does this look like something that could win a design award or appear in Dribbble's Picks?
- Would it stand out in a portfolio?
- Does it avoid Tailwind/shadcn template defaults?
- Are there unexpected creative moments (layout breaks, custom components, distinctive animations)?

### Craft (weight: 0.25)
Is the implementation polished?
- Typography pairing quality (display serif + sans-serif)
- Hover/focus/active states feel designed
- Transitions and motion serve the adventure narrative
- Loading/generation state is epic, not a spinner
- CSS custom properties used as design token system

### Functionality (weight: 0.10)
Does it still work?
- Form submits and generates itinerary
- Conditional fields appear/disappear correctly
- Streaming output displays
- Accessibility preserved (aria-labels, focus rings, semantic HTML)
- Mobile-responsive layout

## Pass Threshold
Weighted score ≥ 7.5 / 10 to pass.

## Scoring Instructions
Score each dimension 0–10, then compute: `0.35*DQ + 0.30*OR + 0.25*CR + 0.10*FN`
Report the breakdown and total. Identify the top 3 specific changes that would most improve the score.
