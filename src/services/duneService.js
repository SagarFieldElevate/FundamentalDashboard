// Dune Analytics API Service
const DUNE_API_KEY = process.env.REACT_APP_DUNE_API_KEY || '';
const DUNE_API_BASE = 'https://api.dune.com/api/v1';

// Query IDs and their descriptions
const DUNE_QUERIES = {
  // Crypto Analytics
  5130605: 'Token Price & Market Cap Trends',
  5068550: 'DEX Trading Volume Analysis',
  5130656: 'Top Token Performance',
  5130531: 'Liquidity Pool Dynamics',
  5130629: 'Active Wallet Metrics',
  5130650: 'Protocol TVL Rankings',
  5130575: 'DeFi Yield Analytics',
  5130448: 'Blockchain Transaction Activity',
  5073067: 'Gas Fee Tracker',
  
  // Economic Analytics
  5003945: 'Global Inflation Rates',
  5016188: 'GDP Growth Indicators',
  5016368: 'Interest Rate Trends',
  5021950: 'Currency Exchange Rates',
  5021890: 'Commodity Price Index',
  5021933: 'Stock Market Correlation',
  5022218: 'Bond Yield Curves',
  5022098: 'Economic Sentiment Index',
  5022401: 'Central Bank Reserves'
};

// Separate query categories
export const CRYPTO_QUERIES = [
  '5130605', '5068550', '5130656', '5130531', '5130629',
  '5130650', '5130575', '5130448', '5073067'
];

export const ECONOMIC_QUERIES = [
  '5003945', '5016188', '5016368', '5021950', '5021890',
  '5021933', '5022218', '5022098', '5022401'
];

// Cache duration - 1 hour
const CACHE_DURATION = 60 * 60 * 1000;

// Get cached data
const getCachedData = (queryId) => {
  try {
    const cached = localStorage.getItem(`dune_query_${queryId}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log(`Using cached data for query ${queryId}`);
        return data;
      }
    }
  } catch (error) {
    console.error('Cache read error:', error);
  }
  return null;
};

// Save to cache
const setCachedData = (queryId, data) => {
  try {
    localStorage.setItem(`dune_query_${queryId}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Cache save error:', error);
  }
};

// Fetch data from a single Dune query
export const fetchDuneQuery = async (queryId) => {
  // Check cache first
  const cached = getCachedData(queryId);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(
      `${DUNE_API_BASE}/query/${queryId}/results?limit=1000`,
      {
        headers: {
          'X-Dune-API-Key': DUNE_API_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache the data
    setCachedData(queryId, data);
    
    return data;
  } catch (error) {
    console.error(`Error fetching query ${queryId}:`, error);
    throw error;
  }
};

// Fetch all queries
export const fetchAllDuneQueries = async () => {
  const queryIds = Object.keys(DUNE_QUERIES);
  return fetchSpecificQueries(queryIds);
};

// Fetch specific queries by IDs
export const fetchSpecificQueries = async (queryIds) => {
  const results = {};
  
  // Fetch queries in parallel with error handling
  const promises = queryIds.map(async (queryId) => {
    try {
      const data = await fetchDuneQuery(queryId);
      return { queryId, data, error: null };
    } catch (error) {
      console.error(`Failed to fetch query ${queryId}:`, error);
      return { queryId, data: null, error: error.message };
    }
  });

  const queryResults = await Promise.all(promises);
  
  // Process results
  queryResults.forEach(({ queryId, data, error }) => {
    results[queryId] = {
      name: DUNE_QUERIES[queryId],
      data: data,
      error: error,
      loading: false
    };
  });

  return results;
};

// Process data for charts based on query structure
export const processQueryData = (queryId, rawData) => {
  if (!rawData || !rawData.result || !rawData.result.rows) {
    return null;
  }

  const rows = rawData.result.rows;
  const metadata = rawData.result.metadata;
  
  // Extract column names
  const columns = metadata.column_names || [];
  
  // Generic processing - can be customized per query
  const processedData = {
    queryId,
    name: DUNE_QUERIES[queryId],
    columns,
    rows,
    chartData: prepareChartData(queryId, rows, columns)
  };

  return processedData;
};

// Analyze data range to determine if dual axis is needed
const analyzeDataRanges = (data, columns) => {
  const ranges = {};
  columns.forEach(col => {
    const values = data.map(row => parseFloat(row[col]) || 0).filter(v => !isNaN(v));
    if (values.length > 0) {
      ranges[col] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        scale: Math.floor(Math.log10(Math.max(...values) || 1))
      };
    }
  });
  return ranges;
};

// Determine if columns need separate axes
const needsSeparateAxis = (range1, range2) => {
  if (!range1 || !range2) return false;
  const scaleDiff = Math.abs(range1.scale - range2.scale);
  return scaleDiff >= 2; // If scales differ by 2 orders of magnitude or more
};

// Prepare data for specific chart types based on query
const prepareChartData = (queryId, rows, columns) => {
  if (!rows || rows.length === 0) {
    return null;
  }

  // Find potential time/date columns
  const timeColumn = columns.find(col => 
    col.toLowerCase().includes('time') || 
    col.toLowerCase().includes('date') ||
    col.toLowerCase().includes('day') ||
    col.toLowerCase().includes('block') ||
    col.toLowerCase().includes('hour') ||
    col.toLowerCase().includes('week') ||
    col.toLowerCase().includes('month')
  );
  
  // Find numeric columns (exclude time columns and string-only columns)
  const numericColumns = columns.filter(col => {
    if (col === timeColumn) return false;
    // Check if column has numeric values
    const sample = rows.slice(0, Math.min(10, rows.length)).map(row => row[col]);
    // Check if at least 50% of samples are numeric
    const numericCount = sample.filter(val => val !== null && val !== undefined && !isNaN(parseFloat(val))).length;
    return numericCount >= sample.length * 0.5;
  });

  // Find label/category columns
  const labelColumns = columns.filter(col => 
    col !== timeColumn && 
    !numericColumns.includes(col) &&
    col.toLowerCase() !== 'id'
  );

  // Analyze data ranges for numeric columns
  const dataRanges = analyzeDataRanges(rows, numericColumns);

  console.log(`Query ${queryId}: timeColumn=${timeColumn}, numericColumns=${numericColumns.length}, rows=${rows.length}, columns=${columns.join(', ')}`);

  // Force specific chart types for certain queries
  const forceLineChart = ['5130531', '5130575', '5003945', '5016188', '5016368', '5021950', '5021890', '5021933'].includes(queryId);
  const useAreaChart = ['5130531', '5130575', '5130605', '5130656', '5003945', '5021890'].includes(queryId);
  const forceBarChart = ['5130650', '5022218', '5022098', '5022401'].includes(queryId); // Rankings and comparisons
  
  // Handle Protocol TVL Rankings as horizontal bar chart
  if (forceBarChart && numericColumns.length > 0) {
    const labelCol = columns.find(col => 
      col.toLowerCase().includes('protocol') || 
      col.toLowerCase().includes('name') ||
      !numericColumns.includes(col)
    ) || columns[0];
    
    const valueCol = columns.find(col => 
      col.toLowerCase().includes('tvl') || 
      col.toLowerCase().includes('value') ||
      col.toLowerCase().includes('total')
    ) || numericColumns[0];
    
    // Take top 20 protocols by TVL
    const sortedRows = [...rows]
      .sort((a, b) => parseFloat(b[valueCol]) - parseFloat(a[valueCol]))
      .slice(0, 20);
    
    return {
      type: 'bar',
      indexAxis: 'y',
      labels: sortedRows.map(row => String(row[labelCol]).substring(0, 20)),
      datasets: [{
        label: 'Total Value Locked (TVL)',
        data: sortedRows.map(row => parseFloat(row[valueCol]) || 0),
        backgroundColor: sortedRows.map((_, index) => getColor(index % 10, 0.8)),
        borderColor: sortedRows.map((_, index) => getColor(index % 10)),
        borderWidth: 1,
        borderRadius: 4
      }]
    };
  }
  
  // Time series chart
  if ((timeColumn && numericColumns.length > 0) || (forceLineChart && numericColumns.length > 0)) {
    const sortColumn = timeColumn || columns[0];
    const sortedRows = timeColumn 
      ? [...rows].sort((a, b) => new Date(a[sortColumn]) - new Date(b[sortColumn]))
      : rows;
    
    const labelColumn = timeColumn || columns.find(col => !numericColumns.includes(col)) || columns[0];
    
    // Group columns by scale for multi-axis
    const columnsByScale = {};
    numericColumns.forEach(col => {
      const scale = dataRanges[col]?.scale || 0;
      if (!columnsByScale[scale]) {
        columnsByScale[scale] = [];
      }
      columnsByScale[scale].push(col);
    });
    
    // Determine if we need dual axis
    const scales = Object.keys(columnsByScale).map(Number).sort((a, b) => b - a);
    const needsDualAxis = scales.length > 1 && Math.abs(scales[0] - scales[scales.length - 1]) >= 2;
    
    const datasets = [];
    let colorIndex = 0;
    
    // Create datasets with appropriate y-axis assignment
    scales.forEach((scale, scaleIndex) => {
      const columnsAtScale = columnsByScale[scale];
      columnsAtScale.forEach(col => {
        datasets.push({
          label: formatColumnName(col),
          data: sortedRows.map(row => parseFloat(row[col]) || 0),
          borderColor: getColor(colorIndex),
          backgroundColor: useAreaChart ? getColor(colorIndex, 0.2) : getColor(colorIndex, 0.1),
          tension: 0.3,
          pointRadius: rows.length > 50 ? 0 : 3,
          borderWidth: 2,
          fill: useAreaChart,
          yAxisID: needsDualAxis ? (scaleIndex === 0 ? 'y' : 'y1') : 'y',
          unit: getUnitForColumn(col, dataRanges[col])
        });
        colorIndex++;
      });
    });
    
    return {
      type: 'line',
      labels: sortedRows.map((row, index) => 
        timeColumn ? formatDate(row[labelColumn]) : row[labelColumn] || `Point ${index + 1}`
      ),
      datasets: datasets.slice(0, 5), // Limit to 5 datasets
      needsDualAxis,
      scales
    };
  }
  
  // Bar chart for categorical data with numeric values
  if (labelColumns.length > 0 && numericColumns.length > 0 && rows.length <= 30) {
    const labelCol = labelColumns[0];
    
    return {
      type: 'bar',
      labels: rows.map(row => String(row[labelCol]).substring(0, 20)),
      datasets: numericColumns.slice(0, 3).map((col, index) => ({
        label: formatColumnName(col),
        data: rows.map(row => parseFloat(row[col]) || 0),
        backgroundColor: getColor(index, 0.8),
        borderColor: getColor(index),
        borderWidth: 1
      }))
    };
  }
  
  // Pie chart for single numeric column with labels
  if (labelColumns.length > 0 && numericColumns.length === 1 && rows.length <= 10) {
    const labelCol = labelColumns[0];
    const valueCol = numericColumns[0];
    
    return {
      type: 'doughnut',
      labels: rows.map(row => String(row[labelCol])),
      datasets: [{
        label: formatColumnName(valueCol),
        data: rows.map(row => parseFloat(row[valueCol]) || 0),
        backgroundColor: rows.map((_, index) => getColor(index, 0.8)),
        borderColor: rows.map((_, index) => getColor(index)),
        borderWidth: 2
      }]
    };
  }
  
  // Horizontal bar for many categories
  if (numericColumns.length > 0 && rows.length > 30 && rows.length <= 50) {
    const labelCol = columns[0];
    const valueCol = numericColumns[0];
    
    return {
      type: 'bar',
      indexAxis: 'y',
      labels: rows.slice(0, 30).map(row => String(row[labelCol]).substring(0, 30)),
      datasets: [{
        label: formatColumnName(valueCol),
        data: rows.slice(0, 30).map(row => parseFloat(row[valueCol]) || 0),
        backgroundColor: getColor(0, 0.8),
        borderColor: getColor(0),
        borderWidth: 1
      }]
    };
  }
  
  // Default to table for complex data
  return {
    type: 'table',
    columns,
    rows: rows.slice(0, 50)
  };
};

// Format date for display
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  // If it's just a date without time, use simpler format
  if (dateStr.includes('T00:00:00') || dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  
  return date.toLocaleDateString();
};

// Format column names for display
const formatColumnName = (col) => {
  return col
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/Usd/g, 'USD')
    .replace(/Eth/g, 'ETH')
    .replace(/Btc/g, 'BTC');
};

// Get consistent colors for charts
const getColor = (index, alpha = 1) => {
  const colors = [
    `rgba(59, 130, 246, ${alpha})`,   // blue
    `rgba(16, 185, 129, ${alpha})`,   // green
    `rgba(251, 146, 60, ${alpha})`,   // orange
    `rgba(147, 51, 234, ${alpha})`,   // purple
    `rgba(236, 72, 153, ${alpha})`,   // pink
    `rgba(245, 158, 11, ${alpha})`,   // amber
    `rgba(6, 182, 212, ${alpha})`,    // cyan
    `rgba(239, 68, 68, ${alpha})`,    // red
    `rgba(34, 197, 94, ${alpha})`,    // emerald
    `rgba(168, 85, 247, ${alpha})`,   // violet
  ];
  return colors[index % colors.length];
};

// Get appropriate unit for column based on name and scale
const getUnitForColumn = (col, range) => {
  const colLower = col.toLowerCase();
  
  // Currency/value columns
  if (colLower.includes('price') || colLower.includes('value') || colLower.includes('usd') || 
      colLower.includes('tvl') || colLower.includes('market') || colLower.includes('cap')) {
    if (range?.scale >= 9) return 'billions';
    if (range?.scale >= 6) return 'millions';
    if (range?.scale >= 3) return 'thousands';
    return 'dollars';
  }
  
  // Percentage columns
  if (colLower.includes('rate') || colLower.includes('apy') || colLower.includes('apr') || 
      colLower.includes('percent') || colLower.includes('growth')) {
    return 'percent';
  }
  
  // Count columns
  if (colLower.includes('count') || colLower.includes('number') || colLower.includes('transaction')) {
    if (range?.scale >= 6) return 'millions';
    if (range?.scale >= 3) return 'thousands';
    return 'count';
  }
  
  // Gas/wei columns
  if (colLower.includes('gas') || colLower.includes('gwei')) {
    return 'gwei';
  }
  
  return 'value';
};

// Clear all Dune caches
export const clearDuneCache = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('dune_query_')) {
      localStorage.removeItem(key);
    }
  });
  console.log('Dune cache cleared');
};