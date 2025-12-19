// COMPLETE FEATURE GATING SYSTEM
let currentUser = JSON.parse(localStorage.getItem('somni_user')) || null;

// Feature Check - PLAN DEPENDENT
function hasFeature(feature) {
    if (!currentUser) return false;
    if (currentUser.promo_used || currentUser.plan === 'elite') return true;
    
    const featureMap = {
        'feeling': ['core', 'pro', 'elite'],
        'weekly': ['pro', 'elite'],
        'recovery': ['pro', 'elite'],
        'coach': ['pro', 'elite'],
        'export': ['elite']
    };
    
    return featureMap[feature]?.includes(currentUser.plan) || false;
}

// Set Plan from PayPal/Promo
function setPlan(plan) {
    if (!currentUser) return;
    
    currentUser.plan = plan;
    switch(plan) {
        case 'core':
            currentUser.features = { feeling: true };
            break;
        case 'pro':
            currentUser.features = { feeling: true, weekly: true, recovery: true, coach: true };
            break;
        case 'elite':
            currentUser.features = { feeling: true, weekly: true, recovery: true, coach: true, export: true };
            break;
    }
    
    // Save to ALL users
    const users = JSON.parse(localStorage.getItem('somni_users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex > -1) users[userIndex] = currentUser;
    else users.push(currentUser);
    
    localStorage.setItem('somni_users', JSON.stringify(users));
    localStorage.setItem('somni_user', JSON.stringify(currentUser));
}

// PROMO CODE HANDLER
function applyPromoCode() {
    const code = document.getElementById('promo-input').value;
    if (code === 'TEST123') {
        if (!currentUser) {
            alert('Login first');
            return;
        }
        currentUser.promo_used = true;
        setPlan('elite');
        alert('✅ ELITE UNLOCKED FOREVER (Promo)');
        window.location.href = 'dashboard.html';
    } else {
        alert('❌ Invalid code');
    }
}

// PROTECTED PAGES - Redirect if no access
function protectPage(requiredFeature = null) {
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    
    if (requiredFeature && !hasFeature(requiredFeature)) {
        window.location.href = 'dashboard.html?upgrade=' + requiredFeature;
        return false;
    }
    return true;
}

// DASHBOARD UPDATE - Show/Hide Features
function updateDashboard() {
    if (!currentUser) return;
    
    // Plan badge
    const planBadge = document.getElementById('plan-status') || document.querySelector('#plan-badge');
    if (planBadge) {
        planBadge.innerHTML = currentUser.promo_used ? '⭐ ELITE (PROMO)' : 
                             currentUser.plan.toUpperCase() + ' PLAN';
    }
    
    // Lock/Unlock nav links
    document.querySelectorAll('.nav-menu .locked').forEach(link => {
        if (hasFeature('feeling') || currentUser.promo_used) {
            link.classList.remove('locked');
        }
    });
}

// Auto-run on load
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    
    // Protect pages
    const pageProtect = window.location.pathname.split('/').pop();
    if (['feeling.html', 'weekly.html'].includes(pageProtect)) {
        protectPage('feeling');
    }
    
    // URL plan upgrade
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('plan')) {
        setPlan(urlParams.get('plan'));
    }
});
