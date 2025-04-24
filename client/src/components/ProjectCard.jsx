import React from 'react';

const ProjectCard = ({ project }) => {
  // Destructure new fields with defaults
  const { 
    name = 'Project Name', 
    last_updated_at = new Date().toISOString(), // Use last_updated_at from DB
    completion_percentage = 0, 
    urgency = 'Medium',
    summary = 'No summary available.', // New field
    project_category = null // New field
  } = project || {};

  const urgencyClasses = {
    Low: 'bg-blue-500 text-blue-100',
    Medium: 'bg-yellow-500 text-yellow-100',
    High: 'bg-red-500 text-red-100',
  };

  // Helper to format date
  const formatDate = (dateString) => {
      try { return new Date(dateString).toLocaleDateString(); } 
      catch (e) { return 'Invalid Date'; }
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-4 border border-gray-700 hover:border-cyan-500 transition duration-150 ease-in-out flex flex-col h-full">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-100 mr-2 flex-1 truncate">{name}</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded flex-shrink-0 ${urgencyClasses[urgency] || 'bg-gray-500 text-gray-100'}`}>
          {urgency}
        </span>
      </div>
      
      {/* Display Category */}
      {project_category && (
          <span className="text-xs px-2 py-0.5 mb-2 rounded bg-gray-700 text-cyan-300 self-start">
              {project_category}
          </span>
      )}

      {/* Display Summary */}
      <p className="text-sm text-gray-400 mb-3 flex-grow">{summary}</p>
      
      {/* Footer with progress and date */}
      <div className="mt-auto pt-2 border-t border-gray-600">
          <div className="w-full bg-gray-700 rounded-full h-2.5 mb-1">
            <div 
              className="bg-cyan-500 h-2.5 rounded-full"
              style={{ width: `${completion_percentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{completion_percentage}% Complete</span>
              <span>Last Updated: {formatDate(last_updated_at)}</span>
          </div>
      </div>
    </div>
  );
};

export default ProjectCard; 