// AI Course Modules JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadCourseModules();
    loadAllMaterials(); // Load all materials from API
    updateProgressStats();
});

let currentModule = 1;
let userStats = {
    completed: [],
    downloads: 0,
    previews: 0
};
let allMaterials = []; // Store all materials globally

// Load all materials from API
function loadAllMaterials() {
    fetch('/api/materials/all')
        .then(response => response.json())
        .then(materials => {
            allMaterials = materials;
            console.log('Loaded materials:', materials); // Debug log
            
            // After loading materials, refresh current module display
            if (currentModule) {
                refreshCurrentModule();
            }
            
            // Update course materials section
            displayCourseMaterials();
        })
        .catch(error => console.error('Error loading materials:', error));
}

// Refresh current module display
function refreshCurrentModule() {
    fetch('content/ai-course.json')
        .then(response => response.json())
        .then(data => {
            const module = data.modules.find(m => m.day === currentModule);
            if (module) {
                renderModuleContent(module);
            }
        });
}

// Load course modules from JSON
function loadCourseModules() {
    fetch('content/ai-course.json')
        .then(response => response.json())
        .then(data => {
            renderModuleTabs(data.modules);
            // Load first module by default
            const firstModule = data.modules[0];
            if (firstModule) {
                currentModule = firstModule.day;
                renderModuleContent(firstModule);
            }
        })
        .catch(error => console.error('Error loading course modules:', error));
}

// Render module tabs
function renderModuleTabs(modules) {
    const tabsContainer = document.getElementById('moduleTabs');
    if (!tabsContainer) return;
    
    tabsContainer.innerHTML = '';
    
    modules.forEach(module => {
        const tab = document.createElement('div');
        tab.className = `module-tab ${module.completed ? 'completed' : ''} ${module.day === currentModule ? 'active' : ''}`;
        tab.setAttribute('data-day', module.day);
        tab.onclick = () => switchModule(module.day);
        
        const tabText = document.documentElement.lang === 'ko' ? 
            `${module.day}일차: ${module.title_ko}` : 
            `Day ${module.day}: ${module.title}`;
        
        tab.textContent = tabText;
        tabsContainer.appendChild(tab);
    });
}

// Switch between modules
function switchModule(day) {
    currentModule = day;
    
    // Update active tab
    document.querySelectorAll('.module-tab').forEach(tab => {
        tab.classList.remove('active');
        if (parseInt(tab.getAttribute('data-day')) === day) {
            tab.classList.add('active');
        }
    });
    
    // Load module content
    fetch('content/ai-course.json')
        .then(response => response.json())
        .then(data => {
            const module = data.modules.find(m => m.day === day);
            if (module) {
                renderModuleContent(module);
            }
        });
}

// Render module content with learning materials
function renderModuleContent(module) {
    const contentDiv = document.getElementById('moduleContent');
    if (!contentDiv) return;
    
    const title = document.documentElement.lang === 'ko' ? module.title_ko : module.title;
    const description = document.documentElement.lang === 'ko' ? module.description_ko : module.description;
    
    // Get materials for this specific module
    const moduleMaterials = allMaterials.filter(m => m.module === `module${module.day}`);
    
    let materialsHTML = '';
    if (moduleMaterials.length > 0) {
        moduleMaterials.forEach(material => {
            materialsHTML += `
                <div class="material-card">
                    <div class="material-icon">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <h3 class="material-title">${material.title}</h3>
                    <p class="material-description">Module ${module.day} Learning Material</p>
                    <div class="material-actions">
                        <button class="btn-material btn-preview" onclick="previewMaterial('${material.file}', '${material.title.replace(/'/g, "\\'")}')">
                            <i class="fas fa-eye"></i> ${document.documentElement.lang === 'ko' ? '미리보기' : 'Preview'}
                        </button>
                        <button class="btn-material btn-download" onclick="downloadMaterial('${material.file}', '${material.title.replace(/'/g, "\\'")}')">
                            <i class="fas fa-download"></i> ${document.documentElement.lang === 'ko' ? '다운로드' : 'Download'}
                        </button>
                    </div>
                </div>
            `;
        });
    } else {
        materialsHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">No materials for this module yet</p>';
    }
    
    contentDiv.innerHTML = `
        <div class="module-header">
            <h2 class="module-title">${title}</h2>
            <p class="module-description">${description}</p>
        </div>
        <div class="learning-materials">
            <h3>${document.documentElement.lang === 'ko' ? '학습 자료' : 'Learning Materials'}</h3>
            <div class="materials-grid">
                ${materialsHTML}
            </div>
        </div>
    `;
}

// Display course materials in the bottom section
function displayCourseMaterials() {
    const container = document.getElementById('courseMaterials');
    if (!container) return;
    
    // Get materials from all modules
    const allModuleMaterials = allMaterials.filter(m => m.module.startsWith('module'));
    
    if (allModuleMaterials.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px;">No course materials available</p>';
        return;
    }
    
    let html = '';
    allModuleMaterials.forEach(material => {
        const moduleNum = material.module.replace('module', '');
        html += `
            <div class="feature-card">
                <div class="feature-icon">
                    <i class="fas fa-file-pdf"></i>
                </div>
                <h3>${material.title}</h3>
                <p>Module ${moduleNum}</p>
                <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
                    <button class="btn btn-primary" onclick="previewMaterial('${material.file}', '${material.title.replace(/'/g, "\\'")}')">
                        <i class="fas fa-eye"></i> ${document.documentElement.lang === 'ko' ? '미리보기' : 'Preview'}
                    </button>
                    <button class="btn btn-outline" onclick="downloadMaterial('${material.file}', '${material.title.replace(/'/g, "\\'")}')">
                        <i class="fas fa-download"></i> ${document.documentElement.lang === 'ko' ? '다운로드' : 'Download'}
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Preview PDF material
function previewMaterial(filePath, title) {
    userStats.previews++;
    updateStats();
    
    const modal = document.getElementById('pdfModal');
    const viewer = document.getElementById('pdfViewer');
    const modalTitle = document.getElementById('pdfModalTitle');
    
    if (!modal || !viewer || !modalTitle) return;
    
    modalTitle.textContent = title;
    viewer.src = filePath;
    modal.classList.add('active');
}

// Download PDF material
function downloadMaterial(filePath, title) {
    userStats.downloads++;
    updateStats();
    
    const link = document.createElement('a');
    link.href = filePath;
    link.download = title.replace(/[^a-z0-9가-힣]/gi, '_') + '.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(document.documentElement.lang === 'ko' ? 
        '다운로드가 시작되었습니다!' : 
        'Download started!');
}

// Close PDF modal
function closePDFModal() {
    const modal = document.getElementById('pdfModal');
    const viewer = document.getElementById('pdfViewer');
    if (modal && viewer) {
        modal.classList.remove('active');
        viewer.src = '';
    }
}

// Update progress statistics
function updateStats() {
    const completedCount = userStats.completed.length;
    const totalModules = 7;
    const progress = (completedCount / totalModules) * 100;
    
    const completedEl = document.getElementById('completedModules');
    const progressFill = document.getElementById('progressFill');
    const downloadsEl = document.getElementById('downloadsCount');
    const previewsEl = document.getElementById('previewsCount');
    
    if (completedEl) completedEl.textContent = completedCount;
    if (progressFill) progressFill.style.width = progress + '%';
    if (downloadsEl) downloadsEl.textContent = userStats.downloads;
    if (previewsEl) previewsEl.textContent = userStats.previews;
    
    localStorage.setItem('aiCourseStats', JSON.stringify(userStats));
}

// Load saved stats
function loadSavedStats() {
    const saved = localStorage.getItem('aiCourseStats');
    if (saved) {
        try {
            userStats = JSON.parse(saved);
            updateStats();
        } catch (e) {
            console.error('Error loading saved stats');
        }
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4cc9f0;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize on page load
loadSavedStats();

// Make functions global for onclick handlers
window.previewMaterial = previewMaterial;
window.downloadMaterial = downloadMaterial;
window.closePDFModal = closePDFModal;

// Listen for language changes
document.addEventListener('languageChanged', function() {
    if (currentModule) {
        refreshCurrentModule();
    }
    displayCourseMaterials();
});