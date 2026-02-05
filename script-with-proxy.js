// ===================================
// CONFIGURATION & STATE (WITH CORS PROXY)
// ===================================

// Toggle this to use CORS proxy if you have network issues
const USE_CORS_PROXY = true;
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

const CONFIG = {
    API_KEY: '8265bd1679663a7ea12ac168da84d2e8', // TMDB API Key (free tier)
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
    POSTER_SIZE: 'w500',
    BACKDROP_SIZE: 'w1280',
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 200,
};

// Helper function to build URL with optional CORS proxy
function buildApiUrl(endpoint, params = {}) {
    const url = new URL(`${CONFIG.BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', CONFIG.API_KEY);

    Object.keys(params).forEach(key => {
        if (params[key]) url.searchParams.append(key, params[key]);
    });

    const finalUrl = url.toString();

    // If using CORS proxy, wrap the URL
    if (USE_CORS_PROXY) {
        return CORS_PROXY + encodeURIComponent(finalUrl);
    }

    return finalUrl;
}

async function fetchFromAPI(endpoint, params = {}) {
    const url = buildApiUrl(endpoint, params);

    try {
        console.log('🔍 API Request:', {
            endpoint: endpoint,
            url: url,
            params: params,
            usingProxy: USE_CORS_PROXY
        });

        const response = await fetch(url);

        console.log('📡 API Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            url: response.url
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ API Error Response:', {
                status: response.status,
                statusText: response.statusText,
                errorData: errorData,
                endpoint: endpoint,
                url: url
            });

            let errorMessage = 'Failed to fetch data. ';
            if (response.status === 401) {
                errorMessage += 'Invalid API key. Please check your TMDB API key.';
            } else if (response.status === 404) {
                errorMessage += 'Resource not found.';
            } else if (response.status === 429) {
                errorMessage += 'Too many requests. Please wait a moment.';
            } else {
                errorMessage += `Error ${response.status}: ${errorData.status_message || response.statusText}`;
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('✅ API Success:', {
            endpoint: endpoint,
            resultsCount: data.results?.length || 'N/A',
            totalResults: data.total_results || 'N/A'
        });

        return data;
    } catch (error) {
        console.error('❌ API Error:', {
            message: error.message,
            endpoint: endpoint,
            url: url,
            params: params,
            error: error,
            usingProxy: USE_CORS_PROXY
        });

        // If not using proxy and got network error, suggest using proxy
        if (!USE_CORS_PROXY && error.message.includes('fetch')) {
            console.warn('💡 Network error detected. Consider enabling CORS proxy by setting USE_CORS_PROXY = true');
        }

        return null;
    }
}

// Test function to check connectivity
async function testConnectivity() {
    console.log('🧪 Testing API connectivity...');
    console.log('Using CORS Proxy:', USE_CORS_PROXY);

    const result = await fetchFromAPI('/configuration');

    if (result) {
        console.log('✅ API is working!');
        return true;
    } else {
        console.log('❌ API connection failed');
        if (!USE_CORS_PROXY) {
            console.log('💡 Try enabling CORS proxy: Set USE_CORS_PROXY = true at the top of this file');
        }
        return false;
    }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { fetchFromAPI, testConnectivity, CONFIG };
}
