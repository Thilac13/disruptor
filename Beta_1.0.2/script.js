(() => {
  // Elements
  const hoursInput = document.getElementById("hours");
  const minutesInput = document.getElementById("minutes");
  const secondsInput = document.getElementById("seconds");

  const intervalInput = document.getElementById("interval");
  const intervalValueDisplay = document.getElementById("interval-value");

  const durationInput = document.getElementById("duration");
  const durationValueDisplay = document.getElementById("duration-value");

  const volumeInput = document.getElementById("volume");
  const volumeValueDisplay = document.getElementById("volume-value");

  const pitchMinInput = document.getElementById("pitch-min");
  const pitchMaxInput = document.getElementById("pitch-max");
  const pitchMinValue = document.getElementById("pitch-min-value");
  const pitchMaxValue = document.getElementById("pitch-max-value");

  const timeDisplay = document.getElementById("time-display");
  const playPauseBtn = document.getElementById("play-pause-btn");
  const circleProgress = document.querySelector(".circle-progress");
  const modeToggleBtn = document.querySelector(".mode-toggle");
  const iconMoon = modeToggleBtn.querySelector(".icon-moon");

  // Constants
  const RADIUS = 74;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  circleProgress.style.strokeDasharray = CIRCUMFERENCE;
  circleProgress.style.strokeDashoffset = CIRCUMFERENCE;

  // State
  let countdownTotalSeconds = 0;
  let countdownRemainingSeconds = 0;
  let countdownIntervalId = null;

  let nextSoundTimeout = null;

  // Audio Context
  let audioCtx = null;

  // Initialize UI values for range labels
  intervalValueDisplay.textContent = `${intervalInput.value}s`;
  durationValueDisplay.textContent = `${durationInput.value}s`;
  volumeValueDisplay.textContent = `${Math.round(volumeInput.value * 100)}%`;
  pitchMinValue.textContent = pitchMinInput.value;
  pitchMaxValue.textContent = pitchMaxInput.value;

  // Helpers
  function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [
      h.toString().padStart(2, "0"),
      m.toString().padStart(2, "0"),
      s.toString().padStart(2, "0"),
    ].join(":");
  }

  function updateTimeDisplay() {
    timeDisplay.textContent = formatTime(countdownRemainingSeconds);
  }

  function setCircleProgress(percent) {
    const offset = CIRCUMFERENCE * (1 - percent);
    circleProgress.style.strokeDashoffset = offset;
  }

  // Play beep sound with random pitch
  function playBeep() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const duration = Number(durationInput.value);
    const volume = Number(volumeInput.value);
    const pitchMin = Number(pitchMinInput.value);
    const pitchMax = Number(pitchMaxInput.value);
    const pitch = Math.random() * (pitchMax - pitchMin) + pitchMin;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440 * pitch, audioCtx.currentTime); // Base 440Hz adjusted by pitch

    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);

    oscillator.onended = () => {
      // Disconnect nodes to free memory
      oscillator.disconnect();
      gainNode.disconnect();
    };
  }

  // Schedule next beep with ±20% randomization on interval
  function scheduleNextBeep() {
    if (countdownRemainingSeconds <= 0) return;

    const baseInterval = Number(intervalInput.value);
    const randomizedInterval = baseInterval * (0.8 + Math.random() * 0.4); // 80% to 120% of interval

    nextSoundTimeout = setTimeout(() => {
      playBeep();
      scheduleNextBeep();
    }, randomizedInterval * 1000);
  }

  // Update countdown every second
  function startCountdown() {
    if (countdownRemainingSeconds <= 0) return;

    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    countdownIntervalId = setInterval(() => {
      countdownRemainingSeconds--;
      updateTimeDisplay();

      // Update progress circle
      setCircleProgress(
        1 - countdownRemainingSeconds / countdownTotalSeconds
      );

      if (countdownRemainingSeconds <= 0) {
        stopCountdown();
      }
    }, 1000);
  }

  function stopCountdown() {
    clearInterval(countdownIntervalId);
    countdownIntervalId = null;

    if (nextSoundTimeout) {
      clearTimeout(nextSoundTimeout);
      nextSoundTimeout = null;
    }

    showPlayIcon();
  }

  // Play/pause toggle
  function togglePlayPause() {
    if (countdownIntervalId) {
      // Currently running, so pause
      stopCountdown();
    } else {
      // If no time set, do nothing
      const total =
        Number(hoursInput.value) * 3600 +
        Number(minutesInput.value) * 60 +
        Number(secondsInput.value);

      if (total <= 0) return;

      countdownTotalSeconds = total;
      countdownRemainingSeconds = total;
      updateTimeDisplay();
      setCircleProgress(0);

      // Start countdown and schedule sound
      startCountdown();
      scheduleNextBeep();

      showPauseIcon();
    }
  }

  // Show play icon
  function showPlayIcon() {
    playPauseBtn.innerHTML = "";
    const playIcon = document.createElement("div");
    playIcon.classList.add("play-icon");
    playPauseBtn.appendChild(playIcon);
    playPauseBtn.setAttribute("aria-label", "Start timer");
    playPauseBtn.setAttribute("title", "Start timer");
  }

  // Show pause icon
  function showPauseIcon() {
    playPauseBtn.innerHTML = "";
    const pauseIcon = document.createElement("div");
    pauseIcon.classList.add("pause-icon");
    pauseIcon.innerHTML = `<div></div><div></div>`;
    playPauseBtn.appendChild(pauseIcon);
    playPauseBtn.setAttribute("aria-label", "Pause timer");
    playPauseBtn.setAttribute("title", "Pause timer");
  }

  // Event listeners

  playPauseBtn.addEventListener("click", togglePlayPause);

  // Update interval value display on change
  intervalInput.addEventListener("input", () => {
    intervalValueDisplay.textContent = `${intervalInput.value}s`;
  });

  // Update duration value display on change
  durationInput.addEventListener("input", () => {
    durationValueDisplay.textContent = `${durationInput.value}s`;
  });

  // Update volume value display on change
  volumeInput.addEventListener("input", () => {
    volumeValueDisplay.textContent = `${Math.round(volumeInput.value * 100)}%`;
  });

  // Update pitch min/max value displays on change
  pitchMinInput.addEventListener("input", () => {
    let minVal = Number(pitchMinInput.value);
    let maxVal = Number(pitchMaxInput.value);
    if (minVal > maxVal) {
      pitchMinInput.value = maxVal;
      minVal = maxVal;
    }
    pitchMinValue.textContent = minVal.toFixed(2);
  });

  pitchMaxInput.addEventListener("input", () => {
    let minVal = Number(pitchMinInput.value);
    let maxVal = Number(pitchMaxInput.value);
    if (maxVal < minVal) {
      pitchMaxInput.value = minVal;
      maxVal = minVal;
    }
    pitchMaxValue.textContent = maxVal.toFixed(2);
  });

  // Dark/light mode toggle
  modeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
      iconMoon.textContent = "☀️";
    } else {
      iconMoon.textContent = "🌙";
    }
  });

  // Initialize UI
  showPlayIcon();
  updateTimeDisplay();
  setCircleProgress(1);
})();
