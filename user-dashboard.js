// Initialize Firebase directly (same approach as working login/signup)
let auth, db;

const DEFAULT_AVATAR = './images/africa_numbers_cover.jpg'; // Updated default image for all users

// Store user info in localStorage
function storeUserInfo(userData) {
    localStorage.setItem('sf_user', JSON.stringify(userData));
}

// Update the UI with user info
function updateUserInfoDisplay(userData) {
    console.log('🖼️ Updating user info display with data:', userData);
    
    if (!userData) {
        console.log('⚠️ No user data provided to updateUserInfoDisplay');
        return;
    }
    
    // Update user name - remove "Loading..." immediately
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) {
        const displayName = userData.fullName || userData.firstName || userData.displayName || 'User';
        userNameEl.textContent = displayName;
        userNameEl.style.opacity = '1';
        console.log('✅ Updated user name to:', displayName);
    } else {
        console.log('❌ Element with id "user-name" not found');
    }
    
    // Update user role
    const roleEl = document.getElementById('user-role');
    if (roleEl) {
        const displayRole = userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : 'Farmer';
        roleEl.textContent = displayRole;
        roleEl.style.opacity = '1';
        console.log('✅ Updated user role to:', displayRole);
    } else {
        console.log('❌ Element with id "user-role" not found');
    }
    
    // Update avatar
    const avatarEl = document.querySelector('.user-profile .avatar');
    if (avatarEl) {
        avatarEl.src = userData.profilePicUrl || DEFAULT_AVATAR;
        avatarEl.style.opacity = '1';
        console.log('✅ Updated avatar');
    } else {
        console.log('❌ Avatar element not found');
    }
    
    // Update other optional elements
    const welcomeMsg = document.getElementById('welcome-message');
    if (welcomeMsg) {
        welcomeMsg.textContent = `Welcome back, ${userData.fullName || userData.firstName || userData.displayName || 'User'}!`;
        console.log('✅ Updated welcome message');
    }
    
    // Update additional user info if elements exist
    if (document.getElementById('user-email')) {
        document.getElementById('user-email').textContent = userData.email || '';
        console.log('✅ Updated user email');
    }
    if (document.getElementById('user-location')) {
        document.getElementById('user-location').textContent = userData.location || '';
        console.log('✅ Updated user location');
    }
    if (document.getElementById('user-phone')) {
        document.getElementById('user-phone').textContent = userData.phone || '';
        console.log('✅ Updated user phone');
    }
    
    console.log('🎉 User info display update completed');
}

// Logout handler with proper Firebase signOut
async function setupLogout() {
    console.log('🚪 Setting up logout functionality...');
    
    // Wait a bit for DOM to be fully ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        console.log('✅ Logout button found, adding event listener');
        
        // Remove any existing listeners to avoid duplicates
        const newLogoutButton = logoutButton.cloneNode(true);
        logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);
        
        newLogoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('🔓 Logout button clicked');
            
            // Show loading state
            const originalContent = newLogoutButton.innerHTML;
            newLogoutButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Logging out...</span>';
            newLogoutButton.disabled = true;
            
            try {
                // Import Firebase signOut function
                console.log('📦 Importing Firebase signOut function...');
                const { signOut } = await import("https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js");
                
                // Sign out from Firebase
                if (auth) {
                    console.log('🔥 Signing out from Firebase...');
                    await signOut(auth);
                    console.log('✅ Firebase sign out successful');
                } else {
                    console.log('⚠️ No auth object available for sign out');
                }
                
                // Clear local storage
                console.log('🧹 Clearing localStorage...');
                localStorage.clear();
                sessionStorage.clear();
                console.log('✅ Storage cleared');
                
                // Redirect to login
                console.log('🔄 Redirecting to login page...');
                window.location.href = 'login.html';
                
            } catch (error) {
                console.error('❌ Logout error:', error);
                // Reset button state
                newLogoutButton.innerHTML = originalContent;
                newLogoutButton.disabled = false;
                
                // Even if Firebase logout fails, clear local storage and redirect
                console.log('🧹 Clearing localStorage despite error...');
                localStorage.clear();
                sessionStorage.clear();
                console.log('🔄 Redirecting to login despite error...');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            }
        });
    } else {
        console.log('❌ Logout button not found! Looking for element with id "logout-btn"');
        // Debug: Let's see what buttons are available
        const allButtons = document.querySelectorAll('button');
        console.log('🔍 Available buttons:', Array.from(allButtons).map(btn => ({ id: btn.id, class: btn.className, text: btn.textContent })));
        
        // Try again after a delay
        setTimeout(() => setupLogout(), 500);
    }
}

// Fetch user info from Firestore or fallback to Auth info
async function fetchAndDisplayUserInfo(user) {
    if (!user) return;
    
    try {
        // Import Firestore functions dynamically
        const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js");
        
        // Always fetch fresh data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        let userData;
        
        if (userDoc.exists()) {
            userData = userDoc.data();
            userData.email = user.email;
            userData.uid = user.uid;
            console.log('User data loaded from Firestore:', userData);
        } else {
            // Fallback to Auth info if Firestore doc is missing
            const emailName = user.email ? user.email.split('@')[0] : 'User';
            userData = {
                fullName: user.displayName || emailName,
                firstName: user.displayName?.split(' ')[0] || emailName,
                email: user.email,
                uid: user.uid,
                role: 'farmer', // default role if missing
                profilePicUrl: user.photoURL || DEFAULT_AVATAR
            };
            console.log('Using fallback user data:', userData);
        }
        
        // Always overwrite localStorage with fresh data
        storeUserInfo(userData);
        updateUserInfoDisplay(userData);
        
    } catch (err) {
        console.error('Error fetching user info:', err);
        // Fallback to Auth info
        const userData = {
            fullName: user.displayName || 'User',
            email: user.email,
            uid: user.uid,
            role: 'farmer',
            profilePicUrl: user.photoURL || DEFAULT_AVATAR
        };
        console.log('Using error fallback user data:', userData);
        storeUserInfo(userData);
        updateUserInfoDisplay(userData);
    }
}

// Initialize Firebase and setup dashboard
async function initDashboard() {
    console.log('🚀 Starting dashboard initialization...');
    
    // First, let's setup logout button immediately without waiting for Firebase
    try {
        console.log('🚪 Setting up basic logout functionality...');
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn && !logoutBtn.hasAttribute('data-initialized')) {
            logoutBtn.setAttribute('data-initialized', 'true');
            logoutBtn.addEventListener('click', () => {
                console.log('🔓 Basic logout clicked');
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = 'login.html';
            });
            console.log('✅ Basic logout setup complete');
        }
    } catch (basicLogoutError) {
        console.error('❌ Basic logout setup failed:', basicLogoutError);
    }
    
    try {
        // Initialize Firebase
        console.log('📦 Importing Firebase modules...');
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js");
        const { getAuth, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js");
        const { getFirestore } = await import("https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js");
        
        const firebaseConfig = {
            apiKey: "AIzaSyBOJSo0b_AN4HB7wHVN8ERAAgGkilTnZWk",
            authDomain: "cmua-7957a.firebaseapp.com",
            databaseURL: "https://cmua-7957a-default-rtdb.firebaseio.com",
            projectId: "cmua-7957a",
            storageBucket: "cmua-7957a.appspot.com",
            messagingSenderId: "273566170303",
            appId: "1:273566170303:web:3d02105c5dd0e15e251a0a",
            measurementId: "G-0T0Q0TP91N"
        };
        
        console.log('🔧 Initializing Firebase app...');
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        
        console.log('✅ Firebase initialized for dashboard');
        console.log('🔐 Auth object:', !!auth);
        console.log('🗄️ Firestore object:', !!db);
        
        // Setup logout functionality immediately
        console.log('🚪 Setting up logout functionality...');
        await setupLogout();
        
        // Setup authentication state listener
        console.log('👤 Setting up auth state listener...');
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('✅ User authenticated:', user.email);
                console.log('📋 User UID:', user.uid);
                // Immediately show basic user info to remove "Loading..."
                updateUserInfoDisplay({
                    fullName: user.displayName || user.email.split('@')[0] || 'User',
                    email: user.email,
                    uid: user.uid,
                    role: 'farmer'
                });
                // Then fetch complete user info from Firestore
                fetchAndDisplayUserInfo(user);
            } else {
                console.log('❌ User not authenticated, redirecting to login');
                // Small delay to avoid redirect loops
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            }
        });
        
        // Check current user immediately
        const currentUser = auth.currentUser;
        if (currentUser) {
            console.log('📋 Current user found immediately:', currentUser.email);
        } else {
            console.log('⏳ No immediate current user, waiting for auth state change...');
        }
        
    } catch (error) {
        console.error('❌ Dashboard initialization error:', error);
        console.error('Error details:', error.stack);
        
        // Immediate fallback - set basic user info to remove "Loading..."
        console.log('🔄 Setting basic fallback user info...');
        const userNameEl = document.getElementById('user-name');
        const userRoleEl = document.getElementById('user-role');
        
        if (userNameEl && userNameEl.textContent === 'Loading...') {
            userNameEl.textContent = 'User';
            userNameEl.style.opacity = '1';
        }
        if (userRoleEl) {
            userRoleEl.textContent = 'Farmer';
            userRoleEl.style.opacity = '1';
        }
        
        // Try to load user data from localStorage as fallback
        const savedUser = localStorage.getItem('sf_user');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                console.log('💾 Loading fallback user data from localStorage:', userData);
                updateUserInfoDisplay(userData);
                // Still try to setup logout even with fallback data
                await setupLogout();
            } catch (parseError) {
                console.error('❌ Error parsing saved user data:', parseError);
                // Stay on dashboard with basic info rather than redirect
                console.log('⚠️ Staying on dashboard with basic info');
            }
        } else {
            console.log('⚠️ No fallback data available, showing basic info');
            // Don't redirect immediately, let user try to logout or navigate
        }
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing dashboard...');
    // Add a small delay to ensure all resources are loaded
    setTimeout(() => {
        initDashboard();
    }, 100);
});

// Also try to initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM loaded, initializing dashboard...');
        setTimeout(() => {
            initDashboard();
        }, 100);
    });
} else {
    console.log('📄 DOM already loaded, initializing dashboard immediately...');
    setTimeout(() => {
        initDashboard();
    }, 100);
} 