import React from "react";

function Review() {
  return (
    <div className="mt-10 bg-slate-700/50 backdrop-blur-md rounded-2xl p-6">
      <h2 className="text-2xl font-semibold text-white mb-4">
        Recent AI Consultations
      </h2>
      <ul className="text-gray-300 list-disc list-inside">
        <li>
          Consultation on "Anxiety Management" - Provided coping strategies and
          resources.
        </li>
        <li>
          Health query about "Persistent Headaches" - Recommended professional
          evaluation.
        </li>
        <li>
          AI provided wellness tips for "Better Sleep Quality" with lifestyle
          changes.
        </li>
      </ul>
    </div>
  );
}

export default Review;
