import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import ReactMarkdown from 'react-markdown'; // Import react-markdown
import rehypeHighlight from 'rehype-highlight'; // Import syntax highlighting plugin
// import 'highlight.js/styles/github-dark.css'; // Temporarily comment out theme

const API_URL = 'http://localhost:3001/api'; // Backend API base URL

// Helper component for individual summary items
const SummaryItem = ({ label, value, children }) => (
  <div>
    <h3 className="text-sm font-medium text-gray-500 mb-1">{label}</h3>
    <div className="text-gray-100 text-base">{children || value || 'N/A'}</div>
  </div>
);

const ProjectDetail = ({ onEditRequest, onDataChange }) => {
  const { id } = useParams();
  const navigate = useNavigate(); // Hook for navigation
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false); // State for description collapse
  const [isDeleting, setIsDeleting] = useState(false); // State for delete operation
  const [isArchiving, setIsArchiving] = useState(false); // State for archive operation

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!id) return; // Don't fetch if ID is missing

      setLoading(true);
      setError(null);
      setIsDescriptionExpanded(false); // Reset collapse state on new project load
      console.log(`Fetching details for project ID: ${id}`);
      try {
        const response = await fetch(`${API_URL}/projects/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
              setError('Project not found.');
          } else {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          setProject(null);
        } else {
            const data = await response.json();
            setProject(data);
        }
      } catch (err) {
        console.error("Failed to fetch project details:", err);
        setError('Failed to load project details. Please try again later.');
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]); // Re-fetch if the ID parameter changes

  // Helper to format date string
  const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
          return new Date(dateString).toLocaleDateString();
      } catch (e) {
          return dateString; // Return original if formatting fails
      }
  }

  // --- Delete Handler --- START ---
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to permanently delete project "${project?.name}"?`)) {
      setIsDeleting(true);
      setError(null); // Clear previous errors
      console.log(`Attempting to delete project ID: ${id}`);
      try {
        const response = await fetch(`${API_URL}/projects/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
           // Check for specific errors if needed, otherwise throw generic
           const errorText = response.status === 404 ? 'Project not found' : `HTTP error! status: ${response.status}`;
           throw new Error(errorText);
        }

        // Deletion successful (status 204)
        console.log(`Project ${id} deleted successfully.`);
        if (onDataChange) {
          onDataChange(); // Trigger refresh in App
        }
        navigate('/'); // Navigate back to dashboard

      } catch (err) {
        console.error("Failed to delete project:", err);
        setError(err.message || 'Failed to delete project.');
        setIsDeleting(false);
      }
      // No finally needed for setIsDeleting here, navigation happens on success
    }
  };
  // --- Delete Handler --- END ---

  // --- Archive Handler --- START ---
  const handleArchiveToggle = async () => {
    if (!project) return; // Should not happen if button is visible

    const action = project.is_archived ? 'unarchive' : 'archive';
    if (window.confirm(`Are you sure you want to ${action} project "${project.name}"?`)) {
      setIsArchiving(true);
      setError(null); // Clear previous errors
      console.log(`Attempting to ${action} project ID: ${id}`);
      try {
        const response = await fetch(`${API_URL}/projects/${id}/archive`, { // Use the archive endpoint
          method: 'PUT',
        });

        if (!response.ok) {
           const errorText = response.status === 404 ? 'Project not found' : `HTTP error! status: ${response.status}`;
           throw new Error(errorText);
        }

        // Toggle successful
        console.log(`Project ${id} ${action}d successfully.`);
        if (onDataChange) {
          onDataChange(); // Trigger refresh in App
        }
        // Optionally navigate away or update local state immediately
        // For now, we rely on the refresh from App.jsx removing it from the default view
        // If we stay on the page, we might need to update the local project state:
        // const updatedProject = await response.json(); // If API returns updated project
        // setProject(updatedProject);
        
        // If archiving, navigate away since it won't be in the default list
        if (!project.is_archived) { 
           navigate('/');
        }

      } catch (err) {
        console.error(`Failed to ${action} project:`, err);
        setError(err.message || `Failed to ${action} project.`);
      } finally {
        setIsArchiving(false);
      }
    }
  };
  // --- Archive Handler --- END ---

  // Render Loading State
  if (loading) {
    return <div className="text-center text-gray-400 mt-10">Loading project details...</div>;
  }

  // Render Error State
  if (error && !isDeleting && !isArchiving) {
    return <div className="text-center text-red-500 mt-10">Error: {error}</div>;
  }

  // Render Not Found or Project Details
  if (!project) {
    // This case might be redundant if error handles 404, but good practice
    return <div className="text-center text-gray-500 mt-10">Project could not be loaded.</div>;
  }

  // Urgency styles for reuse
  const urgencyClasses = project.urgency === 'High' ? 'bg-red-500 text-red-100' : project.urgency === 'Medium' ? 'bg-yellow-500 text-yellow-100' : 'bg-blue-500 text-blue-100';

  // --- Deadline Calculation Logic --- START ---
  let daysRemaining = null;
  let deadlineColorClass = 'text-gray-100'; // Default text color
  let deadlineBgClass = 'bg-gray-600'; // Default background
  let deadlineText = 'N/A';

  if (project.deadline) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize today to start of day
      const deadlineDate = new Date(project.deadline);
      // Add time adjustment to avoid timezone issues making deadline seem one day earlier
      deadlineDate.setMinutes(deadlineDate.getMinutes() + deadlineDate.getTimezoneOffset()); 
      deadlineDate.setHours(0, 0, 0, 0); // Normalize deadline to start of day

      if (!isNaN(deadlineDate)) {
        const diffTime = deadlineDate - today;
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysRemaining < 0) {
          deadlineColorClass = 'text-red-100';
          deadlineBgClass = 'bg-red-600';
          deadlineText = `${Math.abs(daysRemaining)}d overdue`;
        } else if (daysRemaining === 0) {
          deadlineColorClass = 'text-yellow-100';
          deadlineBgClass = 'bg-yellow-500';
          deadlineText = 'Due today';
        } else {
          deadlineColorClass = 'text-green-100';
          deadlineBgClass = 'bg-green-600';
          deadlineText = `${daysRemaining}d left`;
        }
      } else {
        deadlineText = 'Invalid Date';
      }
    } catch (e) {
      console.error("Error calculating deadline difference:", e);
      deadlineText = 'Error';
    }
  }
  // --- Deadline Calculation Logic --- END ---

  return (
    <div className="space-y-6">
      {/* Header - Add Archive Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-cyan-400 flex items-center">
          {project.name}
          {project.is_archived && <span className="ml-3 text-xs font-medium px-2 py-0.5 rounded bg-gray-600 text-gray-300">Archived</span>}
        </h1>
        <div className="flex space-x-3">
           <button 
            onClick={() => onEditRequest(project)} 
            className="px-4 py-2 rounded bg-cyan-700 hover:bg-cyan-600 text-white text-sm font-medium transition duration-150 ease-in-out"
            disabled={isDeleting || isArchiving} // Disable while deleting or archiving
           >
             Edit Project
           </button>
           {/* Archive/Unarchive Button */}
           <button 
             onClick={handleArchiveToggle}
             className={`px-4 py-2 rounded text-sm font-medium transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${project.is_archived ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-100'}`}
             disabled={isDeleting || isArchiving} 
            >
             {isArchiving ? (project.is_archived ? 'Unarchiving...' : 'Archiving...') : (project.is_archived ? 'Unarchive' : 'Archive')}
           </button>
           {/* Delete Button */}
           <button 
             onClick={handleDelete}
             className="px-4 py-2 rounded bg-red-700 hover:bg-red-600 text-white text-sm font-medium transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
             disabled={isDeleting || isArchiving} 
            >
             {isDeleting ? 'Deleting...' : 'Delete'}
           </button>
        </div>
      </div>

      {/* Display general error if archive/delete failed */}
      {(error && (isDeleting || isArchiving)) && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-2 rounded text-sm">
           Operation failed: {error}
        </div>
      )}

      {/* Summary Box */}
      <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700 grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
        <SummaryItem label="Type" value={project.type} />
        <SummaryItem label="Urgency">
            <span className={`text-xs font-bold px-2 py-1 rounded ${urgencyClasses}`}>{project.urgency}</span>
        </SummaryItem>
        <SummaryItem label="Category" value={project.project_category || 'N/A'} />
        <SummaryItem label="Completion" value={`${project.completion_percentage}%`} />
        <div>
           <h3 className="text-sm font-medium text-gray-500 mb-1">Deadline</h3>
           <div className="flex items-center space-x-2">
               <span className="text-gray-100 text-base">{formatDate(project.deadline)}</span>
               {/* Display calculated days remaining if valid */}
               {project.deadline && daysRemaining !== null && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${deadlineBgClass} ${deadlineColorClass}`}>
                      {deadlineText}
                  </span>
               )}
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700 space-y-5">
        {/* Display Summary Text */}
        {project.summary && (
            <div className="border-b border-gray-700 pb-5">
                <h2 className="text-lg font-semibold text-gray-300 mb-2">Summary</h2>
                <p className="text-gray-400 italic">{project.summary}</p>
            </div>
        )}
        
        {/* Concept (was Description) - Collapsible */}
        {project.concept && (
          <div className="border-b border-gray-700 pb-5">
             <h2 className="text-lg font-semibold text-gray-300 mb-2">Concept</h2>
            <div 
              className={`prose prose-invert prose-sm md:prose-base max-w-none relative transition-all duration-300 ease-in-out ${isDescriptionExpanded ? 'max-h-none' : 'max-h-80 overflow-hidden'}`}
            >
              {!isDescriptionExpanded && (
                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-gray-800 to-transparent pointer-events-none"></div>
              )}
              <ReactMarkdown 
                rehypePlugins={[rehypeHighlight]}
                components={{ a: ({node, ...props}) => <a className="text-cyan-400 hover:underline" {...props} /> }}
              >
                  {project.concept}
              </ReactMarkdown>
            </div>
            <button 
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="text-cyan-400 hover:text-cyan-300 text-sm mt-2 font-medium"
            >
              {isDescriptionExpanded ? 'Show Less' : 'Read More'}
            </button>
          </div>
        )}

        {/* Key Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
           <SummaryItem label="Local Path" value={project.local_path} />
           <SummaryItem label="Git Repository">
               {project.git_repo ? <a href={project.git_repo} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline break-all">{project.git_repo}</a> : 'Not set'}
           </SummaryItem>
           <SummaryItem label="Website URL">
                {project.website_url ? <a href={project.website_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline break-all">{project.website_url}</a> : 'Not set'}
           </SummaryItem>
        </div>

        {/* Start Commands */}
        {project.start_commands && (
          <div className="pt-5 border-t border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Start Commands</h3>
            <pre className="bg-gray-900 p-3 rounded border border-gray-700 text-gray-300 text-xs whitespace-pre-wrap break-all">
                <code>{project.start_commands}</code>
            </pre>
          </div>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
           <div className="pt-5 border-t border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, index) => (
                <span key={index} className="px-2 py-0.5 bg-gray-700 text-cyan-300 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="pt-5 border-t border-gray-700 text-xs text-gray-500 grid grid-cols-1 md:grid-cols-2 gap-2">
           <p>Created: {new Date(project.created_at).toLocaleString()}</p>
           <p>Last Updated: {new Date(project.last_updated_at).toLocaleString()}</p>
        </div>
      </div>

    </div>
  );
};

export default ProjectDetail; 