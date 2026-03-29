const SYMPTOM_RULES = [
  { keywords: ['chest pain', 'chest_pain'],                          condition: 'Possible Cardiac Issue',             specialist: 'Cardiologist',       urgency: 'High'   },
  { keywords: ['shortness of breath', 'breathing difficulty'],       condition: 'Possible Respiratory Issue',         specialist: 'Pulmonologist',       urgency: 'High'   },
  { keywords: ['fever', 'high temperature'],                         condition: 'Possible Infection',                 specialist: 'General Physician',   urgency: 'Medium' },
  { keywords: ['headache', 'migraine'],                              condition: 'Possible Migraine or Tension Headache', specialist: 'Neurologist',      urgency: 'Low'    },
  { keywords: ['cough', 'cold'],                                     condition: 'Possible Respiratory Infection',     specialist: 'Pulmonologist',       urgency: 'Medium' },
  { keywords: ['stomach pain', 'abdominal pain', 'nausea'],         condition: 'Possible Gastrointestinal Issue',    specialist: 'Gastroenterologist',  urgency: 'Medium' },
  { keywords: ['joint pain', 'arthritis'],                           condition: 'Possible Arthritis',                 specialist: 'Rheumatologist',      urgency: 'Low'    },
  { keywords: ['skin rash', 'itching'],                              condition: 'Possible Dermatological Issue',      specialist: 'Dermatologist',       urgency: 'Low'    },
];

const DEFAULT_DIAGNOSIS = {
  condition: 'General Checkup Recommended',
  specialist: 'General Physician',
  urgency: 'Low',
};

module.exports = { SYMPTOM_RULES, DEFAULT_DIAGNOSIS };
