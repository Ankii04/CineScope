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
- **Watchlist Management** with localStorage persistence
- **Performance Metrics** showing API efficiency

### 🎨 Design Highlights
- **Glassmorphism UI** with backdrop blur effects
- **Gradient Accents** and smooth animations
- **Dark Theme** optimized for viewing
- **Responsive Design** for all screen sizes
- **Skeleton Loading** for better UX
- **Toast Notifications** for user feedback

### ⚡ Performance Features
- **Debounce**: Search input delays API calls until user stops typing
- **Throttle**: Scroll events limited to prevent excessive function calls
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

### View Details
- Click any movie/TV show card to see full details
- Watch trailers, view cast information, and read overviews
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

**Use Case**: Search input
- **Without debounce**: Every keystroke = 1 API call (typing "Avengers" = 8 calls)
- **With debounce**: Wait 300ms after typing stops = 1 API call
- **Result**: 87.5% reduction in API calls!

### Throttle Function
```javascript
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
```

**Use Case**: Scroll events
- **Without throttle**: Scroll fires 100+ events per second
- **With throttle**: Limited to 1 event every 200ms (5 per second)
- **Result**: 95% reduction in function executions!

## 🎯 Project Structure

```
movie-discovery-hub/
├── index.html          # Main HTML structure
├── styles.css          # Premium CSS with glassmorphism
├── script.js           # JavaScript with throttle/debounce
└── README.md           # This file
```

## 🔑 API Information

This project uses the **TMDB (The Movie Database) API**:
- **Free tier** with 1000 requests per day
- No credit card required
- API key included in the code (free public key)

### Get Your Own API Key (Optional)
1. Visit [TMDB](https://www.themoviedb.org/)
2. Create a free account
3. Go to Settings → API
4. Request an API key
5. Replace the key in `script.js`:
   ```javascript
   API_KEY: 'your-api-key-here'
   ```

## 📊 Performance Metrics Explained

### API Calls Made
Total number of actual API requests sent to TMDB.

### API Calls Saved
Number of API calls prevented by debounce/throttle techniques.

### Search Events
Total number of times the search input changed.

### Scroll Events
Total number of scroll events triggered by the user.

### Efficiency
Percentage of API calls saved: `(Saved / (Made + Saved)) × 100`

## 🎨 Customization

### Change Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary: #6366f1;      /* Main brand color */
    --secondary: #ec4899;    /* Accent color */
    --accent: #f59e0b;       /* Highlight color */
}
```

### Adjust Delays
Modify timing in `script.js`:
```javascript
const CONFIG = {
    DEBOUNCE_DELAY: 300,  // Search delay (ms)
    THROTTLE_DELAY: 200,  // Scroll delay (ms)
};
```

### Change Layout
Modify grid columns in `styles.css`:
```css
.movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}
```

## 🌟 Key Learning Points

### 1. **Debounce vs Throttle**
- **Debounce**: Delays execution until after a pause
- **Throttle**: Limits execution frequency
- **When to use**: Debounce for search, throttle for scroll/resize

### 2. **API Optimization**
- Reduce unnecessary API calls
- Improve user experience
- Save bandwidth and costs

### 3. **Modern CSS**
- Glassmorphism with `backdrop-filter`
- CSS Grid for responsive layouts
- CSS variables for theming
- Smooth animations with `transition`

### 4. **Vanilla JavaScript**
- No frameworks needed for powerful apps
- Better performance understanding
- Full control over functionality

## 🐛 Troubleshooting

### Images Not Loading
- Check your internet connection
- TMDB API might be down (rare)
- Try refreshing the page

### Search Not Working
- Verify API key is valid
- Check browser console for errors
- Ensure JavaScript is enabled

### Performance Metrics Not Updating
- Open the metrics panel (click icon on right)
- Perform some searches and scrolling
- Metrics update in real-time

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🚀 Future Enhancements

- [ ] User authentication
- [ ] Personal ratings and reviews
- [ ] Social sharing features
- [ ] Advanced search filters
- [ ] Recommendation engine
- [ ] Dark/Light theme toggle
- [ ] Multiple language support

## 📝 License

This project is open source and available for educational purposes.

## 🙏 Credits

- **TMDB API** for movie/TV data
- **Font Awesome** for icons
- **Google Fonts** for typography (Inter & Outfit)

## 👨‍💻 Author

Created as a demonstration of **throttle and debounce techniques** in modern web development.

---

### 🎓 Educational Value

This project is perfect for:
- Learning throttle and debounce concepts
- Understanding API optimization
- Practicing modern CSS techniques
- Building real-world applications
- Portfolio showcase

### 💡 Tips for Presentation

1. **Open Performance Metrics** to show real-time efficiency
2. **Type slowly in search** to demonstrate debounce delay
3. **Scroll rapidly** to show throttle limiting events
4. **Compare efficiency** before and after using the app
5. **Highlight the visual design** and smooth animations

---

**Enjoy exploring movies with CineScope! 🎬✨**
#   C i n e S c o p e  
 