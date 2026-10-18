import type { AccreditationStatus, ApplicationStatus, DemoState, FileMetadata, JobPosting, RegistrationInput, Report, Role, User } from '@/types'

export interface AuthResponse { user: User; accessToken?: string }
export interface JobLinkedApi {
  login(email: string, password: string, remember?: boolean): Promise<AuthResponse>
  register(input: RegistrationInput): Promise<AuthResponse>
  logout(): Promise<void>
  listJobs(): Promise<JobPosting[]>
  saveJob(jobId: string): Promise<void>
  createJob(input: Omit<JobPosting, 'id' | 'employerId' | 'postedAt'>): Promise<JobPosting>
  updateJob(id: string, input: Partial<JobPosting>): Promise<JobPosting>
  apply(jobId: string, resumeId: string, coverLetter: string): Promise<string>
  updateApplication(id: string, status: ApplicationStatus, interview?: { date: string; location: string }): Promise<void>
  reviewAccreditation(employerId: string, status: AccreditationStatus, reason: string): Promise<void>
  submitAccreditation(documents: FileMetadata[]): Promise<void>
  markNotification(id: string, read: boolean): Promise<void>
  getReport(from: string, to: string): Promise<Report>
}
export interface DemoApi extends JobLinkedApi { getState(): Promise<DemoState>; previewRole(role: Role): Promise<void>; reset(): Promise<void> }
