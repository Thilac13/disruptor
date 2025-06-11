const countdownDisplay = document.getElementById("countdownDisplay");
const volumeSlider = document.getElementById("volume");
const pitchSlider = document.getElementById("pitch");
const volumeOutput = document.getElementById("volume-output");
const a11yLiveRegion = document.getElementById("a11y-live-region");
const hours = document.getElementById('hours');
const minutes = document.getElementById('minutes');
const seconds = document.getElementById('seconds');
const startBtn = document.getElementById('startBtn');
const display = document.getElementById('countdownDisplay');

let timerRunning = false;
let remainingSeconds = 0;
let countdownInterval, soundTimeout;
let wakeLock = null;
let activeOscillators = []; // Track all active sound oscillators

// Initialize AudioContext on user interaction
let audioCtx;
let audioInitialized = false;

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


function initAudio() {
  if (!audioInitialized) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioInitialized = true;
  }
}

function getPitchFrequency() {
  const val = parseInt(pitchSlider.value);
  return val === 0 ? 200 : val === 1 ? 600 : 1000;
}

function getPitchName() {
  const val = parseInt(pitchSlider.value);
  return val === 0 ? "Low" : val === 1 ? "Mid" : "High";
}

function getSoundIntervalRange() {
  const val = document.getElementById("soundInterval").value;
  return val === "low" ? [5000, 10000] : 
         val === "normal" ? [10000, 15000] : 
         [15000, 20000];
}

function getSoundDurationRange() {
  const val = document.getElementById("soundDuration").value;
  return val === "short" ? [5000, 10000] : 
         val === "medium" ? [10000, 15000] : 
         [20000, 25000];
}

function getSoundType() {
  return document.getElementById("soundType").value;
}

function playSound(volume, pitch) {
  if (!audioInitialized) initAudio();
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  activeOscillators.push({ osc, gain });

  osc.type = getSoundType();
  osc.frequency.value = pitch;
  gain.gain.value = volume;

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();

  const [minDur, maxDur] = getSoundDurationRange();
  const duration = Math.random() * (maxDur - minDur) + minDur;

  setTimeout(() => {
    stopSound(osc, gain);
  }, duration);
}

function stopSound(osc, gain) {
  try {
    if (osc) {
      osc.stop();
      osc.disconnect();
    }
    if (gain) {
      gain.disconnect();
    }
    activeOscillators = activeOscillators.filter(item => item.osc !== osc);
  } catch (e) {
    console.log("Error stopping sound:", e);
  }
}

function stopAllSounds() {
  activeOscillators.forEach(({ osc, gain }) => {
    stopSound(osc, gain);
  });
  activeOscillators = [];
}

function updateCountdownDisplay() {
  const h = Math.floor(remainingSeconds / 3600);
  const m = Math.floor((remainingSeconds % 3600) / 60);
  const s = remainingSeconds % 60;
  const displayText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  countdownDisplay.textContent = displayText;
  countdownDisplay.setAttribute('aria-valuenow', remainingSeconds);
  countdownDisplay.setAttribute('aria-valuetext', `${h} hours, ${m} minutes, ${s} seconds remaining`);
}

function announce(text) {
  a11yLiveRegion.textContent = text;
}

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('Screen Wake Lock acquired');
      wakeLock.addEventListener('release', () => {
        console.log('Screen Wake Lock released');
      });
    }
  } catch (err) {
    console.error(`${err.name}, ${err.message}`);
  }
}

function releaseWakeLock() {
  if (wakeLock !== null) {
    wakeLock.release();
    wakeLock = null;
  }
}

function scheduleNextSound(volume, pitch) {
  if (remainingSeconds <= 0) return;
  playSound(volume, pitch);
  
  const [minInterval, maxInterval] = getSoundIntervalRange();
  const delay = Math.random() * (maxInterval - minInterval) + minInterval;
  
  soundTimeout = setTimeout(() => {
    scheduleNextSound(volume, pitch);
  }, delay);
}

function startTimer() {
  requestWakeLock();
  
  const h = parseInt(document.getElementById("hours").value);
  const m = parseInt(document.getElementById("minutes").value);
  const s = parseInt(document.getElementById("seconds").value);
  remainingSeconds = h * 3600 + m * 60 + s;

  const volume = volumeSlider.value / 100;
  const pitch = getPitchFrequency();

  initAudio();

  // Disable controls
  document.getElementById("hours").disabled = true;
  document.getElementById("minutes").disabled = true;
  document.getElementById("seconds").disabled = true;
  volumeSlider.disabled = true;
  pitchSlider.disabled = true;
  document.getElementById("soundInterval").disabled = true;
  document.getElementById("soundDuration").disabled = true;
  document.getElementById("soundType").disabled = true;
  
  // Update button state
  startBtn.textContent = "Stop";
  startBtn.setAttribute('aria-pressed', 'true');
  timerRunning = true;

  // Announce start
  announce(`Timer started for ${h} hours, ${m} minutes, ${s} seconds at ${volume*100}% volume, ${getPitchName()} pitch`);

  updateCountdownDisplay();

  countdownInterval = setInterval(() => {
    if (remainingSeconds <= 0) {
      clearInterval(countdownInterval);
      clearTimeout(soundTimeout);
      stopAllSounds();
      countdownDisplay.textContent = "Done";
      announce("Timer completed");
      resetControls();
      return;
    }
    remainingSeconds--;
    updateCountdownDisplay();
  }, 1000);

  scheduleNextSound(volume, pitch);
}

function resetControls() {
  releaseWakeLock();
  startBtn.textContent = "Start";
  startBtn.setAttribute('aria-pressed', 'false');
  document.getElementById("hours").disabled = false;
  document.getElementById("minutes").disabled = false;
  document.getElementById("seconds").disabled = false;
  volumeSlider.disabled = false;
  pitchSlider.disabled = false;
  document.getElementById("soundInterval").disabled = false;
  document.getElementById("soundDuration").disabled = false;
  document.getElementById("soundType").disabled = false;
  timerRunning = false;
}

function stopTimer() {
  clearInterval(countdownInterval);
  clearTimeout(soundTimeout);
  stopAllSounds();
  countdownDisplay.textContent = "";
  announce("Timer stopped");
  resetControls();
}

// Event listeners
volumeSlider.addEventListener("input", () => {
  const value = volumeSlider.value;
  volumeOutput.textContent = value;
  volumeSlider.setAttribute('aria-valuenow', value);
});

pitchSlider.addEventListener("input", () => {
  const value = parseInt(pitchSlider.value);
  pitchSlider.setAttribute('aria-valuenow', value);
  pitchSlider.setAttribute('aria-valuetext', getPitchName());
});

startBtn.addEventListener("click", () => {
  if (!timerRunning) {
    startTimer();
  } else {
    stopTimer();
  }
});

// Keyboard accessibility for sliders
volumeSlider.addEventListener("keydown", (e) => {
  if (['ArrowUp', 'ArrowRight'].includes(e.key)) {
    volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 1);
  } else if (['ArrowDown', 'ArrowLeft'].includes(e.key)) {
    volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 1);
  } else if (['PageUp'].includes(e.key)) {
    volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 10);
  } else if (['PageDown'].includes(e.key)) {
    volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 10);
  } else if (['Home'].includes(e.key)) {
    volumeSlider.value = 0;
  } else if (['End'].includes(e.key)) {
    volumeSlider.value = 100;
  } else {
    return;
  }
  volumeSlider.dispatchEvent(new Event('input'));
  e.preventDefault();
});

pitchSlider.addEventListener("keydown", (e) => {
  if (['ArrowUp', 'ArrowRight'].includes(e.key)) {
    pitchSlider.value = Math.min(2, parseInt(pitchSlider.value) + 1);
  } else if (['ArrowDown', 'ArrowLeft'].includes(e.key)) {
    pitchSlider.value = Math.max(0, parseInt(pitchSlider.value) - 1);
  } else if (['Home'].includes(e.key)) {
    pitchSlider.value = 0;
  } else if (['End'].includes(e.key)) {
    pitchSlider.value = 2;
  } else {
    return;
  }
  pitchSlider.dispatchEvent(new Event('input'));
  e.preventDefault();
});

// Handle visibility changes to reacquire wake lock
document.addEventListener('visibilitychange', async () => {
  if (timerRunning && document.visibilityState === 'visible') {
    await requestWakeLock();
  }
});