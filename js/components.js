/**
 * ========================================
 * 🧩 Components JS - المكونات المتقدمة
 * ========================================
 * Version: 3.0
 * Dark Mode, Notifications, Filters, Stats, Validator
 */

// ===== 🌙 Dark Mode Toggle =====
window.NFDarkMode = (function() {
    'use strict';
    
    const STORAGE_KEY = 'nf-dark-mode';
    const DARK_CLASS = 'dark';
    const DARK_MODE_CLASS = 'dark-mode';
    
    function init() {
        const savedMode = localStorage.getItem(STORAGE_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedMode === 'true' || (savedMode === null && prefersDark)) {
            document.documentElement.classList.add(DARK_CLASS);
            document.body.classList.add(DARK_MODE_CLASS);
        }
        
        createToggleButton();
        
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (localStorage.getItem(STORAGE_KEY) === null) {
                if (e.matches) {
                    document.documentElement.classList.add(DARK_CLASS);
                    document.body.classList.add(DARK_MODE_CLASS);
                } else {
                    document.documentElement.classList.remove(DARK_CLASS);
                    document.body.classList.remove(DARK_MODE_CLASS);
                }
                updateButtonIcon();
            }
        });
        
        console.log('🌙 NFDarkMode initialized');
    }
    
    function createToggleButton() {
        if (document.getElementById('nf-dark-mode-btn')) return;
        
        const button = document.createElement('button');
        button.id = 'nf-dark-mode-btn';
        button.className = 'nf-dark-mode-toggle';
        button.setAttribute('title', 'تبديل الوضع الليلي / Toggle Dark Mode');
        button.setAttribute('aria-label', 'Toggle dark mode');
        button.onclick = toggle;
        
        updateButtonIcon(button);
        
        document.body.appendChild(button);
    }
    
    function updateButtonIcon(btn) {
        const button = btn || document.getElementById('nf-dark-mode-btn');
        if (!button) return;
        
        const isDark = document.documentElement.classList.contains(DARK_CLASS) || 
                       document.body.classList.contains(DARK_MODE_CLASS);
        button.innerHTML = isDark 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    }
    
    function toggle() {
        const isDark = document.documentElement.classList.toggle(DARK_CLASS);
        document.body.classList.toggle(DARK_MODE_CLASS);
        localStorage.setItem(STORAGE_KEY, isDark.toString());
        updateButtonIcon();
        
        if (window.NFNotify) {
            NFNotify.show({
                message: isDark ? 'تم تفعيل الوضع الليلي 🌙' : 'تم تفعيل الوضع النهاري ☀️',
                type: 'info',
                duration: 2000
            });
        }
        
        window.dispatchEvent(new CustomEvent('nf-dark-mode-change', { 
            detail: { isDark } 
        }));
        
        return isDark;
    }
    
    function isDarkMode() {
        return document.documentElement.classList.contains(DARK_CLASS) || 
               document.body.classList.contains(DARK_MODE_CLASS);
    }
    
    function enable() {
        if (!isDarkMode()) toggle();
    }
    
    function disable() {
        if (isDarkMode()) toggle();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    return {
        init: init,
        toggle: toggle,
        isDarkMode: isDarkMode,
        enable: enable,
        disable: disable
    };
})();


// ===== 🔔 Enhanced Notifications =====
window.NFNotify = (function() {
    'use strict';
    
    const CONTAINER_ID = 'nf-notification-container';
    const DEFAULT_DURATION = 4000;
    const MAX_NOTIFICATIONS = 5;
    
    const ICONS = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const TITLES = {
        success: 'نجاح!',
        error: 'خطأ!',
        warning: 'تحذير!',
        info: 'معلومة'
    };
    
    function getContainer() {
        let container = document.getElementById(CONTAINER_ID);
        if (!container) {
            container = document.createElement('div');
            container.id = CONTAINER_ID;
            container.className = 'nf-notification-container';
            document.body.appendChild(container);
        }
        return container;
    }
    
    function show(options) {
        const {
            message,
            title = null,
            type = 'info',
            duration = DEFAULT_DURATION,
            showProgress = true,
            onClick = null
        } = typeof options === 'string' ? { message: options } : options;
        
        const container = getContainer();
        
        while (container.children.length >= MAX_NOTIFICATIONS) {
            removeNotification(container.firstChild);
        }
        
        const notification = document.createElement('div');
        notification.className = `nf-notification nf-${type}`;
        
        if (onClick) {
            notification.style.cursor = 'pointer';
            notification.onclick = () => {
                onClick();
                removeNotification(notification);
            };
        }
        
        notification.innerHTML = `
            <div class="nf-notification-icon">
                <i class="fas ${ICONS[type] || ICONS.info}"></i>
            </div>
            <div class="nf-notification-content">
                <span class="nf-notification-title">${title || TITLES[type] || TITLES.info}</span>
                <span class="nf-notification-message">${message}</span>
            </div>
            <button class="nf-notification-close" aria-label="إغلاق">
                <i class="fas fa-times"></i>
            </button>
            ${showProgress && duration > 0 ? `
                <div class="nf-notification-progress">
                    <div class="nf-notification-progress-bar" style="transition: width ${duration}ms linear; width: 100%;"></div>
                </div>
            ` : ''}
        `;
        
        const closeBtn = notification.querySelector('.nf-notification-close');
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            removeNotification(notification);
        };
        
        container.appendChild(notification);
        
        if (showProgress && duration > 0) {
            const progressBar = notification.querySelector('.nf-notification-progress-bar');
            requestAnimationFrame(() => {
                progressBar.style.width = '0%';
            });
        }
        
        if (duration > 0) {
            setTimeout(() => {
                removeNotification(notification);
            }, duration);
        }
        
        return notification;
    }
    
    function removeNotification(notification) {
        if (!notification || !notification.parentNode) return;
        
        notification.classList.add('nf-removing');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    function success(message, options = {}) {
        return show({ message, type: 'success', ...options });
    }
    
    function error(message, options = {}) {
        return show({ message, type: 'error', ...options });
    }
    
    function warning(message, options = {}) {
        return show({ message, type: 'warning', ...options });
    }
    
    function info(message, options = {}) {
        return show({ message, type: 'info', ...options });
    }
    
    function clearAll() {
        const container = document.getElementById(CONTAINER_ID);
        if (container) {
            Array.from(container.children).forEach(removeNotification);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', getContainer);
    } else {
        getContainer();
    }
    
    console.log('🔔 NFNotify initialized');
    
    return {
        show: show,
        success: success,
        error: error,
        warning: warning,
        info: info,
        clearAll: clearAll
    };
})();

window.notify = window.NFNotify;


// ===== 🔍 Advanced Filters =====
window.NFFilters = (function() {
    'use strict';
    
    const DEFAULT_OPTIONS = {
        searchFields: ['customerName', 'make', 'model', 'vin', 'contractNo', 'plateNo'],
        debounceDelay: 300,
        saveToUrl: true,
        onFilter: null
    };
    
    class FilterManager {
        constructor(options = {}) {
            this.options = { ...DEFAULT_OPTIONS, ...options };
            this.filters = {};
            this.searchQuery = '';
            this.sortBy = 'createdAt';
            this.sortDir = 'desc';
            this.debounceTimer = null;
            
            if (this.options.saveToUrl) {
                this.loadFromUrl();
            }
        }
        
        setSearch(query) {
            this.searchQuery = query.toLowerCase().trim();
            this.debouncedApply();
        }
        
        setFilter(key, value) {
            if (value === '' || value === null || value === undefined) {
                delete this.filters[key];
            } else {
                this.filters[key] = value;
            }
            this.debouncedApply();
        }
        
        setSort(field, direction = 'desc') {
            this.sortBy = field;
            this.sortDir = direction;
            this.apply();
        }
        
        reset() {
            this.filters = {};
            this.searchQuery = '';
            this.sortBy = 'createdAt';
            this.sortDir = 'desc';
            
            const searchInput = document.getElementById('nf-search-input');
            if (searchInput) searchInput.value = '';
            
            document.querySelectorAll('.nf-filter-select').forEach(select => {
                select.value = '';
            });
            
            this.apply();
        }
        
        debouncedApply() {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.apply();
            }, this.options.debounceDelay);
        }
        
        apply() {
            if (this.options.saveToUrl) {
                this.saveToUrl();
            }
            
            if (this.options.onFilter) {
                this.options.onFilter(this.getFilteredData());
            }
            
            this.updateActiveFiltersDisplay();
        }
        
        getFilteredData(data = []) {
            let filtered = [...data];
            
            if (this.searchQuery) {
                filtered = filtered.filter(item => {
                    return this.options.searchFields.some(field => {
                        const value = item[field];
                        return value && value.toString().toLowerCase().includes(this.searchQuery);
                    });
                });
            }
            
            Object.keys(this.filters).forEach(key => {
                const filterValue = this.filters[key];
                filtered = filtered.filter(item => {
                    return item[key] && item[key].toString() === filterValue.toString();
                });
            });
            
            filtered.sort((a, b) => {
                let aVal = a[this.sortBy];
                let bVal = b[this.sortBy];
                
                if (aVal && aVal.toDate) aVal = aVal.toDate();
                if (bVal && bVal.toDate) bVal = bVal.toDate();
                
                if (typeof aVal === 'string' && !isNaN(aVal)) aVal = parseFloat(aVal);
                if (typeof bVal === 'string' && !isNaN(bVal)) bVal = parseFloat(bVal);
                
                let comparison = 0;
                if (aVal > bVal) comparison = 1;
                if (aVal < bVal) comparison = -1;
                
                return this.sortDir === 'desc' ? -comparison : comparison;
            });
            
            return filtered;
        }
        
        saveToUrl() {
            const params = new URLSearchParams();
            
            if (this.searchQuery) {
                params.set('q', this.searchQuery);
            }
            
            Object.keys(this.filters).forEach(key => {
                params.set(key, this.filters[key]);
            });
            
            if (this.sortBy !== 'createdAt') {
                params.set('sort', this.sortBy);
            }
            
            if (this.sortDir !== 'desc') {
                params.set('dir', this.sortDir);
            }
            
            const newUrl = params.toString() 
                ? `${window.location.pathname}?${params.toString()}`
                : window.location.pathname;
            
            history.replaceState(null, '', newUrl);
        }
        
        loadFromUrl() {
            const params = new URLSearchParams(window.location.search);
            
            if (params.has('q')) {
                this.searchQuery = params.get('q');
            }
            
            if (params.has('sort')) {
                this.sortBy = params.get('sort');
            }
            
            if (params.has('dir')) {
                this.sortDir = params.get('dir');
            }
            
            params.forEach((value, key) => {
                if (!['q', 'sort', 'dir'].includes(key)) {
                    this.filters[key] = value;
                }
            });
        }
        
        updateActiveFiltersDisplay() {
            const container = document.getElementById('nf-active-filters');
            if (!container) return;
            
            const hasFilters = this.searchQuery || Object.keys(this.filters).length > 0;
            
            if (!hasFilters) {
                container.innerHTML = '';
                container.style.display = 'none';
                return;
            }
            
            container.style.display = 'flex';
            let html = '';
            
            if (this.searchQuery) {
                html += `
                    <span class="nf-filter-tag">
                        <i class="fas fa-search"></i>
                        "${this.searchQuery}"
                        <button class="nf-filter-tag-remove" onclick="NFFilters.clearSearch()">
                            <i class="fas fa-times"></i>
                        </button>
                    </span>
                `;
            }
            
            Object.keys(this.filters).forEach(key => {
                html += `
                    <span class="nf-filter-tag">
                        ${key}: ${this.filters[key]}
                        <button class="nf-filter-tag-remove" onclick="NFFilters.clearFilter('${key}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </span>
                `;
            });
            
            container.innerHTML = html;
        }
    }
    
    let instance = null;
    
    function init(options) {
        instance = new FilterManager(options);
        return instance;
    }
    
    function clearSearch() {
        if (instance) {
            instance.searchQuery = '';
            const searchInput = document.getElementById('nf-search-input');
            if (searchInput) searchInput.value = '';
            instance.apply();
        }
    }
    
    function clearFilter(key) {
        if (instance) {
            delete instance.filters[key];
            const select = document.querySelector(`.nf-filter-select[data-filter="${key}"]`);
            if (select) select.value = '';
            instance.apply();
        }
    }
    
    return {
        init: init,
        FilterManager: FilterManager,
        clearSearch: clearSearch,
        clearFilter: clearFilter,
        getInstance: () => instance
    };
})();


// ===== 📊 Dashboard Stats =====
window.NFStats = (function() {
    'use strict';
    
    function calculateStats(vehicles) {
        const stats = {
            total: vehicles.length,
            totalValue: 0,
            avgValue: 0,
            thisMonth: 0,
            lastMonth: 0,
            ratings: {
                excellent: 0,
                good: 0,
                fair: 0,
                poor: 0
            },
            topVehicles: [],
            byMake: {},
            monthlyTrend: []
        };
        
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        
        vehicles.forEach(v => {
            const value = parseFloat(v.marketValue) || 0;
            stats.totalValue += value;
            
            if (v.overallRating && stats.ratings.hasOwnProperty(v.overallRating)) {
                stats.ratings[v.overallRating]++;
            }
            
            if (v.make) {
                stats.byMake[v.make] = (stats.byMake[v.make] || 0) + 1;
            }
            
            if (v.createdAt || v.savedAt) {
                const dateStr = v.createdAt || v.savedAt;
                const date = dateStr.toDate ? dateStr.toDate() : new Date(dateStr);
                if (date.getMonth() === thisMonth && date.getFullYear() === thisYear) {
                    stats.thisMonth++;
                }
                const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
                const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
                if (date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear) {
                    stats.lastMonth++;
                }
            }
        });
        
        stats.avgValue = stats.total > 0 ? stats.totalValue / stats.total : 0;
        
        stats.topVehicles = [...vehicles]
            .sort((a, b) => (parseFloat(b.marketValue) || 0) - (parseFloat(a.marketValue) || 0))
            .slice(0, 5);
        
        stats.monthTrend = stats.lastMonth > 0 
            ? ((stats.thisMonth - stats.lastMonth) / stats.lastMonth * 100).toFixed(1)
            : 0;
        
        return stats;
    }
    
    function formatNumber(num) {
        return new Intl.NumberFormat('ar-SA').format(num);
    }
    
    function calculateAvgRating(ratings) {
        const values = { excellent: 4, good: 3, fair: 2, poor: 1 };
        const total = Object.values(ratings).reduce((a, b) => a + b, 0);
        if (total === 0) return 0;
        
        let sum = 0;
        Object.keys(ratings).forEach(key => {
            sum += ratings[key] * values[key];
        });
        
        return (sum / total).toFixed(1);
    }
    
    function getRatingText(rating) {
        const texts = {
            excellent: 'ممتاز',
            good: 'جيد',
            fair: 'مقبول',
            poor: 'ضعيف'
        };
        return texts[rating] || rating;
    }
    
    function updateStatsDisplay(stats, containerId = 'statsContainer') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="stat-card">
                <span class="number">${stats.total}</span>
                <span class="label">إجمالي المركبات</span>
            </div>
            <div class="stat-card">
                <span class="number">${formatNumber(stats.totalValue)}</span>
                <span class="label">القيمة الإجمالية (ر.س)</span>
            </div>
        `;
    }
    
    return {
        calculateStats: calculateStats,
        formatNumber: formatNumber,
        calculateAvgRating: calculateAvgRating,
        getRatingText: getRatingText,
        updateStatsDisplay: updateStatsDisplay
    };
})();


// ===== ✅ Form Validator =====
window.NFValidator = (function() {
    'use strict';
    
    const MESSAGES = {
        required: 'هذا الحقل مطلوب',
        email: 'يرجى إدخال بريد إلكتروني صحيح',
        minlength: 'يجب إدخال {0} أحرف على الأقل',
        maxlength: 'يجب أن لا يتجاوز {0} حرف',
        min: 'القيمة يجب أن تكون {0} على الأقل',
        max: 'القيمة يجب أن لا تتجاوز {0}',
        pattern: 'الصيغة غير صحيحة',
        phone: 'يرجى إدخال رقم هاتف صحيح',
        vin: 'رقم الشاصي يجب أن يكون 17 حرف',
        numeric: 'يجب إدخال أرقام فقط',
        password: 'كلمة المرور ضعيفة. يجب أن تحتوي على حروف وأرقام'
    };
    
    const RULES = {
        required: (value) => value.trim().length > 0,
        
        email: (value) => {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return value.length === 0 || regex.test(value);
        },
        
        minlength: (value, min) => value.length >= parseInt(min),
        maxlength: (value, max) => value.length <= parseInt(max),
        min: (value, min) => parseFloat(value) >= parseFloat(min),
        max: (value, max) => parseFloat(value) <= parseFloat(max),
        
        pattern: (value, pattern) => {
            const regex = new RegExp(pattern);
            return value.length === 0 || regex.test(value);
        },
        
        phone: (value) => {
            const regex = /^[\d\s\-\+\(\)]+$/;
            return value.length === 0 || (regex.test(value) && value.replace(/\D/g, '').length >= 9);
        },
        
        vin: (value) => {
            const regex = /^[A-HJ-NPR-Z0-9]{17}$/i;
            return value.length === 0 || regex.test(value);
        },
        
        numeric: (value) => {
            return value.length === 0 || /^\d+$/.test(value);
        },
        
        password: (value) => {
            return value.length === 0 || (/[a-zA-Z]/.test(value) && /\d/.test(value));
        }
    };
    
    function validateInput(input) {
        const value = input.value || '';
        let isValid = true;
        let errorMessage = '';
        
        if (input.hasAttribute('required') && !RULES.required(value)) {
            isValid = false;
            errorMessage = MESSAGES.required;
        }
        
        if (isValid && input.type === 'email' && !RULES.email(value)) {
            isValid = false;
            errorMessage = MESSAGES.email;
        }
        
        if (isValid && input.dataset.validate === 'vin' && !RULES.vin(value)) {
            isValid = false;
            errorMessage = MESSAGES.vin;
        }
        
        if (isValid && input.dataset.validate === 'phone' && !RULES.phone(value)) {
            isValid = false;
            errorMessage = MESSAGES.phone;
        }
        
        updateInputState(input, isValid, errorMessage);
        
        return isValid;
    }
    
    function updateInputState(input, isValid, errorMessage) {
        const formGroup = input.closest('.form-group') || input.parentElement;
        
        input.classList.remove('nf-input-valid', 'nf-input-invalid');
        
        let errorEl = formGroup.querySelector('.nf-error-message');
        
        if (isValid) {
            if (input.value.trim()) {
                input.classList.add('nf-input-valid');
            }
            if (errorEl) {
                errorEl.classList.remove('nf-show');
            }
        } else {
            input.classList.add('nf-input-invalid');
            
            if (!errorEl) {
                errorEl = document.createElement('div');
                errorEl.className = 'nf-error-message';
                formGroup.appendChild(errorEl);
            }
            
            errorEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errorMessage}`;
            errorEl.classList.add('nf-show');
        }
    }
    
    function validateForm(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        let isValid = true;
        let firstError = null;
        
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
                if (!firstError) firstError = input;
            }
        });
        
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
        
        return isValid;
    }
    
    function init(formSelector) {
        const form = typeof formSelector === 'string' 
            ? document.querySelector(formSelector) 
            : formSelector;
        
        if (!form) return;
        
        form.querySelectorAll('[required]').forEach(input => {
            const label = input.closest('.form-group')?.querySelector('label');
            if (label && !label.classList.contains('nf-required')) {
                label.classList.add('nf-required');
            }
        });
        
        form.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('blur', () => validateInput(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('nf-input-invalid')) {
                    validateInput(input);
                }
            });
        });
        
        form.addEventListener('submit', (e) => {
            if (!validateForm(form)) {
                e.preventDefault();
            }
        });
        
        console.log('✅ NFValidator initialized');
    }
    
    return {
        init: init,
        validateInput: validateInput,
        validateForm: validateForm,
        rules: RULES,
        messages: MESSAGES
    };
})();


// ===== Initialize on Load =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚗 Vehicle Evaluation System - Components Loaded');
});
