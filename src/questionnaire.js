import inquirer from 'inquirer';

const questions = [
  // ── Core questions (always asked) ─────────────────────────────────────────

  {
    type: 'input',
    name: 'origin',
    message: 'Where are you starting from?',
    validate: (input) =>
      input.trim().length > 0 || 'Please enter your starting location.',
  },
  {
    type: 'input',
    name: 'destination',
    message: 'Where do you want to go? (or type "help me decide")',
    validate: (input) =>
      input.trim().length > 0 || 'Please enter a destination.',
  },
  {
    type: 'input',
    name: 'travelDates',
    message: 'When are you planning to travel? (e.g. "June 14" or "June 14-16, 2026")',
    validate: (input) =>
      input.trim().length > 0 || 'Please enter travel dates.',
  },
  {
    type: 'input',
    name: 'days',
    message: 'How many days is this trip?',
    validate: (input) => {
      const n = parseInt(input, 10);
      return (!isNaN(n) && n > 0) || 'Please enter a valid number (e.g. 1, 3, 7).';
    },
  },
  {
    type: 'input',
    name: 'travelers',
    message: 'How many people are traveling? (e.g. "solo", "2 adults", "family of 4")',
    validate: (input) =>
      input.trim().length > 0 || 'Please describe who is traveling.',
  },
  {
    type: 'list',
    name: 'budget',
    message: 'What is your approximate budget per person?',
    choices: [
      { name: 'Budget-friendly  (free & cheap options, under $30/activity)', value: 'budget' },
      { name: 'Mid-range        (moderate pricing, $30-$100/activity)',       value: 'mid-range' },
      { name: 'Luxury           (premium experiences, no price limit)',        value: 'luxury' },
    ],
  },
  {
    type: 'checkbox',
    name: 'transport',
    message: 'How do you prefer to get around? (space to select, enter to confirm)',
    choices: ['Car', 'Public transit', 'Flight', 'Train', 'Bike', 'Walking'],
    validate: (input) =>
      input.length > 0 || 'Please select at least one transport option.',
  },
  {
    type: 'checkbox',
    name: 'tripStyle',
    message: 'What kind of trip is this? (select all that apply)',
    choices: [
      'Relaxation',
      'Adventure',
      'Cultural',
      'Food & Drink',
      'Nature',
      'Nightlife',
      'Family-friendly',
    ],
    validate: (input) =>
      input.length > 0 || 'Please select at least one trip style.',
  },

  // ── Conditional follow-ups ─────────────────────────────────────────────────

  {
    type: 'list',
    name: 'accommodation',
    message: 'What type of accommodation do you prefer?',
    choices: ['Hotel', 'Airbnb / Vacation rental', 'Hostel', 'Camping / Glamping', 'No preference'],
    when: (answers) => parseInt(answers.days, 10) >= 2,
  },
  {
    type: 'input',
    name: 'flightConstraints',
    message: 'Any flight preferences or constraints? (e.g. "direct flights only", "max 2h layover")',
    when: (answers) => answers.transport.includes('Flight'),
  },
  {
    type: 'confirm',
    name: 'hasChildren',
    message: 'Are any children traveling with the group?',
    default: false,
    when: (answers) => !answers.travelers.toLowerCase().includes('solo'),
  },
  {
    type: 'input',
    name: 'childrenAges',
    message: "What are the children's ages? (e.g. \"5, 8, 12\")",
    when: (answers) => answers.hasChildren === true,
  },
  {
    type: 'input',
    name: 'dietaryRestrictions',
    message: 'Any dietary restrictions or food preferences to keep in mind?',
    when: (answers) => answers.tripStyle.includes('Food & Drink'),
  },
  {
    type: 'list',
    name: 'fitnessLevel',
    message: 'What is your fitness / activity level?',
    choices: [
      { name: 'Easy       (flat walks, gentle activities)', value: 'easy' },
      { name: 'Moderate   (some hiking, active sightseeing up to 5 miles)', value: 'moderate' },
      { name: 'Strenuous  (challenging hikes, intense activities, 5+ miles)', value: 'strenuous' },
    ],
    when: (answers) =>
      answers.tripStyle.includes('Adventure') || answers.tripStyle.includes('Nature'),
  },
  {
    type: 'input',
    name: 'regionPreference',
    message: 'What region or climate appeals to you? (e.g. "tropical beach", "European city", "mountain wilderness")',
    when: (answers) => {
      const dest = answers.destination.toLowerCase();
      return dest.includes('help me decide') || dest.includes('not sure') || dest.includes('unsure');
    },
  },

  // ── Always last ────────────────────────────────────────────────────────────

  {
    type: 'input',
    name: 'thingsToAvoid',
    message: 'Anything you specifically want to avoid? (optional — press Enter to skip)',
  },
];

export async function runQuestionnaire() {
  return inquirer.prompt(questions);
}
