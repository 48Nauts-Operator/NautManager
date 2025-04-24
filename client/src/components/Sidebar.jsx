import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Sidebar = ({ onNewProjectClick, projects, loading, error }) => {
  // Define base and active styles for NavLink
  const linkBaseClasses = "block px-3 py-1.5 rounded text-gray-300 transition duration-150 ease-in-out truncate border-l-2";
  const linkNormalClasses = "border-transparent hover:bg-gray-700 hover:text-cyan-300 hover:border-cyan-500";
  const linkActiveClasses = "bg-gray-700 text-white border-cyan-500 font-medium"; // Active state styles

  return (
    <aside className="w-64 bg-gray-800 p-4 fixed inset-y-0 left-0 flex flex-col">
      <h2 className="text-xl font-semibold mb-6 text-cyan-400 border-b border-gray-700 pb-4">
        <Link to="/" className="hover:text-cyan-300">NautManager</Link>
      </h2>
      
      {/* New Project Button */}
      <button 
        onClick={onNewProjectClick}
        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded mb-6 transition duration-150 ease-in-out"
      >
        New Project
      </button>
      
      {/* Project List */}
      <nav className="flex-grow overflow-y-auto">
        <h3 className="text-xs uppercase text-gray-500 font-bold mb-2">Projects</h3>
        {loading && <p className="text-sm text-gray-400">Loading...</p>}
        {error && !loading && <p className="text-sm text-red-500">{error}</p>}
        {!loading && !error && (
          <ul>
            {projects.length === 0 ? (
              <li className="text-sm text-gray-500 italic">No projects yet</li>
            ) : (
              projects.map(project => (
                <li key={project.id} className="mb-1">
                  <NavLink 
                    to={`/projects/${project.id}`}
                    className={({ isActive }) => 
                      `${linkBaseClasses} ${isActive ? linkActiveClasses : linkNormalClasses}`
                    }
                  >
                    {project.name}
                  </NavLink>
                </li>
              ))
            )}
          </ul>
        )}
      </nav>

      {/* Archive Link & Optional Footer/Settings Link */}
      <div className="mt-auto pt-4 border-t border-gray-700 space-y-2">
        <Link to="/archive" className="block text-sm text-gray-400 hover:text-cyan-400">
            <i className="fas fa-archive mr-2"></i> {/* Example using Font Awesome if installed */} 
            View Archived
        </Link>
        <a href="#" className="block text-sm text-gray-400 hover:text-cyan-400">
          {/* <i className="fas fa-cog mr-2"></i> Example icon */} 
          Settings
        </a>
      </div>
    </aside>
  );
};

export default Sidebar; 