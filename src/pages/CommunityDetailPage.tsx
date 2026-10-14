import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Send, 
  Heart, 
  Share2, 
  Sparkles, 
  ShieldAlert, 
  Pin, 
  Image as ImageIcon,
  CheckCircle2, 
  Flag,
  ArrowLeft
} from 'lucide-react';
import { StorageService } from '../lib/storage';
import { AIService } from '../lib/aiService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Community, Post, PostComment, Profile, Event, PostType } from '../types/database';
import { Modal } from '../components/common/Modal';

export const CommunityDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { currentUser } = useAuth();
  const { addToast, triggerCelebration } = useNotification();
  const navigate = useNavigate();

  const [community, setCommunity] = useState<Community | null>(null);
  const [activeTab, setActiveTab] = useState<'discussions' | 'announcements' | 'members' | 'events'>('discussions');
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [members, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // New Post Form
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<PostType>('discussion');
  const [newPostTags, setNewPostTags] = useState('Discussion, AI');
  const [newPostImage, setNewPostImage] = useState('');
  const [publishing, setPublishing] = useState(false);

  // Comment inputs map by postId
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>({});

  // Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string; title: string } | null>(null);
  const [reportReason, setReportReason] = useState('');

  const loadData = async () => {
    if (!slug) return;
    setLoading(true);
    const comm = await StorageService.getCommunityBySlug(slug);
    if (!comm) {
      setLoading(false);
      return;
    }
    setCommunity(comm);

    const [postList, allEvents, allProfiles] = await Promise.all([
      StorageService.getPosts(comm.id),
      StorageService.getEvents(),
      StorageService.getProfiles()
    ]);
    setPosts(postList);
    setEvents(allEvents.filter(e => e.communityId === comm.id));
    setProfiles(allProfiles);

    // Load comments for each post
    const cMap: Record<string, PostComment[]> = {};
    for (const p of postList) {
      cMap[p.id] = await StorageService.getComments(p.id);
    }
    setCommentsMap(cMap);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        Loading community hub...
      </div>
    );
  }

  if (!community) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Community Not Found</h2>
        <Link to="/communities" className="text-indigo-500 font-semibold text-xs hover:underline">
          ← Back to all communities
        </Link>
      </div>
    );
  }

  const handleToggleJoin = async () => {
    const isJoined = await StorageService.toggleJoinCommunity(community.id);
    setCommunity({
      ...community,
      isJoined,
      memberCount: community.memberCount + (isJoined ? 1 : -1)
    });
    if (isJoined) {
      triggerCelebration();
      addToast('Joined Hub!', `Welcome to ${community.name}.`, 'success');
    } else {
      addToast('Left Hub', `You have left ${community.name}.`, 'info');
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim() || !currentUser) return;

    setPublishing(true);

    // 1. Run AI Safety / Moderation Scan
    const modResult = await AIService.moderateContent(`${newPostTitle} ${newPostContent}`);
    if (modResult.isHarmful) {
      addToast('AI Moderation Alert', `Your post was flagged for ${modResult.flagCategory}: ${modResult.reason}`, 'warning');
      // Create admin report for safety
      await StorageService.createReport({
        reporter: currentUser,
        targetType: 'post',
        targetId: 'pending-post',
        targetTitle: newPostTitle,
        reason: `Auto AI Flag: ${modResult.reason}`,
        aiFlagged: true,
        aiConfidence: modResult.confidenceScore,
        aiAssessment: modResult.reason
      });
      setPublishing(false);
      return;
    }

    try {
      const created = await StorageService.createPost({
        communityId: community.id,
        communityName: community.name,
        authorId: currentUser.id,
        author: currentUser,
        title: newPostTitle,
        content: newPostContent,
        postType: newPostType,
        imageUrl: newPostImage.trim() || undefined,
        tags: newPostTags.split(',').map(t => t.trim()).filter(Boolean),
        isPinned: newPostType === 'announcement' && currentUser.role === 'admin',
        aiFlagged: false
      });

      setPosts([created, ...posts]);
      setCommentsMap(prev => ({ ...prev, [created.id]: [] }));
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostImage('');
      triggerCelebration();
      addToast('Post Published!', 'Your contribution is now live for community discussion.', 'success');
    } catch (err: any) {
      addToast('Publish Error', err?.message || 'Failed to post', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    const { liked, count } = await StorageService.toggleLikePost(postId);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, userHasLiked: liked, likesCount: count } : p));
  };

  const handleAddReaction = async (postId: string, emoji: string) => {
    const updated = await StorageService.addPostReaction(postId, emoji);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, reactions: updated } : p));
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text || !currentUser) return;

    const modResult = await AIService.moderateContent(text);
    if (modResult.isHarmful) {
      addToast('AI Moderation Alert', 'Comment blocked due to toxic or inappropriate content.', 'warning');
      return;
    }

    const newComment = await StorageService.addComment({
      postId,
      authorId: currentUser.id,
      author: currentUser,
      content: text,
      aiFlagged: false
    });

    setCommentsMap(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
    addToast('Comment added', 'Shared your thought with the author.', 'success');
  };

  const openReportModal = (id: string, title: string) => {
    setReportTarget({ id, title });
    setReportModalOpen(true);
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTarget || !currentUser) return;

    await StorageService.createReport({
      reporter: currentUser,
      targetType: 'post',
      targetId: reportTarget.id,
      targetTitle: reportTarget.title,
      reason: reportReason || 'Inappropriate content',
      aiFlagged: true,
      aiConfidence: 0.85,
      aiAssessment: 'Flagged by user for code of conduct review.'
    });

    setReportModalOpen(false);
    setReportReason('');
    addToast('Report Submitted', 'Our moderation team and AI Safety filter will review this item.', 'info');
  };

  const filteredPosts = activeTab === 'announcements'
    ? posts.filter(p => p.postType === 'announcement' || p.isPinned)
    : posts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      
      {/* Back link */}
      <Link to="/communities" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-500 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to all communities</span>
      </Link>

      {/* Hero Banner Header */}
      <div className="rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-lg">
        <div className="h-44 sm:h-60 w-full relative">
          <img src={community.bannerUrl} alt={community.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-md">
            {community.category}
          </span>
        </div>

        <div className="p-6 sm:p-8 -mt-12 relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={community.iconUrl}
              alt={community.name}
              className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {community.name}
              </h1>
              <p className="text-xs sm:text-sm text-indigo-500 dark:text-cyan-400 font-semibold mt-0.5">
                {community.tagline}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {community.memberCount} members
                </span>
                <span>•</span>
                <span>Created by {community.creatorName || 'Dean'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleJoin}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                community.isJoined
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 border border-indigo-200 dark:border-indigo-800'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
              }`}
            >
              {community.isJoined ? 'Joined Member ✓' : '+ Join Community'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 sm:px-8 border-t border-slate-100 dark:border-slate-800 flex items-center gap-6 overflow-x-auto">
          {[
            { id: 'discussions', label: 'Discussions & Posts', count: posts.length },
            { id: 'announcements', label: 'Announcements', count: posts.filter(p => p.postType === 'announcement').length },
            { id: 'members', label: 'Members Directory', count: community.memberCount },
            { id: 'events', label: 'Community Events', count: events.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-cyan-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Tab Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. DISCUSSIONS TAB */}
          {activeTab === 'discussions' && (
            <>
              {/* Create Post Box */}
              <form onSubmit={handleCreatePost} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Share Insight, Question, or Showcase
                  </span>
                </div>

                <input
                  type="text"
                  required
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="Post title or question headline..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />

                <textarea
                  rows={3}
                  required
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="What are you building or exploring? Share ideas, code snippets, or request peer critique..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <select
                    value={newPostType}
                    onChange={(e) => setNewPostType(e.target.value as PostType)}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs"
                  >
                    <option value="discussion">💬 Discussion</option>
                    <option value="showcase">🚀 Project Showcase</option>
                    <option value="question">❓ Question & Help</option>
                    <option value="announcement">📢 Announcement</option>
                  </select>

                  <input
                    type="text"
                    value={newPostImage}
                    onChange={(e) => setNewPostImage(e.target.value)}
                    placeholder="Optional image URL (https://...)"
                    className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    AI Safety Pre-Checked
                  </span>
                  <button
                    type="submit"
                    disabled={publishing || !newPostTitle.trim() || !newPostContent.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{publishing ? 'Validating & Publishing...' : 'Post to Guild'}</span>
                  </button>
                </div>
              </form>

              {/* Feed */}
              <div className="space-y-4">
                {filteredPosts.map(post => {
                  const comments = commentsMap[post.id] || [];
                  return (
                    <div
                      key={post.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-3.5"
                    >
                      {/* Post Author Bar */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.author.avatarUrl}
                            alt={post.author.fullName}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500/20"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                {post.author.fullName}
                              </h4>
                              {post.author.isVerified && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                {post.postType}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {post.isPinned && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                              <Pin className="h-3 w-3" /> Pinned
                            </span>
                          )}
                          <button
                            onClick={() => openReportModal(post.id, post.title)}
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Report content"
                          >
                            <Flag className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                          {post.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                          {post.content}
                        </p>
                      </div>

                      {/* Post Image */}
                      {post.imageUrl && (
                        <div className="rounded-xl overflow-hidden max-h-72 border border-slate-100 dark:border-slate-800">
                          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Tags */}
                      {post.tags && (
                        <div className="flex flex-wrap gap-1">
                          {post.tags.map((t, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Reactions & Like Action Bar */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                        {/* Reaction Emojis */}
                        <div className="flex items-center gap-1.5">
                          {['🚀', '💡', '❤️', '🔥'].map(emoji => {
                            const count = post.reactions?.[emoji] || 0;
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleAddReaction(post.id, emoji)}
                                className="px-2 py-1 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-slate-200 dark:border-slate-700/80 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <span>{emoji}</span>
                                {count > 0 && <span className="text-[10px] text-slate-400 font-bold">{count}</span>}
                              </button>
                            );
                          })}
                        </div>

                        {/* Likes & Comments Count */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center gap-1 text-xs font-semibold cursor-pointer transition-colors ${
                              post.userHasLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${post.userHasLiked ? 'fill-rose-500' : ''}`} />
                            <span>{post.likesCount}</span>
                          </button>
                          <span className="flex items-center gap-1 text-slate-400 text-xs">
                            <MessageSquare className="h-4 w-4" />
                            <span>{comments.length}</span>
                          </span>
                        </div>
                      </div>

                      {/* Comments Thread */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 space-y-2.5">
                        {comments.map(c => (
                          <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs flex items-start gap-2.5">
                            <img src={c.author.avatarUrl} alt={c.author.fullName} className="h-6 w-6 rounded-full object-cover shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 dark:text-white text-[11px]">{c.author.fullName}</span>
                                <span className="text-[9px] text-slate-400">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5 leading-relaxed">{c.content}</p>
                            </div>
                          </div>
                        ))}

                        {/* Add Comment Input */}
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }}
                            placeholder="Write a supportive, constructive comment..."
                            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddComment(post.id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* 2. ANNOUNCEMENTS TAB */}
          {activeTab === 'announcements' && (
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  No announcements posted yet.
                </div>
              ) : (
                filteredPosts.map(post => (
                  <div key={post.id} className="p-5 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-wider">
                      <Pin className="h-3.5 w-3.5" />
                      <span>Official Guild Announcement</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{post.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{post.content}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      Posted by {post.author.fullName} • {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 3. MEMBERS DIRECTORY TAB */}
          {activeTab === 'members' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {members.map(m => (
                <div key={m.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={m.avatarUrl} alt={m.fullName} className="h-10 w-10 rounded-xl object-cover ring-2 ring-indigo-500/20" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{m.fullName}</h4>
                      <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{m.headline}</p>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-500">
                        {m.role}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/discover?user=${m.id}`}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors"
                  >
                    Profile
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* 4. EVENTS TAB */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              {events.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  No upcoming events for this community.
                </div>
              ) : (
                events.map(e => (
                  <div key={e.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        {e.type}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{e.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{e.locationDetails}</p>
                    </div>
                    <Link
                      to={`/events/${e.slug}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shrink-0"
                    >
                      View Details
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Right 1 Col: Community Sidebar (Rules & AI Moderator Info) */}
        <div className="space-y-6">
          
          {/* About Guild Box */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              About this Community
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {community.description}
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p>📅 Founded {new Date(community.createdAt).toLocaleDateString()}</p>
              <p>🌐 Category: {community.category}</p>
            </div>
          </div>

          {/* Community Ground Rules */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Guild Code of Conduct
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              {community.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-bold text-indigo-500">{idx + 1}.</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Community Moderator Badge */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldAlert className="h-4 w-4" />
              <span>AI Community Moderator Guard Active</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Submissions are continuously audited for harassment, phishing, and spam. All actions require final human admin confirmation.
            </p>
          </div>

        </div>

      </div>

      {/* Report Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Content to Community Moderators"
        subtitle={`Flagging "${reportTarget?.title}" for safety review.`}
        maxWidth="md"
      >
        <form onSubmit={handleSendReport} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Reason for Reporting
            </label>
            <textarea
              rows={3}
              required
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Explain how this content violates community rules (e.g. unsolicited spam, harassment, copyright)..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReportModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
            >
              Submit Report
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
