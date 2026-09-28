import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Paperclip,
  Trash2,
  Repeat2,
  Calendar,
  FileText,
} from 'lucide-react';
import { Header } from '../components/Header';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { announcementService } from '../services/api';
import { Announcement } from '../types';

export const Announcements: React.FC = () => {
  const { isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'IMPORTANT' | 'MEETING' | 'NOTICE' | 'GENERAL'>('IMPORTANT');
  const [hasAttachment, setHasAttachment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementService.getAll();
      setAnnouncements(res.announcements);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setSubmitting(true);
    try {
      await announcementService.create({
        title,
        content,
        priority,
        attachment: hasAttachment ? 'handbook_q4_guidelines.pdf' : undefined,
      });
      setTitle('');
      setContent('');
      setHasAttachment(false);
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to post announcement:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRepost = async (id: string) => {
    if (!window.confirm('Repost this announcement as a new broadcast?')) return;
    try {
      await announcementService.repost(id);
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to repost announcement:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await announcementService.delete(id);
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-12">
      <Header title="Announcements" />

      <div className="px-8 pt-8 space-y-6 max-w-7xl w-full">
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Announcements
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-normal">
            Share updates with teams and members.
          </p>
        </div>

        {/* 2 Column Layout */}
        <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-12' : 'max-w-4xl'} gap-6`}>
          {/* Left Column: Create Form (Admin Only) */}
          {isAdmin && (
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-5">
                  New announcement
                </h3>

                <form onSubmit={handlePostAnnouncement} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Announcement title"
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Priority Category
                    </label>
                    <select
                      value={priority}
                      onChange={(e: any) => setPriority(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="IMPORTANT">Important</option>
                      <option value="MEETING">Meeting</option>
                      <option value="NOTICE">Notice</option>
                      <option value="GENERAL">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Message
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Type your announcement here..."
                      rows={6}
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                    />
                  </div>

                  {hasAttachment && (
                    <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="flex-1 truncate">handbook_q4_guidelines.pdf</span>
                      <button
                        type="button"
                        onClick={() => setHasAttachment(false)}
                        className="text-slate-400 hover:text-rose-500 font-bold px-1"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setHasAttachment(!hasAttachment)}
                      className="px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                      <span>{hasAttachment ? 'Attachment added' : '+ Add attachment'}</span>
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
                    >
                      {submitting ? 'Posting...' : 'Post announcement'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Right Column: Previous announcements */}
          <div className={`${isAdmin ? 'lg:col-span-7' : 'w-full'} bg-white rounded-2xl border border-slate-100 shadow-sm p-6`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-900">
                {isAdmin ? 'Previous announcements' : 'Recent announcements'}
              </h3>
              <span className="text-xs text-slate-400">
                {announcements.length} total
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Loading announcements...
                </div>
              ) : announcements.length > 0 ? (
                announcements.map((ann) => {
                  const dateFormatted = new Date(ann.createdAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={ann.id}
                      className="py-4 flex items-start gap-4 hover:bg-slate-50/60 -mx-3 px-3 rounded-xl transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Megaphone className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">
                            {ann.title}
                          </h4>
                          {ann.isReposted && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-600">
                              <Repeat2 className="w-2.5 h-2.5" />
                              Reposted
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {ann.content}
                        </p>

                        {ann.attachment && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] text-slate-600">
                            <Paperclip className="w-3 h-3 text-slate-400" />
                            <span>{ann.attachment}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {dateFormatted}
                            </span>
                            <StatusBadge status={ann.priority} type="announcement" showDot={false} />
                          </div>

                          {isAdmin && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleRepost(ann.id)}
                                title="Repost announcement"
                                className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                              >
                                <Repeat2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(ann.id)}
                                title="Delete announcement"
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No announcements published yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
