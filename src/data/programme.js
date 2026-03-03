export const PROGRAMME = [
  {
    id: 'lundi',
    label: 'Lundi',
    subtitle: 'Pecs + Rappel Dos',
    accent: '#ef4444',
    muscles: [
      { name: 'PECS', color: '#ef4444', exercises: [
        { name: 'Pec Deck',            sets: 2, reps: '12–20', rir: '0–1' },
        { name: 'Chest Press',         sets: 3, reps: '6–10',  rir: '1–2' },
        { name: 'Wild Chest Press',    sets: 3, reps: '8–12',  rir: '1–2' },
        { name: 'Incline Press',       sets: 2, reps: '6–10',  rir: '1–2' },
      ]},
      { name: 'DOS (rappel)', color: '#3b82f6', exercises: [
        { name: 'Cable Pull-over',                sets: 3, reps: '12–20', rir: '0–1' },
        { name: 'Rowing horizontal poulie basse', sets: 2, reps: '8–12',  rir: '~2'  },
      ]},
    ],
  },
  {
    id: 'mardi',
    label: 'Mardi',
    subtitle: 'Épaules & Bras',
    accent: '#a855f7',
    muscles: [
      { name: 'DELTS', color: '#a855f7', exercises: [
        { name: 'Élévation latérale machine bilat', sets: 3, reps: '12–20', rir: '0–1' },
        { name: 'Face pull poulie',                 sets: 3, reps: '12–20', rir: '0–1' },
      ]},
      { name: 'TRICEPS', color: '#f97316', exercises: [
        { name: 'Pushdown poulie',               sets: 3, reps: '10–15', rir: '0–1' },
        { name: 'Tirage triceps nuque overhead', sets: 3, reps: '10–15', rir: '0–1' },
      ]},
      { name: 'BICEPS', color: '#10b981', exercises: [
        { name: 'Bayesian curl',       sets: 3, reps: '8–12',  rir: '0–1', unilateral: true },
        { name: 'Curl marteau poulie', sets: 3, reps: '10–15', rir: '0–1' },
      ]},
    ],
  },
  {
    id: 'mercredi',
    label: 'Mercredi',
    subtitle: 'Jambes',
    accent: '#eab308',
    muscles: [
      { name: 'JAMBES', color: '#eab308', exercises: [
        { name: 'Hack squat / Leg Press', sets: 3, reps: '6–12',  rir: '1–2' },
        { name: 'Leg extension',          sets: 2, reps: '12–20', rir: '0–1' },
        { name: 'Hip Thrust',             sets: 2, reps: '8–12',  rir: '1–2' },
        { name: 'Machine adducteurs',     sets: 2, reps: '12–20', rir: '0–1' },
        { name: 'Hip Machine',            sets: 2, reps: '12–20', rir: '0–1' },
        { name: 'Leg curl',               sets: 3, reps: '10–15', rir: '0–1' },
      ]},
    ],
  },
  {
    id: 'jeudi',
    label: 'Jeudi',
    subtitle: 'Dos + Rappel Pecs',
    accent: '#3b82f6',
    muscles: [
      { name: 'DOS', color: '#3b82f6', exercises: [
        { name: 'Rowing Unilatéral chest-supported', sets: 2, reps: '8–12',  rir: '1–2', unilateral: true },
        { name: 'Pulldown unilatéral',               sets: 2, reps: '8–12',  rir: '1–2', unilateral: true },
        { name: 'Rowing horizontal poulie basse',    sets: 2, reps: '8–12',  rir: '~2'  },
        { name: 'Lat Pulldown poulie',               sets: 2, reps: '8–12',  rir: '1–2' },
        { name: 'Pull-over poulie',                  sets: 3, reps: '12–20', rir: '0–1' },
      ]},
      { name: 'PECS (rappel)', color: '#ef4444', exercises: [
        { name: 'Pec Deck',       sets: 2, reps: '12–20', rir: '0–1' },
        { name: 'Chest Press',    sets: 2, reps: '8–12',  rir: '2'   },
      ]},
    ],
  },
  {
    id: 'vendredi',
    label: 'Vendredi',
    subtitle: 'Épaules',
    accent: '#a855f7',
    muscles: [
      { name: 'ÉPAULES', color: '#a855f7', exercises: [
        { name: 'Shoulder Press machine',      sets: 2, reps: '6–10',  rir: '1–2' },
        { name: 'Élévation latérale haltères', sets: 2, reps: '10–20', rir: '0–1' },
        { name: 'Reverse Fly',                 sets: 2, reps: '12–20', rir: '0–1' },
        { name: 'Élévation latérale machine',  sets: 3, reps: '12–20', rir: '0–1' },
        { name: 'Shrugs',                      sets: 2, reps: '8–12',  rir: '1–2' },
        { name: 'Élévation frontale',          sets: 2, reps: '10–15', rir: '0–1' },
      ]},
    ],
  },
  {
    id: 'samedi',
    label: 'Samedi',
    subtitle: 'Bras',
    accent: '#f97316',
    muscles: [
      { name: 'BICEPS', color: '#10b981', exercises: [
        { name: 'Curl incliné', sets: 3, reps: '8–12',  rir: '0–1', unilateral: true },
        { name: 'Curl pupitre', sets: 3, reps: '10–15', rir: '0–1', unilateral: true },
        { name: 'Curl marteau', sets: 3, reps: '10–15', rir: '0–1' },
      ]},
      { name: 'TRICEPS', color: '#f97316', exercises: [
        { name: 'Pushdown poulie incliné', sets: 3, reps: '10–15', rir: '0–1' },
        { name: 'Pushdown unilatéral', sets: 3, reps: '10–15', rir: '0–1', unilateral: true },
        { name: 'Overhead triceps poulie', sets: 3, reps: '8–12',  rir: '0–1' },
      ]},
    ],
  },
]
