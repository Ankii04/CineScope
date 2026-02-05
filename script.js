// ⚠️ NETWORK FIX: If you're getting "Failed to fetch" errors, set USE_CORS_PROXY to true
const USE_CORS_PROXY = true; // Change to true if you have network/firewall issues
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

const STATE = {
    currentType: 'movie',
    currentPage: 1,
    totalPages: 1,
    isLoading: false,
    searchQuery: '',
    selectedGenre: '',
    selectedYear: '',
    selectedSort: 'popularity.desc',
    watchlist: JSON.parse(localStorage.getItem('watchlist')) || [],
    metrics: {
        apiCallsMade: 0,
        apiCallsSaved: 0,
        searchEvents: 0,
        scrollEvents: 0,
    },
};

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Debounce function - delays execution until after wait time has elapsed
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function - limits execution to once per wait time
function throttle(func, wait) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), wait);
        }
    };
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'fa-check-circle' :
        type === 'error' ? 'fa-exclamation-circle' :
            'fa-info-circle';

    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;

    document.getElementById('toastContainer').appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Update metrics display
function updateMetrics() {
    document.getElementById('apiCallsMade').textContent = STATE.metrics.apiCallsMade;
    document.getElementById('apiCallsSaved').textContent = STATE.metrics.apiCallsSaved;
    document.getElementById('searchEvents').textContent = STATE.metrics.searchEvents;
    document.getElementById('scrollEvents').textContent = STATE.metrics.scrollEvents;

    const total = STATE.metrics.apiCallsMade + STATE.metrics.apiCallsSaved;
    const efficiency = total > 0 ? Math.round((STATE.metrics.apiCallsSaved / total) * 100) : 0;

    document.getElementById('efficiencyFill').style.width = `${efficiency}%`;
    document.getElementById('efficiencyPercent').textContent = `${efficiency}%`;
}

// ===================================
// API FUNCTIONS
// ===================================

async function fetchFromAPI(endpoint, params = {}) {
    const url = new URL(`${CONFIG.BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', CONFIG.API_KEY);

    Object.keys(params).forEach(key => {
        if (params[key]) url.searchParams.append(key, params[key]);
    });

    // Apply CORS proxy if enabled
    const finalUrl = USE_CORS_PROXY
        ? CORS_PROXY + encodeURIComponent(url.toString())
        : url.toString();

    try {
        STATE.metrics.apiCallsMade++;
        updateMetrics();

        console.log('🔍 API Request:', {
            endpoint: endpoint,
            url: finalUrl,
            originalUrl: url.toString(),
            params: params,
            usingProxy: USE_CORS_PROXY
        });

        const response = await fetch(finalUrl);

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
                url: url.toString()
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
            url: finalUrl,
            originalUrl: url.toString(),
            params: params,
            usingProxy: USE_CORS_PROXY,
            error: error
        });

        // Suggest using proxy if network error and not already using it
        if (!USE_CORS_PROXY && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
            console.warn('💡 Network error detected! Try enabling CORS proxy:');
            console.warn('   Set USE_CORS_PROXY = true at the top of script.js');
        }

        showToast(error.message || 'Failed to fetch data. Please try again.', 'error');
        return null;
    }
}

async function searchContent(query, page = 1) {
    const endpoint = `/search/${STATE.currentType}`;
    return await fetchFromAPI(endpoint, {
        query,
        page,
        include_adult: false,
    });
}

async function discoverContent(page = 1) {
    const endpoint = `/discover/${STATE.currentType}`;
    const params = {
        page,
        sort_by: STATE.selectedSort,
        include_adult: false,
    };

    if (STATE.selectedGenre) params.with_genres = STATE.selectedGenre;
    if (STATE.selectedYear) {
        if (STATE.currentType === 'movie') {
            params.primary_release_year = STATE.selectedYear;
        } else {
            params.first_air_date_year = STATE.selectedYear;
        }
    }

    return await fetchFromAPI(endpoint, params);
}

async function getTrendingContent() {
    const endpoint = `/trending/${STATE.currentType}/week`;
    return await fetchFromAPI(endpoint, { page: 1 });
}

async function getGenres() {
    const endpoint = `/genre/${STATE.currentType}/list`;
    return await fetchFromAPI(endpoint);
}

async function getContentDetails(id) {
    const endpoint = `/${STATE.currentType}/${id}`;
    const params = {
        append_to_response: 'credits,videos,similar',
    };
    return await fetchFromAPI(endpoint, params);
}

// ===================================
// RENDER FUNCTIONS
// ===================================

function getPosterUrl(path) {
    return path
        ? `${CONFIG.IMAGE_BASE_URL}/${CONFIG.POSTER_SIZE}${path}`
        : 'https://via.placeholder.com/500x750/1e293b/94a3b8?text=No+Image';
}

function getBackdropUrl(path) {
    return path
        ? `${CONFIG.IMAGE_BASE_URL}/${CONFIG.BACKDROP_SIZE}${path}`
        : 'https://via.placeholder.com/1280x720/1e293b/94a3b8?text=No+Image';
}

function getTitle(item) {
    return item.title || item.name;
}

function getReleaseDate(item) {
    const date = item.release_date || item.first_air_date;
    return date ? new Date(date).getFullYear() : 'N/A';
}

function isInWatchlist(id) {
    return STATE.watchlist.some(item => item.id === id);
}

function createMovieCard(item) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.id = item.id;

    const inWatchlist = isInWatchlist(item.id);

    card.innerHTML = `
        <div class="movie-poster">
            <img src="${getPosterUrl(item.poster_path)}" alt="${getTitle(item)}" loading="lazy">
            <div class="movie-rating">
                <i class="fas fa-star"></i>
                ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
            </div>
            <button class="watchlist-icon ${inWatchlist ? 'active' : ''}" data-id="${item.id}">
                <i class="fas fa-bookmark"></i>
            </button>
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${getTitle(item)}</h3>
            <div class="movie-meta">
                <span><i class="fas fa-calendar"></i> ${getReleaseDate(item)}</span>
                ${item.vote_count ? `<span><i class="fas fa-users"></i> ${item.vote_count}</span>` : ''}
            </div>
            ${item.overview ? `<p class="movie-overview">${item.overview}</p>` : ''}
        </div>
    `;

    // Add click handler for card (excluding watchlist button)
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.watchlist-icon')) {
            showMovieDetails(item.id);
        }
    });

    // Add watchlist button handler
    const watchlistBtn = card.querySelector('.watchlist-icon');
    watchlistBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleWatchlist(item);
    });

    return card;
}

function renderMovies(items, append = false) {
    const grid = document.getElementById('moviesGrid');

    if (!append) {
        grid.innerHTML = '';
    }

    items.forEach(item => {
        grid.appendChild(createMovieCard(item));
    });

    // Hide loading skeleton
    document.getElementById('loadingSkeleton').classList.remove('active');
    document.getElementById('loadMoreIndicator').classList.remove('active');

    // Show/hide no results
    if (items.length === 0 && !append) {
        document.getElementById('noResults').classList.add('active');
    } else {
        document.getElementById('noResults').classList.remove('active');
    }
}

function showLoadingSkeleton() {
    document.getElementById('loadingSkeleton').classList.add('active');
    document.getElementById('noResults').classList.remove('active');
}

function showLoadMoreIndicator() {
    document.getElementById('loadMoreIndicator').classList.add('active');
}

// ===================================
// SEARCH & FILTER HANDLERS
// ===================================

async function performSearch() {
    if (STATE.isLoading) return;

    STATE.isLoading = true;
    STATE.currentPage = 1;

    showLoadingSkeleton();
    document.getElementById('searchIndicator').classList.add('active');

    let data;
    if (STATE.searchQuery.trim()) {
        data = await searchContent(STATE.searchQuery, 1);
        updateResultsInfo(`Search results for "${STATE.searchQuery}"`);
    } else {
        data = await discoverContent(1);
        updateResultsInfo(`Trending ${STATE.currentType === 'movie' ? 'Movies' : 'TV Shows'}`);
    }

    document.getElementById('searchIndicator').classList.remove('active');

    if (data) {
        STATE.totalPages = data.total_pages;
        renderMovies(data.results);
        updateSearchStats(data.total_results);
    }

    STATE.isLoading = false;
}

// Debounced search function
const debouncedSearch = debounce(() => {
    performSearch();
}, CONFIG.DEBOUNCE_DELAY);

function handleSearchInput(e) {
    STATE.metrics.searchEvents++;
    updateMetrics();

    STATE.searchQuery = e.target.value;

    // Show/hide clear button
    const clearBtn = document.getElementById('clearBtn');
    if (STATE.searchQuery) {
        clearBtn.classList.add('visible');
    } else {
        clearBtn.classList.remove('visible');
    }

    // Count saved API calls
    if (STATE.searchQuery.length > 0) {
        STATE.metrics.apiCallsSaved++;
        updateMetrics();
    }

    debouncedSearch();
}

function updateSearchStats(totalResults) {
    const stats = document.getElementById('searchStats');
    if (STATE.searchQuery) {
        stats.textContent = `Found ${totalResults.toLocaleString()} results`;
    } else {
        stats.textContent = '';
    }
}

function updateResultsInfo(title) {
    document.getElementById('resultsTitle').textContent = title;
    document.getElementById('resultsCount').textContent =
        `Page ${STATE.currentPage} of ${STATE.totalPages}`;
}

// ===================================
// INFINITE SCROLL
// ===================================

async function loadMoreContent() {
    if (STATE.isLoading || STATE.currentPage >= STATE.totalPages) return;

    STATE.isLoading = true;
    STATE.currentPage++;

    showLoadMoreIndicator();

    let data;
    if (STATE.searchQuery.trim()) {
        data = await searchContent(STATE.searchQuery, STATE.currentPage);
    } else {
        data = await discoverContent(STATE.currentPage);
    }

    if (data) {
        renderMovies(data.results, true);
        updateResultsInfo(
            STATE.searchQuery
                ? `Search results for "${STATE.searchQuery}"`
                : `Trending ${STATE.currentType === 'movie' ? 'Movies' : 'TV Shows'}`
        );
    }

    STATE.isLoading = false;
}

// Throttled scroll handler
const throttledScroll = throttle(() => {
    STATE.metrics.scrollEvents++;
    updateMetrics();

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    // Load more when user is 300px from bottom
    if (scrollTop + clientHeight >= scrollHeight - 300) {
        loadMoreContent();
    }

    // Show/hide scroll to top button
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTop > 500) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
}, CONFIG.THROTTLE_DELAY);

// ===================================
// WATCHLIST FUNCTIONS
// ===================================

function toggleWatchlist(item) {
    const index = STATE.watchlist.findIndex(w => w.id === item.id);

    if (index > -1) {
        STATE.watchlist.splice(index, 1);
        showToast('Removed from watchlist', 'info');
    } else {
        STATE.watchlist.push({
            id: item.id,
            title: getTitle(item),
            poster_path: item.poster_path,
            vote_average: item.vote_average,
            type: STATE.currentType,
        });
        showToast('Added to watchlist', 'success');
    }

    localStorage.setItem('watchlist', JSON.stringify(STATE.watchlist));
    updateWatchlistBadge();

    // Update all watchlist icons
    document.querySelectorAll(`.watchlist-icon[data-id="${item.id}"]`).forEach(btn => {
        btn.classList.toggle('active');
    });
}

function updateWatchlistBadge() {
    document.getElementById('watchlistBadge').textContent = STATE.watchlist.length;
}

function showWatchlistModal() {
    const modal = document.getElementById('watchlistModal');
    const grid = document.getElementById('watchlistGrid');
    const empty = document.getElementById('emptyWatchlist');

    grid.innerHTML = '';

    if (STATE.watchlist.length === 0) {
        empty.classList.add('active');
    } else {
        empty.classList.remove('active');
        STATE.watchlist.forEach(item => {
            grid.appendChild(createMovieCard(item));
        });
    }

    modal.classList.add('active');
}

// ===================================
// MOVIE DETAILS MODAL
// ===================================

async function showMovieDetails(id) {
    const modal = document.getElementById('movieModal');
    const body = document.getElementById('modalBody');

    modal.classList.add('active');
    body.innerHTML = '<div class="spinner-large" style="margin: 4rem auto;"></div>';

    const data = await getContentDetails(id);

    if (!data) {
        modal.classList.remove('active');
        return;
    }

    const trailer = data.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const director = data.credits?.crew?.find(c => c.job === 'Director');
    const cast = data.credits?.cast?.slice(0, 5) || [];

    body.innerHTML = `
        <div class="movie-detail-header" style="
            background: linear-gradient(to bottom, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.95)), 
                        url('${getBackdropUrl(data.backdrop_path)}');
            background-size: cover;
            background-position: center;
            padding: 3rem;
            border-radius: 1rem 1rem 0 0;
        ">
            <h2 style="font-size: 2.5rem; font-family: var(--font-display); margin-bottom: 1rem;">
                ${getTitle(data)}
            </h2>
            <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
                <span style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-star" style="color: var(--accent);"></i>
                    ${data.vote_average?.toFixed(1)} / 10
                </span>
                <span><i class="fas fa-calendar"></i> ${getReleaseDate(data)}</span>
                ${data.runtime ? `<span><i class="fas fa-clock"></i> ${data.runtime} min</span>` : ''}
                ${data.number_of_seasons ? `<span><i class="fas fa-tv"></i> ${data.number_of_seasons} Seasons</span>` : ''}
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                ${data.genres?.map(g => `
                    <span style="
                        background: rgba(99, 102, 241, 0.2);
                        padding: 0.25rem 0.75rem;
                        border-radius: 1rem;
                        font-size: 0.85rem;
                        border: 1px solid var(--primary);
                    ">${g.name}</span>
                `).join('') || ''}
            </div>
        </div>
        
        <div style="padding: 2rem 3rem;">
            ${data.tagline ? `<p style="font-style: italic; color: var(--text-muted); margin-bottom: 1rem;">"${data.tagline}"</p>` : ''}
            
            <h3 style="margin-bottom: 1rem; font-size: 1.5rem;">Overview</h3>
            <p style="line-height: 1.8; color: var(--text-secondary); margin-bottom: 2rem;">
                ${data.overview || 'No overview available.'}
            </p>
            
            ${director ? `
                <div style="margin-bottom: 1.5rem;">
                    <strong>Director:</strong> ${director.name}
                </div>
            ` : ''}
            
            ${cast.length > 0 ? `
                <div style="margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1rem; font-size: 1.5rem;">Cast</h3>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                        ${cast.map(actor => `
                            <div style="
                                background: var(--bg-card);
                                padding: 0.75rem 1rem;
                                border-radius: var(--radius-lg);
                                border: 1px solid rgba(255, 255, 255, 0.1);
                            ">
                                <div style="font-weight: 600;">${actor.name}</div>
                                <div style="font-size: 0.85rem; color: var(--text-muted);">${actor.character}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${trailer ? `
                <div style="margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1rem; font-size: 1.5rem;">Trailer</h3>
                    <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: var(--radius-lg);">
                        <iframe 
                            src="https://www.youtube.com/embed/${trailer.key}" 
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                            allowfullscreen
                        ></iframe>
                    </div>
                </div>
            ` : ''}
            
            <button onclick="toggleWatchlist({
                id: ${data.id},
                title: '${getTitle(data).replace(/'/g, "\\'")}',
                poster_path: '${data.poster_path}',
                vote_average: ${data.vote_average},
                type: '${STATE.currentType}'
            })" style="
                background: linear-gradient(135deg, var(--primary), var(--primary-dark));
                border: none;
                color: white;
                padding: 1rem 2rem;
                border-radius: var(--radius-lg);
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: all var(--transition-base);
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-glow)'"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                <i class="fas fa-bookmark"></i>
                ${isInWatchlist(data.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
            </button>
        </div>
    `;
}

// ===================================
// GENRE FILTER POPULATION
// ===================================

async function populateGenreFilter() {
    const data = await getGenres();
    const select = document.getElementById('genreFilter');

    if (data && data.genres) {
        select.innerHTML = '<option value="">All Genres</option>';
        data.genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            select.appendChild(option);
        });
    }
}

function populateYearFilter() {
    const select = document.getElementById('yearFilter');
    const currentYear = new Date().getFullYear();

    select.innerHTML = '<option value="">All Years</option>';
    for (let year = currentYear; year >= 1900; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
    }
}

// ===================================
// EVENT LISTENERS
// ===================================

function initializeEventListeners() {
    // Search input
    document.getElementById('searchInput').addEventListener('input', handleSearchInput);

    // Clear search button
    document.getElementById('clearBtn').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        STATE.searchQuery = '';
        document.getElementById('clearBtn').classList.remove('visible');
        performSearch();
    });

    // Navigation buttons
    document.querySelectorAll('.nav-btn[data-type]').forEach(btn => {
        btn.addEventListener('click', () => {
            STATE.currentType = btn.dataset.type;

            // Update active state
            document.querySelectorAll('.nav-btn[data-type]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Reset and reload
            STATE.currentPage = 1;
            populateGenreFilter();
            performSearch();
        });
    });

    // Watchlist button
    document.getElementById('watchlistBtn').addEventListener('click', showWatchlistModal);

    // Filter changes
    document.getElementById('genreFilter').addEventListener('change', (e) => {
        STATE.selectedGenre = e.target.value;
        STATE.metrics.apiCallsSaved++;
        updateMetrics();
        debouncedSearch();
    });

    document.getElementById('yearFilter').addEventListener('change', (e) => {
        STATE.selectedYear = e.target.value;
        STATE.metrics.apiCallsSaved++;
        updateMetrics();
        debouncedSearch();
    });

    document.getElementById('sortFilter').addEventListener('change', (e) => {
        STATE.selectedSort = e.target.value;
        performSearch();
    });

    // Scroll events
    window.addEventListener('scroll', throttledScroll);

    // Scroll to top button
    document.getElementById('scrollTop').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Metrics panel toggle
    document.getElementById('metricsToggle').addEventListener('click', () => {
        document.getElementById('metricsPanel').classList.toggle('open');
    });

    // Modal close buttons
    document.getElementById('modalClose').addEventListener('click', () => {
        document.getElementById('movieModal').classList.remove('active');
    });

    document.getElementById('modalOverlay').addEventListener('click', () => {
        document.getElementById('movieModal').classList.remove('active');
    });

    document.getElementById('watchlistClose').addEventListener('click', () => {
        document.getElementById('watchlistModal').classList.remove('active');
    });

    document.getElementById('watchlistOverlay').addEventListener('click', () => {
        document.getElementById('watchlistModal').classList.remove('active');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.getElementById('movieModal').classList.remove('active');
            document.getElementById('watchlistModal').classList.remove('active');
        }
        if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
    });
}

// ===================================
// INITIALIZATION
// ===================================

async function initialize() {
    console.log('🎬 CineScope - Movie Discovery Hub');
    console.log('📊 Demonstrating Throttle & Debounce techniques');

    initializeEventListeners();
    updateWatchlistBadge();
    populateYearFilter();
    await populateGenreFilter();

    // Load initial content
    const data = await getTrendingContent();
    if (data) {
        STATE.totalPages = data.total_pages;
        renderMovies(data.results);
        updateResultsInfo('Trending Movies');
    }

    // Show welcome toast
    setTimeout(() => {
        showToast('Welcome to CineScope! Try searching for your favorite movies.', 'info');
    }, 1000);
}

// Start the application
document.addEventListener('DOMContentLoaded', initialize);

// Make toggleWatchlist available globally for modal buttons
window.toggleWatchlist = toggleWatchlist;
