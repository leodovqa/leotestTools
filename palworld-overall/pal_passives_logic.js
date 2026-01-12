// Passive Ability Logic for Palworld Pals
// Based on 2026 meta analysis with element-specific and type-specific builds

// Passive Ability Definitions
const passiveAbilities = {
  // Combat Abilities
  'Legend': { name: 'Legend', type: 'combat', description: 'Ultimate combat ability' },
  'Demon God': { name: 'Demon God', type: 'combat', description: 'Increases attack power significantly' },
  'Serenity': { name: 'Serenity', type: 'combat', description: 'Reduces cooldowns, hidden multiplier' },
  'Musclehead': { name: 'Musclehead', type: 'combat', description: 'Physical attack boost' },
  'Ferocious': { name: 'Ferocious', type: 'combat', description: 'Aggressive attack enhancement' },
  'Invader': { name: 'Invader', type: 'combat', description: 'Invasion-based attack' },
  
  // Elemental Emperors (Slot 4)
  'Celestial Emperor': { name: 'Celestial Emperor', type: 'elemental', element: 'Neutral' },
  'Flame Emperor': { name: 'Flame Emperor', type: 'elemental', element: 'Fire' },
  'Lord of the Sea': { name: 'Lord of the Sea', type: 'elemental', element: 'Water' },
  'Lunker': { name: 'Lunker', type: 'elemental', element: 'Water' },
  'Lord of Lightning': { name: 'Lord of Lightning', type: 'elemental', element: 'Electric' },
  'Spirit Emperor': { name: 'Spirit Emperor', type: 'elemental', element: 'Grass' },
  'Ice Emperor': { name: 'Ice Emperor', type: 'elemental', element: 'Ice' },
  'Earth Emperor': { name: 'Earth Emperor', type: 'elemental', element: 'Ground' },
  'Lord of the Underworld': { name: 'Lord of the Underworld', type: 'elemental', element: 'Dark' },
  'Divine Dragon': { name: 'Divine Dragon', type: 'elemental', element: 'Dragon' },
  'Siren of the Void': { name: 'Siren of the Void', type: 'combat', description: 'Void-based attack' },
  
  // Movement Abilities
  'Swift': { name: 'Swift', type: 'movement', description: 'Speed enhancement' },
  'Runner': { name: 'Runner', type: 'movement', description: 'Movement boost' },
  'Eternal Engine': { name: 'Eternal Engine', type: 'movement', description: 'Stamina management (2026 update)' },
  'Nimble': { name: 'Nimble', type: 'movement', description: 'Ground speed optimization' },
  'King of the Waves': { name: 'King of the Waves', type: 'movement', description: 'Water movement mastery' },
  'Ace Swimmer': { name: 'Ace Swimmer', type: 'movement', description: 'Swimming optimization' },
  'Vanguard': { name: 'Vanguard', type: 'movement', description: 'Front-line leadership' }
};

// Combat Build Logic
function getCombatPassives(palNumber, element, isPrimary = true) {
  const isLegendary = palNumber >= 100;
  
  // Determine elemental emperor based on element
  let elementalEmperor = 'Celestial Emperor'; // default
  if (element === 'Fire') elementalEmperor = 'Flame Emperor';
  else if (element === 'Water') elementalEmperor = 'Lunker';
  else if (element === 'Electric') elementalEmperor = 'Lord of Lightning';
  else if (element === 'Grass') elementalEmperor = 'Spirit Emperor';
  else if (element === 'Ice') elementalEmperor = 'Ice Emperor';
  else if (element === 'Ground') elementalEmperor = 'Earth Emperor';
  else if (element === 'Dark') elementalEmperor = 'Lord of the Underworld';
  else if (element === 'Dragon') elementalEmperor = 'Divine Dragon';
  
  if (isLegendary) {
    return {
      best4: ['Legend', 'Demon God', 'Serenity', elementalEmperor],
      alternative: 'Musclehead'
    };
  } else {
    return {
      best4: ['Demon God', 'Serenity', 'Musclehead', elementalEmperor],
      alternative: 'Ferocious'
    };
  }
}

// Movement Build Logic
function getMovementPassives(mountType, isPrimary = true) {
  const basePassives = ['Legend', 'Swift', 'Runner'];
  
  if (mountType === 'flying') {
    return {
      best4: [...basePassives, 'Eternal Engine'],
      alternative: 'Nimble'
    };
  } else if (mountType === 'water') {
    return {
      best4: [...basePassives, 'King of the Waves'],
      alternative: 'Ace Swimmer'
    };
  } else if (mountType === 'ground') {
    return {
      best4: [...basePassives, 'Nimble'],
      alternative: 'Eternal Engine'
    };
  }
  
  // Default for non-mount types
  return {
    best4: [...basePassives, 'Nimble'],
    alternative: 'Eternal Engine'
  };
}

module.exports = {
  passiveAbilities,
  getCombatPassives,
  getMovementPassives,
  // Returns both passive sets: damage (combat) and mount (movement) when applicable
  getPassiveSets: function(palNumber, element, palType) {
    const combat = getCombatPassives(parseInt(String(palNumber).replace(/[^0-9]/g,''), 10), element, true);
    let mount = null;
    if (palType && palType.type === 'mount') {
      mount = getMovementPassives(palType.mountType || 'ground', true);
    }
    return { damage: combat, mount };
  }
};
