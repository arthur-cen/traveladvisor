/**
 * Serialize questionnaire answers into a structured trip context block
 * that gets injected into the Claude prompt.
 */
export function buildTripContext(answers) {
  const days = parseInt(answers.days, 10);
  const tripLength = days === 1 ? '1 day (single-day trip)' : `${days} days (multi-day trip)`;

  const lines = [
    '[Trip Context]',
    `Origin:          ${answers.origin}`,
    `Destination:     ${answers.destination}`,
    `Dates:           ${answers.travelDates} — ${tripLength}`,
    `Travelers:       ${answers.travelers}`,
    `Budget:          ${answers.budget}`,
    `Transport:       ${answers.transport.join(', ')}`,
    `Trip style:      ${answers.tripStyle.join(', ')}`,
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
    lines.push(`Children:        Yes (ages not specified)`);
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
  if (answers.thingsToAvoid?.trim()) {
    lines.push(`Avoid:           ${answers.thingsToAvoid}`);
  }

  return lines.join('\n');
}

export function isMultiDay(answers) {
  return parseInt(answers.days, 10) >= 2;
}
