/* ============================================
   Sample Stories Data
   (EASY TO EDIT - Modify titles, images, and descriptions here)
   ============================================ */

const stories = [
    {
        id: 1,
        title: "آخر المغامرات",
        
        image: "https://via.placeholder.com/400x300/87ceeb/ffffff?text=آخر+المغامرات",
        description: "قصة مثيرة عن الاستكشاف والاكتشاف. انضم إلى بطلنا في رحلة ملحمية عبر الجبال والوديان، حيث يحمل كل خطوة عجائب وتحديات جديدة. اختبر جمال الطبيعة وقوة الروح الإنسانية."
    },
    {
        id: 2,
        title: "همسات في الظلام",
        
        image: "https://via.placeholder.com/400x300/87ceeb/ffffff?text=همسات+في+الظلام",
        description: "قصة غامضة تتكشف في الظلال. اتبع البطل وهو يكتشف الأسرار المخفية في الظلام. الغموض والتشويق ينتظران في كل زاوية من هذه القصة الرائعة."
    },
    {
        id: 3,
        title: "حب عبر الحدود",
       
        image: "https://via.placeholder.com/400x300/87ceeb/ffffff?text=حب+عبر+الحدود",
        description: "قصة حب جميلة تتجاوز الحدود الجغرافية. نفسان من عالمين مختلفين يلتقيان ويكتشفان أن الحب لا يعرف حدوداً. قصة خالدة عن التواصل والتفاني."
    },
    {
        id: 4,
        title: "المدينة المفقودة",
        
        image: "https://via.placeholder.com/400x300/87ceeb/ffffff?text=المدينة+المفقودة",
        description: "مغامرة أثرية في حضارة منسية. يكتشف الآثاريون بقايا مدينة أسطورية ويفك لغز أسرارها القديمة. التاريخ يعود للحياة في هذه الرحلة المثيرة."
    },
    {
        id: 5,
        title: "سر المحيط",
        
        image: "https://via.placeholder.com/400x300/87ceeb/ffffff?text=سر+المحيط",
        description: "اغوص عميقاً في أسرار المحيط. اكتشف ما يكمن تحت الأمواج في هذه المغامرة الساحرة تحت الماء. عالم من العجائب ينتظر في أعماق البحر."
    },
    {
        id: 6,
        title: "الغموض في منتصف الليل",
        
        image: "https://via.placeholder.com/400x300/87ceeb/ffffff?text=الغموض+في+منتصف",
        description: "قصة مشبوهة تتكشف عندما يحل الظلام. العمل الاستقصائي والأدلة المخفية والمنعطفات غير المتوقعة. حل اللغز قبل أن ينقضي منتصف الليل."
    },
    {
        id: 7,
        title: "بين النجوم",
       
        image: "https://via.placeholder.com/400x300/87ceeb/ffffff?text=بين+النجوم",
        description: "رحلة كونية إلى المجرات البعيدة. انضم إلى رواد الفضاء في رحلتهم خارج نظامنا الشمسي. الخيال العلمي يلتقي بالعجائب في هذه الرحلة النجمية."
    },
    {
        id: 8,
        title: "الصرخة الصامتة",
       
        image: "https://via.placeholder.com/400x300/87ceeb/ffffff?text=الصرخة+الصامتة",
        description: "إثارة نفسية مرعبة. عندما يصبح الصمت مرعباً، الأسرار تهدد بتدمير كل شيء. قصة مقلقة ستحافظ على استيقاظك في الليل."
    },
    {
        id: 9,
        title: "أحلام الغد",
       
        image: "https://via.placeholder.com/400x300/87ceeb/ffffff?text=أحلام+الغد",
        description: "قصة مرهونة عن الأحلام والطموحات. تابع الشخصيات وهي تسعى لتحقيق أعمق رغباتها وتتغلب على العقبات. الأمل والعزم يتألقان في هذه القصة المرفوعة."
    },
    {
        id: 10,
        title: "صدى الأمس",
        
        image: "https://via.placeholder.com/400x300/87ceeb/ffffff?text=صدى+الأمس",
        description: "رحلة حنينية عبر الزمن والذاكرة. الألحان والحزن يتشابكان حيث يعود الماضي ليزور الحاضر. استكشاف حزين للحب والفقدان."
    },
    {
        id: 11,
        title: "الغابة المسحورة",
        
        image: "https://via.placeholder.com/400x300/87ceeb/ffffff?text=الغابة+المسحورة",
        description: "ادخل إلى عالم سحري حيث تحيا الطبيعة. السحر والعجائب تملأ كل زاوية من هذه الغابة الغامضة. قصة خيالية للعصر الحديث."
    },
    {
        id: 12,
        title: "أسرار القلب",
        
        image: "https://via.placeholder.com/400x300/87ceeb/ffffff?text=أسرار+القلب",
        description: "استكشاف طري للعواطف الإنسانية والعلاقات. اكتشف الأعماق المخفية للقلب الإنساني. الحب والفقدان والشفاء تتحد في هذه الرواية المؤثرة."
    }
];

/* ============================================
   DOM Elements
   ============================================ */

const themeToggle = document.getElementById('themeToggle');
const userFormModal = document.getElementById('userFormModal');
const userGreeting = document.getElementById('userGreeting');
const userName = document.getElementById('userName');
const userAge = document.getElementById('userAge');
const greetingText = document.getElementById('greetingText');
const storiesGrid = document.getElementById('storiesGrid');
const searchInput = document.getElementById('searchInput');
const homePage = document.getElementById('homePage');
const storyPage = document.getElementById('storyPage');
const navButtons = document.querySelectorAll('.nav-btn');

let currentUser = null;
let filteredStories = [...stories];

/* ============================================
   Initialize App
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initUser();
    loadStories();
    setupSearch();
    setupNavigation();
});

/* ============================================
   Theme Toggle
   ============================================ */

function initTheme() {
    // Check if dark mode was previously saved
    const isDark = localStorage.getItem('hikayaDarkMode') === 'true';
    
    if (isDark) {
        document.body.classList.add('dark-mode');
        updateThemeIcon();
    }

    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('hikayaDarkMode', isDarkMode);
        updateThemeIcon();
    });
}

function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    if (document.body.classList.contains('dark-mode')) {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-sun';
    }
}

/* ============================================
   User Management
   ============================================ */

function initUser() {
    // Check if user data exists in localStorage
    const savedUser = localStorage.getItem('hikayaUser');
    
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showUserGreeting();
            hideUserForm();
        } catch (e) {
            showUserForm();
        }
    } else {
        showUserForm();
    }
}

function submitUserInfo() {
    const name = userName.value.trim();
    const age = userAge.value.trim();
    const errorDiv = document.getElementById('formError');

    // Validation
    if (!name) {
        errorDiv.textContent = 'يرجى إدخال اسمك';
        errorDiv.classList.add('show');
        return;
    }

    if (!age || age < 1 || age > 150) {
        errorDiv.textContent = 'يرجى إدخال عمر صحيح';
        errorDiv.classList.add('show');
        return;
    }

    // Save user data to localStorage
    currentUser = { name, age };
    localStorage.setItem('hikayaUser', JSON.stringify(currentUser));

    // Update UI
    hideUserForm();
    showUserGreeting();

    // Clear form
    userName.value = '';
    userAge.value = '';
    errorDiv.classList.remove('show');
}

function showUserForm() {
    userFormModal.classList.remove('hidden');
    userGreeting.classList.add('hidden');
}

function hideUserForm() {
    userFormModal.classList.add('hidden');
}

function showUserGreeting() {
    userGreeting.classList.remove('hidden');
    if (currentUser) {
        greetingText.textContent = `هلا بالشيخ ${currentUser.name}!`;
    }
}

function resetUser() {
    // Remove user data from localStorage
    localStorage.removeItem('hikayaUser');
    currentUser = null;
    
    // Reset UI
    userGreeting.classList.add('hidden');
    showUserForm();
    userName.focus();
}

/* ============================================
   Stories Functions
   ============================================ */

function loadStories(storiesToDisplay = stories) {
    storiesGrid.innerHTML = '';

    storiesToDisplay.forEach((story) => {
        const storyCard = document.createElement('div');
        storyCard.className = 'story-card';
        storyCard.innerHTML = `
            <div class="story-image">
                ${story.emoji}
            </div>
            <div class="story-content">
                <h3 class="story-title">${story.title}</h3>
            </div>
        `;

        storyCard.addEventListener('click', () => {
            viewStory(story.id);
        });

        storiesGrid.appendChild(storyCard);
    });
}

function viewStory(storyId) {
    const story = stories.find(s => s.id === storyId);
    
    if (story) {
        // Update story detail page
        document.getElementById('storyDetailImage').src = story.image;
        document.getElementById('storyDetailImage').alt = story.title;
        document.getElementById('storyDetailTitle').textContent = story.title;
        document.getElementById('storyDetailDescription').textContent = story.description;

        // Switch pages
        homePage.classList.remove('active');
        storyPage.classList.add('active');

        // Scroll to top
        window.scrollTo(0, 0);
    }
}

function goHome() {
    storyPage.classList.remove('active');
    homePage.classList.add('active');
    window.scrollTo(0, 0);
}

function readStory() {
    alert('عارض محتوى القصة قادم قريباً!');
}

/* ============================================
   Search Functionality
   ============================================ */

function setupSearch() {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();

        if (searchTerm === '') {
            filteredStories = [...stories];
        } else {
            filteredStories = stories.filter(story =>
                story.title.toLowerCase().includes(searchTerm)
            );
        }
        
        loadStories(filteredStories);
    });
}

/* ============================================
   Navigation
   ============================================ */

function setupNavigation() {
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function goToPage(page) {
    switch (page) {
        case 'home':
            loadStories(stories);
            filteredStories = [...stories];
            searchInput.value = '';
            console.log('الرئيسية');
            break;
        case 'best':
            const bestStories = stories.slice(0, 6);
            loadStories(bestStories);
            console.log('أفضل القصص');
            break;
        case 'support':
            alert('صفحة الدعم الفني قريباً...');
            console.log('الدعم الفني');
            break;
        default:
            console.log('صفحة غير معروفة');
    }
}

/* ============================================
   Utility Functions
   ============================================ */

// Smooth scroll to top on page load
window.addEventListener('load', () => {
    window.scrollTo(0, 0);
});

// Add event listeners for keyboard shortcuts (optional)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        searchInput.value = '';
        loadStories(stories);
    }
});

// Handle Enter key in form
userName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') userAge.focus();
});

userAge.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitUserInfo();
});
