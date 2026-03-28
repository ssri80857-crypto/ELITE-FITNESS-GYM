
import React, { useState, useEffect, useRef } from 'react';
import { StoreItem } from '../types';
import { 
  ShoppingBag, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Camera, 
  Lock, 
  Unlock, 
  Check, 
  Package,
  ArrowRight,
  ChevronRight,
  Info,
  ShieldAlert,
  Globe,
  Zap
} from 'lucide-react';

const DEFAULT_ITEMS: StoreItem[] = [
  {
    id: '1',
    name: 'Forge Elite Performance Belt',
    price: 89.99,
    description: 'Competition-grade leather lifting belt designed for maximum intra-abdominal pressure and spinal stability.',
    image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '2',
    name: 'Nexus Wireless Shaker 3.0',
    price: 34.50,
    description: 'Self-cleaning smart shaker with silent-mixing technology and integrated nutrient tracking.',
    image: 'https://images.unsplash.com/photo-1593005517304-1813d33e8870?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '3',
    name: 'Architect Compression Tee',
    price: 45.00,
    description: 'Advanced moisture-wicking fabric that maps to your musculature for improved blood flow and posture.',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2ec617?auto=format&fit=crop&q=80&w=400'
  }
];

const Store: React.FC = () => {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedItems = localStorage.getItem('forge_store_items');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    } else {
      // Seed the store with default items if it's the first time
      setItems(DEFAULT_ITEMS);
      localStorage.setItem('forge_store_items', JSON.stringify(DEFAULT_ITEMS));
    }
    
    const adminSession = sessionStorage.getItem('forge_admin_active');
    if (adminSession === 'true') setIsAdmin(true);
  }, []);

  const saveToStorage = (newItems: StoreItem[]) => {
    setItems(newItems);
    localStorage.setItem('forge_store_items', JSON.stringify(newItems));
  };

  const handleAdminLogin = () => {
    if (password === 'srihari1234') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      sessionStorage.setItem('forge_admin_active', 'true');
      setPassword('');
    } else {
      alert('Access Denied: Only the application owner can modify the catalog.');
    }
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('forge_admin_active');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: StoreItem = {
      id: editingItem?.id || Math.random().toString(36).substring(2, 9),
      name: formName,
      price: formPrice,
      description: formDescription,
      image: formImage || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=400'
    };

    let updatedItems;
    if (editingItem) {
      updatedItems = items.map(item => item.id === editingItem.id ? newItem : item);
    } else {
      updatedItems = [newItem, ...items];
    }

    saveToStorage(updatedItems);
    closeModal();
  };

  const deleteItem = (id: string) => {
    if (confirm('Permanently remove this item from the store?')) {
      const updated = items.filter(item => item.id !== id);
      saveToStorage(updated);
    }
  };

  const openEdit = (item: StoreItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormPrice(item.price);
    setFormDescription(item.description);
    setFormImage(item.image);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
    setFormName('');
    setFormPrice(0);
    setFormDescription('');
    setFormImage(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">Forge Store</h2>
            <div className="flex items-center gap-2">
              <Globe size={12} className="text-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Marketplace Portal</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-100">
                <ShieldAlert size={14} strokeWidth={3} /> OWNER ACTIVE
              </span>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                <Plus size={16} strokeWidth={3} /> ADD GEAR
              </button>
              <button 
                onClick={logoutAdmin}
                className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                title="Lock Store Settings"
              >
                <Lock size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAdminLogin(true)}
              className="text-slate-300 hover:text-indigo-600 p-2 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-slate-200 rounded-xl px-4"
              title="Owner Portal"
            >
              <Unlock size={14} /> Access Key Required
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => (
          <div key={item.id} className="group bg-white rounded-[40px] overflow-hidden border border-slate-50 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative">
            <div className="aspect-[4/5] overflow-hidden relative bg-slate-100">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {isAdmin && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => openEdit(item)}
                    className="p-3 bg-white/90 backdrop-blur-md rounded-2xl text-indigo-600 shadow-xl hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="p-3 bg-white/90 backdrop-blur-md rounded-2xl text-red-500 shadow-xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
              
              <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <button className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl flex items-center justify-center gap-2 shadow-2xl hover:bg-indigo-600 hover:text-white transition-all">
                  SECURE CHECKOUT <ArrowRight size={18} />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-black text-xl text-slate-800 tracking-tight leading-tight">{item.name}</h3>
                <span className="text-xl font-black text-indigo-600">${item.price}</span>
              </div>
              <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed h-10">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-10 bg-slate-900 rounded-[50px] text-white flex flex-col md:flex-row items-center gap-10 overflow-hidden relative group">
        <div className="absolute right-0 bottom-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
          <Zap size={200} />
        </div>
        <div className="space-y-4 relative z-10 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.3em] text-indigo-400 uppercase">System Active</span>
          </div>
          <h3 className="text-3xl font-black tracking-tight leading-none">THE FORGE ARCHITECTURE IS NOW LIVE.</h3>
          <p className="text-slate-400 font-medium leading-relaxed max-w-lg">
            Every purchase supports the continuous evolution of our AI trainers. All Gear is vetted for maximum anatomical impact.
          </p>
        </div>
        <div className="relative z-10">
           <button className="px-8 py-5 bg-white text-slate-900 font-black rounded-3xl hover:bg-indigo-600 hover:text-white transition-all shadow-2xl flex items-center gap-3">
             VIEW FULL CATALOG <ChevronRight size={20} />
           </button>
        </div>
      </div>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <ShieldAlert size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Owner Verification</h3>
              <p className="text-slate-500 text-sm mt-1">Management is restricted to the application owner.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Master Access Key</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-center text-lg font-black tracking-[0.5em] focus:ring-2 focus:ring-indigo-500 outline-none"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowAdminLogin(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all"
                >
                  CANCEL
                </button>
                <button 
                  onClick={handleAdminLogin}
                  className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                >
                  VERIFY
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black tracking-tight uppercase italic">{editingItem ? 'Update Gear' : 'Add New Gear'}</h3>
                <p className="text-indigo-100 text-sm font-medium">Define your store catalog with precision.</p>
              </div>
              <button 
                onClick={closeModal}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Product Name</label>
                    <input 
                      required
                      type="text" 
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Forge Performance Tee"
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-inner outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Price ($)</label>
                    <input 
                      required
                      type="number" 
                      value={formPrice}
                      onChange={(e) => setFormPrice(parseFloat(e.target.value))}
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-inner outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                    <textarea 
                      required
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="High performance breathable fabric..."
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 h-32 resize-none shadow-inner outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Product Photo</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full aspect-square rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${formImage ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                  >
                    {formImage ? (
                      <img src={formImage} className="w-full h-full object-cover rounded-[30px]" alt="Preview" />
                    ) : (
                      <>
                        <Camera size={32} className="text-slate-300 mb-2" />
                        <span className="text-xs font-black text-slate-400">UPLOAD PHOTO</span>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                  <p className="text-[10px] text-slate-400 mt-2 italic flex items-center gap-1">
                    <Info size={10} /> Data is stored in your local admin cache.
                  </p>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
              >
                {editingItem ? 'SAVE CHANGES' : 'LIST PRODUCT'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;
