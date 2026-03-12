import { ChecklistItem, MandatoryPhoto } from './types';

interface SectionDef {
  name: string;
  items: string[];
}

const sections: SectionDef[] = [
  {
    name: 'Bike Identity',
    items: [
      'Verify VIN on frame matches documents',
      'Verify engine number matches documents',
      'Check model name badge/sticker',
      'Confirm color matches order specification',
      'Check manufacturing date on frame',
    ],
  },
  {
    name: 'Exterior Condition',
    items: [
      'Check fuel tank for scratches or dents',
      'Inspect side panels for damage',
      'Check seat condition and mounting',
      'Inspect exhaust pipe and heat shield',
      'Check front fender for cracks or scratches',
      'Check rear fender condition',
      'Inspect handlebars and grips',
      'Check mirrors for clarity and mounting',
      'Inspect footpegs and brackets',
    ],
  },
  {
    name: 'Wheels & Tyres',
    items: [
      'Check front tyre condition and pressure',
      'Check rear tyre condition and pressure',
      'Inspect front wheel spokes/rim',
      'Inspect rear wheel spokes/rim',
      'Check front axle nut torque',
      'Check rear axle nut torque',
      'Verify tyre brand matches specification',
    ],
  },
  {
    name: 'Suspension & Chassis',
    items: [
      'Check front fork for oil leaks',
      'Test front fork compression and rebound',
      'Check rear shock absorber',
      'Inspect frame for cracks or damage',
      'Check swingarm pivot',
      'Inspect steering head bearing play',
    ],
  },
  {
    name: 'Brakes',
    items: [
      'Check front brake lever feel and travel',
      'Check rear brake pedal feel and travel',
      'Inspect front brake disc condition',
      'Inspect rear brake disc condition',
      'Check front brake caliper for leaks',
      'Check rear brake caliper for leaks',
      'Verify brake fluid level (front)',
      'Verify brake fluid level (rear)',
      'Check ABS sensor wiring',
    ],
  },
  {
    name: 'Engine & Controls',
    items: [
      'Start engine and check for abnormal sounds',
      'Check idle speed stability',
      'Verify smooth throttle response',
      'Check clutch lever operation',
      'Test gear shifting (all gears)',
      'Check oil level',
      'Inspect coolant level',
      'Check for fluid leaks under engine',
      'Verify chain tension and lubrication',
      'Check chain sprocket wear',
    ],
  },
  {
    name: 'Electrical System',
    items: [
      'Test headlight (low beam)',
      'Test headlight (high beam)',
      'Test front turn signals (left & right)',
      'Test rear turn signals (left & right)',
      'Test tail light',
      'Test brake light (front lever)',
      'Test brake light (rear pedal)',
      'Test horn',
      'Check battery terminals',
      'Test kill switch',
    ],
  },
  {
    name: 'Instrument Cluster',
    items: [
      'Verify speedometer works',
      'Verify odometer reads near zero',
      'Check all warning lights on startup',
      'Test fuel gauge',
      'Check trip meter functionality',
      'Verify gear indicator display',
    ],
  },
  {
    name: 'Accessories & Documents',
    items: [
      'Verify toolkit is included',
      'Check owner\'s manual is present',
      'Verify warranty card/booklet',
      'Check both keys provided',
      'Verify registration documents',
      'Check insurance documents',
      'Verify service booklet',
      'Check for any free accessories promised',
    ],
  },
];

let itemId = 0;

export function getDefaultChecklist(): ChecklistItem[] {
  return sections.flatMap((section) =>
    section.items.map((desc) => ({
      id: `item-${itemId++}`,
      section: section.name,
      description: desc,
      status: 'pending' as const,
      comment: '',
      photoUrl: null,
    }))
  );
}

export function getSectionNames(): string[] {
  return sections.map((s) => s.name);
}

export function getDefaultMandatoryPhotos(): MandatoryPhoto[] {
  return [
    { id: 'mp-front', label: 'Front View', description: 'Full front view of the motorcycle', photoUrl: null },
    { id: 'mp-rear', label: 'Rear View', description: 'Full rear view of the motorcycle', photoUrl: null },
    { id: 'mp-left', label: 'Left Side', description: 'Full left side profile', photoUrl: null },
    { id: 'mp-right', label: 'Right Side', description: 'Full right side profile', photoUrl: null },
    { id: 'mp-chassis', label: 'Chassis Number', description: 'Close-up of chassis/VIN plate', photoUrl: null },
    { id: 'mp-odometer', label: 'Odometer', description: 'Close-up of odometer reading', photoUrl: null },
  ];
}
