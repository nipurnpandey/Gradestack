let isLogin = true;
let showForgotPassword = false;
let theme = localStorage.getItem('gradstack-theme') || 'light';

const mockUsers = [
    {
        id: '1',
        name: 'Demo Student',
        email: 'demo@student.com',
        password: 'demo123'
    }
];

document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeEventListeners();
});

function initializeTheme() {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    }
}

function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('gradstack-theme', theme);
}

function initializeEventListeners() {
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    document.getElementById('authForm').addEventListener('submit', handleFormSubmit);

    document.getElementById('toggleLink').addEventListener('click', toggleAuthMode);

    document.getElementById('forgotPasswordBtn').addEventListener('click', showForgotPasswordForm);

    document.getElementById('backToLoginBtn').addEventListener('click', backToLogin);

    document.getElementById('togglePassword').addEventListener('click', togglePasswordVisibility);

    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearError(this.id);
        });
    });
}

function toggleAuthMode() {
    isLogin = !isLogin;
    showForgotPassword = false;
    updateFormUI();
    clearAllErrors();
    clearFormInputs();
}

function showForgotPasswordForm() {
    showForgotPassword = true;
    updateFormUI();
    clearAllErrors();
    clearFormInputs();
}

function backToLogin() {
    showForgotPassword = false;
    isLogin = true;
    updateFormUI();
    clearAllErrors();
    clearFormInputs();
}

function updateFormUI() {
    const cardTitle = document.getElementById('cardTitle');
    const cardDescription = document.getElementById('cardDescription');
    const btnText = document.getElementById('btnText');

    if (showForgotPassword) {
        cardTitle.textContent = 'Reset Password';
        cardDescription.textContent = 'Enter your email to receive reset instructions';
        btnText.textContent = 'Send Reset Link';

        document.getElementById('nameGroup').style.display = 'none';
        document.getElementById('passwordGroup').style.display = 'none';
        document.getElementById('confirmPasswordGroup').style.display = 'none';
        document.getElementById('loginOptions').style.display = 'none';

        document.getElementById('toggleMode').style.display = 'none';
        document.getElementById('backToLogin').style.display = 'block';
    } else if (isLogin) {
        cardTitle.textContent = 'Welcome Back';
        cardDescription.textContent = 'Login to access your notes and resources';
        btnText.textContent = 'Login';

        document.getElementById('nameGroup').style.display = 'none';
        document.getElementById('passwordGroup').style.display = 'block';
        document.getElementById('confirmPasswordGroup').style.display = 'none';
        document.getElementById('loginOptions').style.display = 'flex';

        document.getElementById('toggleMode').style.display = 'block';
        document.getElementById('backToLogin').style.display = 'none';
        document.getElementById('toggleText').textContent = "Don't have an account?";
        document.getElementById('toggleLink').textContent = 'Sign Up';
    } else {
        cardTitle.textContent = 'Create Account';
        cardDescription.textContent = 'Join thousands of students using Gradstack';
        btnText.textContent = 'Create Account';

        document.getElementById('nameGroup').style.display = 'block';
        document.getElementById('passwordGroup').style.display = 'block';
        document.getElementById('confirmPasswordGroup').style.display = 'block';
        document.getElementById('loginOptions').style.display = 'none';

        document.getElementById('toggleMode').style.display = 'block';
        document.getElementById('backToLogin').style.display = 'none';
        document.getElementById('toggleText').textContent = 'Already have an account?';
        document.getElementById('toggleLink').textContent = 'Login';
    }
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.querySelector('.eye-icon');
    const eyeOffIcon = document.querySelector('.eye-off-icon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.style.display = 'none';
        eyeOffIcon.style.display = 'block';
    } else {
        passwordInput.type = 'password';
        eyeIcon.style.display = 'block';
        eyeOffIcon.style.display = 'none';
    }
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateForm() {
    let isValid = true;
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };

    clearAllErrors();

    if (!isLogin && !showForgotPassword && !formData.name) {
        showError('name', 'Name is required');
        isValid = false;
    }

    if (!formData.email) {
        showError('email', 'Email is required');
        isValid = false;
    } else if (!validateEmail(formData.email)) {
        showError('email', 'Please enter a valid email');
        isValid = false;
    }

    if (!showForgotPassword) {
        if (!formData.password) {
            showError('password', 'Password is required');
            isValid = false;
        } else if (!validatePassword(formData.password)) {
            showError('password', 'Password must be at least 6 characters');
            isValid = false;
        }

        if (!isLogin) {
            if (!formData.confirmPassword) {
                showError('confirmPassword', 'Please confirm your password');
                isValid = false;
            } else if (formData.password !== formData.confirmPassword) {
                showError('confirmPassword', 'Passwords do not match');
                isValid = false;
            }
        }
    }

    return { isValid, formData };
}

function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    const inputElement = document.getElementById(fieldId);

    if (errorElement) {
        errorElement.textContent = message;
    }
    if (inputElement) {
        inputElement.classList.add('error');
    }
}

function clearError(fieldId) {
    const errorElement = document.getElementById(fieldId + 'Error');
    const inputElement = document.getElementById(fieldId);

    if (errorElement) {
        errorElement.textContent = '';
    }
    if (inputElement) {
        inputElement.classList.remove('error');
    }
}

function clearAllErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    const errorInputs = document.querySelectorAll('.form-input.error');

    errorMessages.forEach(el => el.textContent = '');
    errorInputs.forEach(el => el.classList.remove('error'));
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const validation = validateForm();
    if (!validation.isValid) {
        return;
    }

    setLoading(true);

    try {
        if (showForgotPassword) {
            await handleForgotPassword(validation.formData.email);
        } else if (isLogin) {
            await handleLogin(validation.formData);
        } else {
            await handleSignup(validation.formData);
        }
    } catch (error) {
        showToast('Error', error.message, 'error');
    } finally {
        setLoading(false);
    }
}

function setLoading(loading) {
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');

    if (loading) {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
    } else {
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleLogin(formData) {
    await delay(1000);

    const user = mockUsers.find(u => u.email === formData.email);

    if (!user) {
        throw new Error('User not found. Please sign up first.');
    }

    if (user.password !== formData.password) {
        throw new Error('Incorrect password. Please try again.');
    }

    const rememberMe = document.getElementById('rememberMe').checked;
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('gradstack_user', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email
    }));

    showToast('Login Successful!', `Welcome back, ${user.name}!`, 'success');
    clearFormInputs();
}

async function handleSignup(formData) {
    await delay(1200);

    const existingUser = mockUsers.find(u => u.email === formData.email);

    if (existingUser) {
        throw new Error('An account with this email already exists.');
    }

    const newUser = {
        id: String(mockUsers.length + 1),
        name: formData.name,
        email: formData.email,
        password: formData.password
    };

    mockUsers.push(newUser);

    sessionStorage.setItem('gradstack_user', JSON.stringify({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
    }));

    showToast('Account Created!', 'Verification email sent. Please check your inbox.', 'success');
    clearFormInputs();
}

async function handleForgotPassword(email) {
    await delay(1000);

    const user = mockUsers.find(u => u.email === email);

    if (!user) {
        throw new Error('No account found with this email address.');
    }

    showToast('Reset Link Sent!', 'Please check your email for password reset instructions.', 'success');
    backToLogin();
}

function clearFormInputs() {
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('rememberMe').checked = false;
}

function showToast(title, message, type = 'success') {
    const container = document.getElementById('toastContainer');

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-header">${title}</div>
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 5000);
}