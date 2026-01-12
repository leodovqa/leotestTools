## Palworld Database - 2026 Meta Passive Build System

### Overview
This system automatically generates optimal passive ability recommendations for all 156 Pals + variants based on 2026 Palworld meta analysis.

### Key Files
- **data_backup.txt** - SOURCE OF TRUTH: Contains all 156 Pals with elements and work suitability data
- **parse_pals.js** - Parser that reads data_backup.txt and generates pals.json with passive recommendations
- **pal_types.js** - Pal type classification (fighter, ground/water/flying mount)
- **pals.json** - Generated output with all parsed data and passive recommendations

### Passive Build Logic (2026 Meta)

#### 1. Combat Builds (Fighters)

**Standard Fighters (Pal #1-99 excluding mounts):**
- Slot 1: **Demon God** - Increases attack power significantly
- Slot 2: **Serenity** - Reduces cooldowns (hidden multiplier of 2026 meta)
- Slot 3: **Musclehead** - Physical attack boost
- Slot 4: **Elemental Emperor** (based on primary element)
  - Neutral → Celestial Emperor
  - Fire → Flame Emperor
  - Water → Lord of the Sea
  - Electric → Lord of Lightning
  - Grass → Spirit Emperor
  - Ice → Ice Emperor
  - Ground → Earth Emperor
  - Dark → Lord of the Underworld
  - Dragon → Divine Dragon
- Alternative: **Ferocious** - Aggressive attack enhancement

**Legendary Fighters (Pal #100+):**
- Slot 1: **Legend** - Ultimate combat ability (replaces Demon God)
- Slot 2: **Demon God** - Secondary attack power boost
- Slot 3: **Serenity** - Cooldown reduction
- Slot 4: **Elemental Emperor** - Same as above
- Alternative: **Musclehead** - Physical attack backup

#### 2. Movement Builds (Mounts)

**Flying Mounts:**
- Slot 1: **Legend** - Ultimate movement ability
- Slot 2: **Swift** - Speed enhancement
- Slot 3: **Runner** - Movement boost
- Slot 4: **Eternal Engine** - Stamina management (2026 update, critical for flyers)
- Alternative: **Nimble** - Ground speed optimization

**Water Mounts:**
- Slot 1: **Legend** - Ultimate movement ability
- Slot 2: **Swift** - Speed enhancement
- Slot 3: **Runner** - Movement boost
- Slot 4: **King of the Waves** - Water movement mastery
- Alternative: **Ace Swimmer** - Swimming optimization

**Ground Mounts:**
- Slot 1: **Legend** - Ultimate movement ability
- Slot 2: **Swift** - Speed enhancement
- Slot 3: **Runner** - Movement boost
- Slot 4: **Nimble** - Ground speed optimization (maximizes raw ground speed)
- Alternative: **Eternal Engine** - Stamina management backup

### Example Pals & Their Builds

```json
{
  "number": "1",
  "name": "Lamball",
  "elements": ["Neutral"],
  "type": "fighter",
  "mountType": null,
  "passives": {
    "best4": ["Demon God", "Serenity", "Musclehead", "Celestial Emperor"],
    "alternative": "Ferocious"
  }
}

{
  "number": "65",
  "name": "Surfent",
  "elements": ["Water"],
  "type": "mount",
  "mountType": "water",
  "passives": {
    "best4": ["Legend", "Swift", "Runner", "King of the Waves"],
    "alternative": "Ace Swimmer"
  }
}

{
  "number": "100",
  "name": "Anubis",
  "elements": ["Ground"],
  "type": "fighter",
  "mountType": null,
  "passives": {
    "best4": ["Legend", "Demon God", "Serenity", "Earth Emperor"],
    "alternative": "Musclehead"
  }
}
```

### Data Structure (pals.json)

Each Pal entry contains:
- `number` - Pal ID (1-156, with variants like 5B, 101B, etc.)
- `name` - Pal name
- `elements` - Array of element types (can be 1-2 elements)
- `workSuitability` - Array of work types with proficiency levels (1-4)
  - e.g., `{ type: "Handiwork", level: 1 }`
- `type` - "fighter" or "mount"
- `mountType` - null for fighters, or "ground"/"water"/"flying" for mounts
- `passives` - Recommended passive abilities
  - `best4` - Array of 4 optimal passives
  - `alternative` - 1 alternative passive for slot 1-3 substitution

### Pal Classification (156 Total)

- **Fighters**: ~140 Pals - Combat-focused, use attack passive builds
- **Mounts**: ~76 variants
  - Ground Mounts: Penking, Direhowl, Relaxaurus, Mammorest, etc.
  - Water Mounts: Celaray, Surfent, Whalaska, Neptilius, etc.
  - Flying Mounts: Cawgnito, Fenglope, Frostallion, Jetragon, Shadowbeak, etc.

### Notes

1. **data_backup.txt is never modified** - It serves as the immutable source of truth
2. **Parse & regenerate anytime** - Run `node parse_pals.js` to refresh pals.json
3. **Element system** - 9 total elements extracted from Palworld icon text patterns
4. **2026 Meta Rules**:
   - Serenity is the "hidden multiplier" due to cooldown reduction
   - Eternal Engine is critical for flying and water mounts (stamina bottleneck)
   - Nimble optimizes ground mount speed over stamina
   - Legendary Pals use Legend instead of Demon God as Slot 1

### Future Enhancements

Could add:
- Attack movesets (1-4 basic attacks)
- Partner skill data
- Breeding combinations
- Item drops
- Capture rates
- Base stats (HP, Attack, Defense, etc.)
