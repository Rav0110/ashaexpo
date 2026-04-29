// Visit types from implementation plan Section 3.2
export const VISIT_TYPES = {
  ANC: 'ANC',
  POSTNATAL: 'Postnatal',
  CHILD: 'Child',
  TB_FOLLOWUP: 'TB Follow-up',
  VACCINATION: 'Vaccination',
  GENERAL: 'General',
};

// Visit type labels for display
export const VISIT_TYPE_OPTIONS = [
  { value: VISIT_TYPES.ANC, label: 'ANC Visit (प्रसव पूर्व)' },
  { value: VISIT_TYPES.POSTNATAL, label: 'Postnatal Visit (प्रसव बाद)' },
  { value: VISIT_TYPES.CHILD, label: 'Child Visit (बाल स्वास्थ्य)' },
  { value: VISIT_TYPES.TB_FOLLOWUP, label: 'TB Follow-up (टीबी फॉलो-अप)' },
  { value: VISIT_TYPES.VACCINATION, label: 'Vaccination (टीकाकरण)' },
  { value: VISIT_TYPES.GENERAL, label: 'General Visit (सामान्य)' },
];

// Condition types for patients
export const CONDITION_TYPES = {
  PREGNANCY: 'pregnancy',
  CHILD: 'child',
  TB: 'tb',
  GENERAL: 'general',
};

export const CONDITION_TYPE_OPTIONS = [
  { value: CONDITION_TYPES.PREGNANCY, label: 'Pregnancy (गर्भावस्था)' },
  { value: CONDITION_TYPES.CHILD, label: 'Child (बालक)' },
  { value: CONDITION_TYPES.TB, label: 'TB (क्षय रोग)' },
  { value: CONDITION_TYPES.GENERAL, label: 'General (सामान्य)' },
];

// Sex options
export const SEX_OPTIONS = [
  { value: 'female', label: 'Female (महिला)' },
  { value: 'male', label: 'Male (पुरुष)' },
  { value: 'other', label: 'Other (अन्य)' },
];
