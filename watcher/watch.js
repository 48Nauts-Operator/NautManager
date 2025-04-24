import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs/promises';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables (for API URL, paths)

const containerWatchPath = process.env.CONTAINER_WATCH_PATH;
const hostWatchPath = process.env.HOST_WATCH_PATH; // Read the host path
const apiUrl = process.env.NAUTMANAGER_API_URL;
const debounceMs = parseInt(process.env.DEBOUNCE_MS || '5000', 10);

if (!containerWatchPath || !hostWatchPath || !apiUrl) {
  console.error('Error: CONTAINER_WATCH_PATH, HOST_WATCH_PATH, and NAUTMANAGER_API_URL must be set in environment variables.');
  process.exit(1);
}

console.log(`Watcher starting...
Watching path inside container: ${containerWatchPath}
Host path: ${hostWatchPath}
API URL: ${apiUrl}
Debounce time: ${debounceMs}ms`);

// Debounce mechanism to avoid rapid triggers
const debounceTimers = {};

const watcher = chokidar.watch(containerWatchPath, {
  ignored: [
      /(^|[\/\\])\../, // ignore dotfiles/dirs
      `${containerWatchPath}/*/node_modules/**`, // ignore node_modules
      `${containerWatchPath}/*/.git/**`, // ignore git folders
      // Add other ignores if needed
  ],
  persistent: true,
  depth: 1, // Watch the root and one level down
  ignoreInitial: false, // Re-enable processing initial folders for easier testing
  awaitWriteFinish: { 
    stabilityThreshold: 1000, // Reduce threshold
    pollInterval: 100
  }
});

// Keep track of processed directories to avoid duplicates if events fire close together
const processedDirs = new Set();

const processNewDirectory = async (dirPath) => {
  // Avoid processing the same directory multiple times quickly
  if (processedDirs.has(dirPath)) {
    // console.log(`Already processing or recently processed: ${dirPath}`);
    return;
  }
  processedDirs.add(dirPath);
  // Remove from set after a delay to allow re-processing if needed later?
  // Or rely solely on API check. Let's keep it simple for now.
  // setTimeout(() => processedDirs.delete(dirPath), debounceMs * 2);

  const projectName = path.basename(dirPath);
  // Calculate the relative path within the container watch dir
  const relativePath = path.relative(containerWatchPath, dirPath);
  // Construct the actual host path
  const hostPath = path.join(hostWatchPath, relativePath);

  console.log(`Processing directory: ${projectName} at ${dirPath}`);
  console.log(`  Container path: ${dirPath}`);
  console.log(`  Host path: ${hostPath}`);

  // *** Check API first ***
  try {
    console.log(` - Checking API if project path exists: ${hostPath}`);
    const checkResponse = await axios.get(`${apiUrl}/projects`, {
        params: { local_path: hostPath } 
    });
    if (checkResponse.data && checkResponse.data.length > 0) {
        console.log(` - Skipping: Project with path ${hostPath} already exists in NautManager (ID: ${checkResponse.data[0].id}).`);
        processedDirs.add(dirPath); // Mark as processed even if skipped
        return; // Exit if project already exists
    }
    console.log(` - Project path ${hostPath} does not exist in NautManager.`);
  } catch (error) {
     console.error(` - Error checking API for existing project ${hostPath}:`, error.message);
     processedDirs.delete(dirPath); // Allow reprocessing if API check failed
     return; // Don't proceed if check failed
  }

  // Check for concept/readme file
  const conceptPathMd = path.join(dirPath, 'docs', 'concept.md');
  const conceptPathReadme = path.join(dirPath, 'docs', 'README.md');
  let conceptContent = null;
  let conceptFilePath = null;

  try {
    if (await fs.access(conceptPathMd).then(() => true).catch(() => false)) {
        conceptFilePath = conceptPathMd;
    } else if (await fs.access(conceptPathReadme).then(() => true).catch(() => false)) {
        conceptFilePath = conceptPathReadme;
    }

    if (conceptFilePath) {
        console.log(` - Found concept/readme file: ${conceptFilePath}`);
        conceptContent = await fs.readFile(conceptFilePath, 'utf-8');
    } else {
        console.log(` - Skipping: No docs/concept.md or docs/README.md found in ${projectName}.`);
        processedDirs.delete(dirPath); // Allow reprocessing if file read failed
        return;
    }
  } catch (err) {
    console.error(` - Error accessing/reading concept for ${projectName}:`, err);
    processedDirs.delete(dirPath); // Allow reprocessing if file read failed
    return;
  }

  const projectData = {
    name: projectName, 
    local_path: hostPath, // Use the calculated HOST path
    concept: conceptContent,
    // Add defaults or leave to API defaults
    // summary: `Auto-detected project: ${projectName}`,
    // type: 'Private', 
    // urgency: 'Medium',
  };

  // POST new project data to API
  try {
    console.log(` - Attempting to create project via API: ${projectName}`);
    const response = await axios.post(`${apiUrl}/projects`, projectData, {
        headers: { 'Content-Type': 'application/json' }
    });
    console.log(` - Successfully created project ${projectName} via API. Status: ${response.status}`);
    // Keep in processedDirs
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
        // Handle API errors (e.g., 409 Conflict if path already exists)
        if (error.response.status === 409) {
             console.log(` - Project with path ${hostPath} already exists according to API.`);
        } else {
             console.error(` - Error response from API for ${projectName}: ${error.response.status}`, error.response.data);
        }
    } else {
         console.error(` - Error sending data to API for ${projectName}:`, error.message);
    }
    // Don't delete from processedDirs if it was a 409, otherwise allow retry
    if (!axios.isAxiosError(error) || !error.response || error.response.status !== 409) {
         processedDirs.delete(dirPath);
    }
  }
};

// --- Event Listeners --- 

// Combined Listener (Simpler Debugging)
const handlePotentialProject = (itemPath) => {
    // Basic check: is it directly inside the watched path?
    if (path.dirname(itemPath) !== containerWatchPath) {
        // console.log(`Ignoring item not directly in watch path: ${itemPath}`);
        return;
    }

    // Debounce based on the item path
    if (debounceTimers[itemPath]) clearTimeout(debounceTimers[itemPath]);
    debounceTimers[itemPath] = setTimeout(() => {
        // processNewDirectory expects a directory path
        // If a file triggered this, we need the parent dir
        // For simplicity, we'll just always call processNewDirectory on the itemPath
        // processNewDirectory should handle checks if it's a dir and has doc/concept
        console.log(`Handling event for: ${itemPath}`);
        fs.stat(itemPath).then(stats => {
            if (stats.isDirectory()) {
                 processNewDirectory(itemPath);
            } else {
                // If it's a file, maybe process its parent directory? 
                // Only if it's concept.md/README.md in a docs folder.
                const docDir = path.dirname(itemPath);
                const projectDir = path.dirname(docDir);
                const baseName = path.basename(itemPath).toLowerCase();
                if (path.basename(docDir) === 'docs' && 
                    (baseName === 'concept.md' || baseName === 'readme.md') &&
                     path.dirname(projectDir) === containerWatchPath) 
                {
                    console.log(`File add triggered processing for dir: ${projectDir}`);
                    processNewDirectory(projectDir);
                }
            }
        }).catch(err => { /* ignore errors for non-existent paths during rapid events */ });
        
        delete debounceTimers[itemPath]; 
    }, debounceMs); // Use the main debounce
};

// Remove separate listeners
// watcher.on('addDir', ...);
// watcher.on('add', ...);

// Use a single listener for both add and addDir for broader capture
watcher
  .on('add', path => handlePotentialProject(path))      // File added
  .on('addDir', path => handlePotentialProject(path)); // Directory added

watcher.on('error', error => console.error(`Watcher error: ${error}`));

console.log('Watcher ready.');

// Keep the process running
process.stdin.resume();

async function gracefulShutdown() {
  console.log('Shutting down watcher...');
  await watcher.close();
  console.log('Watcher stopped.');
  process.exit(0);
}

process.on('SIGINT', gracefulShutdown); // Ctrl+C
process.on('SIGTERM', gracefulShutdown); // Docker stop 