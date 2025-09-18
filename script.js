document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    let analysisHistory = JSON.parse(localStorage.getItem('analysisHistory')) || [];
    
    // DOM elements
    const newsForm = document.getElementById('newsForm');
    const clearBtn = document.getElementById('clearBtn');
    const resultCard = document.getElementById('resultCard');
    const resultVerdict = document.getElementById('resultVerdict');
    const confidenceFill = document.getElementById('confidenceFill');
    const confidenceValue = document.getElementById('confidenceValue');
    const resultFactors = document.getElementById('resultFactors');
    const saveResultBtn = document.getElementById('saveResultBtn');
    const shareResultBtn = document.getElementById('shareResultBtn');
    const historyContainer = document.getElementById('historyContainer');
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    
    // Form submission
    newsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('newsTitle').value;
        const content = document.getElementById('newsContent').value;
        const source = document.getElementById('newsSource').value;
        
        // Simulate analysis
        const analysisResult = analyzeNews(title, content, source);
        
        // Display results
        displayResults(analysisResult);
        
        // Show result card
        resultCard.style.display = 'block';
        
        // Scroll to results
        resultCard.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Clear form
    clearBtn.addEventListener('click', function() {
        newsForm.reset();
        resultCard.style.display = 'none';
    });
    
    // Save result
    saveResultBtn.addEventListener('click', function() {
        const title = document.getElementById('newsTitle').value;
        const content = document.getElementById('newsContent').value;
        const source = document.getElementById('newsSource').value;
        
        const analysisResult = analyzeNews(title, content, source);
        
        // Create history item
        const historyItem = {
            id: Date.now(),
            title,
            content,
            source,
            result: analysisResult.result,
            confidence: analysisResult.confidence,
            date: new Date().toISOString()
        };
        
        // Add to history
        analysisHistory.unshift(historyItem);
        
        // Keep only last 10 items
        if (analysisHistory.length > 10) {
            analysisHistory = analysisHistory.slice(0, 10);
        }
        
        // Save to localStorage
        localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
        
        // Update history display
        renderHistory();
        
        // Show notification
        showNotification('Result saved to history!', 'success');
    });
    
    // Share result
    shareResultBtn.addEventListener('click', function() {
        const title = document.getElementById('newsTitle').value;
        const result = resultVerdict.textContent;
        
        // Create share text
        const shareText = `I analyzed "${title}" using Fake News Detector. Result: ${result}. Check it out yourself!`;
        
        // Check if Web Share API is available
        if (navigator.share) {
            navigator.share({
                title: 'Fake News Detection Result',
                text: shareText,
                url: window.location.href
            })
            .then(() => {
                showNotification('Shared successfully!', 'success');
            })
            .catch((error) => {
                showNotification('Error sharing: ' + error, 'error');
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText)
                .then(() => {
                    showNotification('Result copied to clipboard!', 'success');
                })
                .catch(() => {
                    showNotification('Failed to copy to clipboard', 'error');
                });
        }
    });
    
    // Analyze news function (mock implementation)
    function analyzeNews(title, content, source) {
        // In a real application, this would be replaced with an API call to a machine learning model
        
        // Simple mock analysis based on keywords and patterns
        const fakeNewsKeywords = [
            'shocking', 'you won\'t believe', 'doctors hate', 'they don\'t want you to know',
            'conspiracy', 'cover-up', 'hoax', 'scam', 'miracle cure', 'secret',
            'urgent', 'breaking', 'exclusive', 'hidden', 'revealed'
        ];
        
        const credibleSources = [
            'reuters.com', 'ap.org', 'bbc.com', 'cnn.com', 'nytimes.com',
            'washingtonpost.com', 'theguardian.com', 'npr.org', 'wsj.com'
        ];
        
        // Calculate fake news score
        let fakeScore = 0;
        const lowerContent = content.toLowerCase();
        
        // Check for fake news keywords
        fakeNewsKeywords.forEach(keyword => {
            if (lowerContent.includes(keyword)) {
                fakeScore += 10;
            }
        });
        
        // Check for sensational punctuation
        const exclamationCount = (content.match(/!/g) || []).length;
        const allCapsCount = (content.match(/[A-Z]{3,}/g) || []).length;
        
        fakeScore += exclamationCount * 2;
        fakeScore += allCapsCount * 3;
        
        // Check source credibility
        if (source) {
            let isCredibleSource = false;
            for (const credibleSource of credibleSources) {
                if (source.includes(credibleSource)) {
                    isCredibleSource = true;
                    break;
                }
            }
            
            if (isCredibleSource) {
                fakeScore -= 20;
            } else {
                fakeScore += 10;
            }
        }
        
        // Check for citations/references
        if (!lowerContent.includes('according to') && 
            !lowerContent.includes('study shows') && 
            !lowerContent.includes('researchers') && 
            !lowerContent.includes('reported')) {
            fakeScore += 15;
        }
        
        // Check article length (very short articles are more likely fake)
        if (content.length < 500) {
            fakeScore += 10;
        }
        
        // Normalize score to 0-100
        fakeScore = Math.min(100, Math.max(0, fakeScore));
        
        // Determine result
        let result;
        if (fakeScore < 30) {
            result = 'real';
        } else if (fakeScore > 70) {
            result = 'fake';
        } else {
            result = 'uncertain';
        }
        
        // Generate factors
        const factors = [];
        
        if (fakeScore > 70) {
            factors.push({
                icon: 'fas fa-exclamation-triangle',
                text: 'Contains sensational language and exaggerated claims'
            });
            
            if (exclamationCount > 3) {
                factors.push({
                    icon: 'fas fa-exclamation-circle',
                    text: 'Excessive use of exclamation points'
                });
            }
            
            if (allCapsCount > 2) {
                factors.push({
                    icon: 'fas fa-font',
                    text: 'Uses excessive capitalization for emphasis'
                });
            }
            
            if (source && !isCredibleSource) {
                factors.push({
                    icon: 'fas fa-link',
                    text: 'Source is not a recognized credible news outlet'
                });
            }
            
            if (!lowerContent.includes('according to') && 
                !lowerContent.includes('study shows')) {
                factors.push({
                    icon: 'fas fa-quote-right',
                    text: 'Lacks citations or references to credible sources'
                });
            }
        } else if (fakeScore < 30) {
            factors.push({
                icon: 'fas fa-check-circle',
                text: 'Appears to be from a credible source'
            });
            
            if (source && isCredibleSource) {
                factors.push({
                    icon: 'fas fa-link',
                    text: 'Source is a recognized credible news outlet'
                });
            }
            
            if (lowerContent.includes('according to') || 
                lowerContent.includes('study shows')) {
                factors.push({
                    icon: 'fas fa-quote-right',
                    text: 'Includes citations or references to sources'
                });
            }
        } else {
            factors.push({
                icon: 'fas fa-question-circle',
                text: 'Mixed signals - some credible elements but also some concerns'
            });
        }
        
        return {
            result,
            confidence: Math.abs(fakeScore - 50) * 2, // Convert to confidence percentage
            factors
        };
    }
    
    // Display results
    function displayResults(analysisResult) {
        // Set verdict
        resultVerdict.className = 'result-verdict ' + analysisResult.result;
        
        if (analysisResult.result === 'real') {
            resultVerdict.innerHTML = '<i class="fas fa-check-circle"></i> Likely Real News';
        } else if (analysisResult.result === 'fake') {
            resultVerdict.innerHTML = '<i class="fas fa-times-circle"></i> Likely Fake News';
        } else {
            resultVerdict.innerHTML = '<i class="fas fa-question-circle"></i> Uncertain - Verify with Other Sources';
        }
        
        // Set confidence
        confidenceFill.style.width = analysisResult.confidence + '%';
        confidenceValue.textContent = Math.round(analysisResult.confidence) + '%';
        
        // Set factors
        resultFactors.innerHTML = '';
        analysisResult.factors.forEach(factor => {
            const factorElement = document.createElement('div');
            factorElement.className = 'factor-item';
            factorElement.innerHTML = `
                <div class="factor-icon">
                    <i class="${factor.icon}"></i>
                </div>
                <div>${factor.text}</div>
            `;
            resultFactors.appendChild(factorElement);
        });
    }
    
    // Render history
    function renderHistory() {
        if (analysisHistory.length === 0) {
            historyContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>No analysis history yet. Analyze an article to see it here.</p>
                </div>
            `;
            return;
        }
        
        historyContainer.innerHTML = '';
        analysisHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const date = new Date(item.date).toLocaleDateString();
            
            historyItem.innerHTML = `
                <div class="history-header">
                    <div class="history-title">${item.title}</div>
                    <div class="history-result ${item.result}">${item.result}</div>
                </div>
                <div class="history-content">${item.content}</div>
                <div class="history-date">${date}</div>
                <div class="history-actions">
                    <button class="btn btn-secondary view-btn" data-id="${item.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-secondary delete-btn" data-id="${item.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            historyContainer.appendChild(historyItem);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                const item = analysisHistory.find(h => h.id === id);
                if (item) {
                    // Populate form with item data
                    document.getElementById('newsTitle').value = item.title;
                    document.getElementById('newsContent').value = item.content;
                    document.getElementById('newsSource').value = item.source || '';
                    
                    // Scroll to form
                    newsForm.scrollIntoView({ behavior: 'smooth' });
                    
                    // Show notification
                    showNotification('Article loaded for re-analysis', 'success');
                }
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                analysisHistory = analysisHistory.filter(h => h.id !== id);
                localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
                renderHistory();
                showNotification('Item deleted from history', 'success');
            });
        });
    }
    
    // Show notification
    function showNotification(message, type = 'success') {
        notification.className = `notification ${type}`;
        notificationMessage.textContent = message;
        
        const icon = notification.querySelector('i');
        if (type === 'success') {
            icon.className = 'fas fa-check-circle';
        } else if (type === 'error') {
            icon.className = 'fas fa-exclamation-circle';
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Initialize history display
    renderHistory();
});