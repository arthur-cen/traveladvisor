import type { Activity, Day, Itinerary } from './types';

export function parseItinerary(text: string): Itinerary | null {
  const clean = text.trim();

  if (clean.includes('== Day Trip:')) {
    return parseSingleDay(clean);
  }
  if (/==\s*\d+-Day Itinerary:/i.test(clean)) {
    return parseMultiDay(clean);
  }
  return null;
}

function parseSingleDay(text: string): Itinerary {
  const destMatch = text.match(/== Day Trip:\s*(.+?)\s+on\s+(.+?)\s*==/);
  const destination = destMatch?.[1] ?? 'Your Destination';
  const dates = destMatch?.[2] ?? '';

  const timeBlocks = ['Morning', 'Lunch', 'Afternoon', 'Evening'];
  const activities: Activity[] = [];

  for (let i = 0; i < timeBlocks.length; i++) {
    const block = timeBlocks[i];
    const nextBlock = timeBlocks[i + 1];
    // Matches block header (e.g. Morning, **Morning**:, Morning (9-12)) and lookahead to next block or practical section
    const blockPattern = new RegExp(
      `(?:[-*+]\\s*)?(?:\\*\\*)?${block}(?:\\*\\*)?\\s*(?:\\([^)]*\\))?\\s*(?::|->)?([\\s\\S]*?)(?=(?:(?:[-*+]\\s*)?(?:\\*\\*)?${
        nextBlock ? nextBlock : '== Practical'
      })|$)`,
      'i'
    );
    const blockMatch = text.match(blockPattern);
    if (!blockMatch) continue;

    const blockText = blockMatch[1];
    // Matches item bullet like * or - or +
    const itemPattern = /^\s*[-*+]\s+(.+?)\s+[—–-]\s+(.+?)(?:\s*\(~([^)]+)\))?(?:\s*,\s*(\$+))?$/gm;
    let m;
    while ((m = itemPattern.exec(blockText)) !== null) {
      activities.push({
        time: block,
        name: m[1].trim(),
        description: m[2].trim(),
        duration: m[3]?.trim(),
        cost: m[4]?.trim(),
      });
    }
  }

  const practicalMatch = text.match(/== Practical Info ==([\s\S]*?)(?:$)/i);
  const practicalText = practicalMatch?.[1] ?? '';

  const gettingThereMatch = practicalText.match(/\*\s+Getting there:\s*(.+?)(?:\n|$)/i);
  const costMatch = practicalText.match(/\*\s+Estimated cost:\s*(.+?)(?:\n|$)/i);
  const tipsMatches = Array.from(practicalText.matchAll(/- (.+?)(?:\n|$)/gi));

  return {
    type: 'single-day',
    destination,
    dates,
    days: [{ number: 1, activities }],
    practicalInfo: {
      gettingThere: gettingThereMatch?.[1]?.trim(),
      estimatedCost: costMatch?.[1]?.trim(),
      tips: tipsMatches.map((m) => m[1].trim()).filter(Boolean),
    },
  };
}

function parseMultiDay(text: string): Itinerary {
  const headerMatch = text.match(/==\s*(\d+)-Day Itinerary:\s*(.+?)\s*\|\s*(.+?)\s*==/i);
  const destination = headerMatch?.[2]?.trim() ?? 'Your Destination';
  const dates = headerMatch?.[3]?.trim() ?? '';

  // Split by day headers. Matches '--- Day N:', '### Day N', '## Day N', or 'Day N:'
  const daySections = text
    .split(/(?=(?:---|###|##|#)?\s*Day\s+\d+)/gi)
    .filter((s) => /Day\s+\d+/i.test(s));
  const days: Day[] = daySections.map((section) => parseDaySection(section));

  const summaryMatch = text.match(/== Trip Summary ==([\s\S]*?)(?:$)/i);
  const summaryText = summaryMatch?.[1] ?? '';

  const costMatch = summaryText.match(/\*\s+Estimated total cost:\s*(.+?)(?:\n|$)/i);
  const aroundMatch = summaryText.match(/\*\s+Getting around:\s*(.+?)(?:\n|$)/i);
  const bookMatch = summaryText.match(/\*\s+Book in advance:\s*([\s\S]*?)(?:\*\s+What to pack:|$)/i);
  const packMatch = summaryText.match(/\*\s+What to pack:\s*([\s\S]*?)(?:\*\s+Local tip:|$)/i);
  const tipMatch = summaryText.match(/\*\s+Local tip:\s*(.+?)(?:\n|$)/i);

  return {
    type: 'multi-day',
    destination,
    dates,
    days,
    summary: {
      estimatedCost: costMatch?.[1]?.trim(),
      gettingAround: aroundMatch?.[1]?.trim(),
      bookInAdvance: extractListItems(bookMatch?.[1] ?? ''),
      whatToPack: extractListItems(packMatch?.[1] ?? ''),
      localTip: tipMatch?.[1]?.trim(),
    },
  };
}

function parseDaySection(section: string): Day {
  // Matches '--- Day N: Theme ---', '### Day N: Theme', or 'Day N - Theme'
  const headerMatch = section.match(/(?:---|###|##|#)?\s*Day\s*(\d+)\s*(?::|-)?\s*(.+?)\s*(?:---|#|\n|$)/i);
  const number = parseInt(headerMatch?.[1] ?? '1', 10);
  const theme = headerMatch?.[2]?.trim();

  // Parse Day location if provided, e.g. "Location: Versailles, France"
  const locationMatch = section.match(/Location:\s*(.+?)(?:\n|$)/i);
  const location = locationMatch?.[1]?.trim();

  const activities: Activity[] = [];

  const slots = ['Morning', 'Afternoon', 'Evening'];

  for (const slot of slots) {
    // Matches 'Morning   ->', '- **Morning**:', '* Morning ->', 'Morning:'
    const pattern = new RegExp(
      `(?:[-*+]\\s*)?(?:\\*\\*)?${slot}(?:\\*\\*)?\\s*(?:->|:|—|-)\\s*(.+?)(?:\\n|$)`,
      'i'
    );
    const m = section.match(pattern);
    if (m) {
      activities.push({
        time: slot,
        name: extractActivityName(m[1]),
        description: m[1].trim(),
      });
    }
  }

  const stayMatch = section.match(/Stay:\s*(.+?)(?:\n|$)/i);

  return { number, theme, location, activities, stay: stayMatch?.[1]?.trim() };
}

function extractActivityName(line: string): string {
  const atMatch = line.match(/^(?:Visit|Explore|Enjoy|Dine at|Head to|Stop at|Try)?\s*([A-Z][^—–,.(]+)/);
  return atMatch?.[1]?.trim() ?? line.split('—')[0]?.trim() ?? line.slice(0, 40);
}

function extractListItems(text: string): string[] {
  return text
    .split(/\n/)
    .map((l) => l.replace(/^[\s*\-•]+/, '').trim())
    .filter(Boolean);
}
