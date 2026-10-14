// Database and Domain Types for Creative Community Club AI

export type UserRole = 'student' | 'creator' | 'innovator' | 'mentor' | 'admin';

export interface Profile {
  id: string;
  userId?: string;
  fullName: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio: string;
  role: UserRole;
  headline: string;
  location: string;
  website?: string;
  github?: string;
  skills: string[];
  interests: string[];
  goals: string[];
  reputationPoints: number;
  isVerified: boolean;
  createdAt: string;
}

export type CommunityCategory = 
  | 'AI & Robotics'
  | 'Creative Coding'
  | 'UI/UX & Design'
  | 'Game Development'
  | 'Open Source & DevTools'
  | 'Audio & Music Tech'
  | 'Climate & Green Tech'
  | 'XR & Spatial Computing';

export interface Community {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: CommunityCategory;
  bannerUrl: string;
  iconUrl: string;
  createdBy: string;
  creatorName?: string;
  isFeatured: boolean;
  memberCount: number;
  rules: string[];
  tags: string[];
  isJoined?: boolean;
  createdAt: string;
}

export type PostType = 'discussion' | 'announcement' | 'showcase' | 'question';

export interface Post {
  id: string;
  communityId: string;
  communityName?: string;
  authorId: string;
  author: Profile;
  title: string;
  content: string;
  postType: PostType;
  imageUrl?: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  isPinned: boolean;
  aiFlagged: boolean;
  aiModerationReason?: string;
  userHasLiked?: boolean;
  reactions: Record<string, number>;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  author: Profile;
  content: string;
  likesCount: number;
  aiFlagged: boolean;
  createdAt: string;
}

export type Comment = PostComment;

export type ProjectStatus = 'planning' | 'active' | 'review' | 'completed';
export type ProjectStage = 'Ideation' | 'Prototype' | 'Alpha' | 'Beta' | 'Launch Ready';

export interface ProjectMilestone {
  id: string;
  title: string;
  deadline: string;
  completed: boolean;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  status: ProjectStatus;
  stage: ProjectStage;
  progress: number;
  coverUrl: string;
  demoUrl?: string;
  repoUrl?: string;
  requiredSkills: string[];
  tags: string[];
  createdBy: string;
  creator: Profile;
  aiSummary?: string;
  milestones: ProjectMilestone[];
  members: Profile[];
  likesCount: number;
  commentsCount: number;
  userHasLiked?: boolean;
  createdAt: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  assignee?: Profile;
  dueDate: string;
  tags: string[];
  position: number;
  createdAt: string;
}

export type EventType = 'hackathon' | 'workshop' | 'demo_day' | 'meetup';
export type LocationType = 'virtual' | 'in-person' | 'hybrid';

export interface PrizeItem {
  rank: string;
  reward: string;
  description: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: EventType;
  bannerUrl: string;
  communityId?: string;
  communityName?: string;
  organizer: Profile;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  locationType: LocationType;
  locationDetails: string;
  attendeeCount: number;
  maxAttendees?: number;
  prizes: PrizeItem[];
  tags: string[];
  isRegistered?: boolean;
  ticketCode?: string;
  createdAt: string;
}

export type NotificationType = 
  | 'invite'
  | 'event_reminder'
  | 'comment'
  | 'reaction'
  | 'badge'
  | 'system'
  | 'moderation';

export interface Notification {
  id: string;
  recipientId: string;
  sender?: Profile;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'collaboration' | 'events' | 'projects' | 'leadership' | 'learning';
  badgeColor: string;
  points: number;
  isUnlocked: boolean;
  isVerified: boolean; // Differentiates verified vs demo achievements
  unlockedAt?: string;
}

export interface Report {
  id: string;
  reporter: Profile;
  targetType: 'post' | 'comment' | 'user' | 'project';
  targetId: string;
  targetTitle: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  aiFlagged: boolean;
  aiConfidence: number;
  aiAssessment: string;
  actionNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

// AI Engine Interfaces
export interface AIIdeaRequest {
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  skills: string[];
  timeLimit: 'Weekend Hackathon' | '2-Week Sprint' | '1-Month Project' | 'Semester Capstone';
}

export interface AIIdeaResponse {
  title: string;
  tagline: string;
  problemStatement: string;
  solution: string;
  keyFeatures: string[];
  suggestedStack: string[];
  difficultyScore: string;
  nextSteps: string[];
  differentiator: string;
}

export interface AIProjectPlanRequest {
  title: string;
  description: string;
  targetDeadlineWeeks: number;
  teamSize: number;
}

export interface AIPlanRole {
  role: string;
  skillsNeeded: string[];
  primaryResponsibilities: string;
}

export interface AIPlanPhase {
  phaseName: string;
  durationWeeks: number;
  milestones: string[];
  suggestedTasks: string[];
}

export interface AIProjectPlanResponse {
  executiveSummary: string;
  suggestedRoles: AIPlanRole[];
  timelinePhases: AIPlanPhase[];
  curatedResources: { title: string; url: string; type: string }[];
  riskMitigation: string[];
  recommendedTechStack: string[];
}

export interface AITeamMatchRequest {
  projectId: string;
  requiredSkills: string[];
  preferredInterests: string[];
  teamSizeGoal: number;
}

export interface AITeamMatchResult {
  candidate: Profile;
  matchScore: number;
  relevanceExplanation: string;
  suggestedRole: string;
  complementarySkills: string[];
}

export interface AIModerationResult {
  isHarmful: boolean;
  confidenceScore: number;
  flagCategory: 'clean' | 'spam' | 'harassment' | 'offensive_language' | 'misleading';
  reason: string;
  suggestedAction: 'approve' | 'flag_for_review' | 'auto_quarantine';
}
