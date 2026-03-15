import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { notesFr, notes, allnotes, allnotesFr, intervals, chordtypes, extraireChiffres, extractBaseNote, Interval, Chord } from './music-theory.js';

// Données musicales dans music-theory.js (notes, intervalles, accords, Interval, Chord)

// quelques fonctions utilitaires
function distancePointToSegment(p1, p2, p3) {
    const x1 = p1.x;
    const y1 = p1.y;
    const x2 = p2.x;
    const y2 = p2.y;
    const x3 = p3.x;
    const y3 = p3.y;

    const numerator = Math.abs((x2 - x1) * (y1 - y3) - (x1 - x3) * (y2 - y1));
    const denominator = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    if (denominator === 0) {
        // p1 and p2 are the same point, handle accordingly
        return Math.sqrt(Math.pow(x3 - x1, 2) + Math.pow(y3 - y1, 2));
    }

    return numerator / denominator;
}


// Interval, extraireChiffres, extractBaseNote, Chord → music-theory.js

class GuitarModel {
    constructor (stringNames, onStateChange = () => {}) {
        this.stringNames = stringNames;
        this.holds = new Array(stringNames.length).fill(-1);
        this.onStateChange = onStateChange;
    }
    hold (stringIndex, fret) {
        if (fret === this.holds[stringIndex]) {
            this.holds[stringIndex] = -1;
        } else {
            this.holds[stringIndex] = fret;
        }
        this.onStateChange();
    }
    forcehold (stringIndex, fret) {
        this.holds[stringIndex] = (fret === 'x') ? -1 : parseInt(fret);
        this.onStateChange();
    }
    getholdedstrings () {
        let result = [];
        for (let i = 0; i < this.holds.length; i++) {
            if (this.holds[i] !== -1) {
                let name = this.stringNames[i];
                let basenote = allnotes[allnotes.indexOf(name) + this.holds[i]].replace(/\d/g, '');
                let octavednote = allnotes[allnotes.indexOf(name) + this.holds[i]];
                let octave = parseInt(extraireChiffres(octavednote));
                result.push({ stringnumber: i, fret: this.holds[i], basenote, octavednote, octave });
            }
        }
        return result;
    }
    getholdedfrets () {
        return this.holds.map(h => h !== -1 ? String(h) : 'x');
    }
}

class ComputedString {
    constructor (def, stringIndex, model, nfrets, domdest) {

        this.model = model;
        this.stringIndex = stringIndex;
        this.rootnote = def.pitch.replace(/\d/g, '');
        this.synth = new Tone.Sampler({
            urls: {
                E2: "E2.mp3",
                A2: "A2.mp3",
                D3: "D3.mp3",
                G3: "G3.mp3",
                B3: "B3.mp3",
                E4: "E4.mp3",
                F5: "F5.mp3"
            },
            release: 1,
            baseUrl: "samples/"
        }).toDestination();
        this.synth.volume.value = -10;

this.interval = undefined;
this.domctnr = document.createElement('div');
this.domctnr.classList.add ('computed-string-container');
domdest.appendChild(this.domctnr);
this.d = 0.9*this.domctnr.clientHeight-35;

this.name = def.pitch;
this.nfrets = nfrets;
this.touchmarker = document.createElement('div');
this.touchmarker.classList.add('touch');
this.touchmarker.innerText = '.';
let remaninglength = this.d*1.4;
let s = this.d/(1-1/(2**(nfrets/12)));
remaninglength = s;

for ( let i = 0 ; i < (nfrets+1) ; i++ )
{
    let afret = document.createElement('div');
    if ( i == 0)
    {
        let topneckthickness = 35;
        afret.classList.add('neck-top');
        afret.style.height = topneckthickness+'px';
        afret.style.minHeight = topneckthickness+'px';
        afret.style.maxHeight = topneckthickness+'px';
        afret.innerText = def.pitch;
    }
    else
    {
        afret.classList.add('case');
        afret.style.height = (remaninglength / 17.817)+'px';
        afret.style.minHeight = (remaninglength / 17.817)+'px';
        afret.style.maxHeight = (remaninglength / 17.817)+'px';
        remaninglength = remaninglength - (remaninglength / 17.817);

        let afretstring = document.createElement('div');
        afretstring.classList.add('case-string');
        afretstring.style.width = def.thickness*0.4+'em';
        afret.appendChild(afretstring);
    }
    afret.addEventListener ('click', function () {
        this.hold(i);
    }.bind(this), false);
    this.domctnr.appendChild(afret);
}
this.domctnr.children[0].appendChild(this.touchmarker);

}
tap (fret) {
    let oct = (allnotes.indexOf(this.name)+fret);
    this.synth.triggerAttackRelease(allnotes[oct], "1n");
}
addNoteHelper () {

    let tmp2 = allnotes.indexOf(this.name);


    for (let i = 0 ; i < allnotes.length ; i+=1 )
        if ( i >= tmp2 && i < (tmp2+this.nfrets+1) )
        {
            //-console.log ( i - tmp2);
            let amarker = document.createElement('div');
            amarker.innerText = extractBaseNote( allnotes[i] );
            amarker.classList.add('marker');
            amarker.classList.add('interval');
            amarker.style.color = '#000';
            amarker.style.fontWeight = 'bold';
            amarker.style.fontSize = '10px';
            amarker.style.textAlign = 'center';
            amarker.style.lineHeight = '15px';
            amarker.style.border = '0px solid #000';
            amarker.style.opacity = '0.0';
            this.domctnr.children[i-tmp2].appendChild(amarker);
            //-console.log( this.domctnr.children[i])
        }

    }
    hold (fret) {
        //-console.log('let\'s hold fret n°'+fret);
        let timing = Tone.now();
        const currentFret = this.model.holds[this.stringIndex];

        if ( fret === currentFret )
        {
            if ( currentFret !== -1 )
                this.synth.triggerRelease(currentFret, timing);

            this.domctnr.children[0].appendChild(this.touchmarker);
            this.touchmarker.classList.add('mute');
        }
        else
        {
            let oct = (allnotes.indexOf(this.name)+fret);
            this.synth.triggerRelease(currentFret, timing);
            this.synth.triggerAttack(allnotes[oct], timing+0.1);

            this.touchmarker.classList.remove('mute');
            this.domctnr.children[fret].appendChild(this.touchmarker);
        }
        this.model.hold(this.stringIndex, fret);


    }
    forcehold (fret) {
        if ( fret === 'x' )
        {
            this.domctnr.children[0].appendChild(this.touchmarker);
            this.touchmarker.classList.add('mute');
        }
        else
        {
            const fi = parseInt(fret);
            this.touchmarker.classList.remove('mute');
            this.domctnr.children[fi].appendChild(this.touchmarker);
        }
        this.model.forcehold(this.stringIndex, fret);
    }
    getstate ()
    {
        const fret = this.model.holds[this.stringIndex];
        if (fret !== -1)
        {
            let basenote = allnotes[allnotes.indexOf(this.name)+fret].replace(/\d/g, '');
            let octavednote = allnotes[allnotes.indexOf(this.name)+fret];
            let octave = parseInt(extraireChiffres(octavednote));
            return { fret, basenote, octavednote, octave };
        }
        return { fret: -1, basenote: 'x', octavednote: 'x', octave: 'x' };
    }
}
class ComputedGuitar {
    constructor (guitardef, domdest, groundrender, model) {

        this.groundrender = groundrender;
        this.model = model;
        let stringdefs = guitardef.stringdefs;
        this.strings = [];
        groundrender.loadWavefrontGuitar (guitardef.wavefront, guitardef.material);

        for ( let i = 0 ; i < stringdefs.length ; i++ )
            this.strings.push ( new ComputedString(stringdefs[i], i, model, stringdefs[i].nfret, domdest) );
        for (var i = 0; i < this.strings.length; i++) {
            this.strings[i].addNoteHelper();
        }
    }
    getholdedstrings () { return this.model.getholdedstrings(); }
    getholdedfrets ()   { return this.model.getholdedfrets(); }
    strum (way) {
        let timing = Tone.now();

        if ( way > 0)
        {
            for ( let i = this.strings.length-1 ; i >= 0 ; i-- ) {
                if (this.model.holds[i] !== -1)
                {
                    let oct = allnotes.indexOf(this.strings[i].name)+this.model.holds[i];
                    this.strings[i].synth.triggerRelease(this.model.holds[i], 0);
                    this.strings[i].synth.triggerAttack(allnotes[oct], timing);
                    timing += way*0.01;
                }
            }
        }
        else
        {
            for ( let i = 0 ; i < this.strings.length ; i++ ) {
                if (this.model.holds[i] !== -1)
                {
                    let oct = allnotes.indexOf(this.strings[i].name)+this.model.holds[i];
                    this.strings[i].synth.triggerRelease(this.model.holds[i], 0);
                    this.strings[i].synth.triggerAttack(allnotes[oct], timing);
                    timing += -way*0.01;
                }
            }
        }
    }

    play (string) {
        let timing = Tone.now();
        if (this.model.holds[string] !== -1)
        {
            let oct = allnotes.indexOf(this.strings[string].name)+this.model.holds[string];
            this.strings[string].synth.triggerRelease(this.model.holds[string], 0);
            this.strings[string].synth.triggerAttack(allnotes[oct], timing);
        }
    }
    fingerprintsrender () {

        let tl = document.getElementById('touch-layer');
        tl.innerHTML = '';
        if (!this.groundrender.strings || !this.groundrender.strings[0]) return;

        for (var j = 0; j < this.strings.length; j++) {

            let hf = this.model.holds[j];
            let shf = hf;
            if ( shf === -1 ) shf = 0;
            let da = this.groundrender.getScreenCoordinates(
                this.groundrender.strings[0].fingerprintz[shf] );
            let db = this.groundrender.getScreenCoordinates(
                this.groundrender.strings[5].fingerprintz[shf] );
            let dz = (db.x-da.x)/4.5;

            let c = this.groundrender.getScreenCoordinates( this.groundrender.strings[j].fingerprintz[shf] );
            let nit = document.createElement('i');
            let nitbkgd = document.createElement('i');

            nit.classList.add('fitv');
            nitbkgd.classList.add('fitvbkgd');
            if ( this.strings[j].interval != undefined )
            {
                nit.classList.add('icon-nit-'+this.strings[j].interval);

            }
            else
            {

                if ( hf === -1 )
                   {
                    nit.classList.add('icon-cancel-1');
                                nitbkgd.classList.add('red');

                //    nit.classList.add('red');
                   }

                else
                    nit.classList.add('icon-it-5');
            }

            nitbkgd.classList.add('icon-it-5');

            nit.style.top = ''+c.y+'px';
            nit.style.left = ''+c.x+'px';
            nit.style.fontSize = (dz+1)+'px';

            nitbkgd.style.top = ''+c.y+'px';
            nitbkgd.style.left = ''+c.x+'px';
            nitbkgd.style.fontSize = (dz*0.8)+'px';
            nitbkgd.style.padding = (dz*0)+'px';
            nitbkgd.style.paddingBottom = (dz*0.1)+'px';
            nitbkgd.style.paddingTop = (dz*0.15)+'px';

            tl.appendChild(nitbkgd);
            tl.appendChild(nit);
        }
    }
}
class ChordPinBoard {

    constructor (onApplyChord = () => {}, onStateChange = () => {}) {
        this.onApplyChord = onApplyChord;
        this.onStateChange = onStateChange;
        this.domctnr = document.createElement('div');
        this.domctnr.classList.add('chord-sets-container');
        this.sets = [{ id: 's0', name: 'Set 1', chords: [] }];
        this.activeSetId = 's0';
    }

    _uid () { return 's' + Date.now().toString(36); }
    _revive (c) { return c instanceof Chord ? c : new Chord(c.frets, c.name, c.root, c.type, c.desc, c.bass, c.notes, c.intervals); }
    _activeSet () { return this.sets.find(s => s.id === this.activeSetId) ?? this.sets[0] ?? null; }

    mount (domdest) { domdest.appendChild(this.domctnr); }

    // ── persistance ──
    get data () { return { sets: this.sets, activeSetId: this.activeSetId }; }
    set data (d) {
        this.sets = (d.sets || []).map(s => ({ ...s, chords: (s.chords || []).map(c => this._revive(c)) }));
        this.activeSetId = d.activeSetId ?? (this.sets[0]?.id ?? 's0');
        this.update();
    }

    // ── compat migration ancien format (tableau plat) ──
    set chords (list) {
        this.sets[0].chords = list.map(c => this._revive(c));
        this.update();
    }

    // ── gestion des sets ──
    addSet () {
        const id = this._uid();
        this.sets.push({ id, name: 'Set ' + (this.sets.length + 1), chords: [] });
        this.activeSetId = id;
        this.update();
    }
    removeSet (id) {
        this.sets = this.sets.filter(s => s.id !== id);
        if (this.sets.length === 0) { this.sets = [{ id: 's0', name: 'Set 1', chords: [] }]; }
        if (this.activeSetId === id) this.activeSetId = this.sets[0].id;
        this.update();
    }

    // ── gestion des accords ──
    pinchord (chord) {
        const s = this._activeSet(); if (!s) return;
        const idx = s.chords.findIndex(c => c.sameAs(chord));
        if (idx !== -1) s.chords.splice(idx, 1); else s.chords.push(chord);
        this.update();
    }
    has (chord) {
        const s = this._activeSet();
        return s ? s.chords.some(c => c.sameAs(chord)) : false;
    }
    pushchord (chord) { this.onApplyChord(chord); }

    // ── rendu ──
    update () {
        this.domctnr.innerHTML = '';
        this.sets.forEach(set => {
            const wrap = document.createElement('div');
            wrap.classList.add('chord-set-item');
            if (set.id === this.activeSetId) wrap.classList.add('active');

            // en-tête : nom éditable + bouton suppression
            const header = document.createElement('div');
            header.classList.add('chord-set-header');
            header.addEventListener('click', () => { this.activeSetId = set.id; this.update(); });

            const nameEl = document.createElement('span');
            nameEl.classList.add('chord-set-name');
            nameEl.textContent = set.name;
            nameEl.contentEditable = 'true';
            nameEl.addEventListener('click', e => e.stopPropagation());
            nameEl.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); } });
            nameEl.addEventListener('blur', () => {
                set.name = nameEl.textContent.trim() || set.name;
                this.onStateChange();
            });

            const delBtn = document.createElement('span');
            delBtn.classList.add('chord-set-del');
            delBtn.textContent = '×';
            delBtn.addEventListener('click', e => { e.stopPropagation(); this.removeSet(set.id); });

            header.append(nameEl, delBtn);

            // grille d'accords
            const grid = document.createElement('div');
            grid.classList.add('chord-set-grid');
            set.chords.forEach(chord => {
                const card = document.createElement('div');
                card.classList.add('voicing-card');
                card.innerHTML =
                    '<div class="vc-frets">' + chord.frets.join(' ') + '</div>' +
                    '<div class="vc-span">' + chord.name + '</div>';
                card.addEventListener('click', () => this.pushchord(chord), true);
                const del = document.createElement('span');
                del.classList.add('vc-del');
                del.textContent = '×';
                del.addEventListener('click', e => {
                    e.stopPropagation();
                    set.chords = set.chords.filter(c => !c.sameAs(chord));
                    this.update();
                }, true);
                card.appendChild(del);
                grid.appendChild(card);
            });

            wrap.append(header, grid);
            this.domctnr.appendChild(wrap);
        });

        // bouton nouveau set
        const addBtn = document.createElement('button');
        addBtn.classList.add('chord-set-add');
        addBtn.textContent = '+ nouveau set';
        addBtn.addEventListener('click', () => this.addSet());
        this.domctnr.appendChild(addBtn);

        this.onStateChange();
    }
}
class PluckPad {
    constructor (strings, domdest) {
        this.domctnr = document.createElement('div');
        this.domctnr.id = 'PluckPad';
        domdest.appendChild(this.domctnr);
        this.strings = strings;

        // ── interactions tactiles ──
        let activeEl = null;

        const padAt = (x, y) => {
            const el = document.elementFromPoint(x, y);
            return el?.closest('.p-pad') ?? null;
        };
        const pluckEl = (el) => {
            const idx = parseInt(el.dataset.stringIndex);
            if (!isNaN(idx)) this.pluck(this.strings[idx]);
        };

        this.domctnr.addEventListener('touchstart', (ev) => {
            ev.preventDefault();
            activeEl = padAt(ev.touches[0].clientX, ev.touches[0].clientY);
        }, { passive: false });

        this.domctnr.addEventListener('touchmove', (ev) => {
            ev.preventDefault();
            const t = ev.touches[0];
            const under = padAt(t.clientX, t.clientY);
            if (under && under !== activeEl) {
                if (activeEl) pluckEl(activeEl);
                activeEl = under;
            }
        }, { passive: false });

        this.domctnr.addEventListener('touchend', () => {
            if (activeEl) pluckEl(activeEl);
            activeEl = null;
        });

        this.update();
    }

    pluck (string) {
        const state = string.getstate();
        if (state.octavednote === 'x') return;
        string.synth.triggerAttack(state.octavednote, Tone.now());
    }

    update () {
        this.domctnr.innerHTML = '';
        for (let i = 0; i < this.strings.length; i++) {
            const ctnr = document.createElement('div');
            ctnr.classList.add('p-pad');
            ctnr.dataset.stringIndex = i;

            const state = this.strings[i].getstate();
            if (state.octavednote !== 'x') {
                const noteEl = document.createElement('span');
                noteEl.classList.add('p-pad-note');
                noteEl.textContent = state.octavednote;
                ctnr.appendChild(noteEl);
            }

            this.domctnr.appendChild(ctnr);
        }
    }
}
class ChordWizard {

    constructor (onApplyChord = () => {}, onStateChange = () => {}) {
        this._result = null;
        this._stringIntervals = {};

        this.chordpinboard = new ChordPinBoard(
            onApplyChord,
            onStateChange
        );
    }

    guess (notes, frets) {
        this._stringIntervals = {};
        this._result = null;

        if (!notes || notes.length === 0) return;

        let basenotes = [];
        for (let i = 0; i < notes.length; i++) {
            if (basenotes.indexOf(notes[i].basenote) === -1)
                basenotes.push(notes[i].basenote);
        }

        let founded = [];

        for (let i = 0; i < basenotes.length; i++) {
            let highscore = { chordtypeindex: -1, score: -1000 };
            let its = [];
            let root = basenotes[i];

            for (let j = 0; j < basenotes.length; j++) {
                its.push(this.getinterval(root, basenotes[j]));
            }

            for (let k = 0; k < chordtypes.length; k++) {
                let tableau1 = chordtypes[k].intervals;
                let required = chordtypes[k].musthave;

                let intersection = tableau1.filter(val => its.includes(val));
                let missing = tableau1.filter(val => !its.includes(val));
                let mismatch = its.filter(val => !tableau1.includes(val));

                let score = intersection.length;
                if (missing.length > 0) score *= 0.8;
                if (missing.length > 1) score *= 0.8;
                if (missing.length > 2) score *= 0.8;
                if (mismatch.length > 0) score = 0;
                let fail = required.filter(val => missing.includes(val));
                if (fail.length > 0) score *= 0.0;
                if (its[0] === 'root') score *= 1.1;

                let bass = '';
                if (its.indexOf('root') !== 0) bass = '/' + basenotes[0];

                if (score > highscore.score && mismatch.length === 0) {
                    highscore.score = score;
                    highscore.chordtype = root + chordtypes[k].sym + bass;
                    highscore.type = chordtypes[k].sym;
                    highscore.desc = chordtypes[k].desc;
                    highscore.chordtypeindex = k;
                    highscore.root = root;
                    highscore.missing = missing;
                    highscore.matching = intersection;
                    highscore.bass = bass;
                }
            }

            if (highscore.score > 0) {
                let rawnotes = notes.map(n => n.octavednote);
                let rawintervals = notes.map(n => this.getinterval(highscore.root, n.basenote));
                highscore.chord = new Chord(
                    frets,
                    highscore.chordtype,
                    highscore.root,
                    highscore.type,
                    highscore.desc,
                    highscore.bass,
                    rawnotes,
                    rawintervals
                );
                founded.push(highscore);
            }
        }

        founded.sort((a, b) => b.score - a.score);
        this._result = { founded, notes, frets };

        // compute per-string interval map
        if (founded.length > 0) {
            const best = founded[0];
            for (let j = 0; j < notes.length; j++) {
                const interval = this.getinterval(best.root, notes[j].basenote).replace('#', 'm');
                this._stringIntervals[notes[j].stringnumber] = interval;
            }
        }
    }

    print (domdest) {
        domdest.innerHTML = '';
        if (!this._result || this._result.founded.length === 0) return;

        const { founded, notes, frets } = this._result;
        let someguessing = document.createElement('div');

        for (let i = 0; i < founded.length; i++) {
            if (i === 1) break;

            let aguess = document.createElement('div');
            aguess.classList.add('chord-guess');

            let aguesstitle = document.createElement('div');
            aguesstitle.classList.add('chord-guess-title');
            aguesstitle.innerHTML = '<strong>' + founded[i].chordtype + ' </strong><span class="score">' + founded[i].score.toFixed(1) + '</span>';

            let aguessdesc = document.createElement('div');
            aguessdesc.classList.add('chord-guess-desc');

            let sheme = '';
            for (let j = 0; j < notes.length; j++) {
                if (notes[j].basenote !== undefined) {
                    const itv = this.getinterval(founded[i].root, notes[j].basenote).replace('#', 'm');
                    sheme += '<span class="itv itv-' + itv + '">' + notes[j].basenote + '</span>';
                }
            }

            aguessdesc.innerHTML = frets.join(' ') + '<br>' + sheme;

            if (i === 0) {
                let pinbtn = document.createElement('span');
                pinbtn.classList.add('pin-btn');
                pinbtn.innerHTML = '<i class="icon-attach-2"></i>';
                if (this.chordpinboard.has(founded[0].chord)) {
                    pinbtn.classList.add('blast');
                }
                pinbtn.addEventListener('click', () => {
                    this.chordpinboard.pinchord(founded[0].chord);
                }, true);
                aguesstitle.prepend(pinbtn);
            }

            aguess.appendChild(aguesstitle);
            aguess.appendChild(aguessdesc);
            someguessing.appendChild(aguess);
        }

        domdest.appendChild(someguessing);
    }

    mountPinBoard (domdest) {
        this.chordpinboard.mount(domdest);
    }

    getStringIntervals () {
        return this._stringIntervals;
    }

    getinterval (r, n) {
        let rpos = notes.indexOf(r);
        let npos = notes.indexOf(n);
        let it = npos - rpos;
        if (it < 0) it += 12;
        return intervals[it];
    }

    // ── Catalogue ────────────────────────────────────────────────

    setInstrument (def) {
        // def = { tuning: ['E2','A2',...], frets: 18 }
        this._instrument = def;
    }

    buildVoicings (root, chordTypeIndex, filters = {}) {
        if (!this._instrument) return [];
        const { tuning, frets: nfrets } = this._instrument;
        const maxSpan        = filters.maxSpan        ?? 4;
        const minNotes       = filters.minNotes       ?? 3;
        const maxNotes       = filters.maxNotes       ?? tuning.length;
        const musthave       = filters.musthave       ?? [];
        const allowInversion   = filters.allowInversion   ?? true;
        const requireOpen      = filters.requireOpen      ?? false;
        const maxFret          = filters.maxFret          ?? nfrets;
        const noInteriorMutes  = filters.noInteriorMutes  ?? false;
        const minFret          = filters.minFret          ?? 0;

        const chordDef = chordtypes[chordTypeIndex];
        if (!chordDef) return [];

        // notes de l'accord pour cette tonique
        const rootIdx    = notes.indexOf(root);
        const chordNotes = chordDef.intervals.map(iv => {
            const semi = new Interval(iv).semitones;
            return notes[(rootIdx + semi) % 12];
        });
        // intervalles requis → notes concrètes
        const musthaveNotes = musthave.map(iv => {
            const semi = new Interval(iv).semitones;
            return notes[(rootIdx + semi) % 12];
        });

        // candidats par corde : frettes jouables + 'x'
        const candidates = tuning.map(openNote => {
            const openIdx = allnotes.indexOf(openNote);
            const list = ['x'];
            for (let f = 0; f <= Math.min(nfrets, maxFret); f++) {
                if (f > 0 && f < minFret) continue;
                const idx = openIdx + f;
                if (idx >= allnotes.length) break;
                const n = allnotes[idx].replace(/\d/g, '');
                if (chordNotes.includes(n)) list.push(f);
            }
            return list;
        });

        const voicings = [];

        const combine = (si, current, activeFrets, noteSet) => {
            if (si === tuning.length) {
                if (noteSet.size < minNotes || noteSet.size > maxNotes) return;
                if (musthaveNotes.some(n => !noteSet.has(n))) return;
                const span = activeFrets.length > 1
                    ? Math.max(...activeFrets) - Math.min(...activeFrets)
                    : 0;
                if (span > maxSpan) return;
                // intervalles du voicing
                const voicingIntervals = current.map((f, i) => {
                    if (f === 'x') return 'x';
                    const openIdx = allnotes.indexOf(tuning[i]);
                    const n = allnotes[openIdx + f].replace(/\d/g, '');
                    return this.getinterval(root, n);
                });
                // filtre renversements : la première corde jouée doit être la fondamentale
                if (!allowInversion) {
                    const bassIdx = current.findIndex(f => f !== 'x');
                    if (bassIdx !== -1) {
                        const openIdx = allnotes.indexOf(tuning[bassIdx]);
                        const bassNote = allnotes[openIdx + current[bassIdx]].replace(/\d/g, '');
                        if (bassNote !== root) return;
                    }
                }
                if (requireOpen && !current.some(f => f === 0)) return;
                if (noInteriorMutes) {
                    const first = current.findIndex(f => f !== 'x');
                    const last  = current.length - 1 - [...current].reverse().findIndex(f => f !== 'x');
                    if (first !== -1 && current.slice(first, last + 1).some(f => f === 'x')) return;
                }
                voicings.push({ frets: [...current], notes: [...noteSet], intervals: voicingIntervals, span });
                return;
            }

            for (const fret of candidates[si]) {
                const newActiveFrets = [...activeFrets];
                const newNoteSet = new Set(noteSet);

                if (fret !== 'x') {
                    if (fret > 0) newActiveFrets.push(fret);
                    const openIdx = allnotes.indexOf(tuning[si]);
                    const n = allnotes[openIdx + fret].replace(/\d/g, '');
                    newNoteSet.add(n);
                    // élagage span anticipé
                    if (newActiveFrets.length > 1) {
                        const span = Math.max(...newActiveFrets) - Math.min(...newActiveFrets);
                        if (span > maxSpan) continue;
                    }
                }

                // élagage notes insuffisantes
                const remaining = tuning.length - si - 1;
                if (newNoteSet.size + remaining < minNotes) continue;

                combine(si + 1, [...current, fret], newActiveFrets, newNoteSet);
            }
        };

        combine(0, [], [], new Set());

        // dédoublonnage par empreinte
        const seen = new Set();
        const unique = voicings.filter(v => {
            const key = v.frets.join(',');
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        unique.sort((a, b) => {
            if (a.span !== b.span) return a.span - b.span;
            return a.frets.filter(f => f === 'x').length - b.frets.filter(f => f === 'x').length;
        });

        return unique;
    }

    // Reconstruction non-mutante : retourne {root, chordtypeindex} du meilleur score pour un voicing
    _guessFromVoicing (voicing) {
        if (!this._instrument) return null;
        const { tuning } = this._instrument;

        const heldNotes = [];
        voicing.frets.forEach((fret, i) => {
            if (fret === 'x') return;
            const openIdx = allnotes.indexOf(tuning[i]);
            const octavednote = allnotes[openIdx + fret];
            if (!octavednote) return;
            heldNotes.push({ basenote: octavednote.replace(/\d/g, ''), octavednote });
        });
        if (heldNotes.length === 0) return null;

        const basenotes = [...new Set(heldNotes.map(n => n.basenote))];
        let best = null;

        for (const root of basenotes) {
            const its = basenotes.map(n => this.getinterval(root, n));
            for (let k = 0; k < chordtypes.length; k++) {
                const tableau1  = chordtypes[k].intervals;
                const required  = chordtypes[k].musthave;
                const missing   = tableau1.filter(v => !its.includes(v));
                const mismatch  = its.filter(v => !tableau1.includes(v));
                if (mismatch.length > 0) continue;
                const fail = required.filter(v => missing.includes(v));
                if (fail.length > 0) continue;

                let score = tableau1.filter(v => its.includes(v)).length;
                if (missing.length > 0) score *= 0.8;
                if (missing.length > 1) score *= 0.8;
                if (its[0] === 'root') score *= 1.1;

                if (!best || score > best.score)
                    best = { score, root, chordtypeindex: k };
            }
        }
        return best;
    }

    printCatalog (domdest, onApplyVoicing = () => {}, storage = null) {
        if (!this._instrument) return;
        domdest.innerHTML = '';

        // ── état des filtres ──
        const nfrets = this._instrument.frets;
        const saved = storage ? storage.get('catalog-filters', {}) : {};
        let state = {
            root:           saved.root           ?? notes[0],
            chordTypeIndex: saved.chordTypeIndex  ?? 2,   // majeur par défaut
            maxSpan:        saved.maxSpan         ?? 4,
            minNotes:       saved.minNotes        ?? 3,
            maxNotes:       saved.maxNotes        ?? this._instrument.tuning.length,
            allowInversion: saved.allowInversion  ?? true,
            minFret:        saved.minFret         ?? 0,
            maxFret:        saved.maxFret         ?? nfrets
        };
        const saveState = () => { if (storage) storage.set('catalog-filters', state); };

        const makeCard = (v, chordName) => {
            const card = document.createElement('div');
            card.classList.add('voicing-card');
            card.innerHTML =
                '<div class="vc-frets">' + v.frets.join(' ') + '</div>' +
                '<div class="vc-span">span ' + v.span + '</div>';
            card.addEventListener('click', () => onApplyVoicing(v, chordName));
            return card;
        };

        const render = () => {
            const chordName = state.root + chordtypes[state.chordTypeIndex].sym;

            // grille principale
            grid.innerHTML = '';
            const voicings = this.buildVoicings(state.root, state.chordTypeIndex, {
                maxSpan:        state.maxSpan,
                minNotes:       state.minNotes,
                maxNotes:       state.maxNotes,
                allowInversion: state.allowInversion,
                minFret:        state.minFret,
                maxFret:        state.maxFret
            });
            const minPressed = v => {
                const pressed = v.frets.filter(f => f !== 'x' && f > 0);
                return pressed.length ? Math.min(...pressed) : 0;
            };
            const validated = voicings
                .filter(v => {
                    const match = this._guessFromVoicing(v);
                    return match && match.root === state.root && match.chordtypeindex === state.chordTypeIndex;
                })
                .sort((a, b) => minPressed(a) - minPressed(b));
            header.textContent = chordName + ' — ' + validated.length + ' voicing' + (validated.length > 1 ? 's' : '');

            // groupement par position (minPressed)
            const groups = new Map();
            validated.forEach(v => {
                const pos = minPressed(v);
                if (!groups.has(pos)) groups.set(pos, []);
                groups.get(pos).push(v);
            });
            groups.forEach((vs, pos) => {
                const sub = document.createElement('div');
                sub.classList.add('catalog-sub-title');
                sub.textContent = pos === 0 ? 'Position ouverte' : 'Position ' + pos;
                grid.appendChild(sub);
                const row = document.createElement('div');
                row.classList.add('catalog-grid');
                vs.forEach(v => row.appendChild(makeCard(v, chordName)));
                grid.appendChild(row);
            });

            // section accords ouverts (même tonique + type, contraintes verrouillées)
            openGrid.innerHTML = '';
            const openVoicings = this.buildVoicings(state.root, state.chordTypeIndex, {
                requireOpen: true, maxFret: 4, maxSpan: 4, minNotes: 3,
                allowInversion: false, noInteriorMutes: true
            }).filter(v => {
                const match = this._guessFromVoicing(v);
                return match && match.root === state.root && match.chordtypeindex === state.chordTypeIndex;
            });
            openSection.style.display = openVoicings.length ? '' : 'none';
            openVoicings.forEach(v => openGrid.appendChild(makeCard(v, chordName)));
        };

        // ── header ──
        const header = document.createElement('div');
        header.classList.add('catalog-header');
        domdest.appendChild(header);

        // ── filtres ──
        const filters = document.createElement('div');
        filters.classList.add('catalog-filters');

        // sélecteur tonique
        const rootSel = document.createElement('select');
        notes.forEach(n => {
            const o = document.createElement('option');
            o.value = n; o.textContent = n;
            if (n === state.root) o.selected = true;
            rootSel.appendChild(o);
        });
        rootSel.addEventListener('change', () => { state.root = rootSel.value; saveState(); render(); });

        // sélecteur type d'accord
        const typeSel = document.createElement('select');
        chordtypes.forEach((ct, idx) => {
            const o = document.createElement('option');
            o.value = idx;
            o.textContent = ct.sym || ct.intervals.join(' ');
            if (idx === state.chordTypeIndex) o.selected = true;
            typeSel.appendChild(o);
        });
        typeSel.addEventListener('change', () => { state.chordTypeIndex = parseInt(typeSel.value); saveState(); render(); });

        // span max
        const spanLabel = document.createElement('label');
        spanLabel.textContent = 'span ';
        const spanSel = document.createElement('select');
        [2,3,4,5,6].forEach(v => {
            const o = document.createElement('option');
            o.value = v; o.textContent = v;
            if (v === state.maxSpan) o.selected = true;
            spanSel.appendChild(o);
        });
        spanSel.addEventListener('change', () => { state.maxSpan = parseInt(spanSel.value); saveState(); render(); });
        spanLabel.appendChild(spanSel);

        // nombre de notes
        const notesLabel = document.createElement('label');
        notesLabel.textContent = 'notes ';
        const notesSel = document.createElement('select');
        [['triade',3,3],['4 notes',4,4],['5 notes',5,5],['toutes',3,6]].forEach(([label, min, max]) => {
            const o = document.createElement('option');
            o.value = min + ',' + max; o.textContent = label;
            if (min === state.minNotes && max === state.maxNotes) o.selected = true;
            notesSel.appendChild(o);
        });
        notesSel.addEventListener('change', () => {
            [state.minNotes, state.maxNotes] = notesSel.value.split(',').map(Number);
            saveState(); render();
        });
        notesLabel.appendChild(notesSel);

        // renversements
        const invLabel = document.createElement('label');
        invLabel.classList.add('catalog-toggle');
        const invCheck = document.createElement('input');
        invCheck.type = 'checkbox';
        invCheck.checked = state.allowInversion;
        invCheck.addEventListener('change', () => { state.allowInversion = invCheck.checked; saveState(); render(); });
        invLabel.appendChild(invCheck);
        invLabel.append(' renversements');

        // frette min
        const minFretLabel = document.createElement('label');
        minFretLabel.textContent = 'frette min ';
        const minFretSel = document.createElement('select');
        for (let f = 0; f <= nfrets; f++) {
            const o = document.createElement('option');
            o.value = f; o.textContent = f === 0 ? '—' : f;
            if (f === state.minFret) o.selected = true;
            minFretSel.appendChild(o);
        }
        minFretSel.addEventListener('change', () => {
            state.minFret = parseInt(minFretSel.value);
            if (state.minFret > state.maxFret) { state.maxFret = state.minFret; maxFretSel.value = state.maxFret; }
            saveState(); render();
        });
        minFretLabel.appendChild(minFretSel);

        // frette max
        const maxFretLabel = document.createElement('label');
        maxFretLabel.textContent = 'frette max ';
        const maxFretSel = document.createElement('select');
        for (let f = 0; f <= nfrets; f++) {
            const o = document.createElement('option');
            o.value = f; o.textContent = f === 0 ? '—' : f;
            if (f === state.maxFret) o.selected = true;
            maxFretSel.appendChild(o);
        }
        maxFretSel.addEventListener('change', () => {
            state.maxFret = parseInt(maxFretSel.value);
            if (state.maxFret < state.minFret) { state.minFret = state.maxFret; minFretSel.value = state.minFret; }
            saveState(); render();
        });
        maxFretLabel.appendChild(maxFretSel);

        filters.append(rootSel, typeSel, spanLabel, notesLabel, invLabel, minFretLabel, maxFretLabel);
        domdest.appendChild(filters);

        // ── grille explorateur ──
        const grid = document.createElement('div');
        grid.classList.add('catalog-positions');
        domdest.appendChild(grid);

        // ── section accords ouverts (même sélection, contraintes verrouillées) ──
        const openSection = document.createElement('div');
        const openTitle = document.createElement('div');
        openTitle.classList.add('catalog-section-title');
        openTitle.textContent = 'Accords ouverts';
        const openGrid = document.createElement('div');
        openGrid.classList.add('catalog-grid');
        openSection.append(openTitle, openGrid);
        domdest.appendChild(openSection);

        render();
    }
}
class Cameraman {
    constructor (onNeedRender = () => {}, domElement = document.body) {

        this.onNeedRender = onNeedRender;
        this.viewRatio = 1.0;
        this.normalisedmouse = {x: 0, y: 0};

        this.camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 0.1, 15 );
        this.camera.position.set( 0.13203648995258088, -0.05773723849390569, 1.104895121140156 );

        this.controls = new OrbitControls( this.camera, domElement );
        this.controls.maxDistance = 2;
        this.controls.minDistance = 0.3;
        this.controls.maxPolarAngle = Math.PI/1.2;
        this.controls.minPolarAngle = Math.PI/5;
        this.controls.minAzimuthAngle = 0;
        this.controls.maxAzimuthAngle = 0;
        this.controls.target = new THREE.Vector3( 0.13203648995258088, 0.1, -0.01832311632648151 );

        domElement.addEventListener( 'mousemove', (e) => {
            this.normalisedmouse = {
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: 1 - (e.clientY / window.innerHeight) * 2
            };
            this.onNeedRender();
        }, false );
        const updateFromTouch = (e) => {
            const touch = e.touches[0] || e.changedTouches[0];
            if (!touch) return;
            this.normalisedmouse = {
                x: (touch.clientX / window.innerWidth) * 2 - 1,
                y: 1 - (touch.clientY / window.innerHeight) * 2
            };
            this.onNeedRender();
        };
        domElement.addEventListener( 'touchstart', updateFromTouch, { passive: true });
        domElement.addEventListener( 'touchmove',  updateFromTouch, { passive: true });
        domElement.addEventListener( 'wheel',      () => this.onNeedRender(), false );
    }
    update () {
        this.controls.update();
    }
    getView () {
        const p = this.camera.position;
        const t = this.controls.target;
        return { pos: { x: p.x, y: p.y, z: p.z }, target: { x: t.x, y: t.y, z: t.z } };
    }
    setView (v) {
        this.camera.position.set(v.pos.x, v.pos.y, v.pos.z);
        this.controls.target.set(v.target.x, v.target.y, v.target.z);
        this.controls.update();
    }
    onViewChange (cb) {
        this.controls.addEventListener('change', cb);
    }
    resize (width, height) {
        this.camera.aspect = width / height / this.viewRatio;
        this.camera.updateProjectionMatrix();
    }
    getScreenCoordinates (obj) {
        var vector = new THREE.Vector3();
        obj.updateMatrixWorld();
        vector.setFromMatrixPosition(obj.matrixWorld);
        vector.project(this.camera);
        vector.x = (vector.x + 1) / 2 * window.innerWidth;
        vector.y = -(vector.y - 1) / 2 * window.innerHeight;
        return vector;
    }
}

class GroundRender {
    constructor (domdest, onFretClick = () => {}, onAfterRender = () => {}, onReady = () => {}) {

        this.onFretClick = onFretClick;
        this.onAfterRender = onAfterRender;
        this.onReady = onReady;
        if ( ! navigator.gpu && ! window.WebGLRenderingContext ) { alert('WebGL non supporté par ce navigateur.'); return; }
        this.statebar = document.getElementById('app-stamp');
        this.domdest = domdest;
        this.pos = { x: 0.0, y: 0, z: 0.0};
        this.scl = 1;
        this.scale = { x: this.scl, y: this.scl, z: this.scl };
        this.strings = [];

        this.manager = new THREE.LoadingManager();
        this.manager.onProgress = function ( item, loaded, total ) {
            //-console.log( item, loaded, total );
        };

        this.init();
       // this.loadWavefrontGuitar ('gao-beta-6.obj', 'gao-beta-7.mtl', '');
        this.render();
        //this.raycaster = new THREE.Raycaster();
    }
    raycast (mouse = {x:1, y:1}) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(this.cameraman.normalisedmouse, this.cameraman.camera);
        let intersects = [];
        this.scene.traverse((child) => {
                intersects.push(...raycaster.intersectObject(child));
        });

        const hit = intersects.find(i => i.object.name === 'guitar.fingerboard' || i.object.name === 'guitar.misc');
        if (!hit) return;
        if (true)  {

            let nearest = 100;
            let neareststring;
            for (var i = 0; i < this.strings.length; i++) {
                let tmp = this.strings[i].top;

                let d = new THREE.Vector3(tmp.x, tmp.y, tmp.z).distanceTo(hit.point );
                if (d<nearest) {
                    nearest = d;
                    neareststring = i;
                                }
            }
            let hitedfret = -1;
            for (var i = 0; i < this.strings[neareststring].frets.length; i++) {
                if (this.strings[neareststring].frets[i] < nearest) {
                    hitedfret = i;
                    break;
                }
            }
            this.strings[neareststring].meshprint.position.set (this.strings[neareststring].fingerprints[hitedfret].x, this.strings[neareststring].fingerprints[hitedfret].y, this.strings[neareststring].fingerprints[hitedfret].z);
            this.onFretClick(neareststring, hitedfret);
            //-console.log(this.getScreenCoordinates(this.strings[neareststring].meshprint));

        }
        this.render()
    }
    init () {

        this.cameraman = new Cameraman( () => this.render(), document.getElementById('touch-layer') || document.body );

        this.scene = new THREE.Scene();              //#fffdf0
        this.scene.background = new THREE.Color( 0xeeeeee );
        this.scene.fog = new THREE.Fog( 0xeeeeee, 2, 35 );


                  let plane = new THREE.Mesh(
            new THREE.PlaneGeometry( 40, 40 ),
            new THREE.MeshPhongMaterial( { color: 0x111111, specular: 0x000000 } )
            );
        plane.rotation.x = -Math.PI/2;
        plane.position.x = -8.72*this.scale.x;
        plane.position.z = -2.16*this.scale.y;
        plane.position.y = 192.13;//*this.scale.z;
   //       object.add( plane );

 // Lights

        this.scene.add( new THREE.HemisphereLight( 0x888888, 0x555566 ) );

        this.addShadowedLight( 1, 1, 1, 0xffffff, 0.99 );
        this.addShadowedLight( 0.5, 1, -1, 0xffffff, 0.99 );
        // renderer

        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setClearColor( 0xffffff, 1.0);

        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.shadowMap.enabled = true;
        this.onWindowResize();
        this.renderer.domElement.id = 'ground-render';
        this.domdest.appendChild(this.renderer.domElement)
   //     document.body.insertBefore(this.renderer.domElement, document.body.firstChild);
        //container.appendChild( renderer.domElement );
        window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
    }
    loadWavefrontGuitar (objfilename, mtlfilename, path = '') {

        new MTLLoader().setPath( path ).load( mtlfilename,
        function ( materials ) {

            materials.preload();
            new OBJLoader(this.manager).setMaterials( materials ).setPath( path ).load( objfilename,
            function ( object ) {

                object.position.set( this.pos.x, this.pos.y, this.pos.z );
                //mesh.rotation.set( 0, - Math.PI / 2, 0 );
                object.scale.set( this.scale.x, this.scale.y, this.scale.z );
                object.castShadow = true;
                object.receiveShadow = true;
                object.traverse( function ( child )
                {
                    if ( child instanceof THREE.Mesh )
                    {
                        child.material.side = THREE.DoubleSide;
                        //child.material.map = texture;
                        child.castShadow = true;
                        child.receiveShadow = true;
                        if (child.name == "frame" || child.name == "vitrages")
                        {
                            child.material.side = THREE.DoubleSide;
                        }
                    }
                } );
                object.traverse( function( node ) {
                    if( node.material ) {
                        node.material.side = THREE.DoubleSide;
                        if( node.material.length > 0 ) {
                            for ( var i = 0 ; i < node.material.length ; i++ )
                            {
                                node.material[i].side = THREE.DoubleSide;

                                node.material[i].castShadow = true;
                                node.material[i].receiveShadow = true;
                            }
                            //-console.log  ("multi");
                        }
                    }
                });
                object.name = "paperace";


                let wideness = 1.1;


                this.addLineToObj('E2', object, {x: -0.021849, y: 0.326, z: 0.000887}, {x: -0.021849*wideness, y: -0.326, z: 0.005246}, 0xdddddd, 1.5);
                this.addLineToObj('A2', object, {x: -0.013318, y: 0.326, z: 0.000887}, {x: -0.013318*wideness, y: -0.326, z: 0.005246}, 0xdddddd, 1.4);
                this.addLineToObj('D3', object, {x: -0.004787, y: 0.326, z: 0.000887}, {x: -0.004787*wideness, y: -0.326, z: 0.005246}, 0xdddddd, 1.3);
                this.addLineToObj('G3', object, {x: 0.003744, y: 0.326, z: 0.000887}, {x: 0.003744*wideness, y: -0.326, z: 0.005246}, 0xbbbbbb, 1);
                this.addLineToObj('B3', object, {x: 0.012276, y: 0.326, z: 0.000887}, {x: 0.012276*wideness, y: -0.326, z: 0.005246}, 0xbbbbbb, 0.9);
                this.addLineToObj('E4', object, {x: 0.020806, y: 0.326, z: 0.000887}, {x: 0.020806*wideness, y: -0.326, z: 0.005246}, 0xbbbbbb, 0.8);

                this.scene.add( object );
                this.render();
                this.onReady();

            }.bind(this), this.onProgress, this.onError);

        }.bind(this) );
    }
    onProgress ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '%' );
            var elem = document.getElementById('app-stamp');
            if (percentComplete < 100) {
                elem.textContent = Math.round(percentComplete) + ' %';
            } else {
                elem.innerHTML = '<i class="icon-sliders"></i> Guitar Lab';
            }
        }
    }
    onError ( xhr ) {
    }
    onWindowResize() {
        this.cameraman.resize( window.innerWidth, window.innerHeight );
        this.renderer.setSize( window.innerWidth, window.innerHeight * this.cameraman.viewRatio );
        this.render();
    }
    render() {
        this.cameraman.update();
        this.renderer.render( this.scene, this.cameraman.camera );
        this.onAfterRender();
    }
    progresshelper (e) {
        var percentage = Math.round((e.loaded / e.total * 100));
        console.log(percentage + '%')
    }
    addShadowedLight( x, y, z, color, intensity ) {

        var directionalLight = new THREE.DirectionalLight( color, intensity );
        directionalLight.position.set( x, y, z );
        this.scene.add( directionalLight );

        directionalLight.castShadow = true;

        var d = 1;
        directionalLight.shadow.camera.left = -d;
        directionalLight.shadow.camera.right = d;
        directionalLight.shadow.camera.top = d;
        directionalLight.shadow.camera.bottom = -d;

        directionalLight.shadow.camera.near = 1;
        directionalLight.shadow.camera.far = 4;

        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;

        directionalLight.shadow.bias = -0.002;
    }
    genStringDef (pitch, neck, top, nfret = 18, thickness = 1, color = 0xff0000) {
        let fretpitchs = [];
        let frets = [];
        let diapasonleft = new THREE.Vector3(neck.x, neck.y, neck.z).distanceTo( new THREE.Vector3(top.x, top.y, top.z));
        //-console.log ('diapason: '+diapasonleft)
        for (var i = 0; i < nfret+1; i++) {
          ///  fretpitchs.push
            frets.push(diapasonleft);
            //-console.log ('remaning diapason fret ['+i+'] : '+diapasonleft);
            diapasonleft -= diapasonleft / 17.817;

        }
        let fingerprints = [];
        let fingerprintz = [];
        let norme = new THREE.Vector3(neck.x-top.x, neck.y-top.y, neck.z-top.z).normalize();
        //let diapasonleft = new THREE.Vector3(neck.x, neck.y, neck.z).distanceTo( new THREE.Vector3(top.x, top.y, top.z));
     //   //-console.log ('diapason: '+diapasonleft)

            let opos = {
                x: neck.x + 0.013*norme.x,
                y: neck.y + 0.013*norme.y,
                z: neck.z + 0.013*norme.z,
            }

            let geo = new THREE.SphereGeometry( 0.0001, 32, 16 );
            let mtl = new THREE.MeshBasicMaterial( { color: 0xffffff } );
            let sph = new THREE.Mesh( geo, mtl );
            sph.position.set (opos.x, opos.y, opos.z);
            this.scene.add(sph);
            fingerprints.push(opos);
            fingerprintz.push(sph);
            //-console.log(norme);
        for (var i = 1; i < nfret+1; i++) {
            let dist = (frets[i]+frets[i-1])/2;
            //-console.log('fret('+i+'): dist: '+dist);
            let apos = {
                x: top.x + ((frets[i]+frets[i-1])/2)*norme.x,
                y: top.y + ((frets[i]+frets[i-1])/2)*norme.y,
                z: top.z + ((frets[i]+frets[i-1])/2)*norme.z,
            }
           let geometry = new THREE.SphereGeometry( 0.0001, 32, 16 );
            let material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
            let sphere = new THREE.Mesh( geometry, material );
            sphere.position.set (apos.x, apos.y, apos.z);
            this.scene.add(sphere);
            fingerprints.push(apos);
            fingerprintz.push(sphere);

          }
          let geometryb = new THREE.SphereGeometry( 0.0001, 32, 16 );
            let materialb = new THREE.MeshBasicMaterial( { color: 0xffffff } );
            let sphereb = new THREE.Mesh( geometryb, materialb );
           sphereb.position.set (fingerprints[0].x, fingerprints[0].y, fingerprints[0].z);

            this.scene.add( sphereb );

        let stringdef = { pitch: pitch, neck: neck, top:top, frets: frets, fingerprints: fingerprints, fingerprintz: fingerprintz, meshprint: sphereb, thickness: thickness, color: color }
        return stringdef
    }
    addLineToObj (pitch, object, point1, point2, color = 0xff0000, thickness = 5) {

        this.strings.push( this.genStringDef(pitch, point1, point2));
        let lp = [
            new THREE.Vector3(point1.x, point1.y, point1.z),
            new THREE.Vector3(point2.x, point2.y, point2.z)
        ];

        var material = new THREE.LineBasicMaterial({ color: color,
    linewidth: thickness });
        let geom = new THREE.BufferGeometry().setFromPoints(lp);
        let line = new THREE.Line( geom, material);

        object.add(line);
    }
    getScreenCoordinates(obj) {
        return this.cameraman.getScreenCoordinates(obj);
    }
    getView ()       { return this.cameraman.getView(); }
    setView (v)      { this.cameraman.setView(v); }
    onViewChange (cb){ this.cameraman.onViewChange(cb); }
    stuffat (mouse) {
        let stuff = { c: null,  object: null };
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(this.cameraman.normalisedmouse, this.cameraman.camera);
        let intersects = [];
        this.scene.traverse((child) => {
                intersects.push(...raycaster.intersectObject(child));
        });
        if (intersects[0])
        {

            stuff.c = new THREE.Vector3(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
            stuff.object = intersects[0].object;
        }
        return stuff;
    }
}
class AppStorage {
    constructor (ns = 'guitarlab') {
        this.ns = ns;
    }
    _key (key) { return this.ns + ':' + key; }
    get (key, fallback = null) {
        try {
            const raw = localStorage.getItem(this._key(key));
            return raw !== null ? JSON.parse(raw) : fallback;
        } catch { return fallback; }
    }
    set (key, value) {
        try { localStorage.setItem(this._key(key), JSON.stringify(value)); }
        catch { /* quota dépassé ou mode privé */ }
    }
    remove (key) {
        try { localStorage.removeItem(this._key(key)); }
        catch {}
    }
}

// la classe application utilisera différentes instances des objets précédents. le lancement complet de l'application intervient a l'appel de son constructeur.
class Application {
  constructor (onReady = () => {}) {
        this.storage = new AppStorage();
        this._orientKey = () => window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
        this.appbody = document.createElement('div');
        this.appbody.id = 'app-body';
        document.body.appendChild (this.appbody);
        this.appstamp = document.createElement('div');
        this.appstamp.id = 'app-stamp';
        this.appstamp.innerHTML = '<i class="icon-sliders"></i> Guitar Lab';
        this.appbody.appendChild (this.appstamp);

        this.touchlayer = document.createElement('div');
        this.touchlayer.id = 'touch-layer';
        //this.touchlayer.innerHTML = '<i class="icon-sliders"></i> Guitar Lab';
        this.appbody.appendChild (this.touchlayer);

        this.renderlayer = document.createElement('div');
        this.renderlayer.id = 'render-layer';
        //this.touchlayer.innerHTML = '<i class="icon-sliders"></i> Guitar Lab';
        this.appbody.appendChild (this.renderlayer);

        this.groundrender = new GroundRender(
            this.renderlayer,
            (stringIndex, fret) => this.computedguitar.strings[stringIndex].hold(fret),
            () => { if (this.computedguitar) this.computedguitar.fingerprintsrender(); },
            () => {
                onReady();
                // restaurer la vue caméra pour l'orientation courante
                const savedViews = this.storage.get('camera-views', {});
                const v = savedViews[this._orientKey()];
                if (v) { this.groundrender.setView(v); this.groundrender.render(); }
                // sauvegarder à chaque mouvement de caméra
                this.groundrender.onViewChange(() => {
                    const views = this.storage.get('camera-views', {});
                    views[this._orientKey()] = this.groundrender.getView();
                    this.storage.set('camera-views', views);
                });
                // changer de vue au changement d'orientation
                window.matchMedia('(orientation: portrait)').addEventListener('change', () => {
                    const views = this.storage.get('camera-views', {});
                    const ov = views[this._orientKey()];
                    if (ov) { this.groundrender.setView(ov); this.groundrender.render(); }
                });
            }
        );
        this.ux = document.createElement('div');
        this.ux.id = 'ux';
        this.appbody.appendChild(this.ux);

        const uxbrand = document.createElement('div');
        uxbrand.id = 'ux-brand';
        uxbrand.innerHTML = '<i class="icon-sliders"></i> GuitarLab';
        this.ux.appendChild(uxbrand);

        this.onairchord = document.createElement('div');
        this.onairchord.id = 'onair-chord';
        this.ux.appendChild(this.onairchord);

        this.chordlibrary = document.createElement('div');
        this.chordlibrary.id = 'chord-library';
        this.ux.appendChild(this.chordlibrary);

        this.pinboarddetails = document.createElement('details');
        this.pinboarddetails.id = 'pinboard-details';
        const pinboardsummary = document.createElement('summary');
        pinboardsummary.innerHTML = '<i class="icon-attach-2"></i> Bibliothèque';
        this.pinboarddetails.appendChild(pinboardsummary);
        this.favctnr = document.createElement('div');
        this.favctnr.id = 'fav-ctnr';
        this.pinboarddetails.appendChild(this.favctnr);
        this.chordlibrary.appendChild(this.pinboarddetails);

        // ── restauration + persistance état des panneaux dépliables ──
        const uxOpen = this.storage.get('ux-open', {});
        const syncOpen = (el, key) => {
            if (uxOpen[key] !== undefined) el.open = uxOpen[key];
            el.addEventListener('toggle', () => {
                const state = this.storage.get('ux-open', {});
                state[key] = el.open;
                this.storage.set('ux-open', state);
            });
        };
        syncOpen(this.pinboarddetails, 'pinboard');

        this.neckside = document.createElement('div');
        this.neckside.id = 'neck-side';
     //   this.appbody.appendChild (this.neckside);
        this.rollkeysside = document.createElement('div');
        this.rollkeysside.id = 'rollkeys-side';
    //    this.appbody.appendChild (this.rollkeysside);
        this.neckboard = document.createElement('div');
        this.neckboard.id = 'neck-board';
        this.neckside.appendChild (this.neckboard);

        let strumbtn = document.createElement('div');
        strumbtn.innerText = 'Strum';
        strumbtn.id = 'strum-btn';

        var self = this;
        this.appbody.appendChild(strumbtn);
        window.addEventListener("keydown", (event) => {

        if ( 75 == event.keyCode ) this.computedguitar.play(0);
        if ( 76 == event.keyCode ) this.computedguitar.play(1);
        if ( 77 == event.keyCode ) this.computedguitar.play(2);
        if ( 73 == event.keyCode ) this.computedguitar.play(3);
        if ( 79 == event.keyCode ) this.computedguitar.play(4);
        if ( 80 == event.keyCode ) this.computedguitar.play(5);

        console.log ('vvv '+event.keyCode);
        console.log (event);
        });

        this.appbody.addEventListener('click', function (e) {
            if (!this.touchlayer.contains(e.target) && !this.renderlayer.contains(e.target)) return;
            this.groundrender.raycast();
        }.bind(this), false);

        strumbtn.addEventListener('click', function (e) {

            let bttn = document.getElementById(this.id);
            const clickPercentage = (e.clientX - e.target.getBoundingClientRect().left) / e.target.clientWidth * 100;
            this.computedguitar.strum(clickPercentage-50);
        }, true);

        let wideness = 1.1;
        let nfret = 18;
        let sguitar = {
            wavefront:'gao-beta-6.obj',
            material:'gao-beta-6.mtl',

            stringdefs: [
                {
                    pitch: 'E2', thickness: 0.80, nfret: nfret,
                    neckxyz: {x: -0.021849, y: 0.326, z: 0.000887},
                    topxyz: {x: -0.021849*wideness, y: -0.326, z: 0.005246},
                    partials: [0.8, 0.2, 0.1, 0.05, 0.025]
                },
                {
                    pitch: 'A2', thickness: 0.75, nfret: nfret,
                    neckxyz: {x: -0.013318, y: 0.326, z: 0.000887},
                    topxyz: {x: -0.013318*wideness, y: -0.326, z: 0.005246},
                    partials: [0.8, 0.2, 0.1, 0.05, 0.025]
                },
                {
                    pitch: 'D3', thickness: 0.70, nfret: nfret,
                    neckxyz: {x: -0.004787, y: 0.326, z: 0.000887},
                    topxyz: {x: -0.004787*wideness, y: -0.326, z: 0.005246},
                    partials: [0.8, 0.2, 0.1, 0.05]
                },
                {
                    pitch: 'G3', thickness: 0.65, nfret: nfret,
                    neckxyz: {x: 0.003744, y: 0.326, z: 0.000887},
                    topxyz: {x: 0.003744*wideness, y: -0.326, z: 0.005246},
                    partials: [0.8, 0.2, 0.1]
                },
                {
                    pitch: 'B3', thickness: 0.55, nfret: nfret,
                    neckxyz: {x: 0.012276, y: 0.326, z: 0.000887},
                    topxyz: {x: 0.012276*wideness, y: -0.326, z: 0.005246},
                    partials: [0.8, 0.2]
                },
                {
                    pitch: 'E4', thickness: 0.5, nfret: nfret,
                    neckxyz: {x: 0.020806, y: 0.326, z: 0.000887},
                    topxyz: {x: 0.020806*wideness, y: -0.326, z: 0.005246},
                    partials: [0.8, 0.2]
                }
            ],
            name: 's1g'

        };
        const stringNames = sguitar.stringdefs.map(d => d.pitch);
        const onStateChange = () => {
            const heldNotes = this.model.getholdedstrings();
            const heldFrets = this.model.getholdedfrets();
            this.chordwizard.guess(heldNotes, heldFrets);
            const stringIntervals = this.chordwizard.getStringIntervals();
            for (let i = 0; i < this.computedguitar.strings.length; i++) {
                this.computedguitar.strings[i].interval = stringIntervals[i];
            }
            this.chordwizard.print(this.onairchord);
            if (this.pluckpad) this.pluckpad.update();
            this.storage.set('onair-frets', this.model.getholdedfrets());
        };
        this.model = new GuitarModel(stringNames, onStateChange);
        this.computedguitar = new ComputedGuitar(sguitar, this.neckboard, this.groundrender, this.model);
        this.chordwizard = new ChordWizard(
            (chord) => { for (let i = 0; i < chord.frets.length; i++) this.computedguitar.strings[i].forcehold(chord.frets[i]); },
            onStateChange
        );
        this.chordwizard.mountPinBoard(this.favctnr);

        // ── restauration on-air ──
        const savedFrets = this.storage.get('onair-frets', null);
        if (savedFrets) {
            for (let i = 0; i < savedFrets.length; i++)
                this.computedguitar.strings[i].forcehold(savedFrets[i]);
        }

        // ── restauration bibliothèque (migration depuis ancien format plat) ──
        const savedSets = this.storage.get('chord-sets', null);
        if (savedSets) {
            this.chordwizard.chordpinboard.data = savedSets;
        } else {
            const legacy = this.storage.get('pinboard', []);
            if (legacy.length) this.chordwizard.chordpinboard.chords = legacy;
        }
        // persistance à chaque mutation
        this.chordwizard.chordpinboard.onStateChange = () => {
            this.storage.set('chord-sets', this.chordwizard.chordpinboard.data);
        };

        // catalogue — instrument identique à la guitare virtuelle
        this.chordwizard.setInstrument({
            tuning: stringNames,
            frets: nfret
        });

        this.catalogdetails = document.createElement('details');
        this.catalogdetails.id = 'catalog-details';
        const catalogsummary = document.createElement('summary');
        catalogsummary.innerHTML = '<i class="icon-book"></i> Catalogue';
        this.catalogdetails.appendChild(catalogsummary);
        this.catalogcontent = document.createElement('div');
        this.catalogdetails.appendChild(this.catalogcontent);
        this.chordlibrary.appendChild(this.catalogdetails);
        syncOpen(this.catalogdetails, 'catalog');

        this.catalogdetails.addEventListener('toggle', () => {
            if (this.catalogdetails.open) {
                this.chordwizard.printCatalog(
                    this.catalogcontent,
                    (voicing) => {
                        for (let i = 0; i < voicing.frets.length; i++)
                            this.computedguitar.strings[i].forcehold(voicing.frets[i]);
                        this.groundrender.render();
                    },
                    this.storage
                );
            }
        });

        // PluckPad — flottant déplaçable + dépliable
        const pluckWrap = document.createElement('details');
        pluckWrap.id = 'pluck-pad-wrap';
        pluckWrap.open = true;
        const pluckSummary = document.createElement('summary');
        pluckSummary.textContent = '⬡ Cordes';
        pluckWrap.appendChild(pluckSummary);
        this.appbody.appendChild(pluckWrap);

        const applyPluckPos = () => {
            const pos = this.storage.get('pluck-pos', {});
            const p = pos[this._orientKey()];
            if (p) {
                pluckWrap.style.left   = p.left;
                pluckWrap.style.top    = p.top;
                pluckWrap.style.bottom = 'auto';
            }
        };
        const savePluckPos = () => {
            const pos = this.storage.get('pluck-pos', {});
            pos[this._orientKey()] = { left: pluckWrap.style.left, top: pluckWrap.style.top };
            this.storage.set('pluck-pos', pos);
        };
        applyPluckPos();
        window.matchMedia('(orientation: portrait)').addEventListener('change', applyPluckPos);

        let dragging = false, dragOx = 0, dragOy = 0;
        pluckSummary.addEventListener('mousedown', (e) => {
            dragging = true;
            dragOx = e.clientX - pluckWrap.getBoundingClientRect().left;
            dragOy = e.clientY - pluckWrap.getBoundingClientRect().top;
            e.preventDefault();
        });
        pluckSummary.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            dragging = true;
            dragOx = t.clientX - pluckWrap.getBoundingClientRect().left;
            dragOy = t.clientY - pluckWrap.getBoundingClientRect().top;
        }, { passive: true });
        window.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            pluckWrap.style.left = (e.clientX - dragOx) + 'px';
            pluckWrap.style.top  = (e.clientY - dragOy) + 'px';
            pluckWrap.style.bottom = 'auto';
        });
        window.addEventListener('touchmove', (e) => {
            if (!dragging) return;
            const t = e.touches[0];
            pluckWrap.style.left = (t.clientX - dragOx) + 'px';
            pluckWrap.style.top  = (t.clientY - dragOy) + 'px';
            pluckWrap.style.bottom = 'auto';
        }, { passive: true });
        window.addEventListener('mouseup', () => { if (dragging) { dragging = false; savePluckPos(); } });
        window.addEventListener('touchend', () => { if (dragging) { dragging = false; savePluckPos(); } });

        this.pluckpad = new PluckPad(this.computedguitar.strings, pluckWrap);
    }
    start () {

    }
}

document.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('start');
    const hint   = document.getElementById('start-hint');

    // charge l'app immédiatement en arrière-plan
    window.application = new Application(() => {
        hint.classList.add('ready');
    });

    splash.addEventListener('click', () => {
        Tone.start();
        splash.classList.add('dissolve');
        splash.addEventListener('transitionend', () => splash.remove(), { once: true });
    }, true);
});
