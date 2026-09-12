/**
 * پروین بانو کا گوشۂ سکون - Parveen Banu's Sanctuary
 * Bilingual (Urdu & English) logic, Halal procedural rain synthesizer,
 * tactile tasbih, tea nook, floating petals, and PWA offline caching.
 */

// --- 1. HALAL WEB AUDIO RAIN & SOUND SYNTHESIZER ---
class HalalSoundEngine {
  constructor() {
    this.ctx = null;
    this.isRainPlaying = false;
    this.rainGainNode = null;
    this.noiseNode = null;
    this.rainTimer = null;
    this.volume = 0.55;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startRain() {
    this.initContext();
    if (this.isRainPlaying) return;

    const bufferSize = this.ctx.sampleRate * 4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 850;
    bandpass.Q.value = 0.6;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 1800;

    this.rainGainNode = this.ctx.createGain();
    this.rainGainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.rainGainNode.gain.exponentialRampToValueAtTime(this.volume, this.ctx.currentTime + 1.2);

    this.noiseNode.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(this.rainGainNode);
    this.rainGainNode.connect(this.ctx.destination);

    this.noiseNode.start();
    this.isRainPlaying = true;
    this.scheduleRainDrops();
  }

  scheduleRainDrops() {
    if (!this.isRainPlaying) return;
    const interval = 250 + Math.random() * 550;
    this.rainTimer = setTimeout(() => {
      if (this.isRainPlaying) {
        this.playSingleDrop();
        this.scheduleRainDrops();
      }
    }, interval);
  }

  playSingleDrop() {
    if (!this.ctx || !this.isRainPlaying) return;
    try {
      const osc = this.ctx.createOscillator();
      const dropGain = this.ctx.createGain();

      const baseFreq = 700 + Math.random() * 800;
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, this.ctx.currentTime + 0.03);

      dropGain.gain.setValueAtTime(this.volume * 0.18, this.ctx.currentTime);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

      osc.connect(dropGain);
      dropGain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch (e) {}
  }

  stopRain() {
    if (!this.isRainPlaying) return;
    clearTimeout(this.rainTimer);
    if (this.rainGainNode && this.ctx) {
      this.rainGainNode.gain.setValueAtTime(this.rainGainNode.gain.value, this.ctx.currentTime);
      this.rainGainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
      setTimeout(() => {
        if (this.noiseNode) {
          try { this.noiseNode.stop(); } catch(e) {}
          this.noiseNode.disconnect();
        }
        this.isRainPlaying = false;
      }, 850);
    } else {
      this.isRainPlaying = false;
    }
  }

  setVolume(val) {
    this.volume = val;
    if (this.rainGainNode && this.ctx && this.isRainPlaying) {
      this.rainGainNode.gain.setValueAtTime(val, this.ctx.currentTime);
    }
  }

  playBeadSound() {
    this.initContext();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(980, this.ctx.currentTime + 0.04);
      osc.frequency.exponentialRampToValueAtTime(420, this.ctx.currentTime + 0.09);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.11);
    } catch(e) {}
  }

  playSoftChime() {
    this.initContext();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.48);
    } catch(e) {}
  }
}

const soundEngine = new HalalSoundEngine();

// --- 2. RAIN CANVAS BACKGROUND ANIMATION ---
const canvas = document.getElementById('rain-canvas');
const ctx = canvas.getContext('2d');
let drops = [];

function resizeRainCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeRainCanvas);
resizeRainCanvas();

function initRainDrops() {
  drops = [];
  const count = Math.floor(window.innerWidth / 14);
  for (let i = 0; i < count; i++) {
    drops.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      length: Math.random() * 18 + 10,
      speed: Math.random() * 3 + 2,
      opacity: Math.random() * 0.35 + 0.15
    });
  }
}
initRainDrops();

function drawRain() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (soundEngine.isRainPlaying) {
    ctx.strokeStyle = 'rgba(74, 115, 96, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';

    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 1, d.y + d.length);
      ctx.stroke();

      d.y += d.speed;
      d.x -= 0.3;

      if (d.y > canvas.height) {
        d.y = -d.length;
        d.x = Math.random() * canvas.width;
      }
    }
  }
  requestAnimationFrame(drawRain);
}
drawRain();

// Rain Toggle Control
const btnRainToggle = document.getElementById('btn-rain-toggle');
const rainStatusUrdu = document.getElementById('rain-status-urdu');
const rainStatusEng = document.getElementById('rain-status-eng');
const rainDrawer = document.getElementById('rain-drawer');
const rainVolumeSlider = document.getElementById('rain-volume-slider');

btnRainToggle.addEventListener('click', () => {
  if (soundEngine.isRainPlaying) {
    soundEngine.stopRain();
    btnRainToggle.classList.remove('active');
    rainStatusUrdu.textContent = 'بارانِ رحمت';
    rainStatusEng.textContent = 'Rain: Off';
    rainDrawer.classList.remove('visible');
  } else {
    soundEngine.startRain();
    btnRainToggle.classList.add('active');
    rainStatusUrdu.textContent = 'بارانِ رحمت: جاری';
    rainStatusEng.textContent = 'Rain: Playing';
    rainDrawer.classList.add('visible');
  }
});

rainVolumeSlider.addEventListener('input', (e) => {
  soundEngine.setVolume(parseFloat(e.target.value));
});

// --- 3. TIME-AWARE GREETING (Bilingual) ---
function updateTimeGreeting() {
  const hour = new Date().getHours();
  const greetingUrdu = document.getElementById('time-greeting-urdu');
  const greetingEng = document.getElementById('time-greeting-eng');
  if (!greetingUrdu || !greetingEng) return;

  if (hour >= 4 && hour < 12) {
    greetingUrdu.textContent = "صبح بخیر امی جان! اللہ آپ کا دن نور اور عافیت سے بھر دے۔";
    greetingEng.textContent = "Good Morning Ammi Jaan! May Allah fill your day with divine light and ease.";
  } else if (hour >= 12 && hour < 17) {
    greetingUrdu.textContent = "دوپہر بخیر امی جان! اللہ آپ کی ہر تھکن کو راحت میں بدل دے۔";
    greetingEng.textContent = "Good Afternoon Ammi Jaan! May Allah replace every tiredness with deep relief.";
  } else if (hour >= 17 && hour < 21) {
    greetingUrdu.textContent = "شام بخیر امی جان! چائے کا وقت ہے، ذرا سکھ کا سانس لیجیے۔";
    greetingEng.textContent = "Good Evening Ammi Jaan! It's tea time, take a peaceful breath and rest.";
  } else {
    greetingUrdu.textContent = "شب بخیر امی جان! اللہ آپ کو پرسکون نیند اور سکون عطا فرمائے۔";
    greetingEng.textContent = "Good Night Ammi Jaan! May Allah grant you peaceful sleep and tranquil dreams.";
  }
}
updateTimeGreeting();

// --- 4. MOOD CHECK-IN (Bilingual) ---
const moodBtns = document.querySelectorAll('.mood-btn');
const moodResponseBox = document.getElementById('mood-response');
const moodResponseUrdu = document.getElementById('mood-response-urdu');
const moodResponseEng = document.getElementById('mood-response-eng');

const moodResponses = {
  happy: {
    urdu: "ماشاءاللہ امی جان! آپ کی مسکراہٹ ہی ہمارے گھر کی سب سے بڑی دولت ہے۔ یا اللہ! پروین بانو کو ہمیشہ مسکراتا اور ہنستا رکھنا۔ آمین! 🌸",
    eng: "Masha'Allah Ammi Jaan! Your smile is the greatest wealth of our home. O Allah! Keep Parveen Banu smiling and joyful always. Ameen!"
  },
  tired: {
    urdu: "امی جان، اب سب کام چھوڑ دیجیے اور آرام سے تکیہ لگا کر لیٹ جائیں۔ ایک گرم چائے کی چسکی لیں، آپ کے اس بچے کی جان آپ پر قربان، ہم آپ کی خدمت کے لیے ہر وقت حاضر ہیں ان شاء اللہ۔ ☕",
    eng: "Ammi Jaan, please leave all chores and lean back on a cozy pillow. Take a warm sip of tea. Your child is always at your service in-sha-Allah."
  },
  sad: {
    urdu: "امی جان، اپنے اس بچے کو معاف کر دیجیے۔ آپ کی آنکھوں کا ایک آنسو اور دل کا ملال ہمارے لیے ناقابلِ برداشت ہے۔ ہم دل سے آپ سے معافی مانگتے ہیں اور آپ کے گلے لگتے ہیں۔ پلیز مسکرا دیجیے۔ 💖",
    eng: "Ammi Jaan, please forgive your child. Even a single tear or sorrow in your heart is unbearable for us. We hug you tightly in our hearts. Please smile for us. 💖"
  }
};

moodBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    soundEngine.playSoftChime();
    if (navigator.vibrate) navigator.vibrate(30);

    moodBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    const mood = btn.getAttribute('data-mood');
    const reply = moodResponses[mood];

    if (reply) {
      moodResponseUrdu.textContent = reply.urdu;
      moodResponseEng.textContent = reply.eng;
      moodResponseBox.classList.add('visible');
    }

    if (mood === 'sad') {
      triggerFloatingPetals();
    }
  });
});

// --- 5. AMMI'S TEA CORNER (Bilingual) ---
const chaiThoughts = [
  {
    urdu: "امی جان، گرم چائے کا گھونٹ لیں اور سکون فرمائیں۔ آپ کا یہ بچہ آپ کی خدمت کے لیے ہر وقت حاضر ہے ان شاء اللہ۔",
    eng: "Ammi Jaan, take a warm sip of tea and relax. Your child is always at your service in-sha-Allah."
  },
  {
    urdu: "امی جان! دنیا کا کوئی بھی شیف اتنی لذیذ اور پرسکون چائے نہیں بنا سکتا جتنی آپ کے پیار بھرے ہاتھوں کی ہوتی ہے۔",
    eng: "Ammi Jaan! No chef in the world can brew tea as soothing and delicious as the one made by your loving hands."
  },
  {
    urdu: "ایک گرم چائے کا گھونٹ لیں، گہری سانس لیں اور دنیا کی ہر پریشانی کو ایک طرف رکھ دیں۔ آپ ہمارے دل کا سکھ ہیں۔",
    eng: "Take a warm sip of tea, take a deep breath, and set aside every worry. You are the peace of our hearts."
  },
  {
    urdu: "چائے کی یہ گرمی آپ کی اس ممتا کی یاد دلاتی ہے جس نے بچپن سے لے کر آج تک ہمیں سرد موسموں اور دکھوں سے محفوظ رکھا۔",
    eng: "The warmth of this tea reminds me of your maternal shelter that protected us from every chill and sorrow."
  },
  {
    urdu: "جب بھی آپ مسکراتی ہیں، لگتا ہے کہ دنیا کی سب سے میٹھی چائے میں الائچی اور زعفران کی خوشبو گھل گئی ہو۔",
    eng: "Whenever you smile, it feels like cardamom and saffron have scented the sweetest cup of tea in the world."
  },
  {
    urdu: "امی جان، اگر کبھی میں نے چائے پیتے ہوئے آپ کی طرف توجہ نہ دی ہو تو مجھے معاف کیجیے گا۔ میرا دل ہمیشہ صرف آپ کے لیے ہے۔",
    eng: "Ammi Jaan, if I was ever distracted and didn't give you my full attention, please forgive me. My heart is always yours."
  }
];

let currentChaiIndex = 0;
const teacupWrap = document.getElementById('teacup-interactive');
const chaiUrduElem = document.getElementById('chai-urdu-text');
const chaiEngElem = document.getElementById('chai-eng-text');
const btnSipTea = document.getElementById('btn-sip-tea');

function rotateChaiThought() {
  soundEngine.playSoftChime();
  if (navigator.vibrate) navigator.vibrate(35);

  teacupWrap.style.transform = 'scale(0.92) rotate(-5deg)';
  setTimeout(() => {
    teacupWrap.style.transform = '';
  }, 220);

  currentChaiIndex = (currentChaiIndex + 1) % chaiThoughts.length;
  
  chaiUrduElem.style.opacity = '0';
  chaiEngElem.style.opacity = '0';
  
  setTimeout(() => {
    chaiUrduElem.textContent = chaiThoughts[currentChaiIndex].urdu;
    chaiEngElem.textContent = chaiThoughts[currentChaiIndex].eng;
    chaiUrduElem.style.opacity = '1';
    chaiEngElem.style.opacity = '1';
  }, 250);
}

teacupWrap.addEventListener('click', rotateChaiThought);
btnSipTea.addEventListener('click', rotateChaiThought);

// --- 6. DIGITAL WARM HUG & PETALS ANIMATION ---
const btnHug = document.getElementById('btn-give-hug');
const hugDialog = document.getElementById('hug-dialog');
const petalsLayer = document.getElementById('petals-layer');

function triggerFloatingPetals() {
  const petals = ['🌸', '🌹', '🌿', '✨', '💐'];
  const count = 28;

  for (let i = 0; i < count; i++) {
    const petal = document.createElement('div');
    petal.className = 'floating-petal';
    petal.textContent = petals[Math.floor(Math.random() * petals.length)];
    petal.style.left = `${Math.random() * 96}%`;
    petal.style.fontSize = `${Math.random() * 16 + 18}px`;
    petal.style.animationDuration = `${Math.random() * 2 + 3}s`;
    petal.style.animationDelay = `${Math.random() * 0.8}s`;

    petalsLayer.appendChild(petal);

    setTimeout(() => {
      petal.remove();
    }, 4500);
  }
}

btnHug.addEventListener('click', () => {
  soundEngine.playSoftChime();
  if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
  triggerFloatingPetals();
  hugDialog.showModal();
});

function setupDialogLightDismiss(dialog) {
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (!isDialogContent) {
        dialog.close();
      }
    });
  }
}
setupDialogLightDismiss(hugDialog);

const btnCloseHug = document.getElementById('btn-close-hug');
if (btnCloseHug) {
  btnCloseHug.addEventListener('click', () => hugDialog.close());
}

// --- 7. UNFOLDING APOLOGY & LOVE LETTER ---
const letterCover = document.getElementById('letter-cover');
const letterDialog = document.getElementById('letter-dialog');
const btnCloseLetter = document.getElementById('btn-close-letter');

letterCover.addEventListener('click', () => {
  soundEngine.playSoftChime();
  if (navigator.vibrate) navigator.vibrate(30);
  triggerFloatingPetals();
  letterDialog.showModal();
});

setupDialogLightDismiss(letterDialog);

if (btnCloseLetter) {
  btnCloseLetter.addEventListener('click', () => letterDialog.close());
}

// --- 8. BOUQUET OF 10 REASONS (Bilingual) ---
const flowersData = [
  {
    urdu: "۱. آپ کا نرم اور معاف کرنے والا دل — جو ہر غلطی کو پیار میں بدل دیتا ہے۔",
    eng: "1. Your soft and forgiving heart — which turns every mistake into love."
  },
  {
    urdu: "۲. آپ کی وہ راتوں کی خاموش دعائیں — جو ہر مشکل میں میری ڈھال بنتی ہیں۔",
    eng: "2. Your quiet late-night prayers — that act as my shield in every hardship."
  },
  {
    urdu: "۳. آپ کی میٹھی مسکراہٹ — جس سے ہمارا پورا گھر مسرت اور روشنی سے بھر جاتا ہے۔",
    eng: "3. Your sweet smile — which fills our entire home with joy and light."
  },
  {
    urdu: "۴. آپ کی محبت بھری گود — جو دنیا کا سب سے زیادہ پرامن اور محفوظ ٹھکانہ ہے۔",
    eng: "4. Your loving lap — the most peaceful and safe haven in the entire world."
  },
  {
    urdu: "۵. آپ کے ہاتھوں کی بنی چائے — جس میں آپ کی خالص ممتا اور شفقت کا ذائقہ ہے۔",
    eng: "5. The tea from your hands — carrying the pure taste of maternal kindness."
  },
  {
    urdu: "۶. آپ کا بے پناہ صبر اور قربانیاں — جو آپ نے ہم سب کی خوشیوں کے لیے دیں۔",
    eng: "6. Your boundless patience and sacrifices — made selflessly for all of our happiness."
  },
  {
    urdu: "۷. جب بھی میں بیمار ہوا، آپ کا رات بھر جاگنا اور سر پر پیار سے ہاتھ پھیرنا۔",
    eng: "7. Whenever I fell ill, your sleepless nights and gentle hand stroking my forehead."
  },
  {
    urdu: "۸. آپ کی وہ نرم نصیحتیں — جن کی قدر مجھے ہر گزرتے دن کے ساتھ بڑھتی جا رہی ہے۔",
    eng: "8. Your gentle guidance — whose precious worth grows deeper with each passing day."
  },
  {
    urdu: "۹. آپ کی موجودگی کا احساس — جو مجھے اکیلا پن اور خوف کبھی محسوس نہیں ہونے دیتا۔",
    eng: "9. The comfort of your presence — that never lets loneliness or fear touch me."
  },
  {
    urdu: "۱۰. آپ، جن کے قدموں تلے میرے اللہ نے میری جنت رکھ دی ہے۔",
    eng: "10. You, beneath whose feet my Lord has placed my Paradise."
  }
];

let unlockedCount = 1;
const flowerSlots = document.querySelectorAll('.flower-slot');
const flowerActiveUrdu = document.getElementById('flower-active-urdu');
const flowerActiveEng = document.getElementById('flower-active-eng');
const bouquetProgressBar = document.getElementById('bouquet-progress-bar');
const bouquetStatusBadge = document.getElementById('bouquet-status-badge');

flowerSlots.forEach((slot, index) => {
  slot.addEventListener('click', () => {
    soundEngine.playSoftChime();
    if (navigator.vibrate) navigator.vibrate(30);

    if (!slot.classList.contains('unlocked')) {
      slot.classList.add('unlocked');
      slot.innerHTML = `🌸<span class="flower-number-badge">${index + 1}</span>`;
      unlockedCount = document.querySelectorAll('.flower-slot.unlocked').length;
      
      const percent = (unlockedCount / 10) * 100;
      bouquetProgressBar.style.width = `${percent}%`;
      bouquetStatusBadge.textContent = `${unlockedCount} / 10 Flowers Blossomed`;

      if (unlockedCount === 10) {
        triggerFloatingPetals();
        bouquetStatusBadge.textContent = 'Masha\'Allah! Entire Bouquet Bloomed! 💐';
      }
    }

    flowerActiveUrdu.style.opacity = '0';
    flowerActiveEng.style.opacity = '0';
    setTimeout(() => {
      flowerActiveUrdu.textContent = flowersData[index].urdu;
      flowerActiveEng.textContent = flowersData[index].eng;
      flowerActiveUrdu.style.opacity = '1';
      flowerActiveEng.style.opacity = '1';
    }, 200);
  });
});

// --- 9. TACTILE PEARL TASBIH (Bilingual) ---
const dhikrPresets = [
  {
    arabic: "سُبْحَانَ اللَّهِ",
    urdu: "اللہ ہر عیب اور خامی سے پاک ہے",
    eng: "Glory be to Allah — free from all imperfection",
    target: 33
  },
  {
    arabic: "الْحَمْدُ لِلَّهِ",
    urdu: "تمام تعریفیں اور شکر صرف اللہ کے لیے ہیں",
    eng: "All praise and gratitude belong solely to Allah",
    target: 33
  },
  {
    arabic: "اللَّهُ أَكْبَرُ",
    urdu: "اللہ سب سے بڑا اور سب سے برتر ہے",
    eng: "Allah is the Greatest, above all things",
    target: 34
  },
  {
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    urdu: "میں اللہ سے اپنے تمام گناہوں کی بخشش مانگتا ہوں",
    eng: "I seek forgiveness from Allah, the Most Merciful",
    target: 100
  },
  {
    arabic: "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ",
    urdu: "اے اللہ! ہمارے پیارے نبی محمد ﷺ پر رحمت اور سلامتی نازل فرما",
    eng: "O Allah, send peace and blessings upon Prophet Muhammad ﷺ",
    target: 100
  },
  {
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    urdu: "گناہوں سے بچنے اور نیکی کرنے کی طاقت صرف اللہ کی مدد سے ہے",
    eng: "There is no power nor might except with Allah",
    target: 33
  }
];

let activeDhikrIndex = 0;
let tasbihCounts = JSON.parse(localStorage.getItem('parveen_tasbih_counts') || '[0,0,0,0,0,0]');

const currentDhikrArabic = document.getElementById('current-dhikr-arabic');
const currentDhikrUrdu = document.getElementById('current-dhikr-urdu');
const currentDhikrEng = document.getElementById('current-dhikr-eng');
const tasbihCountDisplay = document.getElementById('tasbih-count-display');
const tasbihTargetLabel = document.getElementById('tasbih-target-label');
const tasbihCircle = document.getElementById('tasbih-circle-btn');
const dhikrTabs = document.querySelectorAll('.dhikr-tab-pill');
const btnResetTasbih = document.getElementById('btn-reset-tasbih');

function updateTasbihUI() {
  const dhikr = dhikrPresets[activeDhikrIndex];
  currentDhikrArabic.textContent = dhikr.arabic;
  currentDhikrUrdu.textContent = dhikr.urdu;
  currentDhikrEng.textContent = dhikr.eng;
  tasbihCountDisplay.textContent = tasbihCounts[activeDhikrIndex];
  tasbihTargetLabel.textContent = `Target / ہدف: ${dhikr.target}`;

  dhikrTabs.forEach((tab, idx) => {
    tab.classList.toggle('active', idx === activeDhikrIndex);
  });

  localStorage.setItem('parveen_tasbih_counts', JSON.stringify(tasbihCounts));
}

tasbihCircle.addEventListener('click', () => {
  soundEngine.playBeadSound();
  if (navigator.vibrate) navigator.vibrate(25);

  tasbihCounts[activeDhikrIndex]++;
  
  tasbihCircle.style.transform = 'scale(0.92)';
  setTimeout(() => {
    tasbihCircle.style.transform = '';
  }, 120);

  if (tasbihCounts[activeDhikrIndex] === dhikrPresets[activeDhikrIndex].target) {
    if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
    triggerFloatingPetals();
  }

  updateTasbihUI();
});

dhikrTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    activeDhikrIndex = index;
    updateTasbihUI();
  });
});

btnResetTasbih.addEventListener('click', () => {
  tasbihCounts[activeDhikrIndex] = 0;
  updateTasbihUI();
  if (navigator.vibrate) navigator.vibrate(20);
});

updateTasbihUI();

// --- 10. DAILY DUA JAR (Bilingual) ---
const duasList = [
  {
    arabic: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    urdu: "اے میرے پروردگار! میری امی جان پر اسی طرح رحم فرما جس طرح انہوں نے بچپن میں مجھے شفقت اور محبت سے پالا۔",
    eng: "My Lord, have mercy upon my mother as she brought me up when I was small."
  },
  {
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ لَهَا الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
    urdu: "یا اللہ! میں میری امی پروین بانو کے لیے دنیا اور آخرت میں کامل عافیت، صحت اور معافی کا سوال کرتا ہوں۔",
    eng: "O Allah, I ask You for complete well-being, vibrant health, and pardon for my mother in this world and the Hereafter."
  },
  {
    arabic: "اللَّهُمَّ اشْفِهَا شِفَاءً لَا يُغَادِرُ سَقَمًا",
    urdu: "اے اللہ! میری امی جان کو ایسی کامل شفا عطا فرما جس کے بعد کوئی بیماری، درد اور کمزوری باقی نہ رہے۔",
    eng: "O Allah, grant her a complete cure and relief that leaves behind no illness or pain."
  },
  {
    arabic: "اللَّهُمَّ اجْعَلْهَا مِنْ أَهْلِ الْجَنَّةِ وَارْزُقْهَا الْفِرْدَوْسَ الْأَعْلَى",
    urdu: "یا باری تعالیٰ! میری پیاری امی جان کو بغیر حساب کتاب کے جنت الفردوس کے اعلیٰ درجات میں جگہ عطا فرما۔",
    eng: "O Allah, make her of the honored people of Jannah and grant her the highest station in Jannat al-Firdaus."
  },
  {
    arabic: "اللَّهُمَّ أَدْخِلِ السَّكِينَةَ فِي قَلْبِهَا وَأَبْعِدْ عَنْهَا كُلَّ هَمٍّ وَحُزْنٍ",
    urdu: "اے اللہ! میری امی کے دل میں دائمی سکون اور چین اتار دے، اور ان سے ہر قسم کا غم، ملال اور پریشانی دور فرما دے۔",
    eng: "O Allah, instill eternal peace in her heart and banish every ounce of worry, grief, and sadness from her life."
  }
];

let currentDuaIdx = 0;
const crystalJar = document.getElementById('crystal-jar-btn');
const btnDrawDua = document.getElementById('btn-draw-dua');
const duaArabicElem = document.getElementById('dua-arabic-text');
const duaUrduElem = document.getElementById('dua-urdu-text');
const duaEngElem = document.getElementById('dua-eng-text');

function drawNewDua() {
  soundEngine.playSoftChime();
  if (navigator.vibrate) navigator.vibrate(30);

  currentDuaIdx = (currentDuaIdx + 1) % duasList.length;
  
  duaArabicElem.style.opacity = '0';
  duaUrduElem.style.opacity = '0';
  duaEngElem.style.opacity = '0';

  setTimeout(() => {
    duaArabicElem.textContent = duasList[currentDuaIdx].arabic;
    duaUrduElem.textContent = duasList[currentDuaIdx].urdu;
    duaEngElem.textContent = duasList[currentDuaIdx].eng;
    duaArabicElem.style.opacity = '1';
    duaUrduElem.style.opacity = '1';
    duaEngElem.style.opacity = '1';
  }, 220);
}

crystalJar.addEventListener('click', drawNewDua);
btnDrawDua.addEventListener('click', drawNewDua);

// --- 11. PROMISES TO AMMI (Bilingual) ---
const promiseItems = document.querySelectorAll('.promise-item');
let storedPromises = JSON.parse(localStorage.getItem('parveen_promises') || '[true, true, true, true, true]');

promiseItems.forEach((item, idx) => {
  if (storedPromises[idx]) {
    item.classList.add('checked');
    item.querySelector('.promise-checkbox').textContent = '✓';
  } else {
    item.classList.remove('checked');
    item.querySelector('.promise-checkbox').textContent = '';
  }

  item.addEventListener('click', () => {
    soundEngine.playSoftChime();
    if (navigator.vibrate) navigator.vibrate(20);
    const isChecked = item.classList.toggle('checked');
    item.querySelector('.promise-checkbox').textContent = isChecked ? '✓' : '';
    storedPromises[idx] = isChecked;
    localStorage.setItem('parveen_promises', JSON.stringify(storedPromises));
  });
});

// --- 12. FONT SIZE ADJUSTER ---
let currentFontSize = 16;
const btnFontMinus = document.getElementById('btn-font-minus');
const btnFontPlus = document.getElementById('btn-font-plus');

if (btnFontMinus && btnFontPlus) {
  btnFontMinus.addEventListener('click', () => {
    if (currentFontSize > 13) {
      currentFontSize--;
      document.documentElement.style.fontSize = `${currentFontSize}px`;
    }
  });

  btnFontPlus.addEventListener('click', () => {
    if (currentFontSize < 21) {
      currentFontSize++;
      document.documentElement.style.fontSize = `${currentFontSize}px`;
    }
  });
}

// --- 13. MOBILE BOTTOM NAVIGATION ---
const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  let currentSec = '';
  const scrollPos = window.scrollY + 180;

  sections.forEach((sec) => {
    const top = sec.offsetTop;
    const height = sec.offsetHeight;
    if (scrollPos >= top && scrollPos < top + height) {
      currentSec = sec.getAttribute('id');
    }
  });

  bottomNavItems.forEach((nav) => {
    const href = nav.getAttribute('href').replace('#', '');
    nav.classList.toggle('active', href === currentSec);
  });
});

// --- 14. SERVICE WORKER REGISTRATION (PWA Offline) ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
