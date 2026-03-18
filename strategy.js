export const AI_FOCUS_LABELS = {
  balanced: "均衡",
  brace: "固守",
  volley: "齐射",
  power: "强攻",
};

export function createInitialAIBrainState() {
  return {
    focus: "balanced",
    reserveUnit: "shield",
    focusUntil: 0,
    lastChoice: null,
    lastLane: null,
  };
}

function normalizeBrain(brain) {
  return {
    ...createInitialAIBrainState(),
    ...brain,
  };
}

function canSpawnUnit(ai, typeId, unitTypes, unitCap) {
  const type = unitTypes[typeId];
  return (
    ai.unitCount < unitCap &&
    ai.gold >= type.cost &&
    ai.cooldowns[typeId] <= 0
  );
}

function refreshAIFocus(brain, context, random) {
  const { timeElapsed, aiCounts, playerCounts, pressure, playerBaseHp } = context;
  if (timeElapsed < brain.focusUntil) {
    return brain;
  }

  let focus = "balanced";
  let reserveUnit = "shield";

  if (pressure >= 4) {
    focus = "brace";
    reserveUnit = "shield";
  } else if (timeElapsed > 42 && (aiCounts.giant === 0 || playerBaseHp < 760)) {
    focus = "power";
    reserveUnit = "giant";
  } else if (
    playerCounts.archer >= 3 ||
    (aiCounts.fighter + aiCounts.shield >= 3 && aiCounts.archer < 2)
  ) {
    focus = "volley";
    reserveUnit = "archer";
  } else {
    const roll = random();
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

  return {
    ...brain,
    focus,
    reserveUnit,
    focusUntil: timeElapsed + 7 + random() * 4,
  };
}

function shouldHoldForReserve(brain, ai, aiCounts, pressure, unitTypes) {
  const reserveTypeId = brain.reserveUnit;
  if (!reserveTypeId) {
    return false;
  }

  const reserveType = unitTypes[reserveTypeId];
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

function getTypeScore(typeId, context) {
  const { ai, player, aiCounts, playerCounts, pressure, timeElapsed, brain } = context;
  const frontline = aiCounts.fighter + aiCounts.shield;
  const enemyFrontline = playerCounts.fighter + playerCounts.shield + playerCounts.giant;
  const enemyArchers = playerCounts.archer;
  let score = 0;

  if (typeId === "fighter") {
    score = 2.2 + Math.max(0, 3 - frontline) * 0.8;
    score += Math.max(0, 4 - aiCounts.fighter) * 0.2;
    score += pressure * 0.22;
    score -= aiCounts.fighter * 0.26;
    score -= timeElapsed > 45 ? 0.45 : 0;
  }

  if (typeId === "archer") {
    score = 4.1 + Math.max(0, enemyFrontline - aiCounts.archer * 2) * 0.46;
    score += Math.max(0, frontline - 1) * 0.36;
    score += Math.max(0, playerCounts.giant - aiCounts.archer) * 0.55;
    score += timeElapsed > 35 ? 0.4 : 0;
  }

  if (typeId === "shield") {
    score = 4.4 + Math.max(0, enemyArchers - aiCounts.shield) * 0.88;
    score += pressure * 0.75;
    score += Math.max(0, playerCounts.giant - aiCounts.shield) * 0.62;
    score -= aiCounts.shield * 0.08;
  }

  if (typeId === "giant") {
    score = 3.0 + Math.max(0, timeElapsed - 35) * 0.024;
    score += player.baseHp < 820 ? 1.35 : 0;
    score += aiCounts.giant === 0 && timeElapsed > 40 ? 1.3 : 0;
    score += frontline >= 2 ? 1.0 : -0.45;
    score += ai.gold > 145 ? 1.15 : 0;
    score -= aiCounts.giant * 0.95;
  }

  if (brain.focus === "brace") {
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

  if (brain.focus === "volley") {
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

  if (brain.focus === "power") {
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

function getLaneScore(typeId, laneState, brain) {
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

  if (brain.focus === "brace") {
    score += defendingThreat * 0.25;
  }

  if (brain.focus === "volley" && typeId === "archer") {
    score += friendly.frontline * 0.22;
  }

  if (brain.focus === "power" && typeId === "giant") {
    score += attackingThreat * 0.24;
  }

  return score;
}

/**
 * Chooses the next AI deployment action from a self-contained state snapshot.
 *
 * Input:
 * - timeElapsed, unitCap, unitOrder, laneOrder, unitTypes
 * - ai: { gold, unitCount, cooldowns, brain, baseHp }
 * - player: { baseHp }
 * - aiCounts, playerCounts, pressure, laneStates
 * - random: optional RNG returning a float in [0, 1)
 *
 * Output:
 * - action: { typeId, lane } or null
 * - brain: the next persisted AI brain state
 */
export function chooseAIStrategyAction(input) {
  const {
    timeElapsed,
    unitCap,
    unitOrder,
    laneOrder,
    unitTypes,
    ai,
    player,
    aiCounts,
    playerCounts,
    pressure,
    laneStates,
    random = Math.random,
  } = input;

  let brain = normalizeBrain(ai.brain);
  if (ai.unitCount >= unitCap) {
    return { action: null, brain };
  }

  brain = refreshAIFocus(
    brain,
    {
      timeElapsed,
      aiCounts,
      playerCounts,
      pressure,
      playerBaseHp: player.baseHp,
    },
    random,
  );

  if (shouldHoldForReserve(brain, ai, aiCounts, pressure, unitTypes)) {
    return { action: null, brain };
  }

  let bestAction = null;
  let bestScore = -Infinity;

  for (const typeId of unitOrder) {
    if (!canSpawnUnit(ai, typeId, unitTypes, unitCap)) {
      continue;
    }

    let score = getTypeScore(typeId, {
      ai,
      player,
      aiCounts,
      playerCounts,
      pressure,
      timeElapsed,
      brain,
    });

    if (brain.reserveUnit === typeId) {
      score += 1.35;
    }

    if (brain.lastChoice === typeId) {
      score -= 0.55;
    }

    for (const lane of laneOrder) {
      let laneScore = score + getLaneScore(typeId, laneStates[lane], brain);
      if (brain.lastLane === lane) {
        laneScore -= 0.18;
      }

      laneScore += random() * 0.5;
      if (laneScore > bestScore) {
        bestScore = laneScore;
        bestAction = { typeId, lane };
      }
    }
  }

  return {
    action: bestAction,
    brain: {
      ...brain,
      lastChoice: bestAction ? bestAction.typeId : null,
      lastLane: bestAction ? bestAction.lane : null,
    },
  };
}
