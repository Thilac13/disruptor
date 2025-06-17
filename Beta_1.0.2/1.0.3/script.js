(() => {
  const circleProgress = document.querySelector(".circle-progress");
  const timeDisplay = document.getElementById("time-display");
  const playPauseBtn = document.getElementById("play-pause-btn");

  let total = 0;
  let remaining = 0;
  let intervalId = null;
  let nextBeepTimeout = null;
  let audioCtx = null;

  const hours = document.getElementById("hours");
  const minutes = document.getElementById("minutes");
  const seconds = document.getElementById("seconds");
  const intervalInput = document.getElementById("interval");
  const durationInput = document.getElementById("duration");
  const volumeInput = document.getElementById("volume");
  const pitchMin = document.getElementById("pitch-min");
  const pitchMax = document.getElementById("pitch-max");

  function formatTime(sec) {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  function updateDisplay() {
    timeDisplay.textContent = formatTime(remaining);
  }

  function playBeep() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    const pitch = Math.random() * (parseFloat(pitchMax.value) - parseFloat(pitchMin.value)) + parseFloat(pitchMin.value);
    osc.frequency.setValueAtTime(440 * pitch, audioCtx.currentTime);
    gain.gain.setValueAtTime(parseFloat(volumeInput.value), audioCtx.currentTime);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + parseFloat(durationInput.value));
  }

  function scheduleBeep() {
    const base = parseFloat(intervalInput.value);
    const randomized = base * (0.8 + Math.random() * 0.4);
    nextBeepTimeout = setTimeout(() => {
      playBeep();
      scheduleBeep();
    }, randomized * 1000);
  }

  function startCountdown() {
    intervalId = setInterval(() => {
      remaining--;
      updateDisplay();
      if (remaining <= 0) stopCountdown();
    }, 1000);
    scheduleBeep();
  }

  function stopCountdown() {        
    clearInterval(intervalId);
    intervalId = null;
    if (nextBeepTimeout) clearTimeout(nextBeepTimeout);
    showPlayIcon();
  }

  function togglePlayPause() {
    if (intervalId) {
      stopCountdown();
    } else {
      total = parseInt(hours.value) * 3600 + parseInt(minutes.value) * 60 + parseInt(seconds.value);
      if (total <= 0) return;
      remaining = total;
      updateDisplay();
      startCountdown();
      showPauseIcon();
    }
  }

  function showPlayIcon() {
    playPauseBtn.innerHTML = "";
    const icon = document.createElement("div");
    icon.classList.add("play-icon");
    playPauseBtn.appendChild(icon);
  }

  function showPauseIcon() {
    playPauseBtn.innerHTML = `<div class="pause-icon"><div></div><div></div></div>`;
  }

  document.getElementById("interval").addEventListener("input", e => {
    document.getElementById("interval-value").textContent = `${e.target.value}s`;
  });
  document.getElementById("duration").addEventListener("input", e => {
    document.getElementById("duration-value").textContent = `${e.target.value}s`;
  });
  document.getElementById("volume").addEventListener("input", e => {
    document.getElementById("volume-value").textContent = `${Math.round(e.target.value * 100)}%`;
  });
  document.getElementById("pitch-min").addEventListener("input", e => {
    document.getElementById("pitch-min-value").textContent = parseFloat(e.target.value).toFixed(2);
  });
  document.getElementById("pitch-max").addEventListener("input", e => {
    document.getElementById("pitch-max-value").textContent = parseFloat(e.target.value).toFixed(2);
  });

  document.querySelector(".mode-toggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    document.querySelector(".icon-moon").textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
  });

  playPauseBtn.addEventListener("click", togglePlayPause);

  // Init
  updateDisplay();
  showPlayIcon();

    // Tab switching
    document.querySelectorAll(".tab-button").forEach(button => {
      button.addEventListener("click", () => {
        const tabId = button.getAttribute("data-tab");

        // Hide all tabs
        document.querySelectorAll(".tab-content").forEach(tab => {
            tab.classList.remove("active");
        });

        // Deactivate all buttons
        document.querySelectorAll(".tab-button").forEach(btn => {
         btn.classList.remove("active");
        });

        // Show selected tab
        document.getElementById(tabId).classList.add("active");
         button.classList.add("active");
        });
    });



})();
