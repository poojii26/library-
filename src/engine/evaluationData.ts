import { EvalQuestion } from '../types/qa';

export const MAIN_EVAL_QUESTIONS: EvalQuestion[] = [
  // Library timings (4)
  {
    id: 'm1',
    question: 'What time does the library open?',
    expectedTopicKey: 'library timings',
    categoryLabel: 'Library timings',
    setType: 'main',
  },
  {
    id: 'm2',
    question: 'What are the library timings?',
    expectedTopicKey: 'library timings',
    categoryLabel: 'Library timings',
    setType: 'main',
  },
  {
    id: 'm3',
    question: 'When does the library close?',
    expectedTopicKey: 'library timings',
    categoryLabel: 'Library timings',
    setType: 'main',
  },
  {
    id: 'm4',
    question: 'What is the library schedule and hours?',
    expectedTopicKey: 'library timings',
    categoryLabel: 'Library timings',
    setType: 'main',
  },

  // Maximum books (4)
  {
    id: 'm5',
    question: 'What is the borrowing limit?',
    expectedTopicKey: 'maximum books',
    categoryLabel: 'Maximum books',
    setType: 'main',
  },
  {
    id: 'm6',
    question: 'How many books can a student borrow?',
    expectedTopicKey: 'maximum books',
    categoryLabel: 'Maximum books',
    setType: 'main',
  },
  {
    id: 'm7',
    question: 'What is the maximum number of books issued?',
    expectedTopicKey: 'maximum books',
    categoryLabel: 'Maximum books',
    setType: 'main',
  },
  {
    id: 'm8',
    question: 'How many book copies can I issue?',
    expectedTopicKey: 'maximum books',
    categoryLabel: 'Maximum books',
    setType: 'main',
  },

  // Book return period (4)
  {
    id: 'm9',
    question: 'How long can I keep borrowed books?',
    expectedTopicKey: 'book return period',
    categoryLabel: 'Book return period',
    setType: 'main',
  },
  {
    id: 'm10',
    question: 'When is the due date for returning books?',
    expectedTopicKey: 'book return period',
    categoryLabel: 'Book return period',
    setType: 'main',
  },
  {
    id: 'm11',
    question: 'What is the return period for a book?',
    expectedTopicKey: 'book return period',
    categoryLabel: 'Book return period',
    setType: 'main',
  },
  {
    id: 'm12',
    question: 'What is the deadline duration in days for books?',
    expectedTopicKey: 'book return period',
    categoryLabel: 'Book return period',
    setType: 'main',
  },

  // Late return fine (4)
  {
    id: 'm13',
    question: 'What is the fine per day for overdue books?',
    expectedTopicKey: 'late return fine',
    categoryLabel: 'Late return fine',
    setType: 'main',
  },
  {
    id: 'm14',
    question: 'How much penalty is charged for late returns?',
    expectedTopicKey: 'late return fine',
    categoryLabel: 'Late return fine',
    setType: 'main',
  },
  {
    id: 'm15',
    question: 'How much do I pay for a late book return?',
    expectedTopicKey: 'late return fine',
    categoryLabel: 'Late return fine',
    setType: 'main',
  },
  {
    id: 'm16',
    question: 'What is the overdue charge in rs?',
    expectedTopicKey: 'late return fine',
    categoryLabel: 'Late return fine',
    setType: 'main',
  },

  // Library membership (4)
  {
    id: 'm17',
    question: 'How do I join the library?',
    expectedTopicKey: 'library membership',
    categoryLabel: 'Library membership',
    setType: 'main',
  },
  {
    id: 'm18',
    question: 'Who can use the library?',
    expectedTopicKey: 'library membership',
    categoryLabel: 'Library membership',
    setType: 'main',
  },
  {
    id: 'm19',
    question: 'Who is eligible for library membership?',
    expectedTopicKey: 'library membership',
    categoryLabel: 'Library membership',
    setType: 'main',
  },
  {
    id: 'm20',
    question: 'How can a member register for access?',
    expectedTopicKey: 'library membership',
    categoryLabel: 'Library membership',
    setType: 'main',
  },

  // Out of scope (4)
  {
    id: 'm21',
    question: 'Who is the principal of the college?',
    expectedTopicKey: null,
    categoryLabel: 'Out of scope',
    setType: 'main',
  },
  {
    id: 'm22',
    question: 'Where is the cafeteria located?',
    expectedTopicKey: null,
    categoryLabel: 'Out of scope',
    setType: 'main',
  },
  {
    id: 'm23',
    question: 'How do I calculate my grade?',
    expectedTopicKey: null,
    categoryLabel: 'Out of scope',
    setType: 'main',
  },
  {
    id: 'm24',
    question: 'What is the WiFi password?',
    expectedTopicKey: null,
    categoryLabel: 'Out of scope',
    setType: 'main',
  },
];

export const HELDOUT_EVAL_QUESTIONS: EvalQuestion[] = [
  {
    id: 'h1',
    question: 'Is the library open at 10 am?',
    expectedTopicKey: 'library timings',
    categoryLabel: 'Library timings',
    setType: 'heldout',
  },
  {
    id: 'h2',
    question: 'Can I enter the library on Sunday?',
    expectedTopicKey: 'library membership',
    categoryLabel: 'Library membership',
    setType: 'heldout',
  },
  {
    id: 'h3',
    question: 'What is the maximum number of copies allowed per borrow?',
    expectedTopicKey: 'maximum books',
    categoryLabel: 'Maximum books',
    setType: 'heldout',
  },
  {
    id: 'h4',
    question: 'By when must I give back a borrowed book?',
    expectedTopicKey: 'book return period',
    categoryLabel: 'Book return period',
    setType: 'heldout',
  },
  {
    id: 'h5',
    question: 'What is the cost if a book is overdue?',
    expectedTopicKey: 'late return fine',
    categoryLabel: 'Late return fine',
    setType: 'heldout',
  },
  {
    id: 'h6',
    question: 'How do I get library access?',
    expectedTopicKey: 'library membership',
    categoryLabel: 'Library membership',
    setType: 'heldout',
  },
  {
    id: 'h7',
    question: 'What are the opening and closing hours?',
    expectedTopicKey: 'library timings',
    categoryLabel: 'Library timings',
    setType: 'heldout',
  },
  {
    id: 'h8',
    question: 'What is the duration to keep an issued book?',
    expectedTopicKey: 'book return period',
    categoryLabel: 'Book return period',
    setType: 'heldout',
  },
  {
    id: 'h9',
    question: 'What is the penalty for late books?',
    expectedTopicKey: 'late return fine',
    categoryLabel: 'Late return fine',
    setType: 'heldout',
  },
  {
    id: 'h10',
    question: 'How do I reset my campus portal password?',
    expectedTopicKey: null,
    categoryLabel: 'Out of scope',
    setType: 'heldout',
  },
];

export const STARTER_PROMPTS = [
  {
    label: 'Late Penalty',
    question: 'How much penalty is charged for late returns?',
    hint: 'Tests weighted scoring (penalty +4, late +3 vs return +2)',
  },
  {
    label: 'Opening Hours',
    question: 'What time does the library open?',
    hint: 'Verifies colon-preserving Knowledge Base lookup (9:00 AM)',
  },
  {
    label: 'Return Period',
    question: 'When is the due date for returning books?',
    hint: 'Demonstrates best-score search over first-match ordering',
  },
  {
    label: 'Membership',
    question: 'Who can use the library?',
    hint: 'Uses expanded synonyms (who +1, use +2)',
  },
  {
    label: 'Out of Scope',
    question: 'How do I calculate my grade?',
    hint: 'Tests whole-token matching against unrelated words',
  },
];
