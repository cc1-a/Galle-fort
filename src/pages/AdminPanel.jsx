import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot, collection, query, orderBy, deleteDoc } from 'firebase/firestore';
import { Trash2, Save, LogOut, LayoutDashboard, History, User, Phone, Calendar, Clock, DollarSign } from 'lucide-react';

const AdminPanel = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [settings, setSettings] = useState({ 
    groupPrice: "12", 
    privatePrice: "40", 
    waNumber: "94766226039", 
    instance: "696103D4D811C", 
    token: "6935797c735a5" 
  });
  const [bookings, setBookings] = useState([]);

  const handleAuth = (e) => {
    e.preventDefault();
    if (password === "galleadmin2026") setIsAuthorized(true);
    else alert("Access Denied");
  };

  useEffect(() => {
    if (!isAuthorized) return;
    
    // Listen for Settings
    const unsubSettings = onSnapshot(doc(db, "admin", "settings"), (docSnap) => {
      if (docSnap.exists()) setSettings(docSnap.data());
    });

    // Listen for Bookings
    const q = query(collection(db, "bookings"), orderBy("timestamp", "desc"));
    const unsubBookings = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubSettings(); unsubBookings(); };
  }, [isAuthorized]);

  const saveSettings = async () => {
    try {
        await setDoc(doc(db, "admin", "settings"), settings);
        alert("Site Settings Synchronized!");
    } catch (e) { alert("Error: Check Firebase Rules"); }
  };

  if (!isAuthorized) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0F172A] font-sans">
        <form onSubmit={handleAuth} className="bg-white p-12 rounded-[3rem] shadow-2xl w-[400px]">
          <h1 className="text-3xl font-black mb-8 text-center tracking-tighter uppercase">Admin Portal</h1>
          <input autoFocus type="password" placeholder="System Key" className="w-full p-5 bg-slate-100 rounded-2xl mb-6 outline-none border-2 focus:border-cyan-500 transition-all font-bold" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="w-full py-5 bg-[#0F172A] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-cyan-600 transition-all">Unlock Dashboard</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex font-sans text-slate-900">
      <div className="w-72 bg-[#0F172A] text-white p-10 flex flex-col justify-between fixed h-full z-50">
        <div className="space-y-12">
            <h2 className="text-2xl font-black tracking-tighter uppercase italic">GALLE ADMIN</h2>
            <div className="space-y-4">
                <button className="w-full flex items-center gap-4 bg-white/10 p-4 rounded-2xl text-cyan-400 font-bold"><LayoutDashboard size={20}/> Dashboard</button>
            </div>
        </div>
        <button onClick={() => window.location.reload()} className="flex items-center gap-4 text-slate-500 hover:text-white transition-colors font-black uppercase text-xs tracking-widest"><LogOut size={20}/> Logout</button>
      </div>

      <div className="flex-1 ml-72 p-16">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
          {/* Settings Section */}
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3 border-b pb-6 uppercase tracking-widest text-slate-400">Site Controls</h3>
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Group Price ($)</label>
                            <input className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 ring-cyan-500 font-bold" value={settings.groupPrice} onChange={e => setSettings({...settings, groupPrice: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Private Price ($)</label>
                            <input className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 ring-cyan-500 font-bold" value={settings.privatePrice} onChange={e => setSettings({...settings, privatePrice: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Guide WhatsApp Number</label>
                        <input className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 ring-cyan-500 font-bold text-cyan-600" value={settings.waNumber} onChange={e => setSettings({...settings, waNumber: e.target.value})} />
                    </div>
                    <button onClick={saveSettings} className="w-full py-5 bg-cyan-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg hover:bg-[#0F172A] transition-all">
                        <Save size={20}/> UPDATE LIVE SITE
                    </button>
                </div>
            </div>
          </div>

          {/* Bookings Section */}
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 border-b pb-6 uppercase tracking-widest text-slate-400">Booking Feed ({bookings.length})</h3>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {bookings.length === 0 && <p className="text-center py-10 text-slate-400 font-bold italic">No bookings found yet...</p>}
                {bookings.map(b => (
                    <div key={b.id} className="p-6 border border-slate-50 rounded-3xl bg-slate-50/50 relative group transition-all hover:bg-white hover:shadow-md">
                        <button onClick={() => deleteDoc(doc(db, "bookings", b.id))} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                        <div className="flex gap-4 items-center mb-4">
                            <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-sm text-cyan-600 font-black">{b.name?.charAt(0)}</div>
                            <div>
                                <p className="font-black text-slate-900 leading-none">{b.name}</p>
                                <p className="text-[10px] font-bold text-cyan-600 uppercase mt-1 tracking-widest">{b.country}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Calendar size={14}/> {b.date}</div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Clock size={14}/> {b.time}</div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-tighter"><DollarSign size={14}/> {b.bookingType}</div>
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600"><Phone size={14}/> {b.phone}</div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;