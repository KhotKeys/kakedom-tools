/* ── KÄKEDOM FARMING ASSISTANT — APP LOGIC ── */

document.addEventListener("DOMContentLoaded", function() {

// ── CONFIG (update in Settings or edit here) ──
// ANTHROPIC_API_KEY and CHATBOT_UNAVAILABLE_MESSAGE come from chatbot-config.js
var FIREBASE_DB_PATH  = "smart_agriculture";

var firebaseConfig = {
  apiKey:            "AIzaSyBOJSo0b_AN4HB7wHVN8ERAAgGkilTnZWk",
  authDomain:        "cmua-7957a.firebaseapp.com",
  databaseURL:       "https://cmua-7957a-default-rtdb.firebaseio.com",
  projectId:         "cmua-7957a",
  storageBucket:     "cmua-7957a.firebasestorage.app",
  messagingSenderId: "273566170303",
  appId:             "1:273566170303:web:3d02105c5dd0e15e251a0a"
};

// ── STATE ──
var sensorData = null;
var prevData   = null;
var conversationHistory = [];
var isLoading  = false;

// ── FIREBASE INIT (compat SDK — no module scope issue) ──
firebase.initializeApp(firebaseConfig);
var db         = firebase.database();
var sensorRef  = db.ref(FIREBASE_DB_PATH);

// ── SENSOR HELPERS ──
var ICONS = {
  moisture: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5e8d83" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
  ph:       '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a6a3a" stroke-width="2" stroke-linecap="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>',
  temp:     '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c0392b" stroke-width="2" stroke-linecap="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>',
  humidity: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3a9bd5" stroke-width="2" stroke-linecap="round"><path d="M8 19a4 4 0 0 1 8 0"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="4.22" y1="4.22" x2="7.05" y2="7.05"/><line x1="19.78" y1="4.22" x2="16.95" y2="7.05"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>'
};

function barColor(key, val) {
  if (key === "moisture") return val < 30 ? "#e8a020" : val > 70 ? "#3a9bd5" : "#5e8d83";
  if (key === "ph")       return (val < 6 || val > 7.5) ? "#e8a020" : "#5e8d83";
  if (key === "temp")     return val > 35 ? "#c0392b" : "#5e8d83";
  if (key === "humidity") return val < 40 ? "#e8a020" : "#3a9bd5";
  return "#5e8d83";
}

function barHeight(key, val) {
  var ranges = { moisture:[0,100], ph:[0,14], temp:[0,50], humidity:[0,100] };
  var r = ranges[key] || [0,100];
  return Math.max(8, Math.min(100, ((val - r[0]) / (r[1] - r[0])) * 100));
}

function renderSensorPanel(data) {
  var sensors = [
    { key:"moisture", label:"Soil Moisture", val:data.soil_moisture_percent, unit:"%",  cls:"moisture" },
    { key:"ph",       label:"Soil pH",        val:data.soil_ph,              unit:"",   cls:"ph"       },
    { key:"temp",     label:"Temperature",    val:data.temperature_C,        unit:"°C", cls:"temp"     },
    { key:"humidity", label:"Air Humidity",   val:data.humidity_percent,     unit:"%",  cls:"humidity" }
  ];

  var html = sensors.map(function(s) {
    var h  = barHeight(s.key, s.val);
    var c  = barColor(s.key, s.val);
    var ch = prevData && prevData[s.key] !== s.val;
    return '<div class="sensor-card' + (ch ? " updated" : "") + '">' +
      '<div class="sensor-icon-wrap ' + s.cls + '">' + ICONS[s.key] + '</div>' +
      '<div class="sensor-data">' +
        '<div class="sensor-val">' + s.val + s.unit + '</div>' +
        '<div class="sensor-lbl">' + s.label + '</div>' +
      '</div>' +
      '<div class="sensor-bar-wrap">' +
        '<div class="sensor-bar-fill" style="height:' + h + '%;background:' + c + ';"></div>' +
      '</div>' +
    '</div>';
  }).join('');

  document.getElementById("sensorPanel").innerHTML = html;
  prevData = { moisture:data.soil_moisture_percent, ph:data.soil_ph, temp:data.temperature_C, humidity:data.humidity_percent };
}

function renderSensorError() {
  document.getElementById("sensorPanel").innerHTML =
    '<div class="sensor-loading-strip">Could not load sensor data — check your connection.</div>';
}

// ── FIREBASE LISTENER ──
sensorRef.on("value", function(snap) {
  var d = snap.val();
  if (d) { sensorData = d; renderSensorPanel(d); }
}, function() { renderSensorError(); });

// initial fetch to show data immediately
sensorRef.once("value", function(snap) {
  var d = snap.val();
  if (d) {
    sensorData = d;
    renderSensorPanel(d);
    addSysMsg("Sensors connected &nbsp;&middot;&nbsp; Moisture " + d.soil_moisture_percent + "% &nbsp;&middot;&nbsp; pH " + d.soil_ph + " &nbsp;&middot;&nbsp; Temp " + d.temperature_C + "°C &nbsp;&middot;&nbsp; Humidity " + d.humidity_percent + "%");
  }
}, function() { renderSensorError(); });

// ── REFRESH ──
document.getElementById("refreshBtn").addEventListener("click", function() {
  var btn = document.getElementById("refreshBtn");
  btn.classList.add("spinning");
  sensorRef.once("value", function(snap) {
    var d = snap.val();
    if (d) { sensorData = d; renderSensorPanel(d); }
    addSysMsg("Sensors refreshed.");
    btn.classList.remove("spinning");
  }, function() {
    renderSensorError();
    btn.classList.remove("spinning");
  });
});

// ── SETTINGS MODAL ──
document.getElementById("settingsBtn").addEventListener("click", function() {
  // API key is managed by admin — not shown to farmers
  document.getElementById("settingsModal").classList.add("open");
});

document.getElementById("modalCloseBtn").addEventListener("click", function() {
  document.getElementById("settingsModal").classList.remove("open");
});

document.getElementById("modalCancelBtn").addEventListener("click", function() {
  document.getElementById("settingsModal").classList.remove("open");
});

document.getElementById("settingsModal").addEventListener("click", function(e) {
  if (e.target === document.getElementById("settingsModal")) {
    document.getElementById("settingsModal").classList.remove("open");
  }
});

document.getElementById("modalSaveBtn").addEventListener("click", function() {
  var url = document.getElementById("settingsFirebaseUrl").value.trim();
  if (url && url !== firebaseConfig.databaseURL) {
    addSysMsg("Settings saved. Reload the page to apply changes.");
  } else {
    addSysMsg("Settings saved.");
  }
  document.getElementById("settingsModal").classList.remove("open");
});

// ── SIDEBAR (mobile) ──
function openSidebar() {
  document.getElementById("sidebar").classList.add("open");
  document.getElementById("sidebarBackdrop").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarBackdrop").classList.remove("open");
  document.body.style.overflow = "";
}

document.getElementById("topbarMenuBtn").addEventListener("click", openSidebar);
document.getElementById("sidebarToggle") && document.getElementById("sidebarToggle").addEventListener("click", openSidebar);
document.getElementById("sidebarCloseBtn").addEventListener("click", closeSidebar);
document.getElementById("sidebarBackdrop").addEventListener("click", closeSidebar);

// ── CLAUDE API ──
function buildContext() {
  if (!sensorData) return "No live sensor data available right now.";
  return "Live farm sensor readings:\n" +
    "- Soil moisture: " + sensorData.soil_moisture_percent + "%\n" +
    "- Soil pH: " + sensorData.soil_ph + "\n" +
    "- Soil temperature: " + sensorData.temperature_C + "°C\n" +
    "- Air humidity: " + sensorData.humidity_percent + "%";
}

function callClaude(userMsg, callback) {
  var system = "You are Käkedom Farming Assistant, helping refugee farmers in Kiryandongo Refugee Settlement, Uganda.\n\n" +
    buildContext() + "\n\n" +
    "Give simple, warm, practical farming advice using this live data. No jargon. Short sentences. " +
    "Always mention the actual sensor numbers. End with one encouraging sentence.\n\n" +
    "Guidelines:\n" +
    "- Moisture < 30% → water crops now\n" +
    "- Moisture > 70% → stop watering, let soil drain\n" +
    "- pH < 6.0 → add organic manure or lime\n" +
    "- pH > 7.5 → add compost\n" +
    "- Temp > 35°C → water early morning or evening only\n" +
    "- Humidity < 40% → warn of dry conditions";

  if (chatbotKeyMissing()) {
    var missing = new Error("Anthropic key not set");
    missing.unavailable = true;
    callback(missing, null);
    return;
  }

  conversationHistory.push({ role: "user", content: userMsg });

  fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system: system,
      messages: conversationHistory
    })
  })
  .then(function(res) {
    if (res.status === 401) {
      var denied = new Error("Anthropic key rejected (401)");
      denied.unavailable = true;
      throw denied;
    }
    return res.json();
  })
  .then(function(data) {
    if (data.error) throw new Error(data.error.message);
    var reply = data.content[0].text;
    conversationHistory.push({ role: "assistant", content: reply });
    callback(null, reply);
  })
  .catch(function(err) { callback(err, null); });
}

// ── RENDER MESSAGES ──
function nowTime() {
  return new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
}

function addMsg(role, text) {
  var c   = document.getElementById("chatContainer");
  var div = document.createElement("div");
  div.className = "msg-row " + role;

  var aiAvatar   = '<div class="msg-avatar ai"><svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.5 2 5 5.5 5 9.5c0 5.5 7 12.5 7 12.5s7-7 7-12.5C19 5.5 15.5 2 12 2z"/></svg></div>';
  var userAvatar = '<div class="msg-avatar user"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c8e8e4" stroke-width="2.2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>';

  var body = '<div class="msg-body">' +
    '<div class="bubble ' + role + '">' + text.replace(/\n/g, "<br>") + '</div>' +
    '<div class="msg-time">' + nowTime() + '</div>' +
  '</div>';

  div.innerHTML = role === "user" ? body + userAvatar : aiAvatar + body;
  c.appendChild(div);
  c.scrollTop = c.scrollHeight;
}

function addSysMsg(text) {
  var c   = document.getElementById("chatContainer");
  var div = document.createElement("div");
  div.className = "sys-msg";
  div.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' + text;
  c.appendChild(div);
  c.scrollTop = c.scrollHeight;
}

function showTyping() {
  var c   = document.getElementById("chatContainer");
  var div = document.createElement("div");
  div.className = "msg-row ai";
  div.id = "typingRow";
  div.innerHTML = '<div class="msg-avatar ai"><svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.5 2 5 5.5 5 9.5c0 5.5 7 12.5 7 12.5s7-7 7-12.5C19 5.5 15.5 2 12 2z"/></svg></div>' +
    '<div class="msg-body"><div class="bubble ai"><div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div></div>';
  c.appendChild(div);
  c.scrollTop = c.scrollHeight;
}

function hideTyping() {
  var el = document.getElementById("typingRow");
  if (el) el.remove();
}

// ── SEND MESSAGE ──
function sendMessage() {
  var inp  = document.getElementById("userInput");
  var text = inp.value.trim();
  if (!text || isLoading) return;

  isLoading = true;
  document.getElementById("sendBtn").disabled = true;
  inp.value = "";
  inp.style.height = "auto";

  addMsg("user", text);
  showTyping();

  callClaude(text, function(err, reply) {
    hideTyping();
    if (err) {
      if (err.unavailable) {
        addMsg("ai", CHATBOT_UNAVAILABLE_MESSAGE);
      } else {
        addMsg("ai", "I could not connect right now. Please check your internet connection and try again.");
      }
      console.warn("Chat error:", err.message);
    } else {
      addMsg("ai", reply);
    }
    isLoading = false;
    document.getElementById("sendBtn").disabled = false;
    inp.focus();
  });
}

// ── QUICK CHIPS ──
document.querySelectorAll(".quick-chip").forEach(function(btn) {
  btn.addEventListener("click", function() {
    var msg = btn.getAttribute("data-msg");
    document.getElementById("userInput").value = msg;
    sendMessage();
  });
});

// ── INPUT EVENTS ──
document.getElementById("sendBtn").addEventListener("click", sendMessage);

document.getElementById("userInput").addEventListener("keydown", function(e) {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

document.getElementById("userInput").addEventListener("input", function() {
  this.style.height = "auto";
  this.style.height = Math.min(this.scrollHeight, 120) + "px";
});

// ── FEATURE SIDEBAR ITEMS ──
var featurePrompts = {
  "Crop Planner":       "Based on my current soil data, what crops should I plan to grow next season and what preparation do I need to do?",
  "Pest & Disease": "Based on my current soil conditions, what pests or diseases should I watch out for and how do I prevent or treat them?",
  "Water Management":   "Based on my soil moisture and weather conditions, give me a water management and irrigation schedule for my crops.",
  "Yield Forecast":     "Based on my current soil health data, what is my likely crop yield this season and how can I improve it?",
  "Market Prices":      "What crops are typically most valuable to sell in Uganda right now, and which ones suit my current soil conditions best?"
};

document.querySelectorAll(".chat-item[data-feature]").forEach(function(item) {
  item.addEventListener("click", function() {
    // set active state
    document.querySelectorAll(".chat-item").forEach(function(i) { i.classList.remove("active"); });
    item.classList.add("active");

    // update topbar title
    var feature = item.getAttribute("data-feature");
    document.querySelector(".topbar-title").textContent = feature;

    // send the feature prompt
    var msg = featurePrompts[feature];
    if (msg) {
      document.getElementById("userInput").value = msg;
      sendMessage();
    }

    // close sidebar on mobile
    closeSidebar();
  });
});

// My Farm Analysis item
var farmAnalysisItem = document.querySelector('.chat-item[data-feature="My Farm Analysis"], .chat-item:not([data-feature])');
if (farmAnalysisItem) {
  farmAnalysisItem.addEventListener("click", function() {
    document.querySelectorAll(".chat-item").forEach(function(i) { i.classList.remove("active"); });
    farmAnalysisItem.classList.add("active");
    document.querySelector(".topbar-title").textContent = "My Farm Analysis";
    closeSidebar();
  });
}


}); // end DOMContentLoaded
