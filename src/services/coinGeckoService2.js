// Alternative CoinGecko service that loads data progressively
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const CACHE_KEY = 'coingecko_data_v2';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Get cached data
const getCachedData = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log('Using cached CoinGecko data');
        return data;
      }
    }
  } catch (error) {
    console.error('Cache read error:', error);
  }
  return null;
};

// Save to cache
const setCachedData = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Cache save error:', error);
  }
};

// Use CoinGecko's list endpoint to get multiple coins at once
export const fetchAllProjectData = async (projects) => {
  // Check cache first
  const cached = getCachedData();
  if (cached) {
    return cached;
  }

  try {
    console.log('Fetching market data for all projects...');
    
    // Get list of all coins with market data
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const marketData = await response.json();
    console.log(`Received data for ${marketData.length} coins`);

    // Create a map for quick lookup
    const marketDataMap = {};
    marketData.forEach(coin => {
      marketDataMap[coin.symbol.toUpperCase()] = coin;
    });

    // Map our projects to the market data
    const results = projects.map(project => {
      const coinData = marketDataMap[project.symbol];
      
      if (coinData) {
        return {
          ...project,
          id: coinData.id,
          marketCap: coinData.market_cap || 0,
          price: coinData.current_price || 0,
          priceChange24h: coinData.price_change_percentage_24h || 0,
          volume24h: coinData.total_volume || 0,
          circulatingSupply: coinData.circulating_supply || 0,
          lastUpdated: coinData.last_updated,
          image: coinData.image,
          loading: false,
          error: false,
          // We'll fetch developer data separately
          commits: 0,
          contributors: 0,
          stars: 0,
          forks: 0,
          devScore: 0
        };
      }
      
      return {
        ...project,
        loading: false,
        error: true,
        errorMessage: 'Not found in CoinGecko'
      };
    });

    // Save the market data
    setCachedData(results);
    
    // Now fetch developer data for top projects asynchronously
    fetchDeveloperDataAsync(results);
    
    return results;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
};

// Fetch developer data in the background
const fetchDeveloperDataAsync = async (projects) => {
  const devDataCache = localStorage.getItem('coingecko_dev_data');
  const devData = devDataCache ? JSON.parse(devDataCache) : {};
  
  // Only fetch dev data for top 50 projects that we don't have cached
  const topProjects = projects
    .filter(p => p.rank <= 50 && p.id && !devData[p.symbol])
    .slice(0, 10); // Limit to 10 at a time
  
  for (const project of topProjects) {
    try {
      console.log(`Fetching developer data for ${project.name}...`);
      
      const response = await fetch(
        `${COINGECKO_API_BASE}/coins/${project.id}?localization=false&tickers=false&market_data=false&community_data=true&developer_data=true`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        devData[project.symbol] = {
          commits: data.developer_data?.commit_count_4_weeks || 0,
          contributors: data.developer_data?.contributors || 0,
          stars: data.developer_data?.stars || 0,
          forks: data.developer_data?.forks || 0,
          devScore: data.developer_score || 0,
          timestamp: Date.now()
        };
        
        // Save dev data cache
        localStorage.setItem('coingecko_dev_data', JSON.stringify(devData));
        
        // Update UI if available
        if (window.updateProjectDevData) {
          window.updateProjectDevData(project.symbol, devData[project.symbol]);
        }
      }
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error fetching dev data for ${project.name}:`, error);
    }
  }
};

// Get developer data from cache
export const getDevDataFromCache = (symbol) => {
  const devDataCache = localStorage.getItem('coingecko_dev_data');
  if (devDataCache) {
    const devData = JSON.parse(devDataCache);
    return devData[symbol] || null;
  }
  return null;
};

// Clear all caches
export const clearAllCaches = () => {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem('coingecko_dev_data');
  console.log('All caches cleared');
};