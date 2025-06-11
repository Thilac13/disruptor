const hours = document.getElementById('hours');
const minutes = document.getElementById('minutes');
const seconds = document.getElementById('seconds');
const startBtn = document.getElementById('startBtn');
const display = document.getElementById('countdownDisplay');

function formatTime(num) {
  return String(num).padStart(2, '0');
}

function updateCountdown(totalSeconds) {
  const interval = setInterval(() => {
    if (totalSeconds <= 0) {
      clearInterval(interval);
      display.textContent = "00:00:00";
      return;
    }
    totalSeconds--;
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    display.textContent = `${formatTime(hrs)}:${formatTime(mins)}:${formatTime(secs)}`;
  }, 1000);
}

startBtn.addEventListener('click', () => {
  const h = parseInt(hours.value) || 0;
  const m = parseInt(minutes.value) || 0;
  const s = parseInt(seconds.value) || 0;
  const total = h * 3600 + m * 60 + s;
  if (total > 0) updateCountdown(total);
});
