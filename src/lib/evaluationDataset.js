// Evaluation dataset: 10 real prompts + 10 edge cases

export const REAL_PROMPTS = [
  {
    id: 'rp1',
    name: 'CRM Application',
    prompt: 'Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins can see analytics.',
    category: 'real',
  },
  {
    id: 'rp2',
    name: 'Project Management',
    prompt: 'Create a project management tool with teams, kanban boards, task assignment, deadlines, file attachments, and member roles (owner, admin, member, viewer).',
    category: 'real',
  },
  {
    id: 'rp3',
    name: 'E-commerce Platform',
    prompt: 'Build an e-commerce platform with product catalog, categories, shopping cart, checkout with Stripe, order tracking, reviews, and an admin panel for managing products and orders.',
    category: 'real',
  },
  {
    id: 'rp4',
    name: 'LMS System',
    prompt: 'Create a learning management system with courses, lessons, video content, quizzes with grading, student progress tracking, certificates, and an instructor dashboard.',
    category: 'real',
  },
  {
    id: 'rp5',
    name: 'Restaurant Reservation',
    prompt: 'Build a restaurant reservation system with table management, booking calendar, menu display, customer reviews, waitlist, and notifications.',
    category: 'real',
  },
  {
    id: 'rp6',
    name: 'Social Media App',
    prompt: 'Create a social media platform with user profiles, posts, comments, likes, followers, direct messaging, notifications, and content moderation.',
    category: 'real',
  },
  {
    id: 'rp7',
    name: 'HR Management',
    prompt: 'Build an HR management system with employee profiles, departments, leave management, payroll, performance reviews, recruitment pipeline, and reporting.',
    category: 'real',
  },
  {
    id: 'rp8',
    name: 'Healthcare Portal',
    prompt: 'Create a patient portal with appointment booking, doctor profiles, medical records, prescription tracking, telemedicine chat, and billing.',
    category: 'real',
  },
  {
    id: 'rp9',
    name: 'Real Estate Platform',
    prompt: 'Build a real estate listing platform with property listings, search filters, map view, virtual tours, agent profiles, inquiry forms, and favorites.',
    category: 'real',
  },
  {
    id: 'rp10',
    name: 'Event Management',
    prompt: 'Create an event management platform with event creation, ticket sales, attendee registration, check-in system, speaker management, and analytics.',
    category: 'real',
  },
];

export const EDGE_CASES = [
  {
    id: 'ec1',
    name: 'Vague - Just a word',
    prompt: 'app',
    category: 'vague',
    expected_behavior: 'Should ask for clarification or make broad assumptions',
  },
  {
    id: 'ec2',
    name: 'Vague - No specifics',
    prompt: 'Make something cool',
    category: 'vague',
    expected_behavior: 'Should request more details or default to a basic template',
  },
  {
    id: 'ec3',
    name: 'Conflicting Roles',
    prompt: 'Build an app where everyone is admin but only some people can edit. All users have full access but restricted to their department.',
    category: 'conflicting',
    expected_behavior: 'Should resolve the admin/restricted contradiction with reasonable role hierarchy',
  },
  {
    id: 'ec4',
    name: 'Conflicting Features',
    prompt: 'Build a free app with premium features. No login required but track user activity. Public content that only members can see.',
    category: 'conflicting',
    expected_behavior: 'Should identify contradictions and resolve with freemium model',
  },
  {
    id: 'ec5',
    name: 'Incomplete - No entities',
    prompt: 'Build a dashboard',
    category: 'incomplete',
    expected_behavior: 'Should infer what data the dashboard shows',
  },
  {
    id: 'ec6',
    name: 'Incomplete - No roles',
    prompt: 'Build a blog with posts and comments',
    category: 'incomplete',
    expected_behavior: 'Should add default author/reader roles',
  },
  {
    id: 'ec7',
    name: 'Overly complex',
    prompt: 'Build a platform that combines CRM, project management, social media, e-commerce, real-time chat, video conferencing, file storage, analytics, AI assistant, blockchain verification, IoT device management, and AR visualization.',
    category: 'complex',
    expected_behavior: 'Should handle gracefully, potentially scoping down or organizing into modules',
  },
  {
    id: 'ec8',
    name: 'Non-app request',
    prompt: 'Write me a poem about clouds',
    category: 'invalid',
    expected_behavior: 'Should recognize this is not an app request and handle accordingly',
  },
  {
    id: 'ec9',
    name: 'Ambiguous relationships',
    prompt: 'Build a school system where teachers are also students and students can teach. Parents can be teachers too.',
    category: 'ambiguous',
    expected_behavior: 'Should resolve multi-role relationships cleanly',
  },
  {
    id: 'ec10',
    name: 'Security-sensitive',
    prompt: 'Build a banking app with transfers, balance checking, and transaction history. Users should see each other\'s transactions for transparency.',
    category: 'conflicting',
    expected_behavior: 'Should flag the security concern of showing others transactions',
  },
];

export const ALL_PROMPTS = [...REAL_PROMPTS, ...EDGE_CASES];
