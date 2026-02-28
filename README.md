# 🎬 CineScope - Movie & TV Show Discovery Hub

A stunning, modern web application for discovering movies and TV shows with **intelligent search powered by throttle and debounce techniques**. Built with vanilla HTML, CSS, and JavaScript, showcasing performance optimization and beautiful UI/UX design.

![CineScope Preview](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## ✨ Features

### 🎯 Core Functionality
- **Real-time Search** with debounced API calls (300ms delay)
- **Infinite Scroll** with throttled scroll events (200ms delay)
- **Advanced Filtering** by genre, year, and popularity
- **Movie/TV Show Details** with trailers, cast, and ratings
- **Contextual Recommendations** - See similar movies within the details modal
- **Watchlist Management** with localStorage persistence
- **Performance Metrics** showing API efficiency

### 🎨 Design Highlights
- **Glassmorphism UI** with backdrop blur effects
- **Gradient Accents** and smooth animations
- **Dark Theme** optimized for viewing
- **Responsive Design** for all screen sizes
- **Skeleton Loading** for better UX
- **Toast Notifications** for user feedback

### ⚡ Performance & Stability
- **Debounce**: Search input delays API calls until user stops typing
- **Throttle**: Scroll events limited to prevent excessive function calls
- **Auto-Retry Mechanism**: Handles temporary network issues with 3 retry attempts
- **Stable CORS Proxy**: Powered by `corsproxy.io` for reliable data fetching
- **Lazy Loading**: Images load only when visible
- **API Call Tracking**: Real-time metrics showing efficiency gains

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for TMDB API

### Installation

1. **Clone or download** this project to your local machine

2. **Open the project folder**:
   ```bash
   cd movie-discovery-hub
   ```

3. **Launch the application**:
   - Simply open `index.html` in your web browser
   - Or use a local server (recommended):
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Using Node.js (http-server)
     npx http-server -p 8000
     
     # Using PHP
     php -S localhost:8000
     ```

4. **Access the app**:
   - Open your browser and navigate to `http://localhost:8000`

## 📖 How to Use

### Search for Content
1. Type in the search bar to find movies or TV shows
2. Notice the **debounce effect** - API calls only happen after you stop typing
3. Check the **Performance Metrics** panel to see API calls saved!

### Browse & Filter
- Switch between **Movies** and **TV Shows** using the navigation
- Filter by **Genre**, **Year**, or **Sort Order**
- Scroll down for **infinite loading** (throttled scroll events)

### View Details & Recommendations
- Click any movie/TV show card to see full details
- Scroll down in the details modal to see **Contextual Recommendations**
- Add to your watchlist with one click

### Manage Watchlist
- Click the bookmark icon to add/remove items
- View your entire watchlist by clicking the **Watchlist** button
- Watchlist persists across browser sessions

### Performance Metrics
- Click the **metrics icon** on the right side of the screen
- View real-time statistics:
  - API Calls Made
  - API Calls Saved (thanks to debounce!)
  - Search Events Triggered
  - Scroll Events Triggered
  - Overall Efficiency Percentage

## 🛠️ Technical Implementation

### Debounce Function
```javascript
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
```

### Auto-Retry Logic
The application now includes an exponential backoff retry mechanism to ensure stability:
```javascript
for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
    try {
        const response = await fetch(finalUrl);
        // ... handle response
    } catch (error) {
        if (attempt < CONFIG.MAX_RETRIES) {
            await new Promise(r => setTimeout(r, 1000 * attempt));
        }
    }
}
```

## 🎯 Project Structure

```
movie-discovery-hub/
├── index.html          # Main HTML structure
├── styles.css          # Premium CSS with glassmorphism
├── script.js           # JavaScript with throttle/debounce/retries
└── README.md           # This file
```

## 🔑 API Information

This project uses the **TMDB (The Movie Database) API**:
- **Free tier** with 1000 requests per day
- No credit card required

## 📝 License

This project is open source and available for educational purposes.

## 🙏 Credits

- **TMDB API** for movie/TV data
- **Font Awesome** for icons
- **Google Fonts** for typography (Inter & Outfit)

## 👨‍💻 Author

Created as a demonstration of **throttle, debounce, and API stability techniques** in modern web development.
