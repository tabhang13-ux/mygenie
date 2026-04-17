document.addEventListener('DOMContentLoaded', () => {
    // ==== STATE MANAGEMENT ====
    let isAdmin = false;
    let wishes = [];
    const STORAGE_KEY = 'genie_wishes';

    // Default Wishes (if local storage is empty)
    const defaultWishes = [
        { id: '1', title: 'Pune Cyclothon 2026', role: 'NEED 100 BOYS & GIRLS', location: 'Pune', date: '12-04-2026', payment: '₹800/day' },
        { id: '2', title: 'India Fastener Show', role: 'Registration', location: 'Pune', date: '09-04-2026', payment: '₹1200/day' },
        { id: '3', title: 'Tech Expo Mumbai', role: 'Stall Helper', location: 'Mumbai', date: '15-04-2026', payment: '₹1000/day' }
    ];

    // ==== 1. LOCAL STORAGE DATABASE ENGINE ====
    const loadWishes = () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            wishes = JSON.parse(stored);
        } else {
            wishes = [...defaultWishes];
            saveWishes();
        }
    };

    const saveWishes = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
        updateWishCounter();
    };

    // ==== 2. TOAST NOTIFICATION SYSTEM ====
    const showToast = (message, type = 'success') => {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = '✅';
        if (type === 'error') icon = '❌';
        if (type === 'info') icon = 'ℹ️';

        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);

        // Animate out and remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    // ==== 3. WISHES RENDERING & SKELETONS ====
    const wishesContainer = document.getElementById('wishes-container');
    const wishCounter = document.getElementById('wish-counter');

    const updateWishCounter = () => {
        if(wishCounter) wishCounter.textContent = `${wishes.length} Active Wishes Available`;
    };

    const renderSkeletons = () => {
        wishesContainer.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            wishesContainer.innerHTML += `
                <div class="skeleton">
                    <div class="skel-title"></div>
                    <div class="skel-text"></div>
                    <div class="skel-text short"></div>
                    <div class="skel-btn"></div>
                </div>
            `;
        }
    };

    const renderWishes = (filterText = '') => {
        wishesContainer.innerHTML = '';
        
        const filteredWishes = wishes.filter(w => 
            w.title.toLowerCase().includes(filterText.toLowerCase()) || 
            w.location.toLowerCase().includes(filterText.toLowerCase())
        );

        if (filteredWishes.length === 0) {
            wishesContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No wishes found matching your search.</p>`;
            return;
        }

        filteredWishes.forEach(wish => {
            const card = document.createElement('div');
            card.className = 'wish-card';
            
            // Generate Random Badge based on role
            let badgeColor = 'var(--primary)';
            let badgeText = 'Event';
            if(wish.role.toLowerCase().includes('registration')) { badgeText = 'Registration'; badgeColor = '#8b5cf6'; }
            if(wish.role.toLowerCase().includes('helper')) { badgeText = 'Helper'; badgeColor = '#f59e0b'; }

            card.innerHTML = `
                <div>
                    <span class="wish-badge" style="color: ${badgeColor}; border-color: ${badgeColor};">${badgeText}</span>
                    <h3>${wish.title}</h3>
                    <p><strong>Role:</strong> ${wish.role}</p>
                    <p><strong>Payment:</strong> ${wish.payment}</p>
                    <p class="wish-meta">📍 ${wish.location} | 📅 ${wish.date}</p>
                </div>
                <div class="wish-actions">
                    <button class="btn btn-primary show-interest-btn" data-id="${wish.id}">Show Interest</button>
                    <button class="btn btn-secondary share-btn" data-title="${wish.title}" data-loc="${wish.location}">Share</button>
                    ${isAdmin ? `<button class="btn btn-danger delete-btn" data-id="${wish.id}">Delete</button>` : ''}
                </div>
            `;
            wishesContainer.appendChild(card);
        });

        attachWishEventListeners();
    };

    // ==== 4. WISH ACTIONS (Share, Delete, WhatsApp Modal) ====
    const attachWishEventListeners = () => {
        // Show Interest -> WhatsApp
        document.querySelectorAll('.show-interest-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const whatsappModal = document.getElementById('whatsapp-modal');
                if(whatsappModal) whatsappModal.classList.add('active');
            });
        });

        // Share Feature
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const title = e.target.getAttribute('data-title');
                const loc = e.target.getAttribute('data-loc');
                const textToCopy = `Check out this Genie Workforce gig: ${title} in ${loc}! Sign up at https://geniework-force.vercel.app/`;
                
                navigator.clipboard.writeText(textToCopy).then(() => {
                    showToast('Link copied to clipboard!', 'info');
                });
            });
        });

        // Delete (Admin Only)
        if (isAdmin) {
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    wishes = wishes.filter(w => w.id !== id);
                    saveWishes();
                    renderWishes(document.getElementById('search-wishes').value);
                    showToast('Wish deleted permanently.', 'error');
                });
            });
        }
    };

    // Initial Load
    loadWishes();
    renderSkeletons();
    setTimeout(() => {
        renderWishes();
        updateWishCounter();
    }, 800); // Fake loading delay for effect

    // ==== 5. SEARCH BAR LOGIC ====
    const searchInput = document.getElementById('search-wishes');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderWishes(e.target.value);
        });
    }

    // ==== 6. POST WISH (ADMIN ONLY) ====
    const postWishForm = document.getElementById('post-wish-form');
    if (postWishForm) {
        postWishForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newWish = {
                id: Date.now().toString(),
                title: document.getElementById('wish-title').value,
                location: document.getElementById('wish-location').value,
                role: document.getElementById('wish-role').value,
                date: document.getElementById('wish-date').value,
                payment: document.getElementById('wish-payment').value
            };

            wishes.unshift(newWish); // Add to beginning
            saveWishes();
            renderWishes();
            postWishForm.reset();
            showToast('Wish successfully posted!', 'success');
            
            // Scroll to wishes
            document.getElementById('hot-wishes').scrollIntoView({behavior: 'smooth'});
        });
    }

    // ==== 7. DARK MODE TOGGLE ====
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const html = document.documentElement;
            if (html.getAttribute('data-theme') === 'light') {
                html.setAttribute('data-theme', 'dark');
                themeToggle.textContent = '☀️';
                showToast('Dark mode activated', 'info');
            } else {
                html.setAttribute('data-theme', 'light');
                themeToggle.textContent = '🌙';
                showToast('Light mode activated', 'info');
            }
        });
    }

    // ==== 8. SCROLL TO TOP BUTTON ====
    const scrollTopBtn = document.getElementById('scroll-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ==== 9. FIND WISHES BANNER SCROLL ====
    const findWishesBtn = document.getElementById('find-wishes-btn');
    if (findWishesBtn) {
        findWishesBtn.addEventListener('click', () => {
            document.getElementById('hot-wishes').scrollIntoView({behavior: 'smooth'});
        });
    }

    // ==== 10. ADMIN AUTHENTICATION & MODALS ====
    const loginModal = document.getElementById('login-modal');
    const subscriptionModal = document.getElementById('subscription-modal');
    const whatsappModal = document.getElementById('whatsapp-modal');
    const volunteerModal = document.getElementById('volunteer-modal');
    const postWishSection = document.getElementById('post-wish-section');
    
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const loginForm = document.getElementById('login-form');
    const volunteerForm = document.getElementById('volunteer-form');

    // Open/Close Modals
    const openModal = (modal) => { if(modal) modal.classList.add('active'); };
    const closeModal = (modal) => { if(modal) modal.classList.remove('active'); };

    if (loginBtn) loginBtn.addEventListener('click', () => openModal(loginModal));
    if (signupBtn) signupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(volunteerModal);
    });
    
    // Close Buttons
    document.getElementById('close-login')?.addEventListener('click', () => closeModal(loginModal));
    document.getElementById('close-volunteer')?.addEventListener('click', () => closeModal(volunteerModal));
    document.getElementById('close-subscription')?.addEventListener('click', () => closeModal(subscriptionModal));
    document.getElementById('close-whatsapp')?.addEventListener('click', () => closeModal(whatsappModal));
    document.getElementById('done-subscription')?.addEventListener('click', () => closeModal(subscriptionModal));
    document.getElementById('open-subscription')?.addEventListener('click', () => {
        closeModal(loginModal);
        openModal(subscriptionModal);
    });

    // Close on overlay click
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) closeModal(loginModal);
        if (e.target === subscriptionModal) closeModal(subscriptionModal);
        if (e.target === whatsappModal) closeModal(whatsappModal);
        if (e.target === volunteerModal) closeModal(volunteerModal);
    });

    // Handle Admin Login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('login-username').value;
            const passwordInput = document.getElementById('login-password').value;

            if (usernameInput === 'Tushar Abhang' && passwordInput === 'Tushar@123') {
                isAdmin = true;
                closeModal(loginModal);
                
                // Unlock Admin UI
                postWishSection.style.display = 'block';
                loginBtn.textContent = 'Logout';
                loginBtn.classList.replace('btn-outline', 'btn-danger');
                
                showToast('Logged in as Admin. You can now post and delete wishes.', 'success');
                
                // Re-render wishes to show delete buttons
                renderWishes();

                // Override login button to act as logout
                loginBtn.onclick = (event) => {
                    event.preventDefault();
                    isAdmin = false;
                    postWishSection.style.display = 'none';
                    loginBtn.textContent = 'Login (Admin)';
                    loginBtn.classList.replace('btn-danger', 'btn-outline');
                    loginBtn.onclick = null;
                    loginBtn.addEventListener('click', () => openModal(loginModal)); // Restore original
                    renderWishes(); // Remove delete buttons
                    showToast('Logged out securely.', 'info');
                };
            } else {
                // Login Failed -> Show Subscription Option
                showToast('Invalid admin credentials. Please subscribe.', 'error');
                closeModal(loginModal);
                openModal(subscriptionModal);
            }
        });
    }

    // Handle Volunteer Sign in
    if (volunteerForm) {
        volunteerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('vol-name').value;
            closeModal(volunteerModal);
            showToast(`Welcome, ${name}! You are signed in as a student.`, 'success');
            
            // Optionally change "Sign Up" text to profile
            if (signupBtn) {
                signupBtn.textContent = 'Student Profile';
            }
        });
    }

    // ==== UI COMPONENT LOGIC (Menus, Headers, Accordion) ====
    // Mobile Menu Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const spans = navToggle.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'translateY(8px) rotate(45deg)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'translateY(-8px) rotate(-45deg)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // Sticky Header
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });

    // FAQ Accordion
    document.querySelectorAll('.faq-item').forEach(item => {
        item.querySelector('.faq-question').addEventListener('click', () => {
            document.querySelectorAll('.faq-item').forEach(other => {
                if (other !== item) other.classList.remove('active');
            });
            item.classList.toggle('active');
        });
    });

    // Join WhatsApp Event (just close modal on click)
    document.getElementById('join-whatsapp-btn')?.addEventListener('click', () => {
        closeModal(whatsappModal);
        showToast('Redirecting to WhatsApp...', 'success');
    });
});
