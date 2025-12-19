// FIXED: Persistent Login + Working Demo + Hidden Promo
let currentUser = JSON.parse(localStorage.getItem('somni_user')) || null;

// Theme - Fixed
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        document.body.classList.toggle('light-mode', savedTheme === 'light');
        themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        
        themeToggle.onclick = () => {
            document.body.classList.toggle('dark-mode');
            document.body.classList.toggle('light-mode');
            const isDark = document.body.classList.contains('dark-mode');
            themeToggle.textContent = isDark ? '☀️' : '🌙';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        };
    }
    
    // Auto-login check
    checkAuth();
    
    // Demo calculator
    if (document.getElementById('demo-bed')) setupDemo();
});

// FIXED DEMO - Works Now
function setupDemo() {
    document.getElementById('demo-bed').onchange = calculateDemoDebt;
    document.getElementById('demo-wake').onchange = calculateDemoDebt;
    document.getElementById('demo-sport').onchange = calculateDemoDebt;
    calculateDemoDebt(); // Initial calc
}

function calculateDemoDebt() {
    const bed = document.getElementById('demo-bed').value;
    const wake = document.getElementById('demo-wake').value;
    const sport = parseFloat(document.getElementById('demo-sport').value);
    
    const bedTime = new Date('2000-01-01T' + bed);
    const wakeTime = new Date('2000-01-01T' + wake);
    let duration = (wakeTime - bedTime) / (1000 * 60 * 60);
    if (duration < 0) duration += 24;
    
    const idealNight = 7.5 + sport;
    const debt = Math.max(0, idealNight - duration);
    
    document.getElementById('demo-result').innerHTML = `
        <div style="font-size:1.8rem;color:#ef4444;margin:1rem 0;">
            ${debt.toFixed(1)}h debt tonight
        </div>
        <p>Avg sleep: ${duration.toFixed(1)}h</p>
        <p>Ideal: ${idealNight.toFixed(1)}h</p>
    `;
}

// FIXED AUTH - Persists Now
function checkAuth() {
    if (window.location.pathname.includes('dashboard.html') && !currentUser) {
        window.location.href = 'login.html';
    }
}

function createUser(username, password, sport = 'none') {
    const userId = btoa(username + Date.now());
    const sportMod = { none: 0, gym: 0.5, athlete: 1 }[sport] || 0;
    
    currentUser = {
        id: userId, username, password: btoa(password),
        plan: 'free', logs: [], sport, sportMod,
        features: {}, promo_used: false
    };
    
    localStorage.setItem('somni_user', JSON.stringify(currentUser));
    window.location.href = 'dashboard.html';
}

function loginUser(username, password) {
    // Simple check - in production use proper hash
    const stored = localStorage.getItem('somni_user');
    if (stored) {
        const user = JSON.parse(stored);
        if (user.username === username) {
            currentUser = user;
            window.location.href = 'dashboard.html';
            return true;
        }
    }
    return false;
}

// Forms
document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            if (loginUser(username, password)) {
                alert('Logged in!');
            } else {
                alert('No account found. Sign up first.');
                window.location.href = 'signup.html';
            }
        };
    }
    
    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.onsubmit = (e) => {
            e.preventDefault();
            const username = document.getElementById('signup-username').value;
            const password = document.getElementById('signup-password').value;
            const sport = document.getElementById('signup-sport')?.value || 'none';
            createUser(username, password, sport);
        };
    }
});

// HIDDEN PROMO - Inspect #promo-section on pricing.html
function applyPromo() {
    const code = document.getElementById('promo-input')?.value;
    if (code === 'TEST123' && currentUser) {
        currentUser.plan = 'elite';
        currentUser.promo_used = true;
        localStorage.setItem('somni_user', JSON.stringify(currentUser));
        alert('✅ Elite unlocked!');
        window.location.href = 'dashboard.html';
    }
}

// Sleep Debt Math
function calculateDebt(logs, sportMod) {
    const weekAgo = Date.now() - 7*24*60*60*1000;
    const recent = logs.filter(l => l.timestamp > weekAgo);
    const ideal = (7.5 + sportMod) * 7;
    const actual = recent.reduce((sum, l) => sum + (l.duration || 0), 0);
    return Math.max(0, ideal - actual).toFixed(1);
}
