import type { TripAnswers } from './types';

export function buildTripContext(answers: TripAnswers): string {
  const days = parseInt(answers.days, 10);
  const tripLength = days === 1 ? '1 day (single-day trip)' : `${days} days (multi-day trip)`;

  const transport = Array.isArray(answers.transport)
    ? answers.transport.join(', ')
    : answers.transport;

  const tripStyle = Array.isArray(answers.tripStyle)
    ? answers.tripStyle.join(', ')
    : answers.tripStyle;

  const lines = [
    '[Trip Context]',
    `Origin:          ${answers.origin}`,
    `Destination:     ${answers.destination}`,
    `Dates:           ${answers.travelDates} — ${tripLength}`,
    `Travelers:       ${answers.travelers}`,
    `Budget:          ${answers.budget}`,
    `Transport:       ${transport}`,
    `Trip style:      ${tripStyle}`,
  ];

  if (answers.accommodation) {
    lines.push(`Accommodation:   ${answers.accommodation}`);
  }
  if (answers.flightConstraints?.trim()) {
    lines.push(`Flight notes:    ${answers.flightConstraints}`);
  }
  if (answers.hasChildren && answers.childrenAges?.trim()) {
    lines.push(`Children ages:   ${answers.childrenAges}`);
  } else if (answers.hasChildren) {
    lines.push('Children:        Yes (ages not specified)');
  }
  if (answers.dietaryRestrictions?.trim()) {
    lines.push(`Dietary notes:   ${answers.dietaryRestrictions}`);
  }
  if (answers.fitnessLevel) {
    lines.push(`Fitness level:   ${answers.fitnessLevel}`);
  }
  if (answers.regionPreference?.trim()) {
    lines.push(`Region preference: ${answers.regionPreference}`);
  }
  if (answers.thingsToAvoid?.trim() && answers.thingsToAvoid.toLowerCase() !== 'none') {
    lines.push(`Avoid:           ${answers.thingsToAvoid}`);
  }

  return lines.join('\n');
}
