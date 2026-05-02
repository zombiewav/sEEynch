import React, { useState, useEffect } from "react";
import { User, Shield, Search, Plus, Copy, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Member {
  id: string;
  name: string;
  studentId: string;
  role: 'Student' | 'Officer';
  position?: string;
  avatar: string; // URL or initials
}

const mockMembers: Member[] = [];

export default function Members() {
  useEffect(() => {
    // Clean dummy members but keep real ones
    const saved = localStorage.getItem('sEEync_members');
    if (saved) {
      try {
        const members = JSON.parse(saved) as Member[];
        const isDummyName = (name: string) => /^(Juan de la Cruz|Maria Clara|Jose Rizal|Andres Bonifacio|Gabriela Silang)$/i.test(name);
        const filtered = members.filter(m => !isDummyName(m.name));
        if (filtered.length !== members.length) {
          localStorage.setItem('sEEync_members', JSON.stringify(filtered));
        }
      } catch {}
    }
  }, []);
  
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('sEEync_members');
    return saved ? JSON.parse(saved) : mockMembers;
  });
  
  useEffect(() => {
    localStorage.setItem('sEEync_members', JSON.stringify(members));
  }, [members]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const inviteCode = "BSEE-1B-XYZ"; // This should ideally come from a shared context or props

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditRole = () => {
    if (!selectedMember) return;
    const newRole = selectedMember.role === 'Student' ? 'Officer' : 'Student';
    const updatedMember: Member = { 
      ...selectedMember, 
      role: newRole,
      position: newRole === 'Officer' ? 'Class Officer' : undefined
    };
    setMembers(prev => prev.map(m => m.id === selectedMember.id ? updatedMember : m));
    setSelectedMember(updatedMember);
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.studentId.includes(searchQuery)
  );

  return (
    <>
      {/* QR Code Modal */}
      <AnimatePresence>
        {showQrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowQrModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-sm p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end mb-2">
                <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                  <X size={20} />
                </button>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Class Invite Code</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Share this code with new students to let them join.</p>
              
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm">
                <span className="text-2xl font-mono font-bold tracking-widest text-orange-600 dark:text-orange-500">
                  {inviteCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                >
                  {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                </button>
              </div>
              {copied && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">Copied to clipboard!</p>}

              <button
                onClick={() => setShowQrModal(false)}
                className="w-full mt-6 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-colors shadow-md shadow-orange-500/20"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Member Details Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-sm p-8 text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-500 flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                {selectedMember.avatar}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{selectedMember.name}</h3>
              <p className="text-sm font-mono text-gray-500 dark:text-slate-400 mb-6">{selectedMember.studentId}</p>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 text-left space-y-4 mb-6 border border-gray-100 dark:border-slate-700">
                <div>
                  <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Role</span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm ${selectedMember.role === 'Officer' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                      {selectedMember.role === 'Officer' ? <Shield size={12} /> : <User size={12} />}
                      {selectedMember.role}
                    </span>
                  </div>
                </div>
                {selectedMember.position && (
                  <div>
                    <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Position</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedMember.position}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSelectedMember(null)} className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  Close
                </button>
                <button onClick={handleEditRole} className="flex-1 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-colors shadow-md shadow-orange-500/20">
                  {selectedMember.role === 'Student' ? 'Promote to Officer' : 'Demote to Student'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Classmates of BSEE 1-B
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">
            View and manage all members.
          </p>
        </div>
        <button onClick={() => setShowQrModal(true)} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm min-h-[44px] shadow-sm shadow-orange-600/20">
          <Plus size={18} />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or student ID..."
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 shadow-sm"
        />
      </div>

      {/* Members Table */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-slate-400 text-sm border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Student ID</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-500 flex items-center justify-center font-bold text-sm shrink-0">{member.avatar}</div><div><div className="font-semibold text-gray-900 dark:text-white">{member.name}</div></div></div></td>
                  <td className="px-6 py-4 font-mono text-gray-600 dark:text-slate-400">{member.studentId}</td>
                  <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm ${member.role === 'Officer' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'}`}>{member.role === 'Officer' ? <Shield size={12} /> : <User size={12} />}{member.role}</span>{member.position && (<div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{member.position}</div>)}</td>
                  <td className="px-6 py-4 text-right"><button onClick={() => setSelectedMember(member)} className="font-semibold text-orange-600 dark:text-orange-500 hover:underline">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredMembers.length === 0 && (<div className="text-center py-12 text-gray-500 dark:text-slate-400"><Search size={32} className="mx-auto mb-2 opacity-50" /><p className="font-semibold">No members found</p><p className="text-sm">Your search for "{searchQuery}" did not return any results.</p></div>)}
      </section>
      </div>
    </>
  );
}