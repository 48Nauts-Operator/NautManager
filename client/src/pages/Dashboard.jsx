import React from 'react';
import ProjectCard from '../components/ProjectCard';

const Dashboard = ({ projects, loading, error }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-cyan-400">Dashboard</h1>
        <div className="flex items-center space-x-4">
          {!loading && !error && (
            <span className="text-sm font-medium text-gray-400">
              Total Active Projects: {projects.length}
            </span>
          )}
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4 text-gray-300">Active Projects</h2>
      {loading && <p className="text-gray-400">Loading projects...</p>}
      {error && !loading && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <section>
          {projects.length === 0 ? (
            <p className="text-gray-500">No active projects found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Dashboard; 