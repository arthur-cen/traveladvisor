import type { Question, TripAnswers } from './types';

export const FOLLOW_UP_QUESTIONS: Question[] = [
  {
    key: 'travelers',
    text: 'How many people are traveling? (e.g. "solo", "2 adults", "family of 4")',
    type: 'text',
  },
  {
    key: 'budget',
    text: 'What is your approximate budget per person?',
    type: 'select',
    choices: [
      { label: 'Budget-friendly (under $30/activity)', value: 'budget' },
      { label: 'Mid-range ($30–$100/activity)', value: 'mid-range' },
      { label: 'Luxury (premium, no limit)', value: 'luxury' },
    ],
  },
  {
    key: 'transport',
    text: 'How do you prefer to get around? (e.g. "car", "public transit", "train, walking")',
    type: 'text',
  },
  {
    key: 'tripStyle',
    text: 'What kind of trip is this? (e.g. "relaxation, food & drink", "adventure, nature", "cultural")',
    type: 'text',
  },
  {
    key: 'accommodation',
    text: 'What type of accommodation do you prefer? (hotel, Airbnb, hostel, camping)',
    type: 'text',
    when: (a: Partial<TripAnswers>) => parseInt(a.days ?? '0', 10) >= 2,
  },
  {
    key: 'fitnessLevel',
    text: 'What is your fitness / activity level? (easy, moderate, or strenuous)',
    type: 'text',
    when: (a: Partial<TripAnswers>) => {
      const styles = (Array.isArray(a.tripStyle) ? a.tripStyle : [a.tripStyle ?? '']).join(' ').toLowerCase();
      return styles.includes('adventure') || styles.includes('nature');
    },
  },
  {
    key: 'dietaryRestrictions',
    text: 'Any dietary restrictions or food preferences we should know about?',
    type: 'text',
    when: (a: Partial<TripAnswers>) => {
      const styles = (Array.isArray(a.tripStyle) ? a.tripStyle : [a.tripStyle ?? '']).join(' ').toLowerCase();
      return styles.includes('food');
    },
  },
  {
    key: 'thingsToAvoid',
    text: 'Anything you specifically want to avoid? (optional — just say "none" to skip)',
    type: 'text',
  },
];
