export default {
  name: '4X Valley',
  origin: 'https://4xvalley.com',
  portal: {
    signIn: '',
    register: '',
    resetPassword: ''
  },
  mode: 'eu-education-only',
  company: {
    legalName: '',
    registration: '',
    address: '',
    jurisdiction: ''
  },
  contact: {
    email: '',
    phone: '',
    careersEmail: ''
  },
  social: {facebook: '', x: '', instagram: '', youtube: '', linkedin: ''},
  // Approved legal HTML is read from src/legal/*.html when supplied.
  legalApproved: {terms: false, privacy: false, risk: false, consumer: false, notice: false},
  review: {operatorVerified: false, curriculumReviewed: false, euNationalRequirementsReviewed: false},
  consent: {policyVersion: '2026-11-17.1', retentionDays: 180, functional: true, meta: {pixelId: '', approved: false}},
  // Deliberately permitted by the user's "use placeholders for now" instruction.
  allowPlaceholders: true
};
