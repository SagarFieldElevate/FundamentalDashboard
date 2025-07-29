// GitHub API service with caching to avoid rate limits
// Cache data for 24 hours and fetch one project per minute

const CACHE_KEY = 'github_commit_data';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const FETCH_DELAY = 60 * 1000; // 1 minute between fetches
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds initial retry delay

// Get cached data from localStorage
const getCachedData = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      
      if (age < CACHE_DURATION) {
        console.log(`Using cached data (${Math.round(age / 1000 / 60)} minutes old)`);
        return data;
      }
    }
  } catch (error) {
    console.error('Error reading cache:', error);
  }
  return null;
};

// Save data to cache
const setCachedData = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

// Get the next project to fetch (round-robin)
const getNextProjectIndex = () => {
  const lastIndex = parseInt(localStorage.getItem('last_fetch_index') || '-1');
  return lastIndex + 1;
};

const setLastProjectIndex = (index) => {
  localStorage.setItem('last_fetch_index', index.toString());
  localStorage.setItem('last_fetch_time', Date.now().toString());
};

// Check if we can fetch (1 minute cooldown)
const canFetchNext = () => {
  const lastFetchTime = parseInt(localStorage.getItem('last_fetch_time') || '0');
  return Date.now() - lastFetchTime >= FETCH_DELAY;
};

// Fetch with retry logic
const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          ...options.headers
        }
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (error.name === 'AbortError' && i < retries - 1) {
        console.log(`Timeout on attempt ${i + 1}/${retries}, retrying in ${RETRY_DELAY * Math.pow(2, i)}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, i)));
      } else {
        throw error;
      }
    }
  }
};

export const fetchCommitData = async (projects, timeRange) => {
  // First, check if we have cached data
  const cachedData = getCachedData();
  if (cachedData) {
    return cachedData;
  }

  // If no cache, we need to build it gradually
  // Start with empty data for all projects
  let results = projects.map(project => ({
    ...project,
    commits: 0,
    contributors: 0,
    lastCommit: null,
    weeklyCommits: [],
    stars: 0,
    forks: 0,
    openIssues: 0,
    loading: true
  }));

  // Load any partial results from localStorage
  const partialCache = localStorage.getItem('partial_github_data');
  if (partialCache) {
    try {
      const partialData = JSON.parse(partialCache);
      results = results.map((project, index) => {
        const cached = partialData[project.symbol];
        if (cached && !cached.loading) {
          return { ...project, ...cached };
        }
        return project;
      });
    } catch (error) {
      console.error('Error loading partial cache:', error);
    }
  }

  // Fetch one project if allowed
  if (canFetchNext()) {
    const nextIndex = getNextProjectIndex() % projects.length;
    const project = projects[nextIndex];
    
    console.log(`Fetching data for ${project.name} (${nextIndex + 1}/${projects.length})`);
    
    if (project.repo) {
      try {
        const [owner, repo] = project.repo.split('/');
        
        // Fetch repository information with retry
        const repoResponse = await fetchWithRetry(
          `https://api.github.com/repos/${owner}/${repo}`
        );

        if (repoResponse.ok) {
          const repoData = await repoResponse.json();
          
          // Get recent commits
          let recentCommits = 0;
          let weeklyCommits = [];
          
          try {
            const since = new Date();
            since.setDate(since.getDate() - Math.min(timeRange, 30));
            
            const commitsResponse = await fetchWithRetry(
              `https://api.github.com/repos/${owner}/${repo}/commits?since=${since.toISOString()}&per_page=30`
            );
            
            if (commitsResponse.ok) {
              const commitsData = await commitsResponse.json();
              recentCommits = commitsData.length;
              
              // Calculate weekly distribution
              const weeks = Math.ceil(Math.min(timeRange, 30) / 7);
              weeklyCommits = new Array(weeks).fill(0);
              
              commitsData.forEach(commit => {
                const commitDate = new Date(commit.commit.author.date);
                const daysAgo = Math.floor((Date.now() - commitDate) / (1000 * 60 * 60 * 24));
                const weekIndex = Math.floor(daysAgo / 7);
                if (weekIndex < weeks) {
                  weeklyCommits[weekIndex]++;
                }
              });
              
              weeklyCommits.reverse();
            }
          } catch (error) {
            console.error(`Error fetching commits:`, error);
          }

          // Update the project data
          const updatedProject = {
            ...project,
            commits: recentCommits,
            contributors: 30, // Estimate
            lastCommit: repoData.pushed_at || repoData.updated_at,
            weeklyCommits: weeklyCommits,
            stars: repoData.stargazers_count || 0,
            forks: repoData.forks_count || 0,
            openIssues: repoData.open_issues_count || 0,
            watchers: repoData.watchers_count || 0,
            language: repoData.language,
            size: repoData.size,
            defaultBranch: repoData.default_branch,
            loading: false,
            error: false
          };

          // Update results
          results[nextIndex] = updatedProject;

          // Save to partial cache
          const partialData = JSON.parse(localStorage.getItem('partial_github_data') || '{}');
          partialData[project.symbol] = updatedProject;
          localStorage.setItem('partial_github_data', JSON.stringify(partialData));

          // Check if all projects are loaded
          const allLoaded = results.every(p => !p.loading);
          if (allLoaded) {
            console.log('All projects loaded! Saving to cache.');
            setCachedData(results);
            localStorage.removeItem('partial_github_data');
            localStorage.removeItem('last_fetch_index');
          }
        } else {
          console.error(`Failed to fetch ${project.name}: ${repoResponse.status}`);
          results[nextIndex] = { ...project, loading: false, error: true };
        }
      } catch (error) {
        console.error(`Error fetching ${project.name}:`, error);
        if (error.name === 'AbortError') {
          // Timeout after retries - keep as loading for next cycle
          console.error(`Timeout fetching ${project.name} after ${MAX_RETRIES} attempts - will retry in next cycle`);
          results[nextIndex] = { ...project, loading: true };
        } else {
          results[nextIndex] = { ...project, loading: false, error: true };
        }
      }
    } else {
      results[nextIndex] = { ...project, loading: false };
    }

    setLastProjectIndex(nextIndex);
  } else {
    const lastFetchTime = parseInt(localStorage.getItem('last_fetch_time') || '0');
    const timeUntilNext = FETCH_DELAY - (Date.now() - lastFetchTime);
    console.log(`Rate limit: Next fetch in ${Math.round(timeUntilNext / 1000)} seconds`);
  }

  return results;
};

// Function to clear cache (useful for debugging)
export const clearCache = () => {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem('partial_github_data');
  localStorage.removeItem('last_fetch_index');
  localStorage.removeItem('last_fetch_time');
  console.log('Cache cleared');
};