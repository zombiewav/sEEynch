import React, { useState, useRef } from "react";
import { Camera, Mail, Lock, User, Hash, GraduationCap, ShieldCheck } from "lucide-react";

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    studentId: "",
    email: "",
    password: "",
    role: "student" as "student" | "officer",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(isLogin ? "Logging in with:" : "Creating account with:", formData);
    // Frontend only: mock authentication flow goes here
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="w-full max-w-md bg-slate-800 rounded-[2rem] shadow-2xl border border-slate-700 p-8 md:p-10 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-slate-400 text-sm">
            {isLogin
              ? "Sign in to access your class dashboard"
              : "Join your class network and stay updated"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* SIGN UP ONLY: Profile Picture */}
          {!isLogin && (
            <div className="flex flex-col items-center justify-center mb-6">
              <div
                className="relative w-24 h-24 rounded-full bg-slate-900 border-2 border-dashed border-slate-600 flex items-center justify-center cursor-pointer hover:border-orange-500 transition-all overflow-hidden group"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewImage ? (
                  <img src={previewImage} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="text-slate-500 group-hover:text-orange-500 transition-colors" size={28} />
                )}
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <p className="text-xs text-slate-500 mt-3 font-medium">Upload Profile Picture</p>
            </div>
          )}

          {/* SIGN UP ONLY: Full Name & Student ID */}
          {!isLogin && (
            <>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-300 ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Juan de la Cruz"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-white placeholder-slate-600"
                    required={!isLogin}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-300 ml-1">Student ID Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Hash size={18} />
                  </div>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    placeholder="e.g. 2023-0001"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-white placeholder-slate-600"
                    required={!isLogin}
                  />
                </div>
              </div>
            </>
          )}

          {/* SHARED: Email Address */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-300 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@student.edu"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-white placeholder-slate-600"
                required
              />
            </div>
          </div>

          {/* SHARED: Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="block text-sm font-semibold text-slate-300">Password</label>
              {isLogin && (
                <a href="#" className="text-xs font-semibold text-orange-500 hover:text-orange-400 transition-colors">
                  Forgot Password?
                </a>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-white placeholder-slate-600"
                required
              />
            </div>
          </div>

          {/* SIGN UP ONLY: Role Selection */}
          {!isLogin && (
            <div className="pt-2">
              <label className="block text-sm font-semibold text-slate-300 ml-1 mb-3">Select your role</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "student" })}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${formData.role === "student" ? "bg-orange-500/10 border-orange-500 text-orange-500" : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"}`}
                >
                  <GraduationCap size={24} className="mb-2" />
                  <span className="text-sm font-bold">I am a Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "officer" })}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${formData.role === "officer" ? "bg-orange-500/10 border-orange-500 text-orange-500" : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"}`}
                >
                  <ShieldCheck size={24} className="mb-2" />
                  <span className="text-sm font-bold">I am an Officer</span>
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-600/20 text-lg"
            >
              {isLogin ? "Log In" : "Create Account"}
            </button>
          </div>
        </form>

        {/* Footer Toggle */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-orange-500 hover:text-orange-400 transition-colors ml-1">
              {isLogin ? "Create one" : "Sign In"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}