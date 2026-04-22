import type { SnomedCode } from './mock-api/types';

// SNOMED CT → ICD-10 mapping for common GP diagnoses
// In production this would query the NHS TRUD SNOMED-to-ICD-10 mapping tables
export const SNOMED_CODES: SnomedCode[] = [
  // Diabetes
  { code: '44054006', term: 'Type 2 diabetes mellitus', icd10: ['E11', 'E11.9'] },
  { code: '46635009', term: 'Type 1 diabetes mellitus', icd10: ['E10', 'E10.9'] },
  { code: '111552007', term: 'Diabetes mellitus without complication', icd10: ['E11.9'] },
  { code: '4783006', term: 'Diabetes mellitus with hyperosmolarity', icd10: ['E11.0'] },
  { code: '190416008', term: 'Type 2 diabetes mellitus with diabetic retinopathy', icd10: ['E11', 'E11.3'] },

  // Hypertension
  { code: '38341003', term: 'Essential hypertension', icd10: ['I10'] },
  { code: '59621000', term: 'Hypertension', icd10: ['I10'] },
  { code: '56218007', term: 'Hypertensive heart disease', icd10: ['I11', 'I11.9'] },

  // Mental health — Anxiety
  { code: '21897009', term: 'Generalised anxiety disorder', icd10: ['F41.1'] },
  { code: '197480006', term: 'Anxiety disorder', icd10: ['F41', 'F41.9'] },
  { code: '371631005', term: 'Panic disorder', icd10: ['F41.0'] },

  // Mental health — Depression
  { code: '35489007', term: 'Depressive disorder', icd10: ['F32', 'F32.9'] },
  { code: '370143000', term: 'Major depressive disorder', icd10: ['F32.1'] },

  // Respiratory
  { code: '195967001', term: 'Asthma', icd10: ['J45', 'J45.9'] },
  { code: '13645005', term: 'Chronic obstructive lung disease', icd10: ['J44', 'J44.9'] },

  // Cardiovascular
  { code: '53741008', term: 'Coronary arteriosclerosis', icd10: ['I25.1'] },
  { code: '22298006', term: 'Myocardial infarction', icd10: ['I21', 'I21.9'] },
  { code: '49436004', term: 'Atrial fibrillation', icd10: ['I48', 'I48.9'] },

  // Common GP conditions
  { code: '36971009', term: 'Sinusitis', icd10: ['J32', 'J32.9'] },
  { code: '68566005', term: 'Urinary tract infection', icd10: ['N39.0'] },
  { code: '10509002', term: 'Acute bronchitis', icd10: ['J20', 'J20.9'] },
  { code: '386661006', term: 'Fever', icd10: ['R50.9'] },
  { code: '25064002', term: 'Headache', icd10: ['R51'] },
  { code: '267036007', term: 'Dyspnoea', icd10: ['R06.0'] },
  { code: '29857009', term: 'Chest pain', icd10: ['R07.9'] },
  { code: '267432004', term: 'Low back pain', icd10: ['M54.5'] },
];

// Search SNOMED codes by term (autocomplete)
export function searchSnomedCodes(query: string): SnomedCode[] {
  if (!query || query.length < 2) return [];
  const lower = query.toLowerCase();
  return SNOMED_CODES.filter(s =>
    s.term.toLowerCase().includes(lower) ||
    s.code.includes(query)
  ).slice(0, 10);
}

// Get SNOMED code by exact code
export function getSnomedByCode(code: string): SnomedCode | undefined {
  return SNOMED_CODES.find(s => s.code === code);
}

// Convert SNOMED code to ICD-10 codes
export function snomedToICD10(snomedCode: string): string[] {
  const snomed = getSnomedByCode(snomedCode);
  return snomed?.icd10 || [];
}
