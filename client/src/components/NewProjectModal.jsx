import React, { useState, useEffect } from 'react';

// Reusable Input component for styling consistency
const FormInput = ({ label, id, type = 'text', value, onChange, required = false, placeholder = '' }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}{required && '*'}</label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-500"
    />
  </div>
);

// Reusable TextArea component
const FormTextArea = ({ label, id, value, onChange, placeholder = '' }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    <textarea
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      rows={3}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-500"
    />
  </div>
);

// Reusable Select component
const FormSelect = ({ label, id, value, onChange, children }) => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
      >
        {children}
      </select>
    </div>
  );

const NewProjectModal = ({ isOpen, onClose, onProjectChange, projectToEdit }) => {
  // Form state
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [concept, setConcept] = useState('');
  const [localPath, setLocalPath] = useState('');
  const [gitRepo, setGitRepo] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [projectCategory, setProjectCategory] = useState('');
  const [startCommands, setStartCommands] = useState('');
  const [tags, setTags] = useState('');
  const [deadline, setDeadline] = useState('');
  const [projectType, setProjectType] = useState('Private');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = Boolean(projectToEdit);

  useEffect(() => {
    if (isEditMode && projectToEdit) {
      setName(projectToEdit.name || '');
      setSummary(projectToEdit.summary || '');
      setConcept(projectToEdit.concept || '');
      setLocalPath(projectToEdit.local_path || '');
      setGitRepo(projectToEdit.git_repo || '');
      setWebsiteUrl(projectToEdit.website_url || '');
      setProjectCategory(projectToEdit.project_category || '');
      setStartCommands(projectToEdit.start_commands || '');
      setTags((projectToEdit.tags || []).join(', '));
      setDeadline(projectToEdit.deadline ? new Date(projectToEdit.deadline).toISOString().split('T')[0] : '');
      setProjectType(projectToEdit.type || 'Private');
    } else {
      resetForm(); 
    }
  }, [isOpen, projectToEdit, isEditMode]); 

  const resetForm = () => {
    setName('');
    setSummary('');
    setConcept('');
    setLocalPath('');
    setGitRepo('');
    setWebsiteUrl('');
    setProjectCategory('');
    setStartCommands('');
    setTags('');
    setDeadline('');
    setProjectType('Private');
    setError(null);
    setSubmitting(false);
  }

  const handleClose = () => {
      resetForm();
      onClose();
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    
    const projectData = {
      name,
      summary: summary || null,
      concept: concept || null,
      local_path: localPath,
      git_repo: gitRepo || null,
      website_url: websiteUrl || null,
      project_category: projectCategory || null,
      start_commands: startCommands || null,
      tags: (tags || '').split(',').map(tag => tag.trim()).filter(tag => tag),
      deadline: deadline || null,
      type: projectType,
      ...(isEditMode && projectToEdit.completion_percentage !== undefined && { completion_percentage: projectToEdit.completion_percentage }),
      ...(isEditMode && projectToEdit.urgency && { urgency: projectToEdit.urgency }),
    };

    console.log(`Submitting data (Edit Mode: ${isEditMode})`, projectData);

    try {
      let response;
      const apiUrl = `http://localhost:3001/api/projects${isEditMode ? `/${projectToEdit.id}` : ''}`;
      const method = isEditMode ? 'PUT' : 'POST';

      console.log(`Sending ${method} request to ${apiUrl}...`);

      response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        let errorData;
        try { errorData = await response.json(); }
        catch (parseError) { errorData = { message: response.statusText }; }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const resultData = await response.json();
      console.log(`Project ${isEditMode ? 'updated' : 'created'} successfully:`, resultData);
      
      // Call the function passed from App to refetch projects
      if (onProjectChange) {
        console.log("Calling onProjectChange to refresh list...");
        onProjectChange(); 
      }
      
      handleClose(); // Close modal after successful submission

    } catch (err) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} project:`, err);
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} project. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    // Modal backdrop
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out">
      {/* Modal content */}
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl z-50 border border-cyan-700 animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-800 py-2 -mt-6 px-6 -mx-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-cyan-400">{isEditMode ? 'Edit Project' : 'Create New Project'}</h2>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-white text-2xl leading-none p-1 rounded-full transition duration-150 ease-in-out"
          >
            &times; 
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <FormInput 
            label="Project Name" 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            placeholder="e.g., My Awesome App"
          />

          <FormInput 
            label="Summary" 
            id="summary" 
            value={summary} 
            onChange={(e) => setSummary(e.target.value)} 
            placeholder="Short one-line summary (optional)"
          />

          <FormTextArea
            label="Concept / Description"
            id="concept"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Detailed description, supports Markdown (optional)"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput 
              label="Development Path" 
              id="localPath" 
              value={localPath} 
              onChange={(e) => setLocalPath(e.target.value)} 
              placeholder="/path/to/project (optional)"
            />

            <FormInput 
              label="Git Repository URL" 
              id="gitRepo" 
              value={gitRepo} 
              onChange={(e) => setGitRepo(e.target.value)} 
              placeholder="https://github.com/... (optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput 
              label="Website URL" 
              id="websiteUrl" 
              value={websiteUrl} 
              onChange={(e) => setWebsiteUrl(e.target.value)} 
              placeholder="https://example.com (optional)"
            />

            <FormInput 
              label="Category" 
              id="projectCategory" 
              value={projectCategory} 
              onChange={(e) => setProjectCategory(e.target.value)} 
              placeholder="e.g., WebApp, LLM, iOS (optional)"
            />
          </div>

          <FormTextArea
            label="Start Commands"
            id="startCommands"
            value={startCommands}
            onChange={(e) => setStartCommands(e.target.value)}
            placeholder="e.g., npm run dev&#10;docker-compose up (optional)"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput 
              label="Tags" 
              id="tags" 
              value={tags} 
              onChange={(e) => setTags(e.target.value)} 
              placeholder="tag1, tag2, tag3 (comma-separated)"
            />

            <FormInput 
              label="Deadline" 
              id="deadline" 
              type="date" 
              value={deadline} 
              onChange={(e) => setDeadline(e.target.value)} 
            />
          </div>

          <FormSelect
            label="Type"
            id="projectType"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
          >
            <option value="Private">Private</option>
            <option value="Business">Business</option>
          </FormSelect>

          {error && (
              <p className="text-red-500 text-sm mt-2">Error: {error}</p>
          )}

          <div className="mt-8 pt-4 border-t border-gray-700 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={handleClose} 
              disabled={submitting}
              className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 text-gray-100 transition duration-150 ease-in-out disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (isEditMode ? 'Updating...' : 'Initializing...') : (isEditMode ? 'Update Project' : 'Initialize Project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal; 