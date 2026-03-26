-- Seed 5 launch exams
INSERT INTO exams (slug, title, department, description, vacancy_count, pay_scale, eligibility, is_active, seo_title, seo_description, focus_keyword) VALUES
(
  'junior-assistant',
  'Junior Assistant',
  'JKSSB',
  'Junior Assistant recruitment under JKSSB for various departments across Jammu & Kashmir. Includes clerical and administrative duties.',
  342,
  'Pay Level 4 (₹25,500–₹81,100)',
  'Graduate from a recognized university. Typing speed of 35 WPM in English or 25 WPM in Hindi/Urdu.',
  true,
  'JKSSB Junior Assistant 2025 — Syllabus, Papers & Cut-offs',
  'Complete guide for JKSSB Junior Assistant exam — syllabus, previous papers, cut-off marks, and important dates for 342 vacancies.',
  'JKSSB Junior Assistant'
),
(
  'sub-inspector',
  'Sub Inspector (JKPSI)',
  'JK Police',
  'Sub Inspector recruitment in Jammu & Kashmir Police. Involves law enforcement, investigation, and maintaining public order.',
  null,
  'Pay Level 6 (₹35,400–₹1,12,400)',
  'Graduate from a recognized university. Physical fitness standards as per J&K Police norms.',
  true,
  'JKPSI Sub Inspector 2025 — Complete Exam Guide',
  'JKPSI Sub Inspector exam guide with syllabus, previous papers, and preparation tips.',
  'JKPSI Sub Inspector'
),
(
  'naib-tehsildar',
  'Naib Tehsildar',
  'JKPSC',
  'Naib Tehsildar recruitment through JKPSC for revenue administration roles across Jammu & Kashmir.',
  null,
  'Pay Level 8 (₹47,600–₹1,51,100)',
  'Graduate from a recognized university. Knowledge of J&K revenue laws preferred.',
  true,
  'JKPSC Naib Tehsildar 2025 — Exam Details',
  'JKPSC Naib Tehsildar exam syllabus, previous papers, cut-off marks, and important dates.',
  'JKPSC Naib Tehsildar'
),
(
  'junior-engineer',
  'Junior Engineer (Civil & Electrical)',
  'JKSSB',
  'Junior Engineer recruitment for Civil and Electrical engineering positions under JKSSB across multiple departments.',
  800,
  'Pay Level 6 (₹35,400–₹1,12,400)',
  'Diploma or B.E./B.Tech in Civil Engineering or Electrical Engineering from a recognized institution.',
  true,
  'JKSSB Junior Engineer 2025 — 800+ Vacancies',
  'JKSSB JE Civil & Electrical exam guide — syllabus, previous papers, cut-offs for 800+ vacancies.',
  'JKSSB Junior Engineer'
),
(
  'finance-accounts-assistant',
  'Finance Accounts Assistant',
  'JKSSB',
  'Finance Accounts Assistant recruitment under JKSSB for finance and accounts departments across J&K.',
  600,
  'Pay Level 5 (₹29,200–₹92,300)',
  'Graduate with Commerce/Accounting background. Knowledge of Tally/accounting software preferred.',
  true,
  'JKSSB Finance Accounts Assistant — 600 Posts',
  'Complete guide for JKSSB Finance Accounts Assistant exam — 600 confirmed posts with syllabus and cut-offs.',
  'JKSSB Finance Accounts Assistant'
);

-- Seed sample syllabus for Junior Assistant
INSERT INTO syllabus_sections (exam_id, section_title, topics, marks_weight, sort_order)
SELECT id, 'General Knowledge', ARRAY['History of India and J&K', 'Geography of India and J&K', 'Indian Polity and Constitution', 'Current Affairs (National & International)', 'Economy of India and J&K', 'Awards and Honours'], 25, 1
FROM exams WHERE slug = 'junior-assistant';

INSERT INTO syllabus_sections (exam_id, section_title, topics, marks_weight, sort_order)
SELECT id, 'English Language', ARRAY['Grammar (Tenses, Articles, Prepositions)', 'Vocabulary (Synonyms, Antonyms, One-word substitution)', 'Comprehension Passages', 'Sentence Correction', 'Fill in the Blanks', 'Idioms and Phrases'], 25, 2
FROM exams WHERE slug = 'junior-assistant';

INSERT INTO syllabus_sections (exam_id, section_title, topics, marks_weight, sort_order)
SELECT id, 'Mathematics', ARRAY['Number System', 'Percentage', 'Ratio and Proportion', 'Profit and Loss', 'Simple and Compound Interest', 'Time and Work', 'Time, Speed and Distance', 'Data Interpretation'], 25, 3
FROM exams WHERE slug = 'junior-assistant';

INSERT INTO syllabus_sections (exam_id, section_title, topics, marks_weight, sort_order)
SELECT id, 'General Science & Computer Basics', ARRAY['Physics (Basic concepts)', 'Chemistry (Basic concepts)', 'Biology (Human body, Diseases)', 'Computer Fundamentals', 'MS Office (Word, Excel, PowerPoint)', 'Internet and Email basics'], 25, 4
FROM exams WHERE slug = 'junior-assistant';

-- Seed sample important dates for Junior Assistant
INSERT INTO exam_dates (exam_id, event_name, event_date, is_tentative)
SELECT id, 'Notification Released', '2025-09-15', false FROM exams WHERE slug = 'junior-assistant';

INSERT INTO exam_dates (exam_id, event_name, event_date, is_tentative)
SELECT id, 'Application Start Date', '2025-10-01', false FROM exams WHERE slug = 'junior-assistant';

INSERT INTO exam_dates (exam_id, event_name, event_date, is_tentative)
SELECT id, 'Last Date to Apply', '2025-11-30', false FROM exams WHERE slug = 'junior-assistant';

INSERT INTO exam_dates (exam_id, event_name, event_date, is_tentative)
SELECT id, 'Admit Card Release', '2026-01-15', true FROM exams WHERE slug = 'junior-assistant';

INSERT INTO exam_dates (exam_id, event_name, event_date, is_tentative)
SELECT id, 'Exam Date', '2026-02-15', true FROM exams WHERE slug = 'junior-assistant';

-- Seed sample notification
INSERT INTO notifications (slug, title, body, exam_id, category, is_published, published_at, seo_title, seo_description, focus_keyword)
SELECT
  'jkssb-junior-assistant-notification-2025',
  'JKSSB Junior Assistant Notification 2025 — 342 Vacancies Announced',
  '<p>The Jammu & Kashmir Services Selection Board (JKSSB) has officially released the notification for <strong>342 Junior Assistant</strong> vacancies across various departments.</p><p>Eligible candidates can apply online through the official JKSSB portal. The last date to apply is November 30, 2025.</p>',
  id,
  'notification',
  true,
  now(),
  'JKSSB Junior Assistant 2025 Notification — 342 Vacancies',
  'JKSSB has announced 342 Junior Assistant vacancies. Check eligibility, application dates, and how to apply.',
  'JKSSB Junior Assistant notification 2025'
FROM exams WHERE slug = 'junior-assistant';
