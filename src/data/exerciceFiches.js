// Fiches exercices — muscles ciblés, conseils, erreurs communes
export const FICHES = {

  // ─── PECS ────────────────────────────────────────────────────────────────

  'Pec Deck': {
    muscles: ['Grand pectoral (chef sternal)', 'Petit pectoral'],
    conseils: [
      'Règle le siège pour que les coudes soient au niveau des épaules.',
      'Pense à "écraser" une balle imaginaire entre tes mains en fin de mouvement.',
      'Contrôle la phase excentrique sur 2-3 secondes.',
      'Garde les épaules basses et en arrière tout au long du mouvement.',
    ],
    erreurs: [
      'Laisser les épaules remonter vers les oreilles.',
      'Aller trop loin en ouverture — s\'arrêter quand tu sens un étirement confortable.',
      'Utiliser l\'élan pour fermer les bras.',
    ],
  },

  'Chest Press': {
    muscles: ['Grand pectoral', 'Deltoïde antérieur', 'Triceps'],
    conseils: [
      'Règle le siège pour que les poignées soient au niveau de la poitrine.',
      'Pousse en expirant, reviens lentement en inspirant.',
      'Garde les pieds bien à plat sur le sol.',
      'Contracte les pecs en fin de poussée sans verrouiller les coudes.',
    ],
    erreurs: [
      'Cambrer excessivement le bas du dos.',
      'Laisser les coudes s\'écarter trop — angle à 45-75° par rapport au torse.',
      'Rebondir avec le poids en bas du mouvement.',
    ],
  },

  'Wild Chest Press': {
    muscles: ['Grand pectoral', 'Deltoïde antérieur', 'Triceps'],
    conseils: [
      'Mouvement libre qui permet une rotation naturelle des poignets.',
      'Laisse les bras suivre un arc naturel, ne force pas la trajectoire.',
      'Idéal pour travailler la contraction maximale des pecs.',
    ],
    erreurs: [
      'Prendre trop lourd et perdre le contrôle de la trajectoire.',
      'Oublier de contracter les pecs en haut du mouvement.',
    ],
  },

  'Incline Press': {
    muscles: ['Grand pectoral (chef claviculaire)', 'Deltoïde antérieur', 'Triceps'],
    conseils: [
      'Inclinaison idéale entre 30° et 45° pour cibler le haut des pecs.',
      'Garde les omoplates serrées et les épaules en arrière.',
      'Descends lentement jusqu\'à sentir un bon étirement dans le haut des pecs.',
    ],
    erreurs: [
      'Inclinaison trop haute (>60°) qui sollicite trop les épaules.',
      'Laisser les coudes trop ouverts — les garder à 45-60° du corps.',
    ],
  },

  // ─── DOS ─────────────────────────────────────────────────────────────────

  'Cable Pull-over': {
    muscles: ['Grand dorsal', 'Grand rond', 'Petit pectoral'],
    conseils: [
      'Poulie haute, corps légèrement incliné en avant.',
      'Garde les bras quasi tendus, légère flexion des coudes.',
      'Amène les bras vers les hanches en contractant fort le grand dorsal.',
      'Pense à "mettre tes épaules dans tes poches".',
    ],
    erreurs: [
      'Fléchir trop les coudes — ça devient du triceps.',
      'Ne pas contracter le grand dorsal en bas du mouvement.',
      'Utiliser le poids du corps comme élan.',
    ],
  },

  'Rowing horizontal poulie basse': {
    muscles: ['Grand dorsal', 'Rhomboïdes', 'Trapèze moyen', 'Biceps'],
    conseils: [
      'Tire vers le nombril en gardant les coudes près du corps.',
      'Serre les omoplates ensemble en fin de mouvement.',
      'Garde le dos droit, légère inclinaison vers l\'arrière acceptable.',
      'Contrôle le retour — ne laisse pas le poids tirer tes épaules.',
    ],
    erreurs: [
      'Arrondir le dos en tirant.',
      'Tirer avec les bras plutôt qu\'avec le dos.',
      'Ne pas aller jusqu\'à la contraction complète des omoplates.',
    ],
  },

  'Rowing Unilatéral chest-supported': {
    muscles: ['Grand dorsal', 'Rhomboïdes', 'Trapèze moyen', 'Biceps'],
    conseils: [
      'Appui sur le banc pour éliminer la triche du bas du dos.',
      'Tire le coude vers le haut et l\'arrière, pas juste vers toi.',
      'Laisse l\'épaule descendre en bas pour maximiser l\'étirement.',
      'Alterne côté G et D avec le même nombre de reps.',
    ],
    erreurs: [
      'Tourner le buste pour aider le bras — garde les épaules parallèles.',
      'Ne pas laisser l\'épaule s\'allonger en bas du mouvement.',
    ],
  },

  'Pulldown unilatéral': {
    muscles: ['Grand dorsal', 'Grand rond', 'Biceps'],
    conseils: [
      'Tire la poignée vers l\'épaule opposée pour maximiser le grand dorsal.',
      'Garde le buste légèrement incliné en arrière.',
      'Laisse le bras monter haut pour bien étirer le grand dorsal.',
      'Pense à "amener ton coude vers ta hanche".',
    ],
    erreurs: [
      'Tirer avec le biceps plutôt que d\'initier avec le coude.',
      'Ne pas étirer suffisamment en haut.',
    ],
  },

  'Lat Pulldown poulie': {
    muscles: ['Grand dorsal', 'Grand rond', 'Biceps', 'Rhomboïdes'],
    conseils: [
      'Prise légèrement plus large que les épaules.',
      'Incline légèrement le buste en arrière (10-15°).',
      'Tire la barre vers le haut de la poitrine, pas derrière la nuque.',
      'Initie le mouvement en abaissant les épaules avant de plier les coudes.',
    ],
    erreurs: [
      'Tirer derrière la nuque — dangereux pour les cervicales.',
      'Se balancer vers l\'arrière pour aider.',
      'Lâcher trop vite en phase excentrique.',
    ],
  },

  'Pull-over poulie': {
    muscles: ['Grand dorsal', 'Grand rond', 'Petit pectoral', 'Triceps (long)'],
    conseils: [
      'Bras tendus ou légèrement fléchis, ne pas trop plier les coudes.',
      'Mouvement en arc de cercle des épaules vers les hanches.',
      'Contracte fort le grand dorsal en bas du mouvement.',
    ],
    erreurs: [
      'Fléchir trop les coudes (ça devient du triceps).',
      'Monter les mains trop haut et perdre la tension sur le dos.',
    ],
  },

  'Straight-arm pulldown': {
    muscles: ['Grand dorsal', 'Grand rond', 'Triceps (long)'],
    conseils: [
      'Bras tendus tout le long du mouvement.',
      'Légère flexion des genoux, buste incliné.',
      'Tire vers les cuisses en contractant fort le grand dorsal.',
    ],
    erreurs: [
      'Fléchir les coudes — le mouvement doit venir des épaules.',
      'Ne pas contracter en bas du mouvement.',
    ],
  },

  'Rowing T-bar chest-supported': {
    muscles: ['Grand dorsal', 'Rhomboïdes', 'Trapèze moyen', 'Biceps'],
    conseils: [
      'Appui sur le banc pour protéger le bas du dos.',
      'Tire les coudes vers le haut et l\'arrière.',
      'Serre les omoplates en haut du mouvement.',
    ],
    erreurs: [
      'Utiliser l\'élan du corps.',
      'Ne pas aller chercher l\'étirement complet en bas.',
    ],
  },

  // ─── ÉPAULES ─────────────────────────────────────────────────────────────

  'Shoulder Press machine': {
    muscles: ['Deltoïde antérieur', 'Deltoïde latéral', 'Triceps', 'Trapèze'],
    conseils: [
      'Règle le siège pour que les poignées soient à hauteur des épaules.',
      'Pousse en expirant, garde le dos plaqué contre le dossier.',
      'Ne verrouille pas les coudes en haut.',
    ],
    erreurs: [
      'Cambrer le bas du dos pour pousser plus lourd.',
      'Laisser les épaules remonter vers les oreilles.',
    ],
  },

  'Élévation latérale machine bilat': {
    muscles: ['Deltoïde latéral', 'Supra-épineux'],
    conseils: [
      'Légère flexion des coudes (15-20°), garde-la constante.',
      'Monte jusqu\'à l\'horizontale, pas plus.',
      'Contrôle la descente — phase excentrique lente.',
      'Penche légèrement le buste en avant pour mieux cibler le deltoïde latéral.',
    ],
    erreurs: [
      'Hausser les épaules en montant — les garder basses.',
      'Monter les bras au-dessus de l\'horizontale.',
      'Utiliser l\'élan.',
    ],
  },

  'Élévation latérale haltères': {
    muscles: ['Deltoïde latéral', 'Supra-épineux'],
    conseils: [
      'Même technique que la machine mais avec haltères.',
      'Le petit doigt légèrement plus haut que le pouce en haut du mouvement.',
      'Légère inclinaison du buste en avant.',
    ],
    erreurs: [
      'Balancer les haltères avec les hanches.',
      'Monter trop haut.',
    ],
  },

  'Élévation latérale machine': {
    muscles: ['Deltoïde latéral', 'Supra-épineux'],
    conseils: [
      'Règle la machine pour que le pivot soit aligné avec l\'épaule.',
      'Contrôle la phase excentrique — c\'est là que se fait le travail.',
    ],
    erreurs: [
      'Mettre trop lourd et perdre la forme.',
      'Hausser les épaules.',
    ],
  },

  'Face pull poulie': {
    muscles: ['Deltoïde postérieur', 'Trapèze', 'Rotateurs externes'],
    conseils: [
      'Poulie à hauteur du visage ou légèrement au-dessus.',
      'Tire vers le visage en écartant les mains (comme un "W").',
      'Les coudes doivent rester hauts tout au long du mouvement.',
      'Excellent pour la santé des épaules — ne pas négliger.',
    ],
    erreurs: [
      'Tirer trop bas — ça devient du rowing.',
      'Ne pas finir le mouvement avec la rotation externe.',
    ],
  },

  'Face pull': {
    muscles: ['Deltoïde postérieur', 'Trapèze', 'Rotateurs externes'],
    conseils: [
      'Poulie à hauteur du visage.',
      'Tire en formant un "W" avec les bras.',
      'Coudes hauts, rotation externe complète en fin de mouvement.',
    ],
    erreurs: [
      'Tirer trop bas.',
      'Coudes qui descendent.',
    ],
  },

  'Reverse Fly': {
    muscles: ['Deltoïde postérieur', 'Rhomboïdes', 'Trapèze moyen'],
    conseils: [
      'Buste penché en avant ou sur un banc incliné.',
      'Bras légèrement fléchis, ouvre en arc de cercle.',
      'Pince les omoplates en haut du mouvement.',
    ],
    erreurs: [
      'Utiliser trop lourd et perdre la forme.',
      'Monter trop haut (au-dessus de l\'horizontale).',
    ],
  },

  'Shrugs': {
    muscles: ['Trapèze supérieur', 'Élévateur de la scapula'],
    conseils: [
      'Monte les épaules vers les oreilles, tiens 1 seconde en haut.',
      'Pas de rotation des épaules — mouvement strictement vertical.',
      'Descend lentement pour maximiser l\'étirement.',
    ],
    erreurs: [
      'Tourner les épaules (risque de blessure).',
      'Ne pas descendre assez bas.',
    ],
  },

  'Élévation frontale': {
    muscles: ['Deltoïde antérieur', 'Petit pectoral'],
    conseils: [
      'Monte les bras devant toi jusqu\'à l\'horizontale.',
      'Légère flexion des coudes, poignets neutres.',
      'Contrôle la descente.',
    ],
    erreurs: [
      'Monter au-dessus de l\'horizontale.',
      'Balancer le buste.',
    ],
  },

  // ─── BICEPS ──────────────────────────────────────────────────────────────

  'Bayesian curl': {
    muscles: ['Biceps brachial (longue portion)', 'Brachial', 'Brachioradial'],
    conseils: [
      'Poulie basse derrière toi, bras en extension vers l\'arrière.',
      'Cette position étire le biceps en position allongée — très efficace.',
      'Curl lentement vers l\'épaule, coude fixe.',
      'Ne laisse pas l\'épaule partir en avant.',
    ],
    erreurs: [
      'Laisser le coude se déplacer vers l\'avant.',
      'Ne pas profiter de l\'étirement en bas — c\'est l\'intérêt de cet exercice.',
    ],
  },

  'Curl marteau poulie': {
    muscles: ['Brachial', 'Brachioradial', 'Biceps (longue portion)'],
    conseils: [
      'Prise neutre (pouce vers le haut) tout au long du mouvement.',
      'Coude fixe contre le corps.',
      'Monte jusqu\'à ce que l\'avant-bras soit vertical.',
    ],
    erreurs: [
      'Tourner le poignet pendant le mouvement.',
      'Balancer le corps.',
    ],
  },

  'Curl incliné': {
    muscles: ['Biceps brachial (longue portion)', 'Brachial'],
    conseils: [
      'Banc incliné à 45-60°, bras qui pendent derrière le corps.',
      'Position d\'étirement maximale — excellent pour la longue portion.',
      'Monte lentement, descend très lentement.',
      'Ne force pas trop lourd — l\'étirement est intense.',
    ],
    erreurs: [
      'Incliner le banc trop droit (perd l\'avantage de l\'étirement).',
      'Laisser les coudes partir en avant en montant.',
    ],
  },

  'Curl pupitre': {
    muscles: ['Biceps brachial (courte portion)', 'Brachial'],
    conseils: [
      'Appui de l\'arrière du bras sur le pupitre, coude légèrement fléchi en bas.',
      'Monte complètement, descend jusqu\'à extension quasi-complète.',
      'Excellent pour isoler les biceps — pas de triche possible.',
    ],
    erreurs: [
      'Descendre trop vite et rebondir en bas.',
      'Lever les épaules pour aider.',
    ],
  },

  'Curl marteau': {
    muscles: ['Brachial', 'Brachioradial', 'Biceps'],
    conseils: [
      'Prise neutre, coudes fixes contre le corps.',
      'Peut se faire alterné ou simultané.',
    ],
    erreurs: [
      'Balancer le corps pour aider.',
      'Tourner le poignet.',
    ],
  },

  // ─── TRICEPS ─────────────────────────────────────────────────────────────

  'Pushdown poulie': {
    muscles: ['Triceps (3 chefs)', 'Anconé'],
    conseils: [
      'Coudes fixés contre le corps, ne bougent pas.',
      'Extension complète en bas, tiens 1 seconde.',
      'Légère inclinaison du buste en avant.',
    ],
    erreurs: [
      'Laisser les coudes remonter et s\'écarter.',
      'Utiliser le poids du corps pour aider.',
    ],
  },

  'Pushdown poulie incliné': {
    muscles: ['Triceps (3 chefs)', 'Anconé'],
    conseils: [
      'Poulie légèrement au-dessus de la tête, inclinaison du câble.',
      'Coudes fixes, extension complète.',
      'L\'angle change le recrutement des chefs du triceps.',
    ],
    erreurs: [
      'Laisser les coudes monter.',
      'Ne pas aller jusqu\'à l\'extension complète.',
    ],
  },

  'Pushdown unilatéral': {
    muscles: ['Triceps (3 chefs)'],
    conseils: [
      'Même technique que le pushdown mais un bras à la fois.',
      'Permet de corriger les déséquilibres gauche/droite.',
      'Coude fixe, extension complète.',
    ],
    erreurs: [
      'Laisser le coude s\'écarter du corps.',
    ],
  },

  'Tirage triceps nuque overhead': {
    muscles: ['Triceps (longue portion)', 'Anconé'],
    conseils: [
      'Poulie haute, mains derrière la nuque, coudes pointés vers le plafond.',
      'Le longue portion est maximalement étiré dans cette position.',
      'Garde les coudes fixes, étends les bras vers le haut.',
    ],
    erreurs: [
      'Laisser les coudes s\'écarter vers les côtés.',
      'Ne pas aller chercher l\'étirement complet en bas.',
    ],
  },

  'Overhead triceps poulie': {
    muscles: ['Triceps (longue portion)'],
    conseils: [
      'Position d\'étirement du longue portion — très efficace.',
      'Coudes serrés, extension vers le haut ou l\'avant.',
      'Contrôle la phase excentrique.',
    ],
    erreurs: [
      'Coudes qui s\'écartent.',
      'Mouvement trop rapide.',
    ],
  },

  // ─── JAMBES ──────────────────────────────────────────────────────────────

  'Hack squat / Leg Press': {
    muscles: ['Quadriceps', 'Fessiers', 'Ischio-jambiers', 'Mollets'],
    conseils: [
      'Pieds à largeur d\'épaules, légèrement tournés vers l\'extérieur.',
      'Descend jusqu\'à 90° ou plus selon ta mobilité.',
      'Pousse avec les talons, pas les orteils.',
      'Garde le dos plaqué contre le dossier.',
    ],
    erreurs: [
      'Verrouiller les genoux en haut.',
      'Laisser les genoux rentrer vers l\'intérieur.',
      'Monter les fesses du siège en bas du mouvement.',
    ],
  },

  'Leg extension': {
    muscles: ['Quadriceps (4 chefs)'],
    conseils: [
      'Règle la machine pour que le pivot soit au niveau du genou.',
      'Extension complète en haut, tiens 1 seconde.',
      'Contrôle la descente sur 2-3 secondes.',
    ],
    erreurs: [
      'Utiliser trop lourd et saccader le mouvement.',
      'Ne pas aller jusqu\'à l\'extension complète.',
    ],
  },

  'Hip Thrust': {
    muscles: ['Grand fessier', 'Ischio-jambiers', 'Adducteurs'],
    conseils: [
      'Dos appuyé sur un banc, barre sur les hanches (avec protection).',
      'Pousse les hanches vers le plafond, contracte les fessiers en haut.',
      'Pieds à plat, genoux à 90° en haut du mouvement.',
      'Menton vers la poitrine pour garder la nuque neutre.',
    ],
    erreurs: [
      'Cambrer le bas du dos — le mouvement vient des hanches.',
      'Ne pas aller jusqu\'à l\'extension complète des hanches.',
      'Pieds trop proches ou trop éloignés.',
    ],
  },

  'Machine adducteurs': {
    muscles: ['Adducteurs', 'Gracile', 'Pectiné'],
    conseils: [
      'Règle l\'amplitude selon ta mobilité.',
      'Contrôle la phase excentrique (ouverture).',
      'Ferme les cuisses lentement en contractant les adducteurs.',
    ],
    erreurs: [
      'Aller trop vite en phase excentrique.',
      'Utiliser trop lourd et compenser avec le bassin.',
    ],
  },

  'Hip Machine': {
    muscles: ['Grand fessier', 'Ischio-jambiers'],
    conseils: [
      'Extension de hanche contrôlée.',
      'Contracte le fessier en fin de mouvement.',
      'Garde le dos stable pendant le mouvement.',
    ],
    erreurs: [
      'Cambrer le bas du dos.',
      'Utiliser l\'élan.',
    ],
  },

  'Leg curl': {
    muscles: ['Ischio-jambiers', 'Gastrocnémien'],
    conseils: [
      'Règle la machine pour que le pivot soit au niveau du genou.',
      'Flexion complète, contracte les ischio-jambiers en haut.',
      'Descend lentement — la phase excentrique est très importante.',
    ],
    erreurs: [
      'Lever les hanches pour aider.',
      'Ne pas aller jusqu\'à la flexion complète.',
    ],
  },
}
