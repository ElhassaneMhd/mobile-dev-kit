// Grade-related TypeScript interfaces for the mobile app

export type GradeStatus = 'PUBLISHED' | 'VALIDATED' | 'PENDING' | 'DRAFT';
export type Mention = 'PASSABLE' | 'ASSEZ_BIEN' | 'BIEN' | 'TRES_BIEN' | 'EXCELLENT';
export type GradeComponent = 'CC' | 'TP' | 'EXAM';

export interface Grade {
  id: number;
  studentId: number;
  moduleId: number;
  cc?: number; // Contrôle Continu (out of 20)
  tp?: number; // Travaux Pratiques (out of 20)
  exam?: number; // Examen final (out of 20)
  finalGrade?: number; // Calculated final grade (out of 20)
  status: GradeStatus;
  publishedAt?: string; // ISO timestamp
  createdAt: string;
  updatedAt: string;
  module?: ModuleInfo;
}

export interface ModuleInfo {
  id: number;
  code: string;
  name: string;
  coefficient: number;
  credits: number;
  semesterId: number;
  semester?: SemesterInfo;
}

export interface SemesterInfo {
  id: number;
  name: string; // "Semestre 1", "Semestre 2"
  academicYear: string; // "2024-2025"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface GradeBreakdown {
  cc: number;
  tp: number;
  exam: number;
  ccWeight: number; // 40%
  tpWeight: number; // 20%
  examWeight: number; // 40%
  finalGrade: number;
}

export interface StudentGrades {
  studentId: number;
  grades: Grade[];
  semesterAverage?: number;
  annualAverage?: number;
}

export interface SemesterAverages {
  semesterId: number;
  semesterName: string;
  academicYear: string;
  average: number;
  totalCredits: number;
  earnedCredits: number;
  modules: ModuleGradeSummary[];
  mention?: Mention;
  isPassed: boolean;
}

export interface AnnualAverages {
  academicYear: string;
  semester1Average: number;
  semester2Average: number;
  annualAverage: number;
  totalCredits: number;
  earnedCredits: number;
  mention?: Mention;
  isPassed: boolean;
}

export interface ModuleGradeSummary {
  moduleId: number;
  moduleCode: string;
  moduleName: string;
  coefficient: number;
  credits: number;
  cc?: number;
  tp?: number;
  exam?: number;
  finalGrade?: number;
  status: GradeStatus;
  isPassed: boolean;
}

export interface ModuleStatistics {
  moduleId: number;
  moduleName: string;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDeviation: number;
  totalStudents: number;
  passedStudents: number;
  passRate: number;
  distribution: GradeDistribution[];
}

export interface GradeDistribution {
  range: string; // "0-5", "5-10", "10-12", "12-14", "14-16", "16-20"
  count: number;
  percentage: number;
}

export interface ClassRanking {
  studentId: number;
  rank: number;
  totalStudents: number;
  percentile: number;
  average: number;
}

export interface PerformanceTrend {
  semesterId: number;
  semesterName: string;
  academicYear: string;
  average: number;
  earnedCredits: number;
  totalCredits: number;
}

export interface GradeHistory {
  gradeId: number;
  action: 'CREATED' | 'UPDATED' | 'PUBLISHED' | 'DELETED';
  performedBy: string;
  performedAt: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface TranscriptData {
  studentId: number;
  studentName: string;
  studentCode: string;
  academicYear: string;
  semesters: SemesterAverages[];
  annualAverage: AnnualAverages;
  generatedAt: string;
}

// Request/Response types
export interface CreateGradeRequest {
  studentId: number;
  moduleId: number;
  cc?: number;
  tp?: number;
  exam?: number;
}

export interface BulkGradeRequest {
  moduleId: number;
  grades: {
    studentId: number;
    cc?: number;
    tp?: number;
    exam?: number;
  }[];
}

export interface UpdateGradeRequest {
  cc?: number;
  tp?: number;
  exam?: number;
}

export interface PublishGradesRequest {
  moduleId: number;
  publishAll: boolean;
}

// Filter types
export interface GradeFilter {
  semesterId?: number;
  academicYear?: string;
  status?: GradeStatus;
  moduleId?: number;
}

// UI Helper types
export interface GradeSummaryCard {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color: string;
  icon: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}
