// Initialize Firebase directly (same approach as working login/signup)
let auth, db;

const DEFAULT_AVATAR = './images/africa_numbers_cover.jpg'; // Updated default image for all admins

// Store user info in localStorage
function storeUserInfo(userData) {
    localStorage.setItem('sf_user', JSON.stringify(userData));
}

// Update the UI with admin info
function updateUserInfoDisplay(userData) {
    console.log('🖼️ Updating admin info display with data:', userData);
    
    if (!userData) {
        console.log('⚠️ No admin data provided to updateUserInfoDisplay');
        return;
    }
    
    // Update admin name - remove "Loading..." immediately
    const adminNameEl = document.getElementById('admin-name');
    if (adminNameEl) {
        const displayName = userData.fullName || userData.firstName || userData.displayName || 'Admin';
        adminNameEl.textContent = displayName;
        adminNameEl.style.opacity = '1';
        console.log('✅ Updated admin name to:', displayName);
    } else {
        console.log('❌ Element with id "admin-name" not found');
    }
    
    // Update admin role
    const adminRoleEl = document.getElementById('admin-role');
    if (adminRoleEl) {
        const displayRole = userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : 'Admin';
        adminRoleEl.textContent = displayRole;
        adminRoleEl.style.opacity = '1';
        console.log('✅ Updated admin role to:', displayRole);
    } else {
        console.log('❌ Element with id "admin-role" not found');
    }
    
    // Update avatar
    const avatarEl = document.querySelector('.user-profile .avatar');
    if (avatarEl) {
        avatarEl.src = userData.profilePicUrl || DEFAULT_AVATAR;
        avatarEl.style.opacity = '1';
        console.log('✅ Updated admin avatar');
    } else {
        console.log('❌ Admin avatar element not found');
    }
    
    console.log('🎉 Admin info display update completed');
}

async function setupLogout() {
    console.log('🚪 Setting up admin logout functionality...');
    
    // Wait a bit for DOM to be fully ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        console.log('✅ Admin logout button found, adding event listener');
        
        // Remove any existing listeners to avoid duplicates
        const newLogoutButton = logoutButton.cloneNode(true);
        logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);
        
        newLogoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('🔓 Admin logout button clicked');
            
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
                    console.log('🔥 Signing out admin from Firebase...');
                    await signOut(auth);
                    console.log('✅ Admin Firebase sign out successful');
                } else {
                    console.log('⚠️ No auth object available for admin sign out');
                }
                
                // Clear local storage
                console.log('🧹 Clearing admin localStorage...');
                localStorage.clear();
                sessionStorage.clear();
                console.log('✅ Admin storage cleared');
                
                // Redirect to login
                console.log('🔄 Redirecting admin to login page...');
                window.location.href = 'login.html';
                
            } catch (error) {
                console.error('❌ Admin logout error:', error);
                // Reset button state
                newLogoutButton.innerHTML = originalContent;
                newLogoutButton.disabled = false;
                
                // Even if Firebase logout fails, clear local storage and redirect
                console.log('🧹 Clearing admin localStorage despite error...');
                localStorage.clear();
                sessionStorage.clear();
                console.log('🔄 Redirecting admin to login despite error...');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            }
        });
    } else {
        console.log('❌ Admin logout button not found! Looking for element with id "logout-btn"');
        // Debug: Let's see what buttons are available
        const allButtons = document.querySelectorAll('button');
        console.log('🔍 Available admin buttons:', Array.from(allButtons).map(btn => ({ id: btn.id, class: btn.className, text: btn.textContent })));
        
        // Try again after a delay
        setTimeout(() => setupLogout(), 500);
    }
}

async function fetchAllUsers() {
    const usersTableBody = document.getElementById('users-table-body');
    const totalUsersCountEl = document.getElementById('total-users-count');
    if (!usersTableBody) return;
    
    try {
        // Import Firestore functions dynamically
        const { collection, onSnapshot } = await import("https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js");
        
        onSnapshot(collection(db, 'users'), (snapshot) => {
            if (totalUsersCountEl) {
                totalUsersCountEl.textContent = snapshot.size;
            }
            usersTableBody.innerHTML = snapshot.docs.map(doc => {
                const user = doc.data();
                const regDate = user.createdAt && user.createdAt.toDate ? user.createdAt.toDate().toLocaleDateString() : '';
                return `
                    <tr>
                        <td>${user.fullName}</td>
                        <td>${user.email}</td>
                        <td>${user.role}</td>
                        <td>${regDate}</td>
                        <td><span class="status-active">Active</span></td>
                    </tr>
                `;
            }).join('');
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Fetch admin info from Firestore or fallback to Auth info
async function fetchAndDisplayAdminInfo(user) {
    if (!user) return;
    
    try {
        // Import Firestore functions dynamically
        const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js");
        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        let userData;
        
        if (userDoc.exists()) {
            userData = userDoc.data();
            userData.email = user.email;
            userData.uid = user.uid;
            console.log('Admin data loaded from Firestore:', userData);
        } else {
            const emailName = user.email ? user.email.split('@')[0] : 'Admin';
            userData = {
                fullName: user.displayName || emailName,
                firstName: user.displayName?.split(' ')[0] || emailName,
                email: user.email,
                uid: user.uid,
                role: 'admin',
                profilePicUrl: user.photoURL || DEFAULT_AVATAR
            };
            console.log('Using fallback admin data:', userData);
        }
        
        storeUserInfo(userData);
        updateUserInfoDisplay(userData);
        
    } catch (err) {
        console.error('Error fetching admin info:', err);
        const userData = {
            fullName: user.displayName || 'Admin',
            email: user.email,
            uid: user.uid,
            role: 'admin',
            profilePicUrl: user.photoURL || DEFAULT_AVATAR
        };
        console.log('Using error fallback admin data:', userData);
        storeUserInfo(userData);
        updateUserInfoDisplay(userData);
    }
}

// Initialize Firebase and setup admin dashboard
async function initAdminDashboard() {
    console.log('🚀 Starting admin dashboard initialization...');
    
    // First, let's setup logout button immediately without waiting for Firebase
    try {
        console.log('🚪 Setting up basic admin logout functionality...');
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn && !logoutBtn.hasAttribute('data-initialized')) {
            logoutBtn.setAttribute('data-initialized', 'true');
            logoutBtn.addEventListener('click', () => {
                console.log('🔓 Basic admin logout clicked');
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = 'login.html';
            });
            console.log('✅ Basic admin logout setup complete');
        }
    } catch (basicLogoutError) {
        console.error('❌ Basic admin logout setup failed:', basicLogoutError);
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
        
        console.log('✅ Firebase initialized for admin dashboard');
        console.log('🔐 Auth object:', !!auth);
        console.log('🗄️ Firestore object:', !!db);
        
        // Setup logout functionality immediately
        console.log('🚪 Setting up logout functionality...');
        await setupLogout();
        
        // Setup authentication state listener
        console.log('👤 Setting up auth state listener...');
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('✅ Admin authenticated:', user.email);
                console.log('📋 Admin UID:', user.uid);
                // Immediately show basic admin info to remove "Loading..."
                updateUserInfoDisplay({
                    fullName: user.displayName || user.email.split('@')[0] || 'Admin',
                    email: user.email,
                    uid: user.uid,
                    role: 'admin'
                });
                // Then fetch complete admin info from Firestore
                fetchAndDisplayAdminInfo(user);
                // Load users list for admin after a short delay to ensure Firestore is ready
                setTimeout(() => {
                    console.log('👥 Loading users list...');
                    fetchAllUsers();
                }, 500);
            } else {
                console.log('❌ Admin not authenticated, redirecting to login');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            }
        });
        
        // Check current user immediately
        const currentUser = auth.currentUser;
        if (currentUser) {
            console.log('📋 Current admin found immediately:', currentUser.email);
        } else {
            console.log('⏳ No immediate current admin, waiting for auth state change...');
        }
        
    } catch (error) {
        console.error('❌ Admin dashboard initialization error:', error);
        console.error('Error details:', error.stack);
        
        // Immediate fallback - set basic admin info to remove "Loading..."
        console.log('🔄 Setting basic fallback admin info...');
        const adminNameEl = document.getElementById('admin-name');
        const adminRoleEl = document.getElementById('admin-role');
        
        if (adminNameEl && adminNameEl.textContent === 'Loading...') {
            adminNameEl.textContent = 'Admin';
            adminNameEl.style.opacity = '1';
        }
        if (adminRoleEl) {
            adminRoleEl.textContent = 'Administrator';
            adminRoleEl.style.opacity = '1';
        }
        
        // Try to load admin data from localStorage as fallback
        const savedUser = localStorage.getItem('sf_user');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                console.log('💾 Loading fallback admin data from localStorage:', userData);
                updateUserInfoDisplay(userData);
            } catch (parseError) {
                console.error('❌ Error parsing saved admin data:', parseError);
            }
        }
        
        console.log('⚠️ Dashboard loaded with basic info due to initialization error');
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing admin dashboard...');
    // Add a small delay to ensure all resources are loaded
    setTimeout(() => {
        initAdminDashboard();
    }, 100);
});

// Also try to initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM loaded, initializing admin dashboard...');
        setTimeout(() => {
            initAdminDashboard();
        }, 100);
    });
} else {
    console.log('📄 DOM already loaded, initializing admin dashboard immediately...');
    setTimeout(() => {
        initAdminDashboard();
    }, 100);
}

const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const location = document.getElementById('location').value;
        const role = document.getElementById('role').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) return alert("Passwords do not match.");
        if (!role) return alert('Please select a role.');
        if (password.length < 6) return alert("Password must be at least 6 characters long.");

        try {
            // Import Firebase functions dynamically
            const { createUserWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js");
            const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js");
            
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('About to write user to Firestore:', { firstName, lastName, email, phone, location, role });
            
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                firstName,
                lastName,
                fullName: `${firstName} ${lastName}`,
                email,
                phone,
                location,
                role,
                createdAt: new Date()
            });
            
            console.log('User written to Firestore!');
            alert('Sign up successful! Please proceed to login.');
            window.location.href = 'login.html';
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });
} 