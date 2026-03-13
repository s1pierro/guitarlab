
        // ======== // ======== // ========
        // ======== // ======== // ========

        //  Données de base : notes, intervalles, qualités d'accords

        // les notes de base

        var notesFr = ['Do', 'Do#', 'Ré', 'Ré#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
        var notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

        // on génère toutes les notes précisées à l'octave

        var allnotes = [];
        for (var i = 0; i <8 ; i++) {
            for (var j = 0; j < notes.length; j++) {
                allnotes.push( notes[j]+i );
            }
        }
        var allnotesFr = [];
        for (var i = 0; i <8 ; i++) {
            for (var j = 0; j < notesFr.length; j++) {
                allnotesFr.push( notesFr[j]+i );
            }
        }

        // Les intervalles ( on se refere ici a la gamme majeure pour le nommage )
        ///////////////////

        var intervals = ['root', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'm5', '6', 'b7', '7'];


        // Les différentes qualités d'accords.
        // Pour chacune sont précisés les intervalles, ainsi que les intervalles "indispensables".

        var chordtypes = [
            { type: '', intervals: ['root'], sym: '', musthave: ['root']},
            { type: '', intervals: ['root', '5'], sym: '5', musthave: ['5']},
            { type: '', intervals: ['root', '3', '5'], sym: '', musthave: ['3'], desc: ' Les accords majeurs ont une sonorité lumineuse et joyeuse, créant une atmosphère positive. Ils sont souvent utilisés pour établir une tonalité majeure, donner un sentiment de stabilité et de bonheur. Ils sont souvents utilisés en ouverture de chansons, transitions heureuses.'},
            { type: '', intervals: ['root', 'b3', 'b5'], sym: 'dim', musthave: ['b3', 'b5']},
            { type: '', intervals: ['root', '2', '5'], sym: 'sus2', musthave: ['2']},
            { type: '', intervals: ['root', '4', '5'], sym: 'sus4', musthave: ['4']},
            { type: '', intervals: ['root', '3', 'b5'], sym: '(♭5)', musthave: ['b5']},
            { type: '', intervals: ['root', '3', 'm5'], sym: '(aug)', musthave: ['m5', '3']},
            { type: '', intervals: ['root', 'b3', 'm5'], sym: 'm(aug)', musthave: ['m5', 'b3']},
            { type: '', intervals: ['root', '3', '5', '6'], sym: '6', musthave: ['6', '3']},
            { type: '', intervals: ['root', '2', '5', '6'], sym: '6sus2', musthave: ['6', '2']},
            { type: '', intervals: ['root', '3', '5', '6', '2'], sym: '6/9', musthave: ['2', '6'], trueintervals: ['root', '3', '5', '6', '9']  },
            { type: '', intervals: ['root', '3', '6', 'b5'], sym: '6(#11)', musthave: ['b5', '6'], trueintervals: ['root', '3', '6', '#11']},
            { type: '', intervals: ['root', '3', '5', '7'], sym: 'maj7', musthave: ['7']},
            { type: '', intervals: ['root', '3', 'b5', '7'], sym: 'maj7(b5)', musthave: ['b5', '7']},
            { type: '', intervals: ['root', '3', '5', 'b7'], sym: '7', musthave: ['b7']},
            { type: '', intervals: ['root', '2', '5', 'b7'], sym: '7/2', musthave: ['2', 'b7']},
            { type: '', intervals: ['root', '4', '5', 'b7'], sym: '7/4', musthave: ['4', 'b7']},
            { type: '', intervals: ['root', '4', '5', '7'], sym: 'maj7/4', musthave: ['4', '7']},
            { type: '', intervals: ['root', '3', 'b5', 'b7'], sym: '7(b5)', musthave: ['b5', 'b7']},
            { type: '', intervals: ['root', 'b3', 'b5', 'b7'], sym: 'm7(b5)', musthave: ['b5', 'b7']},
            { type: '', intervals: ['root', 'b3', 'b5', '6'], sym: '7(dim)', musthave: ['b5', '6']},
            { type: '', intervals: ['root', '3', 'm5', 'b7'], sym: '7(aug)', musthave: ['m5', 'b7']},
            { type: '', intervals: ['root', '3', 'm5', 'b7', 'b2'], sym: '7aug(♭9)', musthave: ['m5', 'b7', 'b2'], trueintervals: ['root', '3', 'm5', 'b7', 'b9']},
            { type: '', intervals: ['root', '3', '5', 'b7', 'b2'], sym: '7(♭9)', musthave: ['b7', 'b2'], trueintervals: ['root', '3', '5', 'b7', 'b9'] },
            { type: '', intervals: ['root', '3', 'b5', 'b7', 'b2'], sym: '7(♭9♭5)', musthave: ['b2', 'b5', 'b7'], trueintervals: ['root', '3', 'b5', 'b7', 'b9']},
            { type: '', intervals: ['root', '3', '5', 'b7', 'b3'], sym: '7(#9)', musthave: ['b3', 'b7'], trueintervals: ['root', '3', '5', 'b7', '#9']},
            { type: '', intervals: ['root', '3', 'b5', 'b7', 'b3'], sym: '7(♭5#9)', musthave: ['b3', 'b7', 'b5'], trueintervals: ['root', '3', 'b5', 'b7', '#9']},
            { type: '', intervals: ['root', '3', '5', '7', '2'], sym: 'maj9', musthave: ['2', '7'],  trueintervals: ['root', '3', '5', '7', '9']},
            { type: '', intervals: ['root', '3', '5', '2'], sym: '(add9)', musthave: ['2'], trueintervals: ['root', '3', '5', '9']},
            { type: '', intervals: ['root', '3', '5', 'b7', '2'], sym: '9', musthave: ['2', 'b7'],  trueintervals: ['root', '3', '5', 'b7', '9']},
            { type: '', intervals: ['root', '4', '5', 'b7', '2'], sym: '9/4', musthave: ['2', '4'],  trueintervals: ['root', '4', '5', 'b7', '9']},
            { type: '', intervals: ['root', '3', 'b5', 'b7', '2'], sym: '9(♭5)', musthave: ['2', 'b5'],  trueintervals: ['root', '3', 'b5', 'b7', '9']},
            { type: '', intervals: ['root', '3', 'm5', 'b7', '2'], sym: '9(aug)', musthave: ['2', 'm5'],  trueintervals: ['root', '3', 'm5', 'b7', '9']},
            { type: '', intervals: ['root', '3', '5', 'b7', '2', 'b5'], sym: '9(#11)', musthave: ['2', 'b5'],  trueintervals: ['root', '3', '5', 'b7', '9', '#11']},
            { type: '', intervals: ['root', '3', '5', 'b7', '2', '4'], sym: '11', musthave: ['4', 'b7'],  trueintervals: ['root', '3', '5', 'b7', '9', '11']},
            { type: '', intervals: ['root', '3', '5', '7', '2', '4'], sym: 'maj11', musthave: ['2', '4', '7']},
            { type: '', intervals: ['root', '3', '5', 'b7', '2', '4', '6'], sym: '13', musthave: ['2', '3', '4', '6']},
            { type: '', intervals: ['root', '3', '5', 'b7', 'b2', '4', '6'], sym: '13(♭9)', musthave: ['b2', '4', '6']},
            { type: '', intervals: ['root', '3', 'b5', 'b7', 'b2', '4', '6'], sym: '13(♭9♭5)', musthave: ['b2', '4', 'b5', '6']},
            { type: '', intervals: ['root', '3', '5', '7', '2', '4', '6'], sym: 'maj13', musthave: ['2', '4', '6', '7']},
            { type: '', intervals: ['root', 'b3', '5'], sym: 'm', musthave: ['b3'], desc: ' Les accords mineurs ont une sonorité plus sombre et émotionnelle que les accords majeurs. Ils créent une atmosphère plus mélancolique, Ils sont souvent utilisés lors des passages émotionnels, introspectifs, en intros.'},
            { type: '', intervals: ['root', 'b3', '5', '6'], sym: 'm6', musthave: ['b3', '6']},
            { type: '', intervals: ['root', 'b3', '5', '6', '2'], sym: 'm6/9', musthave: ['2', 'b3', '6']},
            { type: '', intervals: ['root', 'b3', '5', '7'], sym: 'm(maj7)', musthave: ['b3', '7']},
            { type: '', intervals: ['root', 'b3', '5', 'b7'], sym: 'm7', musthave: ['b3', 'b7']},
            { type: '', intervals: ['root', 'b3', '5', 'b7', '2'], sym: 'm9', musthave: ['b3', '2']},
            { type: '', intervals: ['root', 'b3', '5', '7', '2'], sym: 'm9(maj7)', musthave: ['b3', '7', '2']},
            { type: '', intervals: ['root', 'b3', '5', 'b7', '2', '4'], sym: 'm11', musthave: ['2', '4']},
            { type: '', intervals: ['root', 'b3', '5', 'b7', '2', '4', '6'], sym: 'm13', musthave: ['2', '6', '4']},
            { type: '', intervals: ['root', '3', '5', '7', 'b2'], sym: 'maj7(♭9)', musthave: ['b2', '7']}
        ];

// Fonctions utilitaires musicales

function extraireChiffres(chaine) {
    var chiffres = chaine.match(/\d/g);
    var chiffresEnChaine = chiffres ? chiffres.join('') : '';
    return chiffresEnChaine;
}

function extractBaseNote(octavednote) {
    let base = octavednote.replace('octave', '');
    return base;
}

function Interval(s) {
    let defs = [
        { names : ['r', 'root', '8'], semitones: 0, desc: '', fonticon: '<i class="icon-nit-R"></i>', background: 'assets/svgintervals/it-R' },
        { names : ['b2'], semitones: 2-1, desc: '', fonticon: '<i class="icon-nit-b2"></i>', background: 'assets/svgintervals/it-b2' },
        { names : ['2'], semitones: 2, desc: '', fonticon: '<i class="icon-nit-2"></i>', background: 'assets/svgintervals/it-2' },
        { names : ['b3'], semitones: 2*2-1, desc: '', fonticon: '<i class="icon-nit-b3"></i>', background: 'assets/svgintervals/it-b3' },
        { names : ['3'], semitones: 2*2, desc: '', fonticon: '<i class="icon-nit-3"></i>', background: 'assets/svgintervals/it-3' },
        { names : ['4'], semitones: 5, desc: '', fonticon: '<i class="icon-nit-4"></i>', background: 'assets/svgintervals/it-4' },
        { names : ['m4', '#4'], semitones: 6, desc: '', fonticon: '<i class="icon-nit-m4"></i>', background: 'assets/svgintervals/it-m4' },
        { names : ['b5'], semitones: 6, desc: '', fonticon: '<i class="icon-nit-b5"></i>', background: 'assets/svgintervals/it-b5' },
        { names : ['5'], semitones: 7, desc: '', fonticon: '<i class="icon-nit-5"></i>', background: 'assets/svgintervals/it-5' },
        { names : ['m5', '#5'], semitones: 8, desc: '', fonticon: '<i class="icon-nit-m5"></i>', background: 'assets/svgintervals/it-m5' },
        { names : ['6'], semitones: 9, desc: '', fonticon: '<i class="icon-nit-6"></i>', background: 'assets/svgintervals/it-6' },
        { names : ['b7'], semitones: 10, desc: '', fonticon: '<i class="icon-nit-b7"></i>', background: 'assets/svgintervals/it-b7' },
        { names : ['7', 'm7'], semitones: 11, desc: '', fonticon: '<i class="icon-nit-7"></i>', background: 'assets/svgintervals/it-7' }
    ]
    for (var i = 0; i < defs.length; i++) {
        for (var j = 0; j < defs[i].names.length; j++) {
            if ( defs[i].names[j] == s) {
                this.fonticon = defs[i].fonticon;
                this.background = defs[i].background;
                this.semitones = defs[i].semitones;
                this.desc = defs[i].desc;
                this.name = defs[i].names[0];
                return this
            }
        }
    }
    return this
}

class Chord {
    constructor (frets, name, root, type, desc, bass, notes, intervals)
    {
        this.frets = frets;
        this.name = name;
        this.notes = notes;
        this.root = root;
        this.bass = bass;
        this.type = type;
        this.desc = desc;
        this.intervals = intervals;
        this.comp = frets.join('');
        this.uid = notes.join(',')+'#'+frets.join('.');
        return this;
    }
    sameAs (c) {
      let comp = c.frets.join('');
      if ( comp == this.comp ) return true;
      return false;
    }
}
