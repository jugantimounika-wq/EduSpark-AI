import { 
  Profile, 
  Community, 
  Post, 
  PostComment, 
  Project, 
  Task, 
  Event, 
  Achievement, 
  Report, 
  Notification,
  TaskStatus
} from '../types/database';
import { 
  SEED_PROFILES, 
  SEED_COMMUNITIES, 
  SEED_POSTS, 
  SEED_COMMENTS, 
  SEED_PROJECTS, 
  SEED_TASKS, 
  SEED_EVENTS, 
  SEED_ACHIEVEMENTS, 
  SEED_REPORTS, 
  SEED_NOTIFICATIONS 
} from '../data/seedData';
import { isSupabaseConfigured, supabase } from './supabase';

const STORAGE_KEYS = {
  PROFILES: 'ccai_profiles',
  COMMUNITIES: 'ccai_communities',
  POSTS: 'ccai_posts',
  COMMENTS: 'ccai_comments',
  PROJECTS: 'ccai_projects',
  TASKS: 'ccai_tasks',
  EVENTS: 'ccai_events',
  ACHIEVEMENTS: 'ccai_achievements',
  REPORTS: 'ccai_reports',
  NOTIFICATIONS: 'ccai_notifications',
  CURRENT_USER: 'ccai_current_user',
};

// Safe LocalStorage helpers with seed fallback
function getLocalData<T>(key: string, defaultData: T): T {
  if (typeof window === 'undefined') return defaultData;
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultData;
  }
}

function setLocalData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

export const StorageService = {
  // Mode flag
  isLiveSupabase(): boolean {
    return isSupabaseConfigured();
  },

  // RESET ALL DEMO DATA
  resetDemoData(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(SEED_PROFILES));
    localStorage.setItem(STORAGE_KEYS.COMMUNITIES, JSON.stringify(SEED_COMMUNITIES));
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(SEED_POSTS));
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(SEED_COMMENTS));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(SEED_PROJECTS));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(SEED_TASKS));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(SEED_EVENTS));
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(SEED_ACHIECHMENTS_WITH_STATE()));
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(SEED_REPORTS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
  },

  // PROFILES
  async getProfiles(): Promise<Profile[]> {
    if (this.isLiveSupabase() && supabase) {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data && data.length > 0) return data as Profile[];
    }
    return getLocalData<Profile[]>(STORAGE_KEYS.PROFILES, SEED_PROFILES);
  },

  async getProfileById(id: string): Promise<Profile | undefined> {
    const profiles = await this.getProfiles();
    return profiles.find(p => p.id === id);
  },

  async updateProfile(updated: Partial<Profile> & { id: string }): Promise<Profile> {
    const profiles = await this.getProfiles();
    const index = profiles.findIndex(p => p.id === updated.id);
    let result: Profile;
    if (index >= 0) {
      result = { ...profiles[index], ...updated };
      profiles[index] = result;
    } else {
      result = updated as Profile;
      profiles.push(result);
    }
    setLocalData(STORAGE_KEYS.PROFILES, profiles);

    if (this.isLiveSupabase() && supabase) {
      await supabase.from('profiles').upsert(result);
    }
    return result;
  },

  // COMMUNITIES
  async getCommunities(): Promise<Community[]> {
    if (this.isLiveSupabase() && supabase) {
      const { data, error } = await supabase.from('communities').select('*');
      if (!error && data && data.length > 0) return data as Community[];
    }
    return getLocalData<Community[]>(STORAGE_KEYS.COMMUNITIES, SEED_COMMUNITIES);
  },

  async getCommunityBySlug(slug: string): Promise<Community | undefined> {
    const communities = await this.getCommunities();
    return communities.find(c => c.slug === slug || c.id === slug);
  },

  async createCommunity(community: Omit<Community, 'id' | 'createdAt' | 'memberCount'>): Promise<Community> {
    const communities = await this.getCommunities();
    const newComm: Community = {
      ...community,
      id: `comm-${Date.now()}`,
      memberCount: 1,
      isJoined: true,
      createdAt: new Date().toISOString()
    };
    communities.unshift(newComm);
    setLocalData(STORAGE_KEYS.COMMUNITIES, communities);

    if (this.isLiveSupabase() && supabase) {
      await supabase.from('communities').insert(newComm);
    }
    return newComm;
  },

  async toggleJoinCommunity(communityId: string): Promise<boolean> {
    const communities = await this.getCommunities();
    const comm = communities.find(c => c.id === communityId);
    if (!comm) return false;
    const isNowJoined = !comm.isJoined;
    comm.isJoined = isNowJoined;
    comm.memberCount = Math.max(1, comm.memberCount + (isNowJoined ? 1 : -1));
    setLocalData(STORAGE_KEYS.COMMUNITIES, communities);
    return isNowJoined;
  },

  // POSTS
  async getPosts(communityId?: string): Promise<Post[]> {
    const posts = getLocalData<Post[]>(STORAGE_KEYS.POSTS, SEED_POSTS);
    if (communityId) {
      return posts.filter(p => p.communityId === communityId);
    }
    return posts;
  },

  async createPost(post: Omit<Post, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'reactions'>): Promise<Post> {
    const posts = await this.getPosts();
    const newPost: Post = {
      ...post,
      id: `post-${Date.now()}`,
      likesCount: 0,
      commentsCount: 0,
      reactions: { '🚀': 0, '💡': 0, '❤️': 0 },
      createdAt: new Date().toISOString()
    };
    posts.unshift(newPost);
    setLocalData(STORAGE_KEYS.POSTS, posts);

    if (this.isLiveSupabase() && supabase) {
      await supabase.from('posts').insert(newPost);
    }
    return newPost;
  },

  async toggleLikePost(postId: string): Promise<{ liked: boolean; count: number }> {
    const posts = await this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return { liked: false, count: 0 };
    post.userHasLiked = !post.userHasLiked;
    post.likesCount = Math.max(0, post.likesCount + (post.userHasLiked ? 1 : -1));
    setLocalData(STORAGE_KEYS.POSTS, posts);
    return { liked: post.userHasLiked, count: post.likesCount };
  },

  async addPostReaction(postId: string, emoji: string): Promise<Record<string, number>> {
    const posts = await this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return {};
    if (!post.reactions) post.reactions = {};
    post.reactions[emoji] = (post.reactions[emoji] || 0) + 1;
    setLocalData(STORAGE_KEYS.POSTS, posts);
    return post.reactions;
  },

  // COMMENTS
  async getComments(postId: string): Promise<PostComment[]> {
    const comments = getLocalData<PostComment[]>(STORAGE_KEYS.COMMENTS, SEED_COMMENTS);
    return comments.filter(c => c.postId === postId);
  },

  async addComment(comment: Omit<PostComment, 'id' | 'createdAt' | 'likesCount'>): Promise<PostComment> {
    const comments = getLocalData<PostComment[]>(STORAGE_KEYS.COMMENTS, SEED_COMMENTS);
    const newComment: PostComment = {
      ...comment,
      id: `comm-${Date.now()}`,
      likesCount: 0,
      createdAt: new Date().toISOString()
    };
    comments.push(newComment);
    setLocalData(STORAGE_KEYS.COMMENTS, comments);

    // Update post comment count
    const posts = await this.getPosts();
    const post = posts.find(p => p.id === comment.postId);
    if (post) {
      post.commentsCount = (post.commentsCount || 0) + 1;
      setLocalData(STORAGE_KEYS.POSTS, posts);
    }
    return newComment;
  },

  // PROJECTS
  async getProjects(): Promise<Project[]> {
    if (this.isLiveSupabase() && supabase) {
      const { data, error } = await supabase.from('projects').select('*');
      if (!error && data && data.length > 0) return data as Project[];
    }
    return getLocalData<Project[]>(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
  },

  async getProjectById(id: string): Promise<Project | undefined> {
    const projects = await this.getProjects();
    return projects.find(p => p.id === id);
  },

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>): Promise<Project> {
    const projects = await this.getProjects();
    const newProject: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString()
    };
    projects.unshift(newProject);
    setLocalData(STORAGE_KEYS.PROJECTS, projects);

    if (this.isLiveSupabase() && supabase) {
      await supabase.from('projects').insert(newProject);
    }
    return newProject;
  },

  async toggleLikeProject(projectId: string): Promise<{ liked: boolean; count: number }> {
    const projects = await this.getProjects();
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return { liked: false, count: 0 };
    proj.userHasLiked = !proj.userHasLiked;
    proj.likesCount = Math.max(0, proj.likesCount + (proj.userHasLiked ? 1 : -1));
    setLocalData(STORAGE_KEYS.PROJECTS, projects);
    return { liked: proj.userHasLiked, count: proj.likesCount };
  },

  // TASKS (KANBAN)
  async getTasks(projectId?: string): Promise<Task[]> {
    const tasks = getLocalData<Task[]>(STORAGE_KEYS.TASKS, SEED_TASKS);
    if (projectId) {
      return tasks.filter(t => t.projectId === projectId);
    }
    return tasks;
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const tasks = await this.getTasks();
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    setLocalData(STORAGE_KEYS.TASKS, tasks);
    return newTask;
  },

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task | undefined> {
    const tasks = await this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      setLocalData(STORAGE_KEYS.TASKS, tasks);
    }
    return task;
  },

  async deleteTask(taskId: string): Promise<boolean> {
    let tasks = await this.getTasks();
    const initialLen = tasks.length;
    tasks = tasks.filter(t => t.id !== taskId);
    setLocalData(STORAGE_KEYS.TASKS, tasks);
    return tasks.length < initialLen;
  },

  // EVENTS
  async getEvents(): Promise<Event[]> {
    if (this.isLiveSupabase() && supabase) {
      const { data, error } = await supabase.from('events').select('*');
      if (!error && data && data.length > 0) return data as Event[];
    }
    return getLocalData<Event[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
  },

  async getEventBySlug(slug: string): Promise<Event | undefined> {
    const events = await this.getEvents();
    return events.find(e => e.slug === slug || e.id === slug);
  },

  async createEvent(event: Omit<Event, 'id' | 'createdAt' | 'attendeeCount'>): Promise<Event> {
    const events = await this.getEvents();
    const newEvent: Event = {
      ...event,
      id: `event-${Date.now()}`,
      attendeeCount: 1,
      createdAt: new Date().toISOString()
    };
    events.unshift(newEvent);
    setLocalData(STORAGE_KEYS.EVENTS, events);

    if (this.isLiveSupabase() && supabase) {
      await supabase.from('events').insert(newEvent);
    }
    return newEvent;
  },

  async toggleRegisterEvent(eventId: string): Promise<{ registered: boolean; count: number; ticketCode?: string }> {
    const events = await this.getEvents();
    const evt = events.find(e => e.id === eventId);
    if (!evt) return { registered: false, count: 0 };
    const isNowRegistered = !evt.isRegistered;
    evt.isRegistered = isNowRegistered;
    evt.attendeeCount = Math.max(1, evt.attendeeCount + (isNowRegistered ? 1 : -1));
    if (isNowRegistered) {
      evt.ticketCode = `CCAI-${Math.floor(1000 + Math.random() * 9000)}`;
    } else {
      evt.ticketCode = undefined;
    }
    setLocalData(STORAGE_KEYS.EVENTS, events);
    return { registered: isNowRegistered, count: evt.attendeeCount, ticketCode: evt.ticketCode };
  },

  // ACHIEVEMENTS
  async getAchievements(): Promise<Achievement[]> {
    return getLocalData<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, SEED_ACHIECHMENTS_WITH_STATE());
  },

  async unlockAchievement(id: string): Promise<Achievement | undefined> {
    const achievements = await this.getAchievements();
    const ach = achievements.find(a => a.id === id);
    if (ach && !ach.isUnlocked) {
      ach.isUnlocked = true;
      ach.unlockedAt = new Date().toISOString();
      setLocalData(STORAGE_KEYS.ACHIEVEMENTS, achievements);
    }
    return ach;
  },

  // NOTIFICATIONS
  async getNotifications(): Promise<Notification[]> {
    return getLocalData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
  },

  async markNotificationAsRead(id: string): Promise<void> {
    const notifs = await this.getNotifications();
    const notif = notifs.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      setLocalData(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  },

  async markAllNotificationsAsRead(): Promise<void> {
    const notifs = await this.getNotifications();
    notifs.forEach(n => { n.isRead = true; });
    setLocalData(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },

  async addNotification(notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> {
    const notifs = await this.getNotifications();
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    notifs.unshift(newNotif);
    setLocalData(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return newNotif;
  },

  // REPORTS & MODERATION
  async getReports(): Promise<Report[]> {
    return getLocalData<Report[]>(STORAGE_KEYS.REPORTS, SEED_REPORTS);
  },

  async createReport(report: Omit<Report, 'id' | 'createdAt' | 'status'>): Promise<Report> {
    const reports = await this.getReports();
    const newReport: Report = {
      ...report,
      id: `rep-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    reports.unshift(newReport);
    setLocalData(STORAGE_KEYS.REPORTS, reports);
    return newReport;
  },

  async updateReportStatus(reportId: string, status: Report['status'], actionNotes?: string): Promise<Report | undefined> {
    const reports = await this.getReports();
    const report = reports.find(r => r.id === reportId);
    if (report) {
      report.status = status;
      report.reviewedAt = new Date().toISOString();
      if (actionNotes) report.actionNotes = actionNotes;
      setLocalData(STORAGE_KEYS.REPORTS, reports);
    }
    return report;
  },

  // PLATFORM STATS
  async getPlatformStats() {
    const [profiles, communities, projects, events, reports] = await Promise.all([
      this.getProfiles(),
      this.getCommunities(),
      this.getProjects(),
      this.getEvents(),
      this.getReports(),
    ]);

    return {
      totalMembers: profiles.length * 280 + 340,
      activeProjects: projects.length * 15 + 42,
      activeCommunities: communities.length,
      upcomingEvents: events.length,
      pendingReports: reports.filter(r => r.status === 'pending').length,
      aiGenerationsRun: 1840,
      platformUptime: '99.98%'
    };
  }
};

function SEED_ACHIECHMENTS_WITH_STATE(): Achievement[] {
  return SEED_ACHIEVEMENTS;
}
