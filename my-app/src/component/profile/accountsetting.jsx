import React from "react";

function AccountSettings() {
  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-purple-400/20 rounded-2xl p-6 shadow-lg shadow-purple-500/20 text-white">
      <div className="font-semibold text-lg mb-4">Account Settings</div>
      <div className="flex flex-col gap-4">
        <label className="flex items-center justify-between">
          <span>Email Notifications</span>
          <input type="checkbox" className="accent-purple-500 w-5 h-5" defaultChecked />
        </label>

        <label className="flex items-center justify-between">
          <span>Auto-check on Save</span>
          <input type="checkbox" className="accent-purple-500 w-5 h-5" />
        </label>

        <div>
          <span className="block mb-1">Preferred AI Model</span>
          <select className="w-full bg-slate-800 text-white border border-purple-400/30 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400 transition-all">
            <option>OpenAI — gpt-5-mini</option>
            <option>OpenAI — gpt-4</option>
            <option>Google Gemini</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default AccountSettings;
