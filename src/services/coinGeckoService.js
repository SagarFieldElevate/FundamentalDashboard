// CoinGecko API service for fetching crypto project data including developer activity
// Free tier allows 10-30 calls/minute

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const CACHE_KEY = 'coingecko_data';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const RATE_LIMIT_DELAY = 6000; // 6 seconds between requests (10 req/min safe limit)

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

// Map our symbols to CoinGecko IDs
const symbolToCoingeckoId = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'USDT': 'tether',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'USDC': 'usd-coin',
  'XRP': 'ripple',
  'DOGE': 'dogecoin',
  'TON': 'the-open-network',
  'ADA': 'cardano',
  'TRX': 'tron',
  'AVAX': 'avalanche-2',
  'SHIB': 'shiba-inu',
  'LINK': 'chainlink',
  'BCH': 'bitcoin-cash',
  'DOT': 'polkadot',
  'LEO': 'leo-token',
  'DAI': 'dai',
  'LTC': 'litecoin',
  'POL': 'matic-network',
  'UNI': 'uniswap',
  'KAS': 'kaspa',
  'ICP': 'internet-computer',
  'ETC': 'ethereum-classic',
  'RENDER': 'render-token',
  'HBAR': 'hedera-hashgraph',
  'APT': 'aptos',
  'MNT': 'mantle',
  'CRO': 'crypto-com-chain',
  'ARB': 'arbitrum',
  'VET': 'vechain',
  'MKR': 'maker',
  'OP': 'optimism',
  'NEAR': 'near',
  'FIL': 'filecoin',
  'XLM': 'stellar',
  'OKB': 'okb',
  'INJ': 'injective-protocol',
  'ATOM': 'cosmos',
  'IMX': 'immutable-x',
  'TAO': 'bittensor',
  'GRT': 'the-graph',
  'FTM': 'fantom',
  'THETA': 'theta-token',
  'ALGO': 'algorand',
  'FET': 'fetch-ai',
  'RUNE': 'thorchain',
  'FLOW': 'flow',
  'GALA': 'gala',
  'BSV': 'bitcoin-sv',
  'AXS': 'axie-infinity',
  'SAND': 'the-sandbox',
  'QNT': 'quant-network',
  'JUP': 'jupiter-exchange-solana',
  'FLOKI': 'floki',
  'CHZ': 'chiliz',
  'EOS': 'eos',
  'NEO': 'neo',
  'XTZ': 'tezos',
  'MANA': 'decentraland',
  'FTT': 'ftx-token',
  'XMR': 'monero',
  'KAVA': 'kava',
  'CFX': 'conflux-token',
  'AAVE': 'aave',
  'CRV': 'curve-dao-token',
  'APE': 'apecoin',
  'IOTA': 'iota',
  'EGLD': 'elrond-erd-2',
  'MINA': 'mina-protocol',
  'ZEC': 'zcash',
  'COMP': 'compound-governance-token',
  'XDC': 'xdce-crowd-sale',
  'SNX': 'synthetix-network-token',
  'CELO': 'celo',
  'ENJ': 'enjincoin',
  'MASK': 'mask-network',
  'ROSE': 'oasis-network',
  'LRC': 'loopring',
  'DASH': 'dash',
  'TWT': 'trust-wallet-token',
  'IOTX': 'iotex',
  'LDO': 'lido-dao',
  'HOT': 'holotoken',
  'YFI': 'yearn-finance',
  'ZIL': 'zilliqa',
  'SUSHI': 'sushi',
  'ONT': 'ontology',
  'GMT': 'stepn',
  'BAT': 'basic-attention-token',
  'QTUM': 'qtum',
  'ICX': 'icon',
  'WAVES': 'waves',
  'ANKR': 'ankr',
  'STORJ': 'storj',
  'GNO': 'gnosis',
  'ZRX': 'uniswap',
  'UMA': 'uma',
  'SC': 'siacoin',
  'BAL': 'balancer',
  'ENS': 'ethereum-name-service',
  'OMG': 'omisego',
  'BAND': 'band-protocol',
  'HIVE': 'hive',
  'KNC': 'kyber-network-crystal',
  'LSK': 'lisk',
  'OCEAN': 'ocean-protocol',
  'DYDX': 'dydx-chain',
  'SXP': 'swipe',
  'REN': 'republic-protocol',
  'PERP': 'perpetual-protocol',
  'GLM': 'golem',
  'ANT': 'aragon',
  'ALPHA': 'alpha-finance',
  'PAXG': 'pax-gold',
  'FXS': 'frax-share',
  'NEST': 'nest',
  'API3': 'api3',
  'MLN': 'enzyme-finance',
  'RLC': 'iexec-rlc',
  'CTSI': 'cartesi',
  'NMR': 'numeraire',
  'REP': 'augur',
  'CVC': 'civic',
  'OGN': 'origin-protocol',
  'DNT': 'district0x',
  'POWR': 'power-ledger',
  'BNT': 'bancor',
  'REQ': 'request-network',
  'GTC': 'gitcoin',
  'POLY': 'polymath',
  'NKN': 'nkn',
  'OXT': 'orchid-protocol',
  'CELR': 'celer-network',
  'KEEP': 'keep-network',
  'NU': 'nucypher',
  'FUN': 'funfair',
  'RNDR': 'render-token',
  'DATA': 'streamr',
  'AUDIO': 'audius',
  'C98': 'coin98',
  'DENT': 'dent',
  'REEF': 'reef',
  'AGIX': 'singularitynet',
  'FLM': 'flamingo-finance',
  'RAY': 'raydium',
  'ALICE': 'my-neighbor-alice',
  'BICO': 'biconomy',
  'SYN': 'synapse-2',
  'RAD': 'radicle',
  'RARE': 'superrare',
  'SUPER': 'superfarm',
  'ALCX': 'alchemix'
};

// Fetch developer data from CoinGecko
export const fetchDeveloperData = async (projects) => {
  // Check cache first
  const cached = getCachedData();
  if (cached) {
    return cached;
  }

  const results = [];
  
  // Get partial results from localStorage
  const partialCache = localStorage.getItem('partial_coingecko_data');
  const partialData = partialCache ? JSON.parse(partialCache) : {};
  
  console.log('Starting to fetch data for', projects.length, 'projects');
  console.log('Already have data for:', Object.keys(partialData).length, 'projects');

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const coingeckoId = symbolToCoingeckoId[project.symbol];
    
    // Check if we already have this project's data
    if (partialData[project.symbol]) {
      results.push(partialData[project.symbol]);
      continue;
    }

    if (!coingeckoId) {
      console.log(`No CoinGecko ID for ${project.symbol}`);
      results.push({
        ...project,
        commits: 0,
        contributors: 0,
        stars: 0,
        forks: 0,
        devScore: 0,
        loading: false,
        error: true
      });
      continue;
    }

    try {
      console.log(`Fetching data for ${project.name} (${project.symbol}) - ${i + 1}/${projects.length}`);
      
      // Update progress in UI
      if (window.updateLoadingStatus) {
        window.updateLoadingStatus(`Loading ${project.name} (${i + 1}/${projects.length})...`);
      }
      
      // Fetch coin data including developer data
      const response = await fetch(
        `${COINGECKO_API_BASE}/coins/${coingeckoId}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true`
      );

      if (response.status === 429) {
        console.error('Rate limit hit, waiting...');
        await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
        i--; // Retry this project
        continue;
      }

      if (response.ok) {
        const data = await response.json();
        
        const projectData = {
          ...project,
          commits: data.developer_data?.commit_count_4_weeks || 0,
          contributors: data.developer_data?.contributors || 0,
          stars: data.developer_data?.stars || 0,
          forks: data.developer_data?.forks || 0,
          openIssues: data.developer_data?.total_issues || 0,
          closedIssues: data.developer_data?.closed_issues || 0,
          pullRequests: data.developer_data?.pull_requests_merged || 0,
          devScore: data.developer_score || 0,
          marketCap: data.market_data?.market_cap?.usd || 0,
          price: data.market_data?.current_price?.usd || 0,
          priceChange24h: data.market_data?.price_change_percentage_24h || 0,
          volume24h: data.market_data?.total_volume?.usd || 0,
          lastUpdated: data.last_updated,
          loading: false,
          error: false
        };

        results.push(projectData);
        
        // Save to partial cache
        partialData[project.symbol] = projectData;
        localStorage.setItem('partial_coingecko_data', JSON.stringify(partialData));
        
      } else {
        console.error(`Failed to fetch ${project.name}: ${response.status}`);
        results.push({
          ...project,
          loading: false,
          error: true
        });
      }

      // Rate limit delay
      if (i < projects.length - 1) {
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
      }

    } catch (error) {
      console.error(`Error fetching ${project.name}:`, error);
      results.push({
        ...project,
        loading: false,
        error: true
      });
    }
  }

  // Save partial data
  localStorage.setItem('partial_coingecko_data', JSON.stringify(partialData));
  
  // If all projects loaded successfully, save to cache
  const allLoaded = results.every(p => !p.loading && !p.error);
  if (allLoaded && results.length === projects.length) {
    console.log('All projects loaded successfully, saving to cache');
    setCachedData(results);
    localStorage.removeItem('partial_coingecko_data');
  } else {
    console.log(`Loaded ${results.filter(p => !p.loading && !p.error).length}/${projects.length} projects`);
  }

  return results;
};

// Clear cache function
export const clearCoinGeckoCache = () => {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem('partial_coingecko_data');
  console.log('CoinGecko cache cleared');
};