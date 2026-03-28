
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Droplets, Plus, RotateCcw, Droplet, Bell, BellOff, Settings, Volume2, VolumeX, Clock, AlarmClock, Trash2, CheckCircle2 } from 'lucide-react';
import { WaterReminderSettings, Alarm } from '../types';

const GOAL = 3000; // 3000ml goal

const WaterTracker: React.FC = () => {
  const [intake, setIntake] = useState(0);
  const [lastResetDate, setLastResetDate] = useState<string>('');
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [newAlarmTime, setNewAlarmTime] = useState('08:00');
  const [newAlarmLabel, setNewAlarmLabel] = useState('Workout Time');
  
  const [reminderSettings, setReminderSettings] = useState<WaterReminderSettings>({
    enabled: false,
    intervalMinutes: 60,
    soundEnabled: true,
    lastReminderTimestamp: Date.now()
  });
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const getTodayISO = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    const savedIntake = localStorage.getItem('forge_water_today');
    const savedDate = localStorage.getItem('forge_water_last_date');
    const savedAlarms = localStorage.getItem('forge_alarms');
    
    if (savedIntake) setIntake(parseInt(savedIntake));
    if (savedDate) setLastResetDate(savedDate);
    if (savedAlarms) setAlarms(JSON.parse(savedAlarms));

    const savedSettings = localStorage.getItem('forge_water_reminders');
    if (savedSettings) {
      setReminderSettings(JSON.parse(savedSettings));
    }

    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
    
    checkDailyReset(savedDate);
  }, []);

  const checkDailyReset = (savedDate: string | null) => {
    const today = getTodayISO();
    if (savedDate !== today) {
      setIntake(0);
      setLastResetDate(today);
      localStorage.setItem('forge_water_today', '0');
      localStorage.setItem('forge_water_last_date', today);
    }
  };

  useEffect(() => {
    localStorage.setItem('forge_alarms', JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    localStorage.setItem('forge_water_reminders', JSON.stringify(reminderSettings));
  }, [reminderSettings]);

  const playAlarmSound = useCallback((isHighIntensity = false) => {
    if (!reminderSettings.soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = isHighIntensity ? 'square' : 'sine';
      oscillator.frequency.setValueAtTime(isHighIntensity ? 1200 : 880, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(isHighIntensity ? 600 : 440, ctx.currentTime + 0.5);

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio Context playback prevented by browser policies.");
    }
  }, [reminderSettings.soundEnabled]);

  const sendNotification = (title: string, body: string) => {
    if (permissionStatus === 'granted') {
      new Notification(title, {
        body,
        icon: "https://cdn-icons-png.flaticon.com/512/3105/3105807.png"
      });
    }
  };

  const triggerWaterReminder = useCallback(() => {
    if (reminderSettings.enabled) {
      sendNotification("Forge Hydration Reminder", "Keep your performance high. Time for hydration.");
      playAlarmSound(false);
      setReminderSettings(prev => ({ ...prev, lastReminderTimestamp: Date.now() }));
    }
  }, [reminderSettings.enabled, playAlarmSound]);

  const triggerScheduledAlarm = useCallback((alarm: Alarm) => {
    sendNotification(`Forge Alarm: ${alarm.label}`, `It's ${alarm.time}! Execution time.`);
    playAlarmSound(true);
  }, [playAlarmSound]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      const nowTime = now.toTimeString().slice(0, 5);
      const todayString = getTodayISO();

      if (lastResetDate !== todayString) {
        checkDailyReset(lastResetDate);
      }

      alarms.forEach(alarm => {
        if (alarm.enabled && alarm.time === nowTime && now.getSeconds() < 10) {
          triggerScheduledAlarm(alarm);
        }
      });

      if (reminderSettings.enabled) {
        const elapsedMs = Date.now() - reminderSettings.lastReminderTimestamp;
        const intervalMs = reminderSettings.intervalMinutes * 60 * 1000;
        if (elapsedMs >= intervalMs) {
          triggerWaterReminder();
        }
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [reminderSettings, alarms, lastResetDate, triggerScheduledAlarm, triggerWaterReminder]);

  const addWater = (amount: number) => {
    const newVal = intake + amount;
    setIntake(newVal);
    localStorage.setItem('forge_water_today', newVal.toString());
  };

  const addAlarm = () => {
    const newAlarm: Alarm = {
      id: Math.random().toString(36).substr(2, 9),
      time: newAlarmTime,
      enabled: true,
      label: newAlarmLabel || 'Custom Alarm'
    };
    setAlarms([...alarms, newAlarm]);
    setNewAlarmLabel('');
  };

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter(a => a.id !== id));
  };

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
    if (permission === 'granted') {
      setReminderSettings(prev => ({ ...prev, enabled: true }));
    }
  };

  const toggleReminders = () => {
    if (permissionStatus !== 'granted') {
      requestPermission();
    } else {
      setReminderSettings(prev => ({ ...prev, enabled: !prev.enabled }));
    }
  };

  const progress = Math.min((intake / GOAL) * 100, 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Droplets size={32} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Forge Reminders</h2>
        <p className="text-slate-500 font-medium">Auto-reset hydration and precision fitness alarms.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Hydration Status</p>
                    <span className="bg-blue-50 text-blue-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Resets Daily</span>
                  </div>
                  <h3 className="text-5xl font-black text-slate-800">{intake}<span className="text-lg text-slate-400 font-medium ml-1">ml</span></h3>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Target</p>
                  <h3 className="text-2xl font-bold text-blue-600">{GOAL}ml</h3>
                </div>
              </div>

              <div className="h-4 bg-slate-100 rounded-full overflow-hidden mb-8 shadow-inner">
                <div 
                  className="h-full bg-blue-500 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(59,130,246,0.5)]" 
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[250, 500, 750, 1000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => addWater(amount)}
                    className="group flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all active:scale-95"
                  >
                    <Plus size={16} className="text-blue-500" />
                    <span className="font-bold text-slate-700">{amount}ml</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mt-8 border-t border-slate-50 pt-6">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Periodic Reminders</span>
                        <div className="flex items-center gap-2 mt-1">
                             <button 
                                onClick={toggleReminders}
                                className={`w-8 h-4 rounded-full transition-colors relative ${reminderSettings.enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                             >
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${reminderSettings.enabled ? 'left-4.5' : 'left-0.5'}`} />
                             </button>
                             <span className="text-xs font-bold text-slate-600">{reminderSettings.intervalMinutes}m</span>
                        </div>
                    </div>
                </div>
                <button 
                  onClick={() => setIntake(0)}
                  className="p-3 text-slate-300 hover:text-slate-500 transition-colors rounded-xl hover:bg-slate-50"
                  title="Manual Reset"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
          </div>
          
          {progress >= 100 && (
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[32px] flex items-center gap-4 animate-in zoom-in-95">
              <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-emerald-100">
                 <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-emerald-800 font-black text-lg">Goal Crushed!</p>
                <p className="text-emerald-600 text-xs font-medium">Hydration levels are optimal for peak performance.</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
                        <AlarmClock size={24} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Fitness Alarms</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setReminderSettings(s => ({...s, soundEnabled: !s.soundEnabled}))}
                        className={`p-2 rounded-xl transition-all ${reminderSettings.soundEnabled ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                    >
                        {reminderSettings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>
                </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-[32px] space-y-4 mb-8">
                <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Label</label>
                        <input 
                            type="text"
                            value={newAlarmLabel}
                            onChange={(e) => setNewAlarmLabel(e.target.value)}
                            placeholder="Wake up, Gym..."
                            className="w-full p-3 bg-white border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-violet-500"
                        />
                    </div>
                    <div className="w-28 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Time</label>
                        <input 
                            type="time"
                            value={newAlarmTime}
                            onChange={(e) => setNewAlarmTime(e.target.value)}
                            className="w-full p-3 bg-white border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-violet-500"
                        />
                    </div>
                </div>
                <button 
                    onClick={addAlarm}
                    className="w-full py-4 bg-violet-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-violet-100 hover:bg-violet-700 transition-all active:scale-[0.98]"
                >
                    SET NEW ALARM
                </button>
            </div>

            <div className="space-y-3">
                {alarms.length === 0 ? (
                    <div className="text-center py-10 opacity-30">
                        <Clock size={32} className="mx-auto mb-2" />
                        <p className="text-xs font-bold uppercase tracking-widest">No active alarms</p>
                    </div>
                ) : (
                    alarms.map(alarm => (
                        <div key={alarm.id} className={`flex items-center justify-between p-4 rounded-3xl border transition-all ${alarm.enabled ? 'bg-white border-violet-100 shadow-sm' : 'bg-slate-50 border-transparent opacity-60'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-xl ${alarm.enabled ? 'bg-violet-50 text-violet-600' : 'bg-slate-200 text-slate-400'}`}>
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-slate-800 leading-none mb-1">{alarm.time}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{alarm.label}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => toggleAlarm(alarm.id)}
                                    className={`w-10 h-6 rounded-full transition-colors relative ${alarm.enabled ? 'bg-violet-600' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${alarm.enabled ? 'left-5' : 'left-1'}`} />
                                </button>
                                <button 
                                    onClick={() => deleteAlarm(alarm.id)}
                                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <div className="mt-8 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start gap-3">
                <Settings size={14} className="text-indigo-600 mt-1 shrink-0" />
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                    Reminders rely on browser persistence. Ensure system notifications are allowed.
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterTracker;
