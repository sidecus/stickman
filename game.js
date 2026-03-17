const UNIT_ORDER = ["fighter", "archer", "shield", "giant"];
const LANE_NAMES = {
  top: "上路",
  bottom: "下路",
};
const AI_FOCUS_LABELS = {
  balanced: "均衡",
  brace: "固守",
  volley: "齐射",
  power: "强攻",
};

const UNIT_TYPES = {
  fighter: {
    id: "fighter",
    label: "战士",
    hotkey: "1",
    cost: 50,
    cooldown: 1.4,
    maxHealth: 120,
    damage: 12,
    speed: 46,
    range: 24,
    aggroRange: 110,
    attackInterval: 0.75,
    radius: 13,
    description: "便宜耐用，适合顶在前线。",
    goodAgainst: "弓箭手和空虚一路",
    strugglesAgainst: "盾兵和巨人防线",
    weight: 1,
  },
  archer: {
    id: "archer",
    label: "弓箭手",
    hotkey: "2",
    cost: 80,
    cooldown: 2.6,
    maxHealth: 72,
    damage: 14,
    speed: 44,
    range: 196,
    aggroRange: 230,
    attackInterval: 1.05,
    projectileSpeed: 420,
    radius: 12,
    description: "在后排持续提供远程伤害。",
    goodAgainst: "巨人和僵持战线",
    strugglesAgainst: "冲进后排的战士",
    weight: 1.15,
  },
  shield: {
    id: "shield",
    label: "盾兵",
    hotkey: "3",
    cost: 95,
    cooldown: 3.4,
    maxHealth: 250,
    damage: 10,
    speed: 38,
    range: 24,
    aggroRange: 102,
    attackInterval: 0.9,
    radius: 16,
    description: "高生命低伤害的近战肉盾。",
    goodAgainst: "弓箭手和守住压力",
    strugglesAgainst: "巨人和慢速推进",
    weight: 1.35,
  },
  giant: {
    id: "giant",
    label: "巨人",
    hotkey: "4",
    cost: 190,
    cooldown: 7.2,
    maxHealth: 430,
    damage: 36,
    speed: 28,
    range: 30,
    aggroRange: 120,
    attackInterval: 1.45,
    radius: 24,
    description: "缓慢但压迫感极强，正面很难挡住。",
    goodAgainst: "基地和肉盾前排",
    strugglesAgainst: "集火弓箭手",
    weight: 2.4,
  },
};

const MAP = {
  width: 1280,
  height: 720,
  middleY: 360,
  topY: 210,
  bottomY: 510,
  topSegmentStart: 360,
  topSegmentEnd: 920,
  bottomSegmentStart: 360,
  bottomSegmentEnd: 920,
  leftRampX: 260,
  rightRampX: 1020,
};

const LANE_ORDER = ["top", "bottom"];
const LANE_LABELS = {
  top: "上路",
  bottom: "下路",
};

const TEAMS = {
  red: {
    id: "red",
    name: "红方",
    color: "#d75a55",
    soft: "#f3b1ab",
    baseColor: "rgba(215, 90, 85, 0.18)",
    side: "left",
    direction: 1,
    baseCenterX: 110,
    baseContactX: 155,
    spawnX: 185,
    enemy: "blue",
  },
  blue: {
    id: "blue",
    name: "蓝方",
    color: "#4b7ef1",
    soft: "#b0cafc",
    baseColor: "rgba(75, 126, 241, 0.18)",
    side: "right",
    direction: -1,
    baseCenterX: 1170,
    baseContactX: 1125,
    spawnX: 1095,
    enemy: "red",
  },
};

const ROUTES = {
  red: {
    top: [
      { x: 185, y: MAP.middleY },
      { x: 260, y: MAP.middleY },
      { x: 360, y: MAP.topY },
      { x: 920, y: MAP.topY },
      { x: 1020, y: MAP.middleY },
      { x: 1125, y: MAP.middleY },
    ],
    bottom: [
      { x: 185, y: MAP.middleY },
      { x: 260, y: MAP.middleY },
      { x: 360, y: MAP.bottomY },
      { x: 920, y: MAP.bottomY },
      { x: 1020, y: MAP.middleY },
      { x: 1125, y: MAP.middleY },
    ],
  },
  blue: {
    top: [
      { x: 1095, y: MAP.middleY },
      { x: 1020, y: MAP.middleY },
      { x: 920, y: MAP.topY },
      { x: 360, y: MAP.topY },
      { x: 260, y: MAP.middleY },
      { x: 155, y: MAP.middleY },
    ],
    bottom: [
      { x: 1095, y: MAP.middleY },
      { x: 1020, y: MAP.middleY },
      { x: 920, y: MAP.bottomY },
      { x: 360, y: MAP.bottomY },
      { x: 260, y: MAP.middleY },
      { x: 155, y: MAP.middleY },
    ],
  },
};

const PLATFORM_SEGMENTS = [
  { x1: 70, y1: MAP.middleY, x2: MAP.leftRampX + 40, y2: MAP.middleY },
  { x1: MAP.rightRampX - 40, y1: MAP.middleY, x2: 1210, y2: MAP.middleY },
  { x1: MAP.leftRampX, y1: MAP.middleY, x2: MAP.topSegmentStart, y2: MAP.topY },
  { x1: MAP.rightRampX, y1: MAP.middleY, x2: MAP.topSegmentEnd, y2: MAP.topY },
  { x1: MAP.leftRampX, y1: MAP.middleY, x2: MAP.bottomSegmentStart, y2: MAP.bottomY },
  { x1: MAP.rightRampX, y1: MAP.middleY, x2: MAP.bottomSegmentEnd, y2: MAP.bottomY },
  { x1: MAP.topSegmentStart, y1: MAP.topY, x2: MAP.topSegmentEnd, y2: MAP.topY },
  { x1: MAP.bottomSegmentStart, y1: MAP.bottomY, x2: MAP.bottomSegmentEnd, y2: MAP.bottomY },
];

const BASE_MAX_HEALTH = 1600;
const BASE_DAMAGE_MULTIPLIER = 0.85;
const STARTING_GOLD = 280;
const GOLD_PER_SECOND = 11;
const UNIT_CAP = 20;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distanceBetween(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function hash(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453123;
  return x - Math.floor(x);
}

function jitter(seed, spread) {
  return (hash(seed) - 0.5) * spread;
}

function pickColor(teamId) {
  return TEAMS[teamId].color;
}

function withAlpha(hexColor, alpha) {
  const normalized = hexColor.replace("#", "");
  const number = Number.parseInt(normalized, 16);
  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getUnitIconMarkup(typeId) {
  if (typeId === "fighter") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" stroke-width="1.8">
        <circle cx="8" cy="5.5" r="2.7"></circle>
        <path d="M8 8.5L8 15.5"></path>
        <path d="M8 10.5L13 8"></path>
        <path d="M8 11L4 13.5"></path>
        <path d="M8 15.5L5 20"></path>
        <path d="M8 15.5L11 20"></path>
        <path d="M13.2 8L18.8 4.8"></path>
      </svg>
    `;
  }

  if (typeId === "archer") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" stroke-width="1.8">
        <circle cx="8" cy="5.5" r="2.7"></circle>
        <path d="M8 8.5L8 15.5"></path>
        <path d="M8 10.5L13.5 9"></path>
        <path d="M8 11L4 13.5"></path>
        <path d="M8 15.5L5 20"></path>
        <path d="M8 15.5L11 20"></path>
        <path d="M15 6.5C18.5 8.5 18.5 15.5 15 17.5"></path>
        <path d="M15 6.5L15 17.5"></path>
        <path d="M12.8 12L18.8 12"></path>
      </svg>
    `;
  }

  if (typeId === "shield") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" stroke-width="1.8">
        <circle cx="8" cy="5.5" r="2.7"></circle>
        <path d="M8 8.5L8 15.5"></path>
        <path d="M8 10.5L12 11"></path>
        <path d="M8 11L4 13.5"></path>
        <path d="M8 15.5L5 20"></path>
        <path d="M8 15.5L11 20"></path>
        <path d="M13.5 8.5L18 9.3L18 15.8L13.5 16.6Z"></path>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" stroke-width="2">
      <circle cx="9" cy="5.5" r="3.1"></circle>
      <path d="M9 8.8L9 17"></path>
      <path d="M9 11L15 10"></path>
      <path d="M9 11.5L4.8 15"></path>
      <path d="M9 17L5.8 21"></path>
      <path d="M9 17L12.8 21"></path>
      <path d="M15.2 10.2L19.5 7"></path>
      <path d="M19.5 7L20.5 13.5"></path>
    </svg>
  `;
}

function getResultIconMarkup(result) {
  if (result === "win") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" stroke-width="1.9">
        <path d="M7 4H17L16 8C15.2 11 13.8 13 12 14C10.2 13 8.8 11 8 8Z"></path>
        <path d="M9.5 17H14.5"></path>
        <path d="M12 14V20"></path>
        <path d="M7 5H4.5C4.5 8.2 5.7 10 8.2 10"></path>
        <path d="M17 5H19.5C19.5 8.2 18.3 10 15.8 10"></path>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" stroke-width="1.9">
      <path d="M12 3.5L19 6.5V11.2C19 15.2 16.2 18.8 12 20.5C7.8 18.8 5 15.2 5 11.2V6.5Z"></path>
      <path d="M8.5 8.5L15.5 15.5"></path>
      <path d="M15.5 8.5L8.5 15.5"></path>
    </svg>
  `;
}

class AudioSystem {
  constructor() {
    const Context = window.AudioContext || window.webkitAudioContext;
    this.context = Context ? new Context() : null;
    this.enabled = false;
  }

  unlock() {
    if (!this.context || this.enabled) {
      this.enabled = Boolean(this.context);
      return;
    }

    this.context.resume().then(() => {
      this.enabled = true;
    });
  }

  beep(options) {
    if (!this.context || !this.enabled) {
      return;
    }

    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const {
      frequency,
      type = "triangle",
      duration = 0.08,
      volume = 0.03,
      attack = 0.01,
      release = 0.05,
      slide = 0,
    } = options;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (slide !== 0) {
      oscillator.frequency.linearRampToValueAtTime(frequency + slide, now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + release + duration);

    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + release + 0.02);
  }

  play(eventName) {
    if (!this.enabled) {
      return;
    }

    if (eventName === "spawn") {
      this.beep({ frequency: 290, duration: 0.08, volume: 0.02, slide: 60 });
      return;
    }

    if (eventName === "arrow") {
      this.beep({ frequency: 660, duration: 0.06, volume: 0.02, type: "square", slide: -80 });
      return;
    }

    if (eventName === "hit") {
      this.beep({ frequency: 140, duration: 0.05, volume: 0.018, type: "triangle", slide: -30 });
      return;
    }

    if (eventName === "death") {
      this.beep({ frequency: 95, duration: 0.14, volume: 0.025, type: "sawtooth", slide: -25 });
      return;
    }

    if (eventName === "win") {
      this.beep({ frequency: 392, duration: 0.18, volume: 0.035, slide: 50 });
      window.setTimeout(() => this.beep({ frequency: 523, duration: 0.2, volume: 0.035 }), 120);
      return;
    }

    if (eventName === "lose") {
      this.beep({ frequency: 220, duration: 0.22, volume: 0.03, slide: -40 });
      window.setTimeout(() => this.beep({ frequency: 174, duration: 0.22, volume: 0.03, slide: -30 }), 140);
    }
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.audio = new AudioSystem();
    this.deploymentHud = document.getElementById("deploymentHud");
    this.unitGuide = document.getElementById("unitGuide");
    this.messageBanner = document.getElementById("messageBanner");
    this.redStatus = document.getElementById("redStatus");
    this.centerStatus = document.getElementById("centerStatus");
    this.blueStatus = document.getElementById("blueStatus");
    this.sidePanel = document.getElementById("sidePanel");
    this.unitGuideToggle = document.getElementById("unitGuideToggle");
    this.unitGuideClose = document.getElementById("unitGuideClose");
    this.sidePanelBackdrop = document.getElementById("sidePanelBackdrop");
    this.overlay = document.getElementById("overlay");
    this.overlayTitle = document.getElementById("overlayTitle");
    this.overlaySubtitle = document.getElementById("overlaySubtitle");
    this.summaryGrid = document.getElementById("summaryGrid");
    this.restartButton = document.getElementById("restartButton");
    this.mobileSidePanelQuery = window.matchMedia("(max-width: 1100px)");
    this.handleMobileSidePanelChange = () => {
      this.syncResponsivePanels();
    };

    this.deploymentGroups = new Map();
    this.deploymentButtons = new Map();
    this.lastTimestamp = 0;
    this.nextUnitId = 1;
    this.nextProjectileId = 1;
    this.defaultMessage =
      "点击一路的部署栏即可出兵。首次操作也会同时开启声音。";
    this.bannerMessage = this.defaultMessage;
    this.bannerTimer = 0;

    this.buildDeploymentHud();
    this.buildUnitGuide();
    this.bindEvents();
    this.syncResponsivePanels();
    this.reset();
    window.requestAnimationFrame((timestamp) => this.frame(timestamp));
  }

  buildDeploymentHud() {
    this.deploymentHud.innerHTML = "";

    for (const lane of LANE_ORDER) {
      const group = document.createElement("section");
      group.className = "deployment-group";
      group.dataset.lane = lane;
      group.dataset.state = "contested";

      const title = document.createElement("div");
      title.className = "deployment-title";
      title.textContent = lane === "top" ? "上路" : "下路";

      const buttons = document.createElement("div");
      buttons.className = "deploy-buttons";

      for (const typeId of UNIT_ORDER) {
        const type = UNIT_TYPES[typeId];
        const button = document.createElement("button");
        button.className = "deploy-button";
        button.type = "button";
        button.dataset.unit = typeId;
        button.dataset.lane = lane;
        button.innerHTML = `
          <span class="deploy-badge">${getUnitIconMarkup(typeId)}</span>
          <div class="deploy-note">${type.cost}金</div>
        `;
        button.addEventListener("click", () => {
          this.audio.unlock();
          this.attemptSpawn("blue", typeId, false, lane);
        });
        buttons.appendChild(button);
        this.deploymentButtons.set(`${lane}:${typeId}`, button);
      }

      group.appendChild(title);
      group.appendChild(buttons);
      this.deploymentHud.appendChild(group);
      this.deploymentGroups.set(lane, group);
    }
  }

  buildUnitGuide() {
    this.unitGuide.innerHTML = "";

    for (const typeId of UNIT_ORDER) {
      const type = UNIT_TYPES[typeId];
      const card = document.createElement("article");
      card.className = "unit-guide-card";
      card.innerHTML = `
        <div class="unit-name">
          <strong><span class="unit-icon">${getUnitIconMarkup(typeId)}</span>${type.label}</strong>
          <span>${type.cost} 金币</span>
        </div>
        <div class="unit-meta">
          <span>${type.maxHealth} 生命</span>
          <span>${type.cooldown.toFixed(1)} 秒冷却</span>
        </div>
        <div class="unit-stats">
          <span class="unit-chip">${type.damage} 伤害</span>
          <span class="unit-chip">${type.range <= 40 ? "近战" : `${type.range} 射程`}</span>
          <span class="unit-chip">${type.attackInterval.toFixed(2)} 秒攻速</span>
        </div>
        <div class="unit-role">${type.description}</div>
        <div class="unit-matchup">擅长：${type.goodAgainst}</div>
        <div class="unit-matchup">劣势：${type.strugglesAgainst}</div>
      `;
      this.unitGuide.appendChild(card);
    }
  }

  bindEvents() {
    window.addEventListener("keydown", (event) => {
      if (event.repeat) {
        return;
      }

      if (event.key === "Escape" && this.isMobileSidePanelOpen()) {
        this.setMobileSidePanelOpen(false);
        return;
      }

      if (event.key.toLowerCase() === "r" && this.phase === "ended") {
        this.reset();
      }
    });

    this.canvas.addEventListener("pointerdown", () => {
      this.audio.unlock();
    });

    this.restartButton.addEventListener("click", () => {
      this.audio.unlock();
      this.reset();
    });

    this.unitGuideToggle.addEventListener("click", () => {
      this.setMobileSidePanelOpen(!this.isMobileSidePanelOpen());
    });

    this.unitGuideClose.addEventListener("click", () => {
      this.setMobileSidePanelOpen(false);
    });

    this.sidePanelBackdrop.addEventListener("click", () => {
      this.setMobileSidePanelOpen(false);
    });

    if (typeof this.mobileSidePanelQuery.addEventListener === "function") {
      this.mobileSidePanelQuery.addEventListener("change", this.handleMobileSidePanelChange);
    } else {
      this.mobileSidePanelQuery.addListener(this.handleMobileSidePanelChange);
    }
  }

  reset() {
    this.phase = "playing";
    this.timeElapsed = 0;
    this.aiDecisionTimer = 0;
    this.units = [];
    this.projectiles = [];
    this.particles = [];
    this.bloodStains = [];
    this.nextUnitId = 1;
    this.nextProjectileId = 1;
    this.teams = {
      red: this.createTeamState("red"),
      blue: this.createTeamState("blue"),
    };
    this.setMessage(this.defaultMessage, 2.8);
    this.lastTimestamp = 0;
    this.overlay.classList.add("hidden");
    this.renderHud();
  }

  isMobileLayout() {
    return this.mobileSidePanelQuery.matches;
  }

  isMobileSidePanelOpen() {
    return document.body.classList.contains("unit-guide-open");
  }

  syncResponsivePanels() {
    this.setMobileSidePanelOpen(false);
    this.sidePanel.dataset.mobile = this.isMobileLayout() ? "true" : "false";
  }

  setMobileSidePanelOpen(open) {
    const shouldOpen = this.isMobileLayout() && open;
    document.body.classList.toggle("unit-guide-open", shouldOpen);
    this.unitGuideToggle.setAttribute("aria-expanded", String(shouldOpen));
    this.unitGuideToggle.textContent = shouldOpen ? "收起兵种" : "兵种";
  }

  createTeamState(teamId) {
    const spawned = {};
    const lost = {};

    for (const typeId of UNIT_ORDER) {
      spawned[typeId] = 0;
      lost[typeId] = 0;
    }

    return {
      id: teamId,
      gold: STARTING_GOLD,
      baseHp: BASE_MAX_HEALTH,
      cooldowns: Object.fromEntries(UNIT_ORDER.map((typeId) => [typeId, 0])),
      unitCount: 0,
      brain: {
        focus: "balanced",
        reserveUnit: "shield",
        focusUntil: 0,
        lastChoice: null,
        lastLane: null,
      },
      stats: {
        spawned,
        lost,
        damageDealt: 0,
        damageTaken: 0,
      },
    };
  }

  frame(timestamp) {
    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
    }

    const delta = clamp((timestamp - this.lastTimestamp) / 1000, 0, 0.033);
    this.lastTimestamp = timestamp;

    this.update(delta);
    this.render();
    window.requestAnimationFrame((nextTimestamp) => this.frame(nextTimestamp));
  }

  update(delta) {
    if (this.bannerTimer > 0) {
      this.bannerTimer = Math.max(0, this.bannerTimer - delta);
      if (this.bannerTimer === 0) {
        this.messageBanner.textContent = this.defaultMessage;
      }
    }

    if (this.phase !== "playing") {
      this.updateParticles(delta);
      return;
    }

    this.timeElapsed += delta;

    for (const teamId of Object.keys(this.teams)) {
      const team = this.teams[teamId];
      team.gold += GOLD_PER_SECOND * delta;
      for (const typeId of UNIT_ORDER) {
        team.cooldowns[typeId] = Math.max(0, team.cooldowns[typeId] - delta);
      }
    }

    this.updateAI(delta);
    this.updateUnits(delta);
    this.updateProjectiles(delta);
    this.resolveCrowding();
    this.updateParticles(delta);

    if (this.teams.red.baseHp <= 0) {
      this.finishGame("blue");
    } else if (this.teams.blue.baseHp <= 0) {
      this.finishGame("red");
    }

    this.renderHud();
  }

  updateAI(delta) {
    this.aiDecisionTimer += delta;
    if (this.aiDecisionTimer < 0.42) {
      return;
    }

    this.aiDecisionTimer = 0;
    const selectedAction = this.chooseAIAction();
    if (selectedAction) {
      this.attemptSpawn("red", selectedAction.typeId, true, selectedAction.lane);
    }
  }

  chooseAIAction() {
    if (this.teams.red.unitCount >= UNIT_CAP) {
      return null;
    }

    const ai = this.teams.red;
    const player = this.teams.blue;
    const aiCounts = this.getUnitCounts("red");
    const playerCounts = this.getUnitCounts("blue");
    const pressure = this.units.filter(
      (unit) => unit.teamId === "blue" && unit.x < 340 && unit.alive,
    ).length;
    const aiBrain = ai.brain;
    const laneStates = this.getLaneStates();

    this.refreshAIFocus(ai, aiCounts, playerCounts, pressure);
    if (this.shouldAIHoldForReserve(ai, aiCounts, pressure)) {
      return null;
    }

    let bestAction = null;
    let bestScore = -Infinity;

    for (const typeId of UNIT_ORDER) {
      if (!this.canSpawn("red", typeId)) {
        continue;
      }

      let score = this.getAITypeScore(typeId, {
        ai,
        player,
        aiCounts,
        playerCounts,
        pressure,
      });

      if (aiBrain.reserveUnit === typeId) {
        score += 1.35;
      }

      if (aiBrain.lastChoice === typeId) {
        score -= 0.55;
      }

      for (const lane of LANE_ORDER) {
        let laneScore = score + this.getAILaneScore(typeId, laneStates[lane], aiBrain);
        if (aiBrain.lastLane === lane) {
          laneScore -= 0.18;
        }

        laneScore += Math.random() * 0.5;
        if (laneScore > bestScore) {
          bestScore = laneScore;
          bestAction = { typeId, lane };
        }
      }
    }

    aiBrain.lastChoice = bestAction ? bestAction.typeId : null;
    aiBrain.lastLane = bestAction ? bestAction.lane : null;
    return bestAction;
  }

  refreshAIFocus(ai, aiCounts, playerCounts, pressure) {
    if (this.timeElapsed < ai.brain.focusUntil) {
      return;
    }

    let focus = "balanced";
    let reserveUnit = "shield";

    if (pressure >= 4) {
      focus = "brace";
      reserveUnit = "shield";
    } else if (this.timeElapsed > 42 && (aiCounts.giant === 0 || this.teams.blue.baseHp < 760)) {
      focus = "power";
      reserveUnit = "giant";
    } else if (
      playerCounts.archer >= 3 ||
      (aiCounts.fighter + aiCounts.shield >= 3 && aiCounts.archer < 2)
    ) {
      focus = "volley";
      reserveUnit = "archer";
    } else {
      const roll = Math.random();
      if (roll < 0.22) {
        focus = "balanced";
        reserveUnit = "shield";
      } else if (roll < 0.56) {
        focus = "volley";
        reserveUnit = "archer";
      } else {
        focus = "power";
        reserveUnit = "giant";
      }
    }

    ai.brain.focus = focus;
    ai.brain.reserveUnit = reserveUnit;
    ai.brain.focusUntil = this.timeElapsed + 7 + Math.random() * 4;
  }

  shouldAIHoldForReserve(ai, aiCounts, pressure) {
    const reserveTypeId = ai.brain.reserveUnit;
    if (!reserveTypeId) {
      return false;
    }

    const reserveType = UNIT_TYPES[reserveTypeId];
    const goldGap = reserveType.cost - ai.gold;
    const frontline = aiCounts.fighter + aiCounts.shield;

    if (goldGap <= 0) {
      return false;
    }

    if (reserveTypeId === "giant") {
      return goldGap <= 90 && frontline >= 2 && pressure <= 3;
    }

    if (reserveTypeId === "shield") {
      return goldGap <= 34 && pressure >= 1;
    }

    if (reserveTypeId === "archer") {
      return goldGap <= 28 && frontline >= 1;
    }

    return false;
  }

  getAITypeScore(typeId, context) {
    const { ai, player, aiCounts, playerCounts, pressure } = context;
    const frontline = aiCounts.fighter + aiCounts.shield;
    const enemyFrontline = playerCounts.fighter + playerCounts.shield + playerCounts.giant;
    const enemyArchers = playerCounts.archer;
    const aiBrain = ai.brain;
    let score = 0;

    if (typeId === "fighter") {
      score = 2.2 + Math.max(0, 3 - frontline) * 0.8;
      score += Math.max(0, 4 - aiCounts.fighter) * 0.2;
      score += pressure * 0.22;
      score -= aiCounts.fighter * 0.26;
      score -= this.timeElapsed > 45 ? 0.45 : 0;
    }

    if (typeId === "archer") {
      score = 4.1 + Math.max(0, enemyFrontline - aiCounts.archer * 2) * 0.46;
      score += Math.max(0, frontline - 1) * 0.36;
      score += Math.max(0, playerCounts.giant - aiCounts.archer) * 0.55;
      score += this.timeElapsed > 35 ? 0.4 : 0;
    }

    if (typeId === "shield") {
      score = 4.4 + Math.max(0, enemyArchers - aiCounts.shield) * 0.88;
      score += pressure * 0.75;
      score += Math.max(0, playerCounts.giant - aiCounts.shield) * 0.62;
      score -= aiCounts.shield * 0.08;
    }

    if (typeId === "giant") {
      score = 3.0 + Math.max(0, this.timeElapsed - 35) * 0.024;
      score += player.baseHp < 820 ? 1.35 : 0;
      score += aiCounts.giant === 0 && this.timeElapsed > 40 ? 1.3 : 0;
      score += frontline >= 2 ? 1.0 : -0.45;
      score += ai.gold > 145 ? 1.15 : 0;
      score -= aiCounts.giant * 0.95;
    }

    if (aiBrain.focus === "brace") {
      if (typeId === "shield") {
        score += 1.5;
      }
      if (typeId === "fighter") {
        score += 0.9;
      }
      if (typeId === "giant") {
        score -= 0.35;
      }
    }

    if (aiBrain.focus === "volley") {
      if (typeId === "archer") {
        score += 1.9;
      }
      if (typeId === "shield") {
        score += 0.75;
      }
      if (typeId === "fighter") {
        score -= 0.4;
      }
    }

    if (aiBrain.focus === "power") {
      if (typeId === "giant") {
        score += 2.45;
      }
      if (typeId === "shield") {
        score += 0.8;
      }
      if (typeId === "fighter") {
        score -= 0.7;
      }
    }

    return score;
  }

  getUnitCounts(teamId) {
    const counts = Object.fromEntries(UNIT_ORDER.map((typeId) => [typeId, 0]));
    for (const unit of this.units) {
      if (unit.alive && unit.teamId === teamId) {
        counts[unit.typeId] += 1;
      }
    }
    return counts;
  }

  getLaneStates() {
    const laneStates = Object.fromEntries(
      LANE_ORDER.map((lane) => [
        lane,
        {
          lane,
          blue: this.createLaneSideState(),
          red: this.createLaneSideState(),
          bluePressure: 0,
          redPressure: 0,
        },
      ]),
    );

    for (const unit of this.units) {
      if (!unit.alive) {
        continue;
      }

      const laneState = laneStates[unit.lane];
      const side = laneState[unit.teamId];
      const strength = this.getUnitStrength(unit);
      const push = this.getUnitPush(unit);

      side.total += 1;
      side[unit.typeId] += 1;
      side.strength += strength;
      side.deepestPush = Math.max(side.deepestPush, push);
      if (unit.typeId === "archer") {
        side.ranged += 1;
      } else {
        side.frontline += 1;
      }

      if (unit.teamId === "blue") {
        laneState.bluePressure += strength * (0.65 + push * 0.9);
      } else {
        laneState.redPressure += strength * (0.65 + push * 0.9);
      }
    }

    return laneStates;
  }

  createLaneSideState() {
    return {
      total: 0,
      frontline: 0,
      ranged: 0,
      fighter: 0,
      archer: 0,
      shield: 0,
      giant: 0,
      strength: 0,
      deepestPush: 0,
    };
  }

  getUnitStrength(unit) {
    const healthRatio = clamp(unit.health / unit.maxHealth, 0.2, 1);
    return unit.type.weight * (0.55 + healthRatio * 0.45);
  }

  getUnitPush(unit) {
    const spawnX = TEAMS[unit.teamId].spawnX;
    const enemyBaseX = TEAMS[unit.enemyTeamId].baseContactX;
    const totalDistance = Math.abs(enemyBaseX - spawnX);
    if (totalDistance <= 0.001) {
      return 0;
    }

    return clamp(Math.abs(unit.x - spawnX) / totalDistance, 0, 1);
  }

  getAILaneScore(typeId, laneState, aiBrain) {
    const defendingThreat = laneState.bluePressure;
    const attackingThreat = laneState.redPressure;
    const friendly = laneState.red;
    const enemy = laneState.blue;
    let score = 0;

    if (typeId === "fighter") {
      score += defendingThreat * 0.62;
      score += Math.max(0, enemy.total - friendly.total) * 0.48;
      score += Math.max(0, enemy.archer - friendly.frontline) * 0.7;
      score += friendly.total === 0 ? 0.35 : 0;
    }

    if (typeId === "archer") {
      score += friendly.frontline * 0.85;
      score += Math.max(0, enemy.frontline - friendly.archer) * 0.42;
      score += attackingThreat * 0.36;
      score -= defendingThreat > attackingThreat + 1.4 ? 0.28 : 0;
    }

    if (typeId === "shield") {
      score += defendingThreat * 0.96;
      score += enemy.archer * 0.74;
      score += Math.max(0, enemy.frontline - friendly.frontline) * 0.44;
      score += friendly.shield === 0 ? 0.16 : 0;
    }

    if (typeId === "giant") {
      score += attackingThreat * 0.94;
      score += friendly.frontline * 0.82;
      score += enemy.archer === 0 ? 0.62 : 0;
      score -= enemy.archer * 0.54;
      score -= friendly.total === 0 ? 0.52 : 0;
    }

    if (aiBrain.focus === "brace") {
      score += defendingThreat * 0.25;
    }

    if (aiBrain.focus === "volley" && typeId === "archer") {
      score += friendly.frontline * 0.22;
    }

    if (aiBrain.focus === "power" && typeId === "giant") {
      score += attackingThreat * 0.24;
    }

    return score;
  }

  canSpawn(teamId, typeId) {
    const team = this.teams[teamId];
    const type = UNIT_TYPES[typeId];
    return (
      this.phase === "playing" &&
      team.gold >= type.cost &&
      team.cooldowns[typeId] <= 0 &&
      team.unitCount < UNIT_CAP
    );
  }

  attemptSpawn(teamId, typeId, fromAI, laneOverride = null) {
    const team = this.teams[teamId];
    const type = UNIT_TYPES[typeId];

    if (this.phase !== "playing") {
      return false;
    }

    if (team.unitCount >= UNIT_CAP) {
      if (!fromAI) {
        this.setMessage("已达单位上限：场上最多 20 个单位。", 1.8);
      }
      return false;
    }

    if (team.gold < type.cost) {
      if (!fromAI) {
        this.setMessage(`部署${type.label}需要 ${type.cost} 金币。`, 1.6);
      }
      return false;
    }

    if (team.cooldowns[typeId] > 0) {
      if (!fromAI) {
        this.setMessage(
          `${type.label}冷却中：还剩 ${team.cooldowns[typeId].toFixed(1)} 秒。`,
          1.4,
        );
      }
      return false;
    }

    const lane = LANE_ORDER.includes(laneOverride)
      ? laneOverride
      : fromAI
        ? this.chooseRandomLane()
        : "top";
    const route = ROUTES[teamId][lane].map((point) => ({ x: point.x, y: point.y }));
    const spawnPoint = route[0];
    const newUnit = {
      id: this.nextUnitId,
      teamId,
      enemyTeamId: TEAMS[teamId].enemy,
      typeId,
      type,
      x: spawnPoint.x + jitter(this.nextUnitId * 0.91, 10),
      y: spawnPoint.y + jitter(this.nextUnitId * 1.37, 8),
      lane,
      route,
      routeIndex: 1,
      health: type.maxHealth,
      maxHealth: type.maxHealth,
      radius: type.radius,
      attackCooldown: 0.25 + Math.random() * 0.15,
      retargetTimer: 0.1,
      target: null,
      alive: true,
      hitFlash: 0,
      facing: TEAMS[teamId].direction,
      walkCycle: Math.random() * Math.PI * 2,
      poseSeed: Math.random() * 999,
    };

    this.nextUnitId += 1;
    team.gold -= type.cost;
    team.cooldowns[typeId] = type.cooldown;
    team.unitCount += 1;
    team.stats.spawned[typeId] += 1;
    this.units.push(newUnit);

    if (!fromAI) {
      this.audio.play("spawn");
      this.setMessage(`${type.label}已部署到${LANE_LABELS[lane]}。`, 1.2);
    }

    return true;
  }

  chooseRandomLane() {
    const laneIndex = Math.floor(Math.random() * LANE_ORDER.length);
    return LANE_ORDER[laneIndex];
  }

  updateUnits(delta) {
    const attackQueue = [];

    for (const unit of this.units) {
      if (!unit.alive) {
        continue;
      }

      unit.attackCooldown = Math.max(0, unit.attackCooldown - delta);
      unit.retargetTimer -= delta;
      unit.hitFlash = Math.max(0, unit.hitFlash - delta);

      if (
        !unit.target ||
        !this.isTargetValid(unit, unit.target) ||
        unit.retargetTimer <= 0
      ) {
        unit.target = this.findTarget(unit);
        unit.retargetTimer = 0.16 + Math.random() * 0.1;
      }

      if (unit.target) {
        this.actOnTarget(unit, unit.target, delta, attackQueue);
      } else {
        this.followRoute(unit, delta);
      }
    }

    this.resolveQueuedAttacks(attackQueue);
    this.units = this.units.filter((unit) => unit.alive);
  }

  isTargetValid(unit, target) {
    if (!target) {
      return false;
    }

    if (target.kind === "base") {
      return this.teams[target.teamId].baseHp > 0;
    }

    if (!target.alive || target.teamId === unit.teamId) {
      return false;
    }

    const verticalLimit = unit.typeId === "archer" ? 120 : 86;
    return Math.abs(target.y - unit.y) <= verticalLimit;
  }

  findTarget(unit) {
    let closest = null;
    let closestDistance = Infinity;
    const verticalLimit = unit.typeId === "archer" ? 120 : 86;

    for (const other of this.units) {
      if (!other.alive || other.teamId === unit.teamId) {
        continue;
      }

      if (Math.abs(other.y - unit.y) > verticalLimit) {
        continue;
      }

      const distance = distanceBetween(unit, other);
      if (distance > unit.type.aggroRange) {
        continue;
      }

      if (distance < closestDistance) {
        closest = other;
        closestDistance = distance;
      }
    }

    if (closest) {
      return closest;
    }

    const baseTarget = this.getBaseTarget(unit.enemyTeamId);
    const distanceToBase = distanceBetween(unit, baseTarget);
    if (distanceToBase <= unit.type.aggroRange + 80) {
      return baseTarget;
    }

    return null;
  }

  getBaseTarget(teamId) {
    return {
      kind: "base",
      teamId,
      x: TEAMS[teamId].baseContactX,
      y: MAP.middleY,
      radius: 42,
    };
  }

  actOnTarget(unit, target, delta, attackQueue) {
    const resolvedTarget = target.kind === "base" ? this.getBaseTarget(target.teamId) : target;
    const targetRadius = resolvedTarget.radius || 18;
    const distance = distanceBetween(unit, resolvedTarget);
    const attackRange = unit.type.range + unit.radius + targetRadius;

    if (distance <= attackRange) {
      unit.facing = resolvedTarget.x >= unit.x ? 1 : -1;
      if (unit.attackCooldown <= 0) {
        attackQueue.push(this.buildAttackAction(unit, target));
        unit.attackCooldown = unit.type.attackInterval;
      }
      return;
    }

    if (target.kind === "base") {
      this.followRoute(unit, delta);
      return;
    }

    this.moveToward(unit, resolvedTarget.x, resolvedTarget.y, unit.type.speed, delta);
  }

  followRoute(unit, delta) {
    const waypoint = unit.route[unit.routeIndex];
    if (!waypoint) {
      const enemyBase = this.getBaseTarget(unit.enemyTeamId);
      this.moveToward(unit, enemyBase.x, enemyBase.y, unit.type.speed, delta);
      return;
    }

    const reached = this.moveToward(unit, waypoint.x, waypoint.y, unit.type.speed, delta);
    if (reached) {
      unit.routeIndex += 1;
    }
  }

  moveToward(unit, targetX, targetY, speed, delta) {
    const dx = targetX - unit.x;
    const dy = targetY - unit.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 0.001) {
      unit.x = targetX;
      unit.y = targetY;
      return true;
    }

    const step = Math.min(distance, speed * delta);
    unit.x += (dx / distance) * step;
    unit.y += (dy / distance) * step;
    unit.x = clamp(unit.x, 40, MAP.width - 40);
    unit.y = clamp(unit.y, 120, MAP.height - 80);
    unit.facing = dx >= 0 ? 1 : -1;
    unit.walkCycle += step * 0.09;

    return distance - step < 1;
  }

  buildAttackAction(unit, target) {
    if (unit.typeId === "archer") {
      return {
        kind: "projectile",
        teamId: unit.teamId,
        typeId: unit.typeId,
        x: unit.x + unit.facing * 10,
        y: unit.y - 18,
        target,
        speed: unit.type.projectileSpeed,
        damage: unit.type.damage,
        trail: Math.random() * 999,
      };
    }

    return {
      kind: "melee",
      teamId: unit.teamId,
      typeId: unit.typeId,
      target,
      damage: unit.type.damage,
    };
  }

  resolveQueuedAttacks(attackQueue) {
    for (const action of attackQueue) {
      if (action.kind === "projectile") {
        this.projectiles.push({
          id: this.nextProjectileId,
          teamId: action.teamId,
          typeId: action.typeId,
          x: action.x,
          y: action.y,
          target: action.target,
          speed: action.speed,
          damage: action.damage,
          alive: true,
          trail: action.trail,
        });
        this.nextProjectileId += 1;
        this.audio.play("arrow");
        continue;
      }

      this.resolveDamage(action.teamId, action.target, action.damage);
      this.audio.play("hit");
    }
  }

  resolveDamage(sourceTeamId, target, damage) {
    const sourceTeam = this.teams[sourceTeamId];

    if (target.kind === "base") {
      const defendingTeam = this.teams[target.teamId];
      if (defendingTeam.baseHp <= 0) {
        return;
      }
      const baseDamage = Math.max(1, Math.round(damage * BASE_DAMAGE_MULTIPLIER));
      const actualDamage = Math.min(defendingTeam.baseHp, baseDamage);
      defendingTeam.baseHp -= actualDamage;
      sourceTeam.stats.damageDealt += actualDamage;
      defendingTeam.stats.damageTaken += actualDamage;
      this.spawnBlood(target.x + jitter(Math.random() * 50, 36), target.y - 20, 4, 0.75);
      return;
    }

    if (!target.alive || target.health <= 0) {
      return;
    }

    const actualDamage = Math.min(target.health, damage);
    target.health -= actualDamage;
    target.hitFlash = 0.14;
    sourceTeam.stats.damageDealt += actualDamage;
    this.teams[target.teamId].stats.damageTaken += actualDamage;
    this.spawnBlood(target.x, target.y - 10, 4, 0.95);

    if (target.health <= 0) {
      target.alive = false;
      this.teams[target.teamId].unitCount -= 1;
      this.teams[target.teamId].stats.lost[target.typeId] += 1;
      this.spawnBlood(target.x, target.y, 10, 1.1);
      this.audio.play("death");
    }
  }

  updateProjectiles(delta) {
    for (const projectile of this.projectiles) {
      if (!projectile.alive) {
        continue;
      }

      const target = projectile.target.kind === "base"
        ? this.getBaseTarget(projectile.target.teamId)
        : projectile.target;

      if (!this.isProjectileTargetAlive(projectile.target)) {
        projectile.alive = false;
        continue;
      }

      const dx = target.x - projectile.x;
      const dy = target.y - projectile.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 0.001) {
        projectile.alive = false;
        continue;
      }

      const step = Math.min(distance, projectile.speed * delta);
      projectile.x += (dx / distance) * step;
      projectile.y += (dy / distance) * step;

      const hitDistance = (target.radius || 18) + 8;
      if (distance <= hitDistance || distance - step <= hitDistance) {
        this.resolveDamage(projectile.teamId, projectile.target, projectile.damage);
        this.audio.play("hit");
        projectile.alive = false;
      }
    }

    this.projectiles = this.projectiles.filter((projectile) => projectile.alive);
  }

  isProjectileTargetAlive(target) {
    if (target.kind === "base") {
      return this.teams[target.teamId].baseHp > 0;
    }

    return target.alive;
  }

  resolveCrowding() {
    for (let i = 0; i < this.units.length; i += 1) {
      const a = this.units[i];
      if (!a.alive) {
        continue;
      }

      for (let j = i + 1; j < this.units.length; j += 1) {
        const b = this.units[j];
        if (!b.alive || a.teamId === b.teamId) {
          continue;
        }

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy);
        const minimumDistance = a.radius * 0.72 + b.radius * 0.72;

        if (distance >= minimumDistance) {
          continue;
        }

        const safeDistance = Math.max(distance, 0.001);
        const overlap = (minimumDistance - safeDistance) / 2;
        const nx = distance < 0.001 ? (TEAMS[a.teamId].direction > 0 ? 1 : -1) : dx / safeDistance;
        const ny = distance < 0.001 ? jitter(a.id + b.id, 0.16) : dy / safeDistance;
        a.x -= nx * overlap;
        a.y -= ny * overlap * 0.35;
        b.x += nx * overlap;
        b.y += ny * overlap * 0.35;
        a.x = clamp(a.x, 40, MAP.width - 40);
        a.y = clamp(a.y, 120, MAP.height - 80);
        b.x = clamp(b.x, 40, MAP.width - 40);
        b.y = clamp(b.y, 120, MAP.height - 80);
      }
    }
  }

  spawnBlood(x, y, amount, strength) {
    this.bloodStains.push({
      x: x + jitter(Math.random() * 33, 10),
      y: y + jitter(Math.random() * 77, 10),
      radius: 4 + Math.random() * 8 * strength,
      alpha: 0.1 + Math.random() * 0.16,
    });

    if (this.bloodStains.length > 140) {
      this.bloodStains.shift();
    }

    for (let index = 0; index < amount; index += 1) {
      this.particles.push({
        x,
        y,
        vx: jitter(Math.random() * 173, 120) * strength,
        vy: -40 - Math.random() * 130 * strength,
        life: 0.25 + Math.random() * 0.5,
        age: 0,
        size: 2 + Math.random() * 3.5,
        gravity: 290,
        color: "rgba(142, 18, 18, 0.88)",
      });
    }
  }

  updateParticles(delta) {
    for (const particle of this.particles) {
      particle.age += delta;
      particle.life -= delta;
      particle.vy += particle.gravity * delta;
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
    }

    this.particles = this.particles.filter((particle) => particle.life > 0);
  }

  finishGame(winnerTeamId) {
    if (this.phase === "ended") {
      return;
    }

    this.phase = "ended";
    const playerWon = winnerTeamId === "blue";
    const result = playerWon ? "win" : "lose";
    this.overlay.dataset.result = result;
    this.overlayTitle.innerHTML = `
      <span class="result-badge" aria-hidden="true">${getResultIconMarkup(result)}</span>
      <span>${playerWon ? "胜利" : "战败"}</span>
    `;
    this.overlaySubtitle.textContent =
      `对局时长 ${this.formatTime(this.timeElapsed)}。` +
      `蓝方总计造成 ${Math.round(this.teams.blue.stats.damageDealt)} 点伤害，承受 ` +
      `${Math.round(this.teams.blue.stats.damageTaken)} 点伤害。`;
    this.summaryGrid.innerHTML = this.renderSummaryCard("red") + this.renderSummaryCard("blue");
    this.overlay.classList.remove("hidden");
    this.setMessage(playerWon ? "敌方基地已被摧毁。" : "我方基地已被攻破。", 5);
    this.audio.play(playerWon ? "win" : "lose");
  }

  renderSummaryCard(teamId) {
    const team = this.teams[teamId];
    const color = pickColor(teamId);
    const lines = UNIT_ORDER.map((typeId) => {
      const type = UNIT_TYPES[typeId];
      return `
        <div class="summary-line summary-line-unit">
          <span class="summary-unit" title="${type.label}" aria-label="${type.label}">
            ${getUnitIconMarkup(typeId)}
          </span>
          <span class="summary-stat">
            <span class="summary-stat-label">部署</span>
            <strong class="summary-stat-value">${team.stats.spawned[typeId]}</strong>
          </span>
          <span class="summary-stat">
            <span class="summary-stat-label">阵亡</span>
            <strong class="summary-stat-value">${team.stats.lost[typeId]}</strong>
          </span>
        </div>
      `;
    }).join("");

    return `
      <div class="summary-card" style="border-color: ${withAlpha(color, 0.55)};">
        <h3 style="color: ${color};">${TEAMS[teamId].name}</h3>
        ${lines}
        <div class="summary-line summary-line-total">
          <span class="summary-total-label">总输出伤害</span>
          <strong class="summary-total-value">${Math.round(team.stats.damageDealt)}</strong>
        </div>
        <div class="summary-line summary-line-total">
          <span class="summary-total-label">总承受伤害</span>
          <strong class="summary-total-value">${Math.round(team.stats.damageTaken)}</strong>
        </div>
      </div>
    `;
  }

  renderHud() {
    const red = this.teams.red;
    const blue = this.teams.blue;
    const laneStates = this.getLaneStates();

    this.redStatus.innerHTML = `
      <h3 style="color: ${TEAMS.red.color};">红方基地（AI）</h3>
      <div class="hud-lines">
        <div>基地生命：${Math.max(0, Math.round(red.baseHp))} / ${BASE_MAX_HEALTH}</div>
        <div>场上单位：${red.unitCount} / ${UNIT_CAP}</div>
        <div>经济：${Math.floor(red.gold)} 金币，+${GOLD_PER_SECOND}/秒</div>
      </div>
    `;

    this.centerStatus.innerHTML = `
      <div class="hud-lines">
        <div><strong>${this.phase === "playing" ? "战斗进行中" : "战斗结束"}</strong></div>
        <div>时间：${this.formatTime(this.timeElapsed)}</div>
        <div>敌方策略：${AI_FOCUS_LABELS[red.brain.focus]}</div>
        ${LANE_ORDER.map((lane) => `<div>${this.formatLanePressureLine(lane, laneStates[lane])}</div>`).join("")}
      </div>
    `;

    this.blueStatus.innerHTML = `
      <h3 style="color: ${TEAMS.blue.color};">蓝方基地（玩家）</h3>
      <div class="hud-lines">
        <div>基地生命：${Math.max(0, Math.round(blue.baseHp))} / ${BASE_MAX_HEALTH}</div>
        <div>金币：${Math.floor(blue.gold)}</div>
        <div>收入：+${GOLD_PER_SECOND}/秒</div>
        <div>场上单位：${blue.unitCount} / ${UNIT_CAP}</div>
      </div>
    `;

    this.renderDeploymentHud(laneStates);
  }

  renderDeploymentHud(laneStates) {
    for (const lane of LANE_ORDER) {
      const group = this.deploymentGroups.get(lane);
      const laneState = laneStates[lane];
      const laneStateName = this.getLaneStateName(laneState);
      group.dataset.state = laneStateName;
      group.title = `${LANE_NAMES[lane]}：蓝方 ${laneState.blue.total} 对 红方 ${laneState.red.total} · ${this.describeLaneStatusFromBlue(laneState)}`;

      for (const typeId of UNIT_ORDER) {
        const button = this.deploymentButtons.get(`${lane}:${typeId}`);
        const type = UNIT_TYPES[typeId];
        const cooldown = this.teams.blue.cooldowns[typeId];
        const note = button.querySelector(".deploy-note");
        const available = this.canSpawn("blue", typeId);

        note.textContent = cooldown > 0 ? `${cooldown.toFixed(1)}秒` : `${type.cost}金`;
        button.disabled = !available;
        button.classList.toggle("is-disabled", !available);
        button.setAttribute("aria-disabled", String(!available));
        button.title = cooldown > 0
          ? `${type.label}冷却中：还剩 ${cooldown.toFixed(1)} 秒`
          : !available
            ? `需要 ${type.cost} 金币，或场上单位空位不足`
            : `部署${type.label}到${LANE_NAMES[lane]}`;
      }
    }
  }

  getLaneStateName(laneState) {
    const netPressure = laneState.bluePressure - laneState.redPressure;
    if (netPressure > 1.5) {
      return "pushing";
    }

    if (netPressure < -1.5) {
      return "threatened";
    }

    return "contested";
  }

  formatLanePressureLine(lane, laneState) {
    return `${LANE_NAMES[lane]}：蓝方 ${laneState.blue.total} 对 红方 ${laneState.red.total} · ${this.describeLaneStatusFromBlue(laneState)}`;
  }

  describeLaneStatusFromBlue(laneState) {
    const netPressure = laneState.bluePressure - laneState.redPressure;
    if (netPressure > 1.5) {
      return "我方推进中";
    }

    if (netPressure < -1.5) {
      return "敌方施压中";
    }

    return "拉锯中";
  }

  setMessage(message, duration) {
    this.bannerMessage = message;
    this.bannerTimer = duration;
    this.messageBanner.textContent = message;
  }

  formatTime(timeSeconds) {
    const minutes = Math.floor(timeSeconds / 60);
    const seconds = Math.floor(timeSeconds % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackground(ctx);
    this.drawTerrain(ctx);
    this.drawBases(ctx);
    this.drawBloodStains(ctx);
    this.drawProjectiles(ctx);
    this.drawUnits(ctx);
    this.drawParticles(ctx);
  }

  drawBackground(ctx) {
    const sky = ctx.createLinearGradient(0, 0, 0, MAP.height);
    sky.addColorStop(0, "#f7efd3");
    sky.addColorStop(0.7, "#f1d89d");
    sky.addColorStop(1, "#dcb879");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, MAP.width, MAP.height);

    const hillGradient = ctx.createLinearGradient(0, 0, 0, MAP.height);
    hillGradient.addColorStop(0, "rgba(134, 111, 78, 0.12)");
    hillGradient.addColorStop(1, "rgba(91, 74, 54, 0.2)");
    ctx.fillStyle = hillGradient;
    ctx.beginPath();
    ctx.moveTo(0, 520);
    ctx.bezierCurveTo(170, 430, 250, 470, 390, 440);
    ctx.bezierCurveTo(520, 410, 670, 460, 760, 430);
    ctx.bezierCurveTo(920, 380, 1000, 470, 1280, 410);
    ctx.lineTo(1280, 720);
    ctx.lineTo(0, 720);
    ctx.closePath();
    ctx.fill();

    this.drawSun(ctx, 150, 74, 40);
    this.drawCloud(ctx, 450, 106, 74, 28, 0.2);
    this.drawCloud(ctx, 690, 132, 92, 32, 0.18);
    this.drawCloud(ctx, 940, 102, 78, 26, 0.2);
  }

  drawSun(ctx, x, y, radius) {
    ctx.fillStyle = "rgba(255, 215, 86, 0.34)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(112, 79, 28, 0.6)";
    ctx.lineWidth = 2;
    for (let ray = 0; ray < 10; ray += 1) {
      const angle = (Math.PI * 2 * ray) / 10;
      this.roughLine(
        ctx,
        x + Math.cos(angle) * (radius + 8),
        y + Math.sin(angle) * (radius + 8),
        x + Math.cos(angle) * (radius + 26),
        y + Math.sin(angle) * (radius + 26),
        "rgba(112, 79, 28, 0.55)",
        2,
        x * 0.01 + ray,
      );
    }
  }

  drawCloud(ctx, x, y, width, height, alpha) {
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y, width * 0.4, height, 0, 0, Math.PI * 2);
    ctx.ellipse(x + width * 0.18, y - 8, width * 0.32, height * 0.8, 0, 0, Math.PI * 2);
    ctx.ellipse(x - width * 0.18, y - 4, width * 0.28, height * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawTerrain(ctx) {
    ctx.fillStyle = "rgba(198, 162, 102, 0.48)";
    ctx.fillRect(0, MAP.middleY + 8, MAP.width, MAP.height - MAP.middleY - 8);

    for (const segment of PLATFORM_SEGMENTS) {
      this.drawSegmentShadow(ctx, segment);
      this.roughLine(
        ctx,
        segment.x1,
        segment.y1,
        segment.x2,
        segment.y2,
        "rgba(70, 57, 40, 0.95)",
        5,
        segment.x1 * 0.013 + segment.y1 * 0.021,
      );
      this.roughLine(
        ctx,
        segment.x1,
        segment.y1 + 7,
        segment.x2,
        segment.y2 + 7,
        "rgba(70, 57, 40, 0.6)",
        2,
        segment.x1 * 0.015 + segment.y2 * 0.018,
      );
    }

    this.drawGrass(ctx, 110, MAP.middleY - 5, 180);
    this.drawGrass(ctx, 990, MAP.middleY - 5, 180);
    this.drawGrass(ctx, 390, MAP.topY - 6, 500);
    this.drawGrass(ctx, 390, MAP.bottomY - 6, 500);
  }

  drawSegmentShadow(ctx, segment) {
    const dx = segment.x2 - segment.x1;
    const dy = segment.y2 - segment.y1;
    const length = Math.hypot(dx, dy);
    const normalX = (dy / length) * 6;
    const normalY = (-dx / length) * 6;
    ctx.strokeStyle = "rgba(87, 71, 49, 0.18)";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(segment.x1 + normalX, segment.y1 + normalY);
    ctx.lineTo(segment.x2 + normalX, segment.y2 + normalY);
    ctx.stroke();
  }

  drawGrass(ctx, startX, y, width) {
    ctx.strokeStyle = "rgba(77, 110, 54, 0.75)";
    ctx.lineWidth = 1.4;
    for (let x = startX; x < startX + width; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + jitter(x * 0.37, 5), y - 7 - hash(x * 0.11) * 5);
      ctx.stroke();
    }
  }

  drawBases(ctx) {
    this.drawBase(ctx, "red");
    this.drawBase(ctx, "blue");
  }

  drawBase(ctx, teamId) {
    const team = TEAMS[teamId];
    const x = team.baseCenterX;
    const y = MAP.middleY;
    const color = team.color;
    const flagDirection = team.side === "left" ? 1 : -1;

    ctx.fillStyle = team.baseColor;
    ctx.beginPath();
    ctx.moveTo(x - 50, y + 2);
    ctx.lineTo(x - 44, y - 44);
    ctx.lineTo(x - 12, y - 82);
    ctx.lineTo(x + 22, y - 82);
    ctx.lineTo(x + 46, y - 30);
    ctx.lineTo(x + 50, y + 2);
    ctx.closePath();
    ctx.fill();

    this.roughLine(ctx, x - 44, y + 2, x - 34, y - 86, "#4a4031", 4, x * 0.15 + 1);
    this.roughLine(ctx, x + 24, y + 2, x + 18, y - 112, "#4a4031", 4, x * 0.17 + 3);
    this.roughLine(ctx, x - 44, y + 2, x + 40, y + 2, "#4a4031", 5, x * 0.14 + 6);
    this.roughLine(ctx, x - 34, y - 86, x + 18, y - 112, "#4a4031", 3, x * 0.16 + 7);
    this.roughLine(ctx, x - 8, y + 2, x - 8, y - 44, "#4a4031", 4, x * 0.11 + 9);
    this.roughLine(ctx, x + 10, y + 2, x + 10, y - 48, "#4a4031", 4, x * 0.12 + 11);
    this.roughLine(ctx, x - 8, y - 44, x + 10, y - 48, "#4a4031", 3, x * 0.12 + 13);
    this.roughLine(ctx, x + 18, y - 112, x + 60 * flagDirection, y - 112, "#4a4031", 3, x * 0.13 + 15);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + 60 * flagDirection, y - 112);
    ctx.lineTo(x + 34 * flagDirection, y - 126);
    ctx.lineTo(x + 34 * flagDirection, y - 98);
    ctx.closePath();
    ctx.fill();

    const barWidth = 110;
    const hpRatio = clamp(this.teams[teamId].baseHp / BASE_MAX_HEALTH, 0, 1);
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(x - barWidth / 2, y - 140, barWidth, 12);
    ctx.fillStyle = withAlpha(color, 0.78);
    ctx.fillRect(x - barWidth / 2, y - 140, barWidth * hpRatio, 12);
    ctx.strokeStyle = "#4a4031";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - barWidth / 2, y - 140, barWidth, 12);
  }

  drawBloodStains(ctx) {
    for (const stain of this.bloodStains) {
      ctx.fillStyle = `rgba(125, 16, 16, ${stain.alpha})`;
      ctx.beginPath();
      ctx.ellipse(stain.x, stain.y, stain.radius, stain.radius * 0.65, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawProjectiles(ctx) {
    for (const projectile of this.projectiles) {
      const tailX = projectile.x - 12;
      const tailY = projectile.y + 2;
      this.roughLine(
        ctx,
        tailX,
        tailY,
        projectile.x,
        projectile.y,
        "#3e2f21",
        2,
        projectile.trail * 0.011 + projectile.x * 0.01,
      );
      ctx.fillStyle = withAlpha(pickColor(projectile.teamId), 0.8);
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 3.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawUnits(ctx) {
    const sortedUnits = [...this.units].sort((left, right) => left.y - right.y);
    for (const unit of sortedUnits) {
      this.drawUnit(ctx, unit);
    }
  }

  drawUnit(ctx, unit) {
    const scale = unit.typeId === "giant" ? 1.45 : unit.typeId === "shield" ? 1.15 : 1;
    const step = Math.sin(unit.walkCycle) * 6;
    const color = pickColor(unit.teamId);
    const aura = unit.hitFlash > 0 ? "rgba(255, 255, 255, 0.45)" : withAlpha(color, 0.22);

    ctx.save();
    ctx.translate(unit.x, unit.y);
    ctx.scale(scale, scale);

    ctx.fillStyle = "rgba(35, 27, 19, 0.12)";
    ctx.beginPath();
    ctx.ellipse(0, 6, 11 + unit.radius * 0.25, 4 + unit.radius * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    this.drawHealthBar(ctx, unit, scale, color);

    ctx.strokeStyle = aura;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    this.drawStickFigure(ctx, unit, step, true);

    ctx.strokeStyle = "#241d15";
    ctx.lineWidth = 2.4;
    this.drawStickFigure(ctx, unit, step, false);

    ctx.restore();
  }

  drawHealthBar(ctx, unit, scale, color) {
    const width = 26 + unit.radius * 0.9;
    const ratio = clamp(unit.health / unit.maxHealth, 0, 1);
    ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
    ctx.fillRect(-width / 2, -52 / scale, width, 6);
    ctx.fillStyle = withAlpha(color, 0.9);
    ctx.fillRect(-width / 2, -52 / scale, width * ratio, 6);
    ctx.strokeStyle = "#4a4031";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-width / 2, -52 / scale, width, 6);
  }

  drawStickFigure(ctx, unit, step, accentPass) {
    const facing = unit.facing;
    const headY = -28;
    const shoulderY = -10;
    const hipY = 10;
    const armSwing = step * 0.6 * facing;
    const legSwing = step * 0.8 * facing;

    if (accentPass) {
      ctx.strokeStyle = withAlpha(pickColor(unit.teamId), 0.28);
    }

    ctx.beginPath();
    ctx.arc(0, headY, 9, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, headY + 9);
    ctx.lineTo(0, shoulderY);
    ctx.lineTo(0, hipY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, shoulderY);
    ctx.lineTo(10 * facing, shoulderY + armSwing);
    ctx.moveTo(0, shoulderY);
    ctx.lineTo(-9 * facing, shoulderY - armSwing * 0.8);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(9, 24 + legSwing * 0.75);
    ctx.moveTo(0, hipY);
    ctx.lineTo(-9, 24 - legSwing * 0.75);
    ctx.stroke();

    if (unit.typeId === "fighter") {
      ctx.beginPath();
      ctx.moveTo(10 * facing, shoulderY + armSwing);
      ctx.lineTo(22 * facing, shoulderY + armSwing - 8);
      ctx.stroke();
    }

    if (unit.typeId === "archer") {
      ctx.beginPath();
      ctx.arc(13 * facing, shoulderY - 2, 8, Math.PI * 0.65, Math.PI * 1.35);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(13 * facing, shoulderY - 10);
      ctx.lineTo(13 * facing, shoulderY + 8);
      ctx.stroke();
    }

    if (unit.typeId === "shield") {
      ctx.fillStyle = accentPass ? withAlpha(pickColor(unit.teamId), 0.24) : "rgba(0, 0, 0, 0)";
      ctx.beginPath();
      ctx.moveTo(14 * facing, shoulderY - 8);
      ctx.lineTo(26 * facing, shoulderY - 6);
      ctx.lineTo(26 * facing, shoulderY + 12);
      ctx.lineTo(14 * facing, shoulderY + 14);
      ctx.closePath();
      if (accentPass) {
        ctx.fill();
      } else {
        ctx.stroke();
      }
    }

    if (unit.typeId === "giant") {
      ctx.beginPath();
      ctx.moveTo(11 * facing, shoulderY + armSwing);
      ctx.lineTo(28 * facing, shoulderY + armSwing - 12);
      ctx.moveTo(28 * facing, shoulderY + armSwing - 12);
      ctx.lineTo(32 * facing, shoulderY + armSwing + 2);
      ctx.stroke();
    }
  }

  drawParticles(ctx) {
    for (const particle of this.particles) {
      const alpha = clamp(particle.life / (particle.age + particle.life + 0.001), 0, 1);
      ctx.fillStyle = particle.color.replace("0.88", `${alpha * 0.88}`);
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  roughLine(ctx, x1, y1, x2, y2, color, width, seed) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";

    for (let pass = 0; pass < 2; pass += 1) {
      const passSeed = seed + pass * 1.37;
      const startX = x1 + jitter(passSeed, 2.4);
      const startY = y1 + jitter(passSeed + 11, 2.4);
      const endX = x2 + jitter(passSeed + 23, 2.4);
      const endY = y2 + jitter(passSeed + 37, 2.4);
      const midX = (x1 + x2) / 2 + jitter(passSeed + 51, 7);
      const midY = (y1 + y2) / 2 + jitter(passSeed + 63, 7);

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.stroke();
    }
  }
}

const canvas = document.getElementById("gameCanvas");
if (canvas instanceof HTMLCanvasElement) {
  new Game(canvas);
}
