
import React, { useState, useEffect } from 'react';
import { FeedPost, User as UserType } from '../types';
import { 
  Megaphone, 
  AlertTriangle, 
  Lightbulb, 
  MessageCircle, 
  Send, 
  Clock, 
  ThumbsUp, 
  MoreHorizontal,
  ChevronRight,
  ShieldAlert,
  User
} from 'lucide-react';

interface FeedProps {
  user: UserType;
}

const Feed: React.FC<FeedProps> = ({ user }) => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [content, setContent] = useState('');
  const [type, setType] = useState<FeedPost['type']>('Feedback');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedPosts = localStorage.getItem('forge_feed_posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      // Seed data
      const initialPosts: FeedPost[] = [
        {
          id: '1',
          userName: 'Forge Admin',
          userLevel: 'Developer',
          content: 'Welcome to the Community Feed. Report any performance anomalies or suggest evolutions here.',
          type: 'Feedback',
          timestamp: Date.now() - 3600000,
          likes: 42
        }
      ];
      setPosts(initialPosts);
      localStorage.setItem('forge_feed_posts', JSON.stringify(initialPosts));
    }
  }, []);

  const savePosts = (newPosts: FeedPost[]) => {
    setPosts(newPosts);
    localStorage.setItem('forge_feed_posts', JSON.stringify(newPosts));
  };

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    
    setTimeout(() => {
      const newPost: FeedPost = {
        id: Math.random().toString(36).substring(2, 9),
        userName: user.name,
        userLevel: user.level,
        content: content,
        type: type,
        timestamp: Date.now(),
        likes: 0
      };

      const updatedPosts = [newPost, ...posts];
      savePosts(updatedPosts);
      setContent('');
      setIsSubmitting(false);
    }, 600);
  };

  const handleLike = (id: string) => {
    const updated = posts.map(p => 
      p.id === id ? { ...p, likes: p.likes + 1 } : p
    );
    savePosts(updated);
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Community Intel</h2>
          <p className="text-slate-500 font-medium">Broadcast your feedback and system observations.</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
           <ShieldAlert size={16} className="text-indigo-600" />
           <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Authorized Feed</span>
        </div>
      </div>

      {/* Post Architect */}
      <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100 space-y-6">
        <form onSubmit={handlePost} className="space-y-4">
          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-full">
            {[
              { id: 'Problem', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
              { id: 'Suggestion', icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-50' },
              { id: 'Feedback', icon: Megaphone, color: 'text-indigo-500', bg: 'bg-indigo-50' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setType(cat.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  type === cat.id 
                  ? 'bg-white shadow-xl shadow-slate-200/50 scale-[1.02] text-slate-800' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <cat.icon size={14} className={type === cat.id ? cat.color : ''} />
                {cat.id}
              </button>
            ))}
          </div>

          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                type === 'Problem' 
                ? "Describe the system anomaly..." 
                : type === 'Suggestion' 
                ? "Propose a feature evolution..." 
                : "Share your Forge experience..."
              }
              className="w-full p-6 bg-slate-50 border-none rounded-[32px] text-base font-medium text-slate-700 focus:ring-2 focus:ring-indigo-600 h-32 resize-none shadow-inner transition-all placeholder:text-slate-300"
            />
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User size={16} className="text-indigo-600" />
               </div>
               <span className="text-xs font-bold text-slate-400">Broadcasting as <span className="text-slate-800">{user.name}</span></span>
            </div>
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              {isSubmitting ? 'Transmitting...' : 'Post Intel'}
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* Feed Stream */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
             <MessageCircle size={40} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Quiet on the wire.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 animate-in slide-in-from-bottom-4 group">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
                    {post.type === 'Problem' && <AlertTriangle size={24} className="text-red-500" />}
                    {post.type === 'Suggestion' && <Lightbulb size={24} className="text-amber-500" />}
                    {post.type === 'Feedback' && <Megaphone size={24} className="text-indigo-600" />}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 tracking-tight flex items-center gap-2">
                      {post.userName}
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-slate-400">
                        {post.userLevel}
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> {getTimeAgo(post.timestamp)}
                    </p>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-slate-600 transition-colors p-2">
                   <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="px-1 text-slate-700 leading-relaxed mb-6 font-medium whitespace-pre-wrap">
                {post.content}
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all font-black text-xs uppercase tracking-widest active:scale-125"
                  >
                    <ThumbsUp size={16} />
                    {post.likes > 0 && post.likes} LIKES
                  </button>
                  <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all font-black text-xs uppercase tracking-widest">
                    <MessageCircle size={16} />
                    RESPOND
                  </button>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  post.type === 'Problem' ? 'bg-red-50 text-red-600' : 
                  post.type === 'Suggestion' ? 'bg-amber-50 text-amber-600' : 
                  'bg-indigo-50 text-indigo-600'
                }`}>
                  {post.type}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-8 bg-slate-900 rounded-[40px] text-white shadow-2xl flex flex-col items-center text-center relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
            <ShieldAlert size={120} />
         </div>
         <h3 className="text-2xl font-black mb-2 relative z-10">Forge Response Team</h3>
         <p className="text-slate-400 text-sm max-w-sm relative z-10 font-medium leading-relaxed italic">
           "Every reported problem is a catalyst for system evolution. Our elite support units monitor this broadcast 24/7."
         </p>
         <button className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 hover:text-white transition-colors relative z-10">
            View System Status <ChevronRight size={14} />
         </button>
      </div>
    </div>
  );
};

export default Feed;
