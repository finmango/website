
// Judges Portal Logic
// Handles the Dashboard view, Form view, and "Next Track" logic.

const TRACKS = [
    { id: 'transportation', name: 'Transportation', icon: '🚗' },
    { id: 'housing', name: 'Housing Affordability', icon: '🏠' },
    { id: 'healthcare', name: 'Healthcare Access', icon: '🏥' },
    { id: 'open', name: 'Open Track', icon: '🌟' },
    { id: 'literacy', name: 'Literacy & Investment Access', icon: '📚' }
];

// Placeholder URL - replace with actual Google Apps Script URL when available
const SUBMIT_URL = 'https://script.google.com/macros/s/AKfycbwNaajSoakdQaiqkNQSdaMCu996eoKXFGhv45HdrjfArZ5nwHeo-9LdofZjpZX_8IoNkQ/exec';

// State
let completedTracks = new Set();
let currentJudgeName = localStorage.getItem('judgeName') || '';

document.addEventListener('DOMContentLoaded', function () {
    renderDashboard();

    // Pre-fill judge name if saved
    if (currentJudgeName) {
        document.getElementById('judgeName').value = currentJudgeName;
    }

    // Form Handler
    document.getElementById('nominationForm').addEventListener('submit', handleSubmission);
});

function renderDashboard() {
    const list = document.getElementById('track-list');
    list.innerHTML = '';

    TRACKS.forEach(track => {
        const isDone = completedTracks.has(track.id);
        const card = document.createElement('div');
        card.className = `track-card ${isDone ? 'completed' : ''}`;
        card.onclick = () => openForm(track.id);

        card.innerHTML = `
            <div class="track-info">
                <h3>${track.icon} ${track.name} ${isDone ? '✅' : ''}</h3>
                <span class="status-badge">${isDone ? 'Completed' : 'Pending'}</span>
            </div>
            <div>${isDone ? 'Edit' : 'Start'} →</div>
        `;
        list.appendChild(card);
    });

    // Update progress
    document.getElementById('progress-text').innerText = `${completedTracks.size}/${TRACKS.length} Tracks Completed`;
}

function openForm(trackId) {
    const track = TRACKS.find(t => t.id === trackId);
    if (!track) return;

    // Set UI
    document.getElementById('form-track-title').innerText = `${track.icon} ${track.name}`;
    document.getElementById('trackInput').value = track.name;

    // Pre-fill name if we have it
    if (document.getElementById('judgeName').value === '' && currentJudgeName) {
        document.getElementById('judgeName').value = currentJudgeName;
    }

    // Reset inputs if needed (optional: could save drafts, but keeping simple)
    // For now we clear nominations when opening a new track unless we want to support editing.
    // Let's clear for now to avoid confusion.
    document.querySelectorAll('#nominationForm input:not(#judgeName):not(#trackInput), #nominationForm textarea').forEach(i => i.value = '');

    // Switch View
    document.getElementById('dashboard-view').classList.remove('active');
    document.getElementById('form-view').classList.add('active');

    // Update Nav Action
    document.getElementById('nav-action').innerHTML = `<span class="back-link" onclick="showDashboard()">Back to Dashboard</span>`;

    window.scrollTo(0, 0);
}

function showDashboard() {
    document.getElementById('successOverlay').style.display = 'none';
    document.getElementById('form-view').classList.remove('active');
    document.getElementById('dashboard-view').classList.add('active');
    document.getElementById('nav-action').innerHTML = `<a href="/barrier-breakers.html" class="back-link">Exit</a>`;
    renderDashboard();
    window.scrollTo(0, 0);
}

function handleSubmission(e) {
    e.preventDefault();

    // Save Judge Name for future
    const nameInput = document.getElementById('judgeName').value;
    if (nameInput) {
        currentJudgeName = nameInput;
        localStorage.setItem('judgeName', currentJudgeName);
    }

    // Get Track Info
    const trackName = document.getElementById('trackInput').value;
    const trackObj = TRACKS.find(t => t.name === trackName);

    // Simulate Submission
    const btn = e.target.querySelector('.btn-submit');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = 'Submitting...';

    // Log data
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Convert to URLSearchParams for Google Apps Script
    const params = new URLSearchParams();
    for (const key in data) {
        params.append(key, data[key]);
    }

    // Add Timestamp if not present (Apps Script handles it, but good for local log)
    if (!data.timestamp) data.timestamp = new Date().toISOString();

    console.log('Submitting Nomination:', data);

    // If SUBMIT_URL is empty, we simulate. If present, we fetch.
    if (!SUBMIT_URL) {
        // SIMULATION
        setTimeout(() => handleSuccess(), 800);
    } else {
        // REAL SUBMISSION
        fetch(SUBMIT_URL, {
            method: 'POST',
            body: params
        })
            .then(response => response.json())
            .then(result => {
                if (result.result === 'success') {
                    handleSuccess();
                } else {
                    throw new Error(result.error);
                }
            })
            .catch(error => {
                console.error('Error!', error.message);
                alert('Error submitting form: ' + error.message);
                btn.disabled = false;
                btn.innerText = originalText;
            });
    }

    function handleSuccess() {
        // Mark Complete
        if (trackObj) completedTracks.add(trackObj.id);

        // Show Success
        btn.disabled = false;
        btn.innerText = originalText;

        const overlay = document.getElementById('successOverlay');
        document.getElementById('success-track-name').innerText = trackName;

        // Setup "Next Track" button
        const nextTrack = getNextTrack(trackObj ? trackObj.id : null);
        const nextBtn = document.getElementById('btn-next-track');

        if (nextTrack) {
            nextBtn.style.display = 'block';
            nextBtn.innerText = `Judge Next: ${nextTrack.name} →`;
            nextBtn.onclick = () => {
                overlay.style.display = 'none';
                openForm(nextTrack.id);
            };
        } else {
            nextBtn.style.display = 'none'; // All done
        }

        overlay.style.display = 'flex';
    }
}

function getNextTrack(currentId) {
    if (!currentId) return TRACKS[0];
    const currentIndex = TRACKS.findIndex(t => t.id === currentId);
    // Find next track that isn't done
    for (let i = currentIndex + 1; i < TRACKS.length; i++) {
        if (!completedTracks.has(TRACKS[i].id)) return TRACKS[i];
    }
    // If all subsequent are done, check from beginning
    for (let i = 0; i < currentIndex; i++) {
        if (!completedTracks.has(TRACKS[i].id)) return TRACKS[i];
    }
    return null; // All done
}
