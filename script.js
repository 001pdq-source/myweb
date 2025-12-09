// Main Script - UI, Dark Mode, Auth Protection, and Card Effects
import { checkAuth, logoutUser, onAuthStateChange, getCurrentUser } from "./auth.js";

// ============================================
// Initialize App on Page Load
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    initThemeToggle();
    loadStoredTheme();
    setupSearch();
    
    // Check if this is a protected page
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        await protectAuthPage();
    }
    
    // Update nav based on auth status
    setupAuthUI();
});

// ============================================
// Theme Toggle (Light/Dark Mode)
// ============================================

function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    themeToggle.addEventListener('click', () => {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        updateThemeIcon();
    });
}

function loadStoredTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    const icon = themeToggle.querySelector('i');
    const isDark = document.body.classList.contains('dark-mode');

    if (isDark) {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-sun';
    }
}

// ============================================
// Auth Page Protection
// ============================================

async function protectAuthPage() {
    const user = await checkAuth();
    
    if (!user) {
        // User not logged in, redirect to login
        window.location.href = './login.html';
        return;
    }

    // User is logged in, allow access
    loadStories();
}

// ============================================
// Setup Auth UI (Navbar)
// ============================================

function setupAuthUI() {
    onAuthStateChange((user) => {
        const navRight = document.querySelector('.nav-right');
        if (!navRight) return;

        navRight.innerHTML = '';

        if (user) {
            // User is logged in - show logout button
            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'auth-button logout';
            logoutBtn.textContent = 'تسجيل الخروج';
            logoutBtn.addEventListener('click', handleLogout);
            navRight.appendChild(logoutBtn);
        } else {
            // User is not logged in - show login and register buttons
            const loginBtn = document.createElement('button');
            loginBtn.className = 'auth-button';
            loginBtn.textContent = 'تسجيل الدخول';
            loginBtn.addEventListener('click', () => {
                window.location.href = './login.html';
            });

            const registerBtn = document.createElement('button');
            registerBtn.className = 'auth-button';
            registerBtn.textContent = 'إنشاء حساب';
            registerBtn.addEventListener('click', () => {
                window.location.href = './register.html';
            });

            navRight.appendChild(loginBtn);
            navRight.appendChild(registerBtn);
        }
    });
}

// ============================================
// Logout Handler
// ============================================

async function handleLogout() {
    const result = await logoutUser();
    if (result.success) {
        window.location.href = './login.html';
    }
}

// ============================================
// Search Functionality
// ============================================

function setupSearch() {
    const searchBar = document.querySelector('.search-bar');
    if (!searchBar) return;

    searchBar.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.story-card');

        cards.forEach(card => {
            const title = card.querySelector('.story-title')?.textContent.toLowerCase() || '';
            const author = card.querySelector('.story-author')?.textContent.toLowerCase() || '';

            if (title.includes(query) || author.includes(query)) {
                card.style.display = '';
                card.style.animation = 'fadeIn 0.3s ease forwards';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// ============================================
// Load and Display Stories
// ============================================

function loadStories() {
    const storiesGrid = document.querySelector('.stories-grid');
    if (!storiesGrid) return;

    // Sample stories data - you can replace with API call
    const stories = [
        {
            title: 'رحلة الحلم',
            author: 'أحمد علي',
            price: '49 ريال',
            image: 'https://via.placeholder.com/300x220/87ceeb/ffffff?text=رحلة+الحلم'
        },
        {
            title: 'في قلب المدينة',
            author: 'فاطمة محمود',
            price: '39 ريال',
            image: 'https://via.placeholder.com/300x220/87ceeb/ffffff?text=في+قلب+المدينة'
        },
        {
            title: 'صوت الهمس',
            author: 'محمد سعيد',
            price: '45 ريال',
            image: 'https://via.placeholder.com/300x220/87ceeb/ffffff?text=صوت+الهمس'
        },
        {
            title: 'نجوم الليل',
            author: 'ليلى جاد',
            price: '55 ريال',
            image: 'https://via.placeholder.com/300x220/87ceeb/ffffff?text=نجوم+الليل'
        },
        {
            title: 'أسرار البحر',
            author: 'سارة خليل',
            price: '50 ريال',
            image: 'https://via.placeholder.com/300x220/87ceeb/ffffff?text=أسرار+البحر'
        },
        {
            title: 'عبور الجسر',
            author: 'علي إبراهيم',
            price: '42 ريال',
            image: 'https://via.placeholder.com/300x220/87ceeb/ffffff?text=عبور+الجسر'
        },
        {
            title: 'ضوء القمر',
            author: 'نور عبدالله',
            price: '48 ريال',
            image: 'https://via.placeholder.com/300x220/87ceeb/ffffff?text=ضوء+القمر'
        },
        {
            title: 'خطوات الأمل',
            author: 'هناء عمر',
            price: '44 ريال',
            image: 'https://via.placeholder.com/300x220/87ceeb/ffffff?text=خطوات+الأمل'
        },
        {
            title: 'رسائل العشق',
            author: 'ياسمين أحمد',
            price: '52 ريال',
            image: 'https://via.placeholder.com/300x220/87ceeb/ffffff?text=رسائل+العشق'
        }
    ];

    storiesGrid.innerHTML = stories.map(story => `
        <div class="story-card">
            <div class="story-image-container">
                <img src="${story.image}" alt="${story.title}" class="story-image" onerror="this.src='https://via.placeholder.com/300x220/87ceeb/ffffff?text=صورة'">
            </div>
            <div class="story-content">
                <h3 class="story-title">${story.title}</h3>
                <p class="story-author">${story.author}</p>
                <p class="story-price">${story.price}</p>
            </div>
        </div>
    `).join('');

    // Add click handlers to cards
    document.querySelectorAll('.story-card').forEach(card => {
        card.addEventListener('click', () => {
            console.log('Story clicked:', card.querySelector('.story-title').textContent);
            // You can add navigation logic here
        });
    });
}

// ============================================
// Navigation Items Handler
// ============================================

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const action = this.dataset.action;
            
            if (action === 'home') {
                window.location.href = './index.html';
            } else if (action === 'best') {
                filterBestStories();
            } else if (action === 'support') {
                showAlert('خدمة الدعم الفني قريباً');
            }
        });
    });
}

function filterBestStories() {
    showAlert('جاري تحميل أفضل القصص...');
}

function showAlert(message) {
    alert(message);
}

// ============================================
// Initialize Navigation on Page Load
// ============================================

setupNavigation();
