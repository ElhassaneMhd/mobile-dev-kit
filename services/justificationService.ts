import { BaseApiService, defaultApiConfig } from './BaseApiService';
import { sharedTokenStorage } from './tokenStorage';

export type JustificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Justification {
  id: number;
  attendanceId: number;
  studentId: number;
  reasonText: string;
  documentPath?: string;
  status: JustificationStatus;
  coordinatorComment?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  moduleName?: string;
  absenceDate: string;
  details?: string;
  reason?: string;
  documentUrl?: string;
  documentName?: string;
  reviewComment?: string;
}

export interface JustificationListItem {
  id: number;
  attendanceId: number;
  reasonText: string;
  status: JustificationStatus;
  submittedAt: string;
  hasDocument: boolean;
}

export interface DisciplinaryFlag {
  id: number;
  studentId: number;
  moduleId: number;
  absenceCount: number;
  warningLevel: 1 | 2 | 3;
  flaggedAt: string;
  resolved: boolean;
}

export interface CreateJustificationRequest {
  attendanceId: number;
  studentId: number;
  reasonText: string;
  document?: {
    uri: string;
    name: string;
    type: string;
  };
}

export interface UploadDocumentResponse {
  documentPath: string;
  message: string;
}

class JustificationServiceClass extends BaseApiService {
  private static readonly BASE_PATH = '/justifications';
  private static readonly DISCIPLINARY_PATH = '/disciplinary-flags';

  constructor() {
    super(defaultApiConfig, sharedTokenStorage);
  }

  /**
   * Submit justification with optional document
   */
  async submitJustification(
    request: CreateJustificationRequest
  ): Promise<Justification> {
    try {
      const formData = new FormData();
      formData.append('attendanceId', request.attendanceId.toString());
      formData.append('studentId', request.studentId.toString());
      formData.append('reasonText', request.reasonText);

      if (request.document) {
        const file = {
          uri: request.document.uri,
          type: request.document.type,
          name: request.document.name,
        } as unknown as Blob;

        formData.append('document', file);
      }

      const response = await this.postFormData<Justification>(
        JustificationServiceClass.BASE_PATH,
        formData
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to submit justification');
      }

      return response.data;
    } catch (error) {
      console.error('Error submitting justification:', error);
      throw error;
    }
  }

  /**
   * Get all justifications for a student
   */
  async getStudentJustifications(studentId: number): Promise<JustificationListItem[]> {
    try {
      // Use mock data if enabled
      if (USE_MOCK_JUSTIFICATION_DATA) {
        console.log('📋 Using MOCK justification data for studentId:', studentId);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // Return all mock data regardless of studentId for demo purposes
        return MOCK_JUSTIFICATION_LIST;
      }

      const response = await this.get<JustificationListItem[]>(
        `${JustificationServiceClass.BASE_PATH}/student/${studentId}`
      );

      return response.data || [];
    } catch (error) {
      console.error('Error getting student justifications:', error);
      return [];
    }
  }

  /**
   * Get specific justification by ID
   */
  async getJustificationById(id: number): Promise<Justification | null> {
    try {
      // Use mock data if enabled
      if (USE_MOCK_JUSTIFICATION_DATA) {
        console.log('📋 Using MOCK justification data for ID:', id);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_JUSTIFICATIONS.find(j => j.id === id) || null;
      }

      const response = await this.get<Justification>(
        `${JustificationServiceClass.BASE_PATH}/${id}`
      );

      return response.data || null;
    } catch (error) {
      console.error('Error getting justification:', error);
      return null;
    }
  }

  /**
   * Upload document for existing justification
   */
  async uploadDocument(
    justificationId: number,
    document: { uri: string; name: string; type: string }
  ): Promise<UploadDocumentResponse> {
    try {
      const formData = new FormData();
      const file = {
        uri: document.uri,
        type: document.type,
        name: document.name,
      } as unknown as Blob;

      formData.append('document', file);

      const response = await this.postFormData<UploadDocumentResponse>(
        `${JustificationServiceClass.BASE_PATH}/${justificationId}/upload-document`,
        formData
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to upload document');
      }

      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  /**
   * Get disciplinary flags for a student
   */
  async getDisciplinaryFlags(studentId: number): Promise<DisciplinaryFlag[]> {
    try {
      // Use mock data if enabled
      if (USE_MOCK_JUSTIFICATION_DATA) {
        console.log('⚠️ Using MOCK disciplinary flags data for studentId:', studentId);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        // Return all mock data regardless of studentId for demo purposes
        return MOCK_DISCIPLINARY_FLAGS;
      }

      const response = await this.get<DisciplinaryFlag[]>(
        `${JustificationServiceClass.DISCIPLINARY_PATH}/student/${studentId}`
      );

      return response.data || [];
    } catch (error) {
      console.error('Error getting disciplinary flags:', error);
      return [];
    }
  }

  /**
   * Get pending justifications (for coordinators - future use)
   */
  async getPendingJustifications(): Promise<JustificationListItem[]> {
    try {
      const response = await this.get<JustificationListItem[]>(
        `${JustificationServiceClass.BASE_PATH}/pending`
      );

      return response.data || [];
    } catch (error) {
      console.error('Error getting pending justifications:', error);
      return [];
    }
  }

  /**
   * Approve justification (coordinator only - future use)
   */
  async approveJustification(
    id: number,
    coordinatorComment?: string
  ): Promise<Justification> {
    try {
      const response = await this.put<Justification>(
        `${JustificationServiceClass.BASE_PATH}/${id}/approve`,
        { coordinatorComment }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to approve justification');
      }

      return response.data;
    } catch (error) {
      console.error('Error approving justification:', error);
      throw error;
    }
  }

  /**
   * Reject justification (coordinator only - future use)
   */
  async rejectJustification(
    id: number,
    coordinatorComment: string
  ): Promise<Justification> {
    try {
      const response = await this.put<Justification>(
        `${JustificationServiceClass.BASE_PATH}/${id}/reject`,
        { coordinatorComment }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to reject justification');
      }

      return response.data;
    } catch (error) {
      console.error('Error rejecting justification:', error);
      throw error;
    }
  }

  /**
   * Get status display info
   */
  getStatusDisplay(status: JustificationStatus): { label: string; color: string } {
    switch (status) {
      case 'PENDING':
        return { label: 'En attente', color: '#F59E0B' };
      case 'APPROVED':
        return { label: 'Approuvée', color: '#10B981' };
      case 'REJECTED':
        return { label: 'Refusée', color: '#EF4444' };
      default:
        return { label: status, color: '#6B7280' };
    }
  }

  /**
   * Get warning level display info
   */
  getWarningLevelDisplay(level: 1 | 2 | 3): { label: string; color: string; threshold: number } {
    const warnings = {
      1: { threshold: 3, color: '#F59E0B', label: 'Avertissement niveau 1' },
      2: { threshold: 5, color: '#F97316', label: 'Avertissement niveau 2' },
      3: { threshold: 7, color: '#EF4444', label: 'Avertissement niveau 3' },
    };

    return warnings[level];
  }

  /**
   * Format submission date (relative time in French)
   */
  formatSubmissionDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: diffDays > 365 ? 'numeric' : undefined,
    });
  }

  // ============ HYBRID METHODS - Student Self-Service Integration ============
  // These methods use the new /students/me/* endpoints when available
  // and fallback to old endpoints if needed

  /**
   * Get current user's justifications (Student Self-Service endpoint)
   * Uses: GET /students/me/justifications
   * Fallback: getStudentJustifications()
   */
  async getMyJustifications(): Promise<{ justifications: any[] }> {
    try {
      // Try new student self-service endpoint first
      const { studentSelfService } = await import('./studentSelfService');
      return await studentSelfService.getMyJustifications();
    } catch (error) {
      console.warn('Student self-service justifications endpoint not available, using fallback');
      // If the new endpoint fails, users should provide studentId to use getStudentJustifications()
      throw new Error('Please use studentSelfService.getMyJustifications() directly or provide studentId to getStudentJustifications()');
    }
  }

  /**
   * Submit current user's justification (Student Self-Service endpoint)
   * Uses: POST /students/me/justifications
   * Fallback: submitJustification()
   */
  async submitMyJustification(data: FormData): Promise<any> {
    try {
      // Try new student self-service endpoint first
      const { studentSelfService } = await import('./studentSelfService');
      return await studentSelfService.submitJustification(data);
    } catch (error) {
      console.warn('Student self-service submit justification endpoint not available');
      throw error;
    }
  }

  /**
   * Get current user's justification details (Student Self-Service endpoint)
   * Uses: GET /students/me/justifications/{id}
   * Fallback: getJustificationById()
   */
  async getMyJustificationDetails(id: number): Promise<any> {
    try {
      // Try new student self-service endpoint first
      const { studentSelfService } = await import('./studentSelfService');
      return await studentSelfService.getJustificationDetails(id);
    } catch (error) {
      console.warn('Student self-service justification details endpoint not available, using fallback');
      // Fallback to old endpoint
      return this.getJustificationById(id);
    }
  }

  // Note: Old methods (getStudentJustifications, submitJustification, etc.) remain available
  // for professor/coordinator views and backward compatibility
}

// Mock data configuration
const USE_MOCK_JUSTIFICATION_DATA = false;
const MOCK_JUSTIFICATION_LIST: JustificationListItem[] = [];
const MOCK_JUSTIFICATIONS: Justification[] = [];
const MOCK_DISCIPLINARY_FLAGS: DisciplinaryFlag[] = [];

export const JustificationService = new JustificationServiceClass();
