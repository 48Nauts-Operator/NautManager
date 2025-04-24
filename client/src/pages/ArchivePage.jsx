import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard'; // Reuse the card for display consistency

const API_URL = 'http://localhost:3001/api';

const ArchivePage = ({ onDataChange }) => {
  const [archivedProjects, setArchivedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activatingId, setActivatingId] = useState(null); // Track which project is being re-activated

  const fetchArchivedProjects = async () => {
    setLoading(true);
    setError(null);
    console.log("Fetching archived projects...");
    try {
      const response = await fetch(`${API_URL}/projects?archived=true`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setArchivedProjects(data);
    } catch (err) {
      console.error("Failed to fetch archived projects:", err);
      setError('Failed to load archived projects.');
      setArchivedProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedProjects();
  }, []); // Fetch on initial mount

  const handleReactivate = async (projectId) => {
    setActivatingId(projectId); // Indicate activation in progress
    setError(null); // Clear previous errors
    console.log(`Attempting to re-activate project ID: ${projectId}`);
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/archive`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const errorText = response.status === 404 ? 'Project not found' : `HTTP error! status: ${response.status}`;
        throw new Error(errorText);
      }

      console.log(`Project ${projectId} re-activated successfully.`);
      // Refresh the *archived* list for this page
      fetchArchivedProjects(); 
      // Also trigger refresh in App to update the main dashboard/sidebar list
      if (onDataChange) {
        onDataChange();
      }

    } catch (err) {
      console.error("Failed to re-activate project:", err);
      setError(err.message || 'Failed to re-activate project.');
    } finally {
      setActivatingId(null); // Reset activating state
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-cyan-400">Archived Projects</h1>

      {loading && <p className="text-gray-400">Loading archived projects...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <section>
          {archivedProjects.length === 0 ? (
            <p className="text-gray-500">No archived projects found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedProjects.map(project => (
                <div key={project.id} className="flex flex-col">
                    {/* Link the card to the detail page */}
                    <Link to={`/projects/${project.id}`} className="block mb-2 flex-grow">
                       <ProjectCard project={project} />
                    </Link>
                    {/* Re-activate Button */}
                    <button
                        onClick={() => handleReactivate(project.id)}
                        disabled={activatingId === project.id}
                        className="w-full mt-auto px-3 py-1.5 rounded bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-medium transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {activatingId === project.id ? 'Re-activating...' : 'Re-activate'}
                    </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default ArchivePage; 