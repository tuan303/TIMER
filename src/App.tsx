import * as React from 'react';
import { useState, useEffect, useRef, Component } from 'react';
import { 
  Clock, 
  Globe, 
  Bell, 
  History, 
  Settings, 
  HelpCircle, 
  Search, 
  Plus, 
  MoreVertical, 
  Cloud, 
  Users, 
  Play, 
  Upload, 
  CheckCircle, 
  Zap,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  LogIn,
  Trash2,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  db, 
  storage, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  doc, 
  getDoc, 
  getDocFromServer, 
  Timestamp, 
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteDoc,
  updateDoc
} from './firebase';

// --- Components ---

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<any, any> {
  state = { hasError: false, error: null };
  props: any;

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background-dark text-white p-8">
          <div className="max-w-md w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-500">Something went wrong</h2>
            <p className="text-sm text-slate-400 mb-6">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Components ---

const ClockView = ({ onAdminClick }: { onAdminClick: () => void }) => {
  const [time, setTime] = useState(new Date());
  const [timers, setTimers] = useState<any[]>([]);
  const [nextTimer, setNextTimer] = useState<any>(null);
  const [playedTimers, setPlayedTimers] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Real-time sync with Firestore
  useEffect(() => {
    const q = query(collection(db, 'timers'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const timersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      // Sort by time in memory to avoid requiring a composite index
      timersData.sort((a, b) => {
        if (a.date === b.date) {
          return a.time.localeCompare(b.time);
        }
        return 0;
      });
      
      setTimers(timersData);
    }, (error) => {
      console.error("Firestore error in ClockView:", error);
    });

    return () => unsubscribe();
  }, []);

  // Clock and Alarm Logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);

      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
      const currentSecond = now.getSeconds();

      // Find if any timer matches current date and time
      const activeTimer = timers.find(t => t.date === currentDate && t.time === currentTime);
      
      if (activeTimer && !playedTimers.has(activeTimer.id) && currentSecond === 0) {
        console.log("Triggering alarm:", activeTimer.ringtoneName);
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        const audio = new Audio(activeTimer.ringtoneUrl);
        audioRef.current = audio;
        
        let playCount = 0;
        const targetCount = activeTimer.repeatCount || 1;
        
        const playAudio = () => {
          audio.currentTime = 0;
          audio.play().catch(e => console.error("Audio play failed:", e));
        };
        
        audio.addEventListener('ended', () => {
          playCount++;
          if (playCount < targetCount) {
            playAudio();
          }
        });
        
        playAudio();
        
        setPlayedTimers(prev => new Set(prev).add(activeTimer.id));
      }

      // Update Next Timer display
      const upcoming = timers.filter(t => {
        if (t.date > currentDate) return true;
        if (t.date === currentDate && t.time > currentTime) return true;
        return false;
      })[0];
      setNextTimer(upcoming);

      // Reset played timers at midnight
      if (currentTime === '00:00' && currentSecond === 0) {
        setPlayedTimers(new Set());
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timers, playedTimers]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat relative" 
      style={{ backgroundImage: 'url("https://hoangmaistarschool.edu.vn/thongtin/nshm_nen1.jpg")' }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-6 md:px-20 py-6">
          <div className="flex items-center gap-3 bg-white/95 p-2 md:p-3 rounded-2xl md:rounded-3xl shadow-lg shadow-black/10 backdrop-blur-sm">
            <img 
              src="https://hoangmaistarschool.edu.vn/thongtin/LogoNSHM.png" 
              alt="Logo" 
              className="h-12 md:h-16 w-auto object-contain" 
              referrerPolicy="no-referrer"
            />
          </div>
          <button 
            onClick={onAdminClick}
            className="size-10 rounded-full border border-primary/20 bg-primary/10 flex items-center justify-center hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer"
          >
            <Settings className="size-5 text-primary" />
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2 mb-8"
          >
            <div className="px-8 py-3 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
              <p className="text-white text-4xl md:text-6xl font-black tracking-tight drop-shadow-lg">{formatDate(time)}</p>
            </div>
            
            {nextTimer && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-red-600 bg-white px-6 py-3 rounded-full shadow-lg shadow-black/10"
              >
                <Bell className="size-5 animate-pulse" />
                <span className="text-lg md:text-xl font-black uppercase tracking-widest">
                  Next: {nextTimer.time} ({nextTimer.ringtoneName})
                </span>
              </motion.div>
            )}
          </motion.div>

          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="relative flex flex-col items-center">
              <h1 className="text-white tracking-tighter text-8xl md:text-[12rem] font-black leading-none tabular-nums drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {formatTime(time)}
              </h1>
            </div>
          </motion.div>
        </main>

        <footer className="p-10 text-center">
          <p className="text-slate-600 text-[10px] tracking-[0.3em] uppercase">© 2026 NSHM Global Network</p>
        </footer>
      </div>
    </div>
  );
};

const AdminView = ({ onBackClick }: { onBackClick: () => void }) => {
  const [pin, setPin] = useState('');
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [pinError, setPinError] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');
  const [ringtoneUrl, setRingtoneUrl] = useState('');
  const [ringtoneName, setRingtoneName] = useState('');
  const [repeatCount, setRepeatCount] = useState('1');
  const [isSaving, setIsSaving] = useState(false);
  const [timers, setTimers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [timerToDelete, setTimerToDelete] = useState<string | null>(null);
  const [editingTimerId, setEditingTimerId] = useState<string | null>(null);

  useEffect(() => {
    if (!isPinVerified) return;
    
    const q = query(collection(db, 'timers'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const timersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      // Sort by time in memory to avoid requiring a composite index
      timersData.sort((a, b) => {
        if (a.date === b.date) {
          return a.time.localeCompare(b.time);
        }
        return 0;
      });
      
      setTimers(timersData);
    }, (error) => {
      console.error("Firestore error in AdminView:", error);
      setFeedback({ message: "Failed to load timers. Please check your connection.", type: 'error' });
    });

    return () => unsubscribe();
  }, [isPinVerified]);

  const handleDelete = async (id: string) => {
    setTimerToDelete(id);
  };

  const confirmDelete = async () => {
    if (!timerToDelete) return;
    try {
      await deleteDoc(doc(db, 'timers', timerToDelete));
      setTimerToDelete(null);
    } catch (error: any) {
      console.error("Error deleting timer:", error);
      setFeedback({ message: `Failed to delete timer: ${error.message}`, type: 'error' });
      setTimerToDelete(null);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1122') {
      setIsPinVerified(true);
      setPinError('');
    } else {
      setPinError('Incorrect PIN code.');
      setPin('');
    }
  };

  const handleLogout = () => {
    setIsPinVerified(false);
    setPin('');
  };

  const handleEdit = (timer: any) => {
    setEditingTimerId(timer.id);
    setDate(timer.date);
    const [h, m] = timer.time.split(':');
    setHours(h);
    setMinutes(m);
    setRingtoneName(timer.ringtoneName);
    setRingtoneUrl(timer.ringtoneUrl);
    setRepeatCount(timer.repeatCount?.toString() || '1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    setFeedback(null);
    if (!date) {
      setFeedback({ message: 'Please select a date', type: 'error' });
      return;
    }
    if (!ringtoneUrl.trim() || !ringtoneName.trim()) {
      setFeedback({ message: 'Please provide a ringtone URL and name', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      if (editingTimerId) {
        await updateDoc(doc(db, 'timers', editingTimerId), {
          date,
          time: `${hours}:${minutes}`,
          ringtoneName: ringtoneName.trim(),
          ringtoneUrl: ringtoneUrl.trim(),
          repeatCount: parseInt(repeatCount, 10) || 1,
        });
        setFeedback({ message: 'Timer updated successfully!', type: 'success' });
        setEditingTimerId(null);
      } else {
        await addDoc(collection(db, 'timers'), {
          date,
          time: `${hours}:${minutes}`,
          ringtoneName: ringtoneName.trim(),
          ringtoneUrl: ringtoneUrl.trim(),
          repeatCount: parseInt(repeatCount, 10) || 1,
          createdBy: 'admin_pin',
          createdAt: serverTimestamp()
        });
        setFeedback({ message: 'Timer saved successfully!', type: 'success' });
      }

      setRingtoneUrl('');
      setRingtoneName('');
      setRepeatCount('1');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setFeedback(null), 3000);
    } catch (error: any) {
      console.error("Save failed:", error);
      setFeedback({ message: `Failed to save timer: ${error.message}`, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isPinVerified) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center text-white p-4"
        style={{ backgroundImage: 'url("https://hoangmaistarschool.edu.vn/thongtin/nshm_nen1.jpg")' }}
      >
        <div className="absolute inset-0 bg-background-dark/90 backdrop-blur-sm"></div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-primary/5 border border-primary/10 rounded-2xl p-12 text-center backdrop-blur-md max-w-md w-full"
        >
          <img 
            src="https://hoangmaistarschool.edu.vn/thongtin/LogoNSHM.png" 
            alt="Logo" 
            className="h-16 mx-auto mb-8 object-contain" 
            referrerPolicy="no-referrer"
          />
          <h2 className="text-2xl font-bold mb-2">Admin Access</h2>
          <p className="text-slate-400 mb-8">Please enter PIN code to access the control panel.</p>
          
          <form onSubmit={handlePinSubmit} className="space-y-4 text-left">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-primary/70 text-center block">Enter 4-digit PIN</label>
              <input 
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full bg-background-dark border border-primary/10 rounded-xl py-4 px-4 text-2xl text-center tracking-[1em] focus:ring-1 focus:ring-primary/30 outline-none text-white"
                required
              />
            </div>
            {pinError && <p className="text-red-500 text-xs font-bold text-center">{pinError}</p>}
            <button 
              type="submit"
              className="w-full py-4 bg-primary text-background-dark rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary/90 transition-all mt-4"
            >
              <LogIn className="size-5" />
              Access Admin
            </button>
          </form>

          <button 
            onClick={onBackClick}
            className="mt-6 text-slate-500 hover:text-white transition-colors text-sm font-bold"
          >
            Back to Clock
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="flex h-screen text-slate-100 overflow-hidden bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: 'url("https://hoangmaistarschool.edu.vn/thongtin/nshm_nen1.jpg")' }}
    >
      <div className="absolute inset-0 bg-background-dark/90 backdrop-blur-sm"></div>
      <div className="relative z-10 flex w-full h-full">
        {/* Sidebar */}
        <aside className="w-64 border-r border-primary/10 flex flex-col bg-background-dark/40 backdrop-blur-xl">
          <div className="p-6 flex flex-col gap-1">
              <div className="flex items-center gap-3 mb-8">
                <img 
                  src="https://hoangmaistarschool.edu.vn/thongtin/LogoNSHM.png" 
                  alt="Logo" 
                  className="h-8 w-auto object-contain" 
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h1 className="text-lg font-bold leading-none">Admin</h1>
                  <p className="text-[10px] text-primary/60 font-bold uppercase tracking-wider mt-1">Control Panel</p>
                </div>
              </div>
            
            <nav className="flex flex-col gap-1">
              <NavItem icon={<Plus className="size-4" />} label="Create Timer" active />
              <NavItem icon={<HelpCircle className="size-4" />} label="Support" />
            </nav>
          </div>

          <div className="mt-auto p-4 border-t border-primary/5">
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-primary/5 transition-colors group">
              <div className="size-10 rounded-full overflow-hidden border border-primary/20 bg-primary/10 flex items-center justify-center">
                <Users className="size-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">Administrator</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">PIN Access</p>
              </div>
              <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          <header className="h-16 border-b border-primary/10 bg-background-dark/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
            <h2 className="text-xl font-bold">{editingTimerId ? 'Edit Timer' : 'Create New Timer'}</h2>
            <div className="flex items-center gap-4">
              <button 
                onClick={onBackClick}
                className="text-slate-400 hover:text-white transition-colors text-sm font-bold"
              >
                Back to Clock
              </button>
            </div>
          </header>

          <div className="p-8 max-w-2xl mx-auto w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/5 border border-primary/10 rounded-2xl p-8 space-y-8 backdrop-blur-md"
            >
              {/* Date Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-widest text-primary/70">Select Date</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-background-dark border border-primary/10 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary/30 outline-none text-white [color-scheme:dark]"
                />
              </div>

              {/* Time Selection (24h) */}
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-widest text-primary/70">Select Time (24h Format)</label>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Hours</span>
                    <select 
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      className="w-full bg-background-dark border border-primary/10 rounded-xl py-3 px-4 text-sm appearance-none focus:ring-1 focus:ring-primary/30 outline-none text-white"
                    >
                      {Array.from({ length: 24 }).map((_, i) => (
                        <option key={i} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Minutes</span>
                    <select 
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value)}
                      className="w-full bg-background-dark border border-primary/10 rounded-xl py-3 px-4 text-sm appearance-none focus:ring-1 focus:ring-primary/30 outline-none text-white"
                    >
                      {Array.from({ length: 60 }).map((_, i) => (
                        <option key={i} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Ringtone Input */}
              <div className="space-y-4">
                <label className="block text-xs font-black uppercase tracking-widest text-primary/70">Ringtone Details</label>
                
                <div className="space-y-3">
                  <input 
                    type="text" 
                    value={ringtoneName}
                    onChange={(e) => setRingtoneName(e.target.value)}
                    placeholder="Ringtone Name (e.g., Morning Bell)"
                    className="w-full bg-background-dark border border-primary/10 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary/30 outline-none text-white"
                  />
                  
                  <input 
                    type="url" 
                    value={ringtoneUrl}
                    onChange={(e) => setRingtoneUrl(e.target.value)}
                    placeholder="Ringtone URL (e.g., https://example.com/audio.mp3)"
                    className="w-full bg-background-dark border border-primary/10 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary/30 outline-none text-white"
                  />
                  
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Repeat Count</span>
                    <input 
                      type="number" 
                      min="1"
                      max="100"
                      value={repeatCount}
                      onChange={(e) => setRepeatCount(e.target.value)}
                      placeholder="Number of times to repeat"
                      className="w-full bg-background-dark border border-primary/10 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary/30 outline-none text-white"
                    />
                  </div>
                </div>
              </div>

              {feedback && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${feedback.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}
                >
                  {feedback.type === 'error' ? <X className="size-5" /> : <CheckCircle className="size-5" />}
                  {feedback.message}
                </motion.div>
              )}

              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-4 bg-primary text-background-dark rounded-xl text-sm font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving && <div className="size-4 border-2 border-background-dark border-t-transparent animate-spin rounded-full"></div>}
                {isSaving ? 'Saving...' : (editingTimerId ? 'Update Timer' : 'Save Timer')}
              </button>
              
              {editingTimerId && (
                <button 
                  onClick={() => {
                    setEditingTimerId(null);
                    setRingtoneUrl('');
                    setRingtoneName('');
                    setRepeatCount('1');
                  }}
                  disabled={isSaving}
                  className="w-full mt-3 py-4 bg-slate-800 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Cancel Edit
                </button>
              )}
            </motion.div>

            {/* Timers List */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-8 bg-primary/5 border border-primary/10 rounded-2xl p-8 backdrop-blur-md"
            >
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Bell className="size-5 text-primary" />
                Active Timers
              </h3>
              
              {timers.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No timers created yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {timers.map((timer) => (
                    <div key={timer.id} className="flex items-center justify-between p-4 rounded-xl bg-background-dark/50 border border-primary/5 hover:border-primary/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-mono font-bold text-lg">
                          {timer.time}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{timer.ringtoneName}</p>
                          <p className="text-xs text-slate-400">{timer.date}</p>
                        </div>
                      </div>
                      {timerToDelete === timer.id ? (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={confirmDelete}
                            className="px-3 py-1.5 bg-red-500/20 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/30 transition-colors"
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={() => setTimerToDelete(null)}
                            className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleEdit(timer)}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Edit Timer"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(timer.id)}
                            className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Timer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

// --- Helper Components ---

const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <a className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${active ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' : 'text-slate-400 hover:bg-primary/5 hover:text-slate-200'}`} href="#">
    {icon}
    <span className="text-sm font-bold">{label}</span>
  </a>
);

export default function App() {
  const [view, setView] = useState<'clock' | 'admin'>('clock');

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <AnimatePresence mode="wait">
          {view === 'clock' ? (
            <motion.div
              key="clock"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ClockView onAdminClick={() => setView('admin')} />
            </motion.div>
          ) : (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AdminView onBackClick={() => setView('clock')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
