document.addEventListener('DOMContentLoaded', () => {
    const liveMinutesEl = document.getElementById('live-minutes');
    const liveTargetEl = document.getElementById('live-date-target');
    const customDateInput = document.getElementById('custom-date');
    const customResultEl = document.getElementById('custom-result');
    const customMinutesEl = document.getElementById('custom-minutes');
    const customTargetInfoEl = document.getElementById('custom-target-info');

    // Helper: Get next Christmas date from a given date
    function getNextChristmas(fromDate) {
        const year = fromDate.getFullYear();
        const christmas = new Date(year, 11, 25); // Month is 0-indexed (11 = Dec)

        // If the date is AFTER Dec 25th of the current year, next christmas is next year
        // Note: If it's exactly Dec 25th, we might want to show 0 or next year. 
        // Let's assume on Dec 25th it shows 0 until end of day, then switches.
        // Actually, let's say if it's AFTER Dec 25 23:59:59, it's next year.
        if (fromDate.getTime() > christmas.getTime() + (1000 * 60 * 60 * 24) - 1) {
            christmas.setFullYear(year + 1);
        }
        return christmas;
    }

    // Helper: Calculate minutes difference
    function getMinutesDifference(dateNow, dateFuture) {
        const diffMs = dateFuture - dateNow;
        if (diffMs <= 0) return 0;
        return Math.floor(diffMs / (1000 * 60));
    }

    // Helper: Format number with separators
    function formatNumber(num) {
        return new Intl.NumberFormat('it-IT').format(num);
    }

    // Update Live Counter
    function updateLiveCounter() {
        const now = new Date();
        const nextXmas = getNextChristmas(now);
        const minutes = getMinutesDifference(now, nextXmas);

        liveMinutesEl.textContent = formatNumber(minutes);
        liveTargetEl.textContent = `al 25 Dicembre ${nextXmas.getFullYear()}`;
    }

    // Update Custom Counter
    function updateCustomCounter() {
        const inputVal = customDateInput.value;
        if (!inputVal) {
            customResultEl.classList.add('hidden');
            return;
        }

        const selectedDate = new Date(inputVal);
        if (isNaN(selectedDate.getTime())) return;

        const nextXmas = getNextChristmas(selectedDate);

        // If selected date is after the computed next christmas (edge case logic), recalculate
        // The getNextChristmas logic handles "from a date", so it should be fine.
        // Example: User picks Dec 26 2025. getNextChristmas(Dec 26 2025) -> Dec 25 2026.

        const minutes = getMinutesDifference(selectedDate, nextXmas);

        customMinutesEl.textContent = formatNumber(minutes);
        customTargetInfoEl.textContent = `Rispetto al 25 Dicembre ${nextXmas.getFullYear()}`;
        customResultEl.classList.remove('hidden');
    }

    // Initialize
    updateLiveCounter();
    setInterval(updateLiveCounter, 1000); // Update every second to keep it fresh (though minutes change slower)

    // Event Listeners
    customDateInput.addEventListener('input', updateCustomCounter);

    // Set default value for custom input to now (optional, but helpful)
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Local ISO fix
    customDateInput.value = now.toISOString().slice(0, 16);
    updateCustomCounter();

    // Music Controls
    const musicBtn = document.getElementById('music-control');
    const bgMusic = document.getElementById('bg-music');
    let isPlaying = false;

    musicBtn.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            musicBtn.textContent = '🔇';
            musicBtn.setAttribute('aria-label', 'Play Music');
        } else {
            // User interaction allows us to play
            bgMusic.volume = 0.5; // Set a reasonable volume
            bgMusic.play().then(() => {
                musicBtn.textContent = '🎵';
                musicBtn.setAttribute('aria-label', 'Pause Music');
            }).catch(e => {
                console.error("Playback failed:", e);
                alert("Impossibile riprodurre la musica. Controlla le impostazioni del browser.");
            });
        }
        isPlaying = !isPlaying;
    });
});
