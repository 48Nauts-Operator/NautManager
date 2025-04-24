import { useState, useEffect } from 'react'; // Import useEffect
import './index.css' // Ensure Tailwind styles are imported
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import NewProjectModal from './components/NewProjectModal'; // Import the modal
import { Routes, Route } from 'react-router-dom'; // Import Routes and Route
import ProjectDetail from './pages/ProjectDetail'; // Import the actual component
// Placeholder for Archive Page
// const ArchivePagePlaceholder = () => <h2>Archived Projects Placeholder</h2>;
import ArchivePage from './pages/ArchivePage'; // Import actual archive page

const API_URL = 'http://localhost:3001/api'; // Define API URL here

// Placeholder for ProjectDetail page (we'll create this next)
// const ProjectDetailPlaceholder = () => <h2>Project Detail Page Placeholder</h2>;

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Lifted State
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProject, setEditingProject] = useState(null); // State for project being edited

  // Modify openModal to optionally accept a project to edit
  const openModal = (project = null) => {
    setEditingProject(project); // Set the project to edit (or null for new)
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null); // Clear editing project when closing modal
  };

  // Fetch only non-archived projects for the main view
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    // Backend defaults to is_archived = false
    const endpoint = `${API_URL}/projects`;
    console.log(`App: Fetching active projects from: ${endpoint}`);
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error("App: Failed to fetch active projects:", err);
      setError('Failed to load projects.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Renamed back, or keep as onDataChange - consistency?
  // Let's call it refreshActiveProjects for clarity in App
  const refreshActiveProjects = () => {
    fetchProjects();
  };

  // Fetch active projects on initial mount
  useEffect(() => {
    fetchProjects();
  }, []); // Runs only once

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 relative"> {/* Add relative for potential overlay positioning */}
      {/* Pass relevant state/handlers */}
      <Sidebar 
        onNewProjectClick={() => openModal()} 
        projects={projects} 
        loading={loading} 
        error={error} 
      />

      <main className="flex-1 ml-64 p-6 overflow-y-auto">
        <Routes>
          <Route 
            path="/" 
            element={ 
              <Dashboard 
                projects={projects} 
                loading={loading} 
                error={error} 
              /> 
            }
          />
          <Route 
            path="/projects/:id" 
            element={ <ProjectDetail onEditRequest={openModal} onDataChange={refreshActiveProjects} /> /* Pass refresh handler */ }
          />
          <Route 
            path="/archive" 
            element={ <ArchivePage onDataChange={refreshActiveProjects} /> /* Use actual component */ }
          />
          {/* Add other routes here if needed */}
        </Routes>
      </main>

      {/* Pass fetchProjects down to modal */}
      <NewProjectModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onProjectChange={refreshActiveProjects} // Use the refresh handler
        projectToEdit={editingProject} // Pass the project to edit
      />
    </div>
  );
}

export default App;
