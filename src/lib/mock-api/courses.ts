import { Course } from './types';
import { mockPosts } from './posts';

const now = '2026-04-01T00:00:00.000Z';
const id = (prefix: string, n: number) => `${prefix}-${String(n).padStart(4, '0')}-5b4c-9d3e-f2a1b0c9d8e7`;

export const mockCourses: Course[] = [
  {
    id: id('course', 1),
    universalTitle: 'Living Well with Type 2 Diabetes',
    category: ['condition_diabetes'],
    icd10: ['E11', 'E11.9', 'E11.65'],
    clinicallyVerified: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    courseDetailsList: [{
      id: id('cd', 1),
      language: 'en',
      languageReviewLevel: 'clinicallyReviewed',
      title: 'Living Well with Type 2 Diabetes',
      description: 'A complete learning journey for patients newly diagnosed with Type 2 Diabetes. Covers understanding your condition, managing medications, lifestyle changes, and building a support network.',
      createdAt: now,
      updatedAt: now,
      courseId: id('course', 1),
    }],
    courseItems: [
      { id: id('ci', 1), order: 1, contentType: 'post', contentId: mockPosts[0].id, post: mockPosts[0] },
      { id: id('ci', 2), order: 2, contentType: 'post', contentId: mockPosts[1].id, post: mockPosts[1] },
      { id: id('ci', 3), order: 3, contentType: 'post', contentId: mockPosts[2].id, post: mockPosts[2] },
      { id: id('ci', 4), order: 4, contentType: 'post', contentId: mockPosts[3].id, post: mockPosts[3] },
      { id: id('ci', 5), order: 5, contentType: 'post', contentId: mockPosts[9].id, post: mockPosts[9] },
    ],
  },
  {
    id: id('course', 2),
    universalTitle: 'Managing High Blood Pressure',
    category: ['condition_cardiovascular', 'condition_hypertension'],
    icd10: ['I10', 'I11'],
    clinicallyVerified: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    courseDetailsList: [{
      id: id('cd', 2),
      language: 'en',
      languageReviewLevel: 'clinicallyReviewed',
      title: 'Managing High Blood Pressure',
      description: 'Everything you need to know about managing hypertension — from understanding your diagnosis to medication, lifestyle changes, and home monitoring.',
      createdAt: now,
      updatedAt: now,
      courseId: id('course', 2),
    }],
    courseItems: [
      { id: id('ci', 6), order: 1, contentType: 'post', contentId: mockPosts[10].id, post: mockPosts[10] },
      { id: id('ci', 7), order: 2, contentType: 'post', contentId: mockPosts[11].id, post: mockPosts[11] },
      { id: id('ci', 8), order: 3, contentType: 'post', contentId: mockPosts[12].id, post: mockPosts[12] },
      { id: id('ci', 9), order: 4, contentType: 'post', contentId: mockPosts[17].id, post: mockPosts[17] },
    ],
  },
  {
    id: id('course', 3),
    universalTitle: 'Understanding and Managing Anxiety',
    category: ['condition_mentalHealth', 'condition_anxiety'],
    icd10: ['F41', 'F41.1'],
    clinicallyVerified: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    courseDetailsList: [{
      id: id('cd', 3),
      language: 'en',
      languageReviewLevel: 'clinicallyReviewed',
      title: 'Understanding and Managing Anxiety',
      description: 'A supportive learning journey for people diagnosed with generalised anxiety disorder. From understanding your diagnosis to practical coping strategies and finding support.',
      createdAt: now,
      updatedAt: now,
      courseId: id('course', 3),
    }],
    courseItems: [
      { id: id('ci', 10), order: 1, contentType: 'post', contentId: mockPosts[18].id, post: mockPosts[18] },
      { id: id('ci', 11), order: 2, contentType: 'post', contentId: mockPosts[20].id, post: mockPosts[20] },
      { id: id('ci', 12), order: 3, contentType: 'post', contentId: mockPosts[19].id, post: mockPosts[19] },
      { id: id('ci', 13), order: 4, contentType: 'post', contentId: mockPosts[23].id, post: mockPosts[23] },
    ],
  },
];
