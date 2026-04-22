import { Post, PostWhere, Course, CourseWhere } from './types';
import { mockPosts } from './posts';
import { mockCourses } from './courses';

/**
 * Mock S5 GraphQL resolver — mirrors the real Sanctuary S5 API filtering behaviour.
 * Implements `contains` for string arrays (icd10) and `in` for enum arrays (category, topic).
 */

function matchesPostWhere(post: Post, where?: PostWhere): boolean {
  if (!where) return true;

  // ICD-10 filter: post matches if ANY of its icd10 codes appear in the filter's contains array
  if (where.icd10?.contains) {
    const hasMatch = post.icd10.some(code =>
      where.icd10!.contains!.some(filterCode =>
        code.startsWith(filterCode) || filterCode.startsWith(code)
      )
    );
    if (!hasMatch) return false;
  }

  // Category filter: post matches if ANY of its categories appear in the filter's in array
  if (where.category?.in) {
    const hasMatch = post.category.some(cat => where.category!.in!.includes(cat));
    if (!hasMatch) return false;
  }

  // Topic filter: post matches if ANY of its topics appear in the filter's in array
  if (where.topic?.in) {
    const hasMatch = post.topic.some(t => where.topic!.in!.includes(t));
    if (!hasMatch) return false;
  }

  // Clinical verification filter
  if (where.clinicallyVerified?.eq !== undefined) {
    if (post.clinicallyVerified !== where.clinicallyVerified.eq) return false;
  }

  // Media type filter
  if (where.mediaType?.eq) {
    if (post.mediaType !== where.mediaType.eq) return false;
  }

  return true;
}

function matchesCourseWhere(course: Course, where?: CourseWhere): boolean {
  if (!where) return true;

  if (where.icd10?.contains) {
    const hasMatch = course.icd10.some(code =>
      where.icd10!.contains!.some(filterCode =>
        code.startsWith(filterCode) || filterCode.startsWith(code)
      )
    );
    if (!hasMatch) return false;
  }

  if (where.category?.in) {
    const hasMatch = course.category.some(cat => where.category!.in!.includes(cat));
    if (!hasMatch) return false;
  }

  if (where.clinicallyVerified?.eq !== undefined) {
    if (course.clinicallyVerified !== where.clinicallyVerified.eq) return false;
  }

  return true;
}

export function getPosts(where?: PostWhere, limit?: number, offset?: number): Post[] {
  let results = mockPosts.filter(post => matchesPostWhere(post, where));

  // Sort by contentValue descending (highest quality first)
  results.sort((a, b) => b.contentValue - a.contentValue);

  if (offset) results = results.slice(offset);
  if (limit) results = results.slice(0, limit);

  return results;
}

export function getCourses(where?: CourseWhere, limit?: number, offset?: number): Course[] {
  let results = mockCourses.filter(course => matchesCourseWhere(course, where));

  if (offset) results = results.slice(offset);
  if (limit) results = results.slice(0, limit);

  return results;
}

export function getPostById(id: string): Post | undefined {
  return mockPosts.find(post => post.id === id);
}

export function getCourseById(id: string): Course | undefined {
  return mockCourses.find(course => course.id === id);
}
