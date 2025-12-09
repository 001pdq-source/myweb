/* ============================================
   Global State & Configuration
   ============================================ */

const API_URL = 'http://localhost:3000/api';
let currentUser = null;
let currentStory = null;
let stripe = null;
let cardElement = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

/* ============================================
   Initialization Functions
   ============================================ */

function initializeApp() {
    applyStoredTheme();
    setupThemeToggle();
    setupUserMenu();
    setupEventListeners();
    initializeStripe();
    checkAuthStatus();
    loadStories();
}

function applyStoredTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    }
}

function initializeStripe() {
    const stripeKey = 'pk_test_YOUR_STRIPE_PUBLIC_KEY'; // Replace with actual key
    stripe = Stripe(stripeKey);
    const elements = stripe.elements();
    cardElement = elements.create('card', {
        style: {
            base: {
                fontSize: '16px',
                color: '#424242',
            }
        }
    });
}

function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
        verifyToken(token);
    } else {
        updateUIForLoggedOut();
    }
}

/* ============================================
   Theme Management
   ============================================ */

function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        updateThemeIcon(isDarkMode);
    });
}

function updateThemeIcon(isDarkMode) {
    const icon = document.getElementById('themeToggle').querySelector('i');
    if (isDarkMode) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
}

/* ============================================
   User Menu
   ============================================ */

function setupUserMenu() {
    const userMenuToggle = document.getElementById('userMenuToggle');
    const userDropdown = document.getElementById('userDropdown');

    userMenuToggle.addEventListener('click', () => {
        userDropdown.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!userMenuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('active');
        }
    });
}

/* ============================================
   Event Listeners Setup
   ============================================ */

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        filterStoriesBySearch(e.target.value);
    });
}

/* ============================================
   Page Navigation
   ============================================ */

function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Show selected page
    const pageElement = document.getElementById(page + 'Page');
    if (pageElement) {
        pageElement.classList.add('active');
        
        // Load page-specific data
        switch(page) {
            case 'profile':
                if (currentUser) loadProfilePage();
                else navigateTo('auth');
                break;
            case 'library':
                if (currentUser) loadLibraryPage();
                else navigateTo('auth');
                break;
            case 'admin':
                if (currentUser && currentUser.role === 'admin') loadAdminDashboard();
                else showNotification('ليس لديك صلاحيات للوصول إلى لوحة التحكم', 'error');
                break;
        }
    }
}

/* ============================================
   Story Loading & Display
   ============================================ */

async function loadStories() {
    try {
        const response = await fetch(`${API_URL}/stories`);
        const stories = await response.json();
        displayStories(stories);
    } catch (error) {
        console.error('Error loading stories:', error);
        showNotification('خطأ في تحميل القصص', 'error');
    }
}

function displayStories(stories) {
    const storiesGrid = document.getElementById('storiesGrid');
    storiesGrid.innerHTML = '';

    stories.forEach((story, index) => {
        const storyCard = createStoryCard(story);
        storyCard.style.animationDelay = `${index * 0.1}s`;
        storiesGrid.appendChild(storyCard);
    });
}

function createStoryCard(story) {
    const card = document.createElement('div');
    card.className = 'story-card';
    card.innerHTML = `
        <div class="story-image">
            <img src="${story.imageUrl}" alt="${story.title}" onerror="this.src='https://via.placeholder.com/300x200'">
        </div>
        <div class="story-content">
            <h3 class="story-title">${story.title}</h3>
            <p class="story-author">${story.author}</p>
            <p class="story-price">${story.price} ريال</p>
        </div>
    `;
    
    card.addEventListener('click', () => viewStoryDetail(story));
    return card;
}

function filterStoriesBySearch(query) {
    const cards = document.querySelectorAll('.story-card');
    cards.forEach(card => {
        const title = card.querySelector('.story-title').textContent.toLowerCase();
        const author = card.querySelector('.story-author').textContent.toLowerCase();
        
        if (title.includes(query.toLowerCase()) || author.includes(query.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterStories(type) {
    if (type === 'best') {
        showNotification('جاري تحميل أفضل القصص', 'success');
        // Implement filtering logic
    }
}

async function viewStoryDetail(story) {
    currentStory = story;
    document.getElementById('detailImage').src = story.imageUrl || 'https://via.placeholder.com/300x200';
    document.getElementById('detailTitle').textContent = story.title;
    document.getElementById('detailAuthor').textContent = `المؤلف: ${story.author}`;
    document.getElementById('detailDescription').textContent = story.description;
    document.getElementById('detailPrice').textContent = `${story.price} ريال`;
    document.getElementById('detailRating').textContent = `⭐ ${story.rating || 4.5}`;
    document.getElementById('detailCategory').textContent = story.category || 'عام';
    
    navigateTo('storyDetail');
}

/* ============================================
   Authentication Functions
   ============================================ */

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.getElementById(tab + 'Tab').classList.add('active');

    document.querySelectorAll('.auth-tab').forEach(btn => btn.classList.remove('active'));
    event.target?.classList.add('active');
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('authToken', data.token);
            currentUser = data.user;
            updateUIForLoggedIn();
            showNotification('تم تسجيل الدخول بنجاح', 'success');
            navigateTo('home');
        } else {
            showNotification(data.message || 'خطأ في البيانات المدخلة', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('حدث خطأ في الاتصال', 'error');
    }
}

async function handleSignup(event) {
    event.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const age = document.getElementById('signupAge').value;
    const gender = document.getElementById('signupGender').value;
    const password = document.getElementById('signupPassword').value;
    const password2 = document.getElementById('signupPassword2').value;

    if (password !== password2) {
        showNotification('كلمات المرور غير متطابقة', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, age, gender, password })
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني', 'success');
            switchAuthTab('verification');
            document.getElementById('verificationCode').dataset.email = email;
        } else {
            showNotification(data.message || 'خطأ في البيانات', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showNotification('حدث خطأ في الاتصال', 'error');
    }
}

async function handleVerification(event) {
    event.preventDefault();

    const code = document.getElementById('verificationCode').value;
    const email = document.getElementById('verificationCode').dataset.email;

    try {
        const response = await fetch(`${API_URL}/auth/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('تم التحقق من البريد الإلكتروني بنجاح', 'success');
            switchAuthTab('login');
        } else {
            showNotification(data.message || 'رمز التحقق غير صحيح', 'error');
        }
    } catch (error) {
        console.error('Verification error:', error);
        showNotification('حدث خطأ في الاتصال', 'error');
    }
}

async function handleForgotPassword(event) {
    event.preventDefault();

    const email = document.getElementById('forgotEmail').value;

    try {
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('تم إرسال رابط الاستعادة إلى بريدك الإلكتروني', 'success');
            setTimeout(() => switchAuthTab('login'), 2000);
        } else {
            showNotification(data.message || 'البريد الإلكتروني غير موجود', 'error');
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        showNotification('حدث خطأ في الاتصال', 'error');
    }
}

async function verifyToken(token) {
    try {
        const response = await fetch(`${API_URL}/auth/verify-token`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            updateUIForLoggedIn();
        } else {
            localStorage.removeItem('authToken');
            updateUIForLoggedOut();
        }
    } catch (error) {
        console.error('Token verification error:', error);
        updateUIForLoggedOut();
    }
}

function updateUIForLoggedIn() {
    if (currentUser?.role === 'admin') {
        document.getElementById('adminLink').style.display = 'block';
    }
}

function updateUIForLoggedOut() {
    currentUser = null;
    document.getElementById('adminLink').style.display = 'none';
}

async function handleLogout() {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
    } catch (error) {
        console.error('Logout error:', error);
    }

    localStorage.removeItem('authToken');
    currentUser = null;
    updateUIForLoggedOut();
    showNotification('تم تسجيل الخروج', 'success');
    navigateTo('home');
}

/* ============================================
   Payment Functions
   ============================================ */

function handleBuyClick() {
    if (!currentUser) {
        showNotification('يرجى تسجيل الدخول أولاً', 'error');
        navigateTo('auth');
        return;
    }

    document.getElementById('paymentStoryTitle').textContent = currentStory.title;
    document.getElementById('paymentPrice').textContent = `السعر: ${currentStory.price} ريال`;
    
    if (cardElement && !cardElement.mount) {
        cardElement.mount('#card-element');
    }
    
    navigateTo('payment');
}

async function handlePayment(event) {
    event.preventDefault();

    if (!stripe || !cardElement) {
        showNotification('خدمة الدفع غير متاحة', 'error');
        return;
    }

    const paymentButton = document.getElementById('paymentButton');
    paymentButton.disabled = true;
    paymentButton.textContent = 'جاري المعالجة...';

    try {
        // Create payment intent on server
        const response = await fetch(`${API_URL}/payments/create-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                storyId: currentStory._id,
                amount: currentStory.price * 100
            })
        });

        const { clientSecret } = await response.json();

        // Confirm payment
        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: { name: currentUser.name }
            }
        });

        if (result.error) {
            showNotification(result.error.message, 'error');
        } else if (result.paymentIntent.status === 'succeeded') {
            showNotification('تم الدفع بنجاح! تم إضافة القصة إلى مكتبتك', 'success');
            navigateTo('home');
        }
    } catch (error) {
        console.error('Payment error:', error);
        showNotification('حدث خطأ في عملية الدفع', 'error');
    } finally {
        paymentButton.disabled = false;
        paymentButton.textContent = 'الدفع';
    }
}

/* ============================================
   Profile Functions
   ============================================ */

function loadProfilePage() {
    if (!currentUser) return;

    const profileInfo = document.getElementById('profileInfo');
    profileInfo.innerHTML = `
        <div class="profile-info">
            <p><strong>الاسم:</strong> ${currentUser.name}</p>
            <p><strong>البريد الإلكتروني:</strong> ${currentUser.email}</p>
            <p><strong>السن:</strong> ${currentUser.age}</p>
            <p><strong>الجنس:</strong> ${currentUser.gender || 'غير محدد'}</p>
            <p><strong>تاريخ الانضمام:</strong> ${new Date(currentUser.createdAt).toLocaleDateString('ar-SA')}</p>
        </div>
    `;
}

/* ============================================
   Library Functions
   ============================================ */

async function loadLibraryPage() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_URL}/users/library`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });

        const { stories } = await response.json();
        const libraryGrid = document.getElementById('libraryGrid');
        libraryGrid.innerHTML = '';

        if (stories.length === 0) {
            libraryGrid.innerHTML = '<p>لم تقم بشراء أي قصص بعد</p>';
            return;
        }

        stories.forEach(story => {
            const card = createStoryCard(story);
            libraryGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading library:', error);
        showNotification('خطأ في تحميل مكتبتك', 'error');
    }
}

/* ============================================
   Admin Dashboard Functions
   ============================================ */

function switchAdminTab(tab) {
    document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tab + 'Tab').classList.add('active');

    document.querySelectorAll('.admin-tab').forEach(btn => btn.classList.remove('active'));
    event.target?.classList.add('active');

    switch(tab) {
        case 'stories':
            loadAdminStories();
            break;
        case 'users':
            loadAdminUsers();
            break;
        case 'purchases':
            loadAdminPurchases();
            break;
        case 'analytics':
            loadAdminAnalytics();
            break;
    }
}

async function loadAdminDashboard() {
    loadAdminAnalytics();
}

async function loadAdminStories() {
    try {
        const response = await fetch(`${API_URL}/admin/stories`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });

        const stories = await response.json();
        const grid = document.getElementById('storiesManagementGrid');
        grid.innerHTML = '';

        stories.forEach(story => {
            const card = document.createElement('div');
            card.className = 'story-card';
            card.innerHTML = `
                <div class="story-image">
                    <img src="${story.imageUrl}" alt="${story.title}">
                </div>
                <div class="story-content">
                    <h3 class="story-title">${story.title}</h3>
                    <p class="story-price">${story.price} ريال</p>
                    <div style="margin-top: 10px; display: flex; gap: 10px;">
                        <button class="form-button" style="flex: 1; padding: 5px;" onclick="editStory('${story._id}')">تعديل</button>
                        <button class="form-button" style="flex: 1; padding: 5px; background-color: #e74c3c;" onclick="deleteStory('${story._id}')">حذف</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading admin stories:', error);
    }
}

async function loadAdminUsers() {
    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });

        const users = await response.json();
        const table = document.getElementById('usersTable');
        
        table.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>الاسم</th>
                        <th>البريد الإلكتروني</th>
                        <th>السن</th>
                        <th>الدور</th>
                        <th>تاريخ الانضمام</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.age}</td>
                            <td>${user.role}</td>
                            <td>${new Date(user.createdAt).toLocaleDateString('ar-SA')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function loadAdminPurchases() {
    try {
        const response = await fetch(`${API_URL}/admin/purchases`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });

        const purchases = await response.json();
        const table = document.getElementById('purchasesTable');
        
        table.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>المستخدم</th>
                        <th>القصة</th>
                        <th>المبلغ</th>
                        <th>التاريخ</th>
                    </tr>
                </thead>
                <tbody>
                    ${purchases.map(purchase => `
                        <tr>
                            <td>${purchase.userId.name}</td>
                            <td>${purchase.storyId.title}</td>
                            <td>${purchase.amount} ريال</td>
                            <td>${new Date(purchase.createdAt).toLocaleDateString('ar-SA')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading purchases:', error);
    }
}

async function loadAdminAnalytics() {
    try {
        const response = await fetch(`${API_URL}/admin/analytics`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });

        const analytics = await response.json();
        document.getElementById('totalUsers').textContent = analytics.totalUsers;
        document.getElementById('totalStories').textContent = analytics.totalStories;
        document.getElementById('totalPurchases').textContent = analytics.totalPurchases;
        document.getElementById('totalRevenue').textContent = `${analytics.totalRevenue} ريال`;
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function showAddStoryForm() {
    document.getElementById('storyFormModal').classList.add('active');
}

async function handleAddStory(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('title', document.getElementById('storyTitle').value);
    formData.append('author', document.getElementById('storyAuthor').value);
    formData.append('description', document.getElementById('storyDescription').value);
    formData.append('category', document.getElementById('storyCategory').value);
    formData.append('price', document.getElementById('storyPrice').value);
    formData.append('image', document.getElementById('storyImage').files[0]);

    try {
        const response = await fetch(`${API_URL}/admin/stories`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
            body: formData
        });

        if (response.ok) {
            showNotification('تم إضافة القصة بنجاح', 'success');
            closeModal('storyFormModal');
            loadAdminStories();
        } else {
            showNotification('خطأ في إضافة القصة', 'error');
        }
    } catch (error) {
        console.error('Error adding story:', error);
        showNotification('حدث خطأ في الاتصال', 'error');
    }
}

async function deleteStory(storyId) {
    if (!confirm('هل تريد حذف هذه القصة؟')) return;

    try {
        const response = await fetch(`${API_URL}/admin/stories/${storyId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });

        if (response.ok) {
            showNotification('تم حذف القصة بنجاح', 'success');
            loadAdminStories();
        }
    } catch (error) {
        console.error('Error deleting story:', error);
    }
}

function editStory(storyId) {
    showNotification('ميزة التعديل قيد الإنشاء', 'warning');
}

/* ============================================
   Modal Functions
   ============================================ */

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

/* ============================================
   Notification Toast
   ============================================ */

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/* ============================================
   Utility Functions
   ============================================ */

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
