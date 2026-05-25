export type TripAnswers = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  travelDates: string;
  days: string;
  travelers: string;
  budget: 'budget' | 'mid-range' | 'luxury';
  transport: string[];
  tripStyle: string[];
  accommodation?: string;
  flightConstraints?: string;
  hasChildren?: boolean;
  childrenAges?: string;
  dietaryRestrictions?: string;
  fitnessLevel?: 'easy' | 'moderate' | 'strenuous';
  regionPreference?: string;
  thingsToAvoid?: string;
};

export type Activity = {
  time: string;
  name: string;
  description: string;
  duration?: string;
  cost?: string;
};

export type Day = {
  number: number;
  theme?: string;
  location?: string;
  activities: Activity[];
  stay?: string;
};

export type Itinerary = {
  type: 'single-day' | 'multi-day';
  destination: string;
  dates: string;
  days: Day[];
  practicalInfo?: {
    gettingThere?: string;
    estimatedCost?: string;
    tips?: string[];
  };
  summary?: {
    estimatedCost?: string;
    gettingAround?: string;
    bookInAdvance?: string[];
    whatToPack?: string[];
    localTip?: string;
  };
};

export type GeoPoint = {
  lat: number;
  lng: number;
  placeName?: string;
};

export type ChatMessage = {
  id: string;
  role: 'ai' | 'user';
  content: string;
};

export type Question = {
  key: keyof TripAnswers;
  text: string;
  type: 'text' | 'select' | 'multiselect' | 'confirm';
  choices?: { label: string; value: string }[];
  when?: (answers: Partial<TripAnswers>) => boolean;
};

export type AppPhase = 'form' | 'generating' | 'done';
