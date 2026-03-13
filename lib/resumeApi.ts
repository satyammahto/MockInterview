/**
 * Helper to interact with the Resume Upload backend endpoint.
 */

export interface ResumeData {
  skills: string[];
  projects: string[];
  experience: string[];
  target_role: string;
}

export async function uploadResume(file: File): Promise<ResumeData> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:8000/api/resume/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || 'Failed to analyze resume. Please try again.');
  }

  return response.json();
}
