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
        const active = this._activeSet();

        // ── set actif (déplié en tête) ──
        if (active) {
            const activeWrap = document.createElement('div');
            activeWrap.className = 'chord-set-active';

            const header = document.createElement('div');
            header.className = 'chord-set-header';

            const nameEl = document.createElement('span');
            nameEl.className = 'chord-set-name';
            nameEl.textContent = active.name;
            nameEl.contentEditable = 'true';
            nameEl.addEventListener('click', e => e.stopPropagation());
            nameEl.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); } });
            nameEl.addEventListener('blur', () => { active.name = nameEl.textContent.trim() || active.name; this.onStateChange(); });

            const delBtn = document.createElement('span');
            delBtn.className = 'chord-set-del';
            delBtn.textContent = '×';
            delBtn.addEventListener('click', e => { e.stopPropagation(); this.removeSet(active.id); });

            header.append(nameEl, delBtn);

            const grid = document.createElement('div');
            grid.className = 'chord-set-grid';
            active.chords.forEach(chord => {
                const card = document.createElement('div');
                card.className = 'voicing-card';
                card.innerHTML = '<div class="vc-frets">' + chord.frets.join(' ') + '</div>' +
                                 '<div class="vc-span">' + chord.name + '</div>';
                card.addEventListener('click', () => this.pushchord(chord), true);
                const del = document.createElement('span');
                del.className = 'vc-del';
                del.textContent = '×';
                del.addEventListener('click', e => { e.stopPropagation(); active.chords = active.chords.filter(c => !c.sameAs(chord)); this.update(); }, true);
                card.appendChild(del);
                grid.appendChild(card);
            });

            activeWrap.append(header, grid);
            this.domctnr.appendChild(activeWrap);
        }

        // ── sets repliés + nouveau set ──
        const collapsedRow = document.createElement('div');
        collapsedRow.className = 'chord-sets-collapsed';

        this.sets.filter(s => s.id !== this.activeSetId).forEach(set => {
            const pill = document.createElement('button');
            pill.className = 'chord-set-pill';
            pill.textContent = set.name;
            pill.addEventListener('click', () => { this.activeSetId = set.id; this.update(); this.onStateChange(); });
            collapsedRow.appendChild(pill);
        });

        const addBtn = document.createElement('button');
        addBtn.className = 'chord-set-pill chord-set-pill--add';
        addBtn.innerHTML = '<i class="icon-plus"></i>';
        addBtn.addEventListener('click', () => this.addSet());
        collapsedRow.appendChild(addBtn);

        this.domctnr.appendChild(collapsedRow);
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

            const state    = this.strings[i].getstate();
            const interval = this.strings[i].interval;

            if (interval) {
                const iv = document.createElement('i');
                iv.className = 'p-pad-iv icon-nit-' + interval;
                ctnr.appendChild(iv);
            }

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
// ─────────────────────────────────────────────────────────────────────────────
//  PartitionManager  — séquenceur deux mains (piste accord sparse + grille picking)
// ─────────────────────────────────────────────────────────────────────────────

function _partNew () {
    return {
        id: 'p' + Date.now().toString(36),
        name: 'Séquence 1',
        bpm: 120,
        division: '16n',
        length: 4,
        chords: [],
        pattern: Array(6).fill(null).map(() => Array(4).fill(0))
    };
}
function _partReviveChord (c) {
    return c instanceof Chord
        ? c
        : new Chord(c.frets, c.name, c.root, c.type, c.desc, c.bass, c.notes, c.intervals);
}
function _partMigrateItem (item) {
    if (!item.slots) return item; // already new format
    const length = item.slots.length * 16;
    const pattern = Array(6).fill(null).map((_, s) =>
        Array.from({ length }, (_, u) => item.slots[Math.floor(u / 16)]?.pattern[s]?.[u % 16] ? 1 : 0)
    );
    const chords = [];
    item.slots.forEach((slot, si) => {
        if (slot.chord) {
            const at = si * 16;
            if (!chords.length || chords[chords.length - 1].at !== at)
                chords.push({ at, chord: _partReviveChord(slot.chord) });
        }
    });
    return { id: item.id, name: item.name, bpm: item.bpm, division: '16n', length, chords, pattern };
}

class PartitionManager {
    constructor (getStrings) {
        this.getStrings    = getStrings;   // () => ComputedString[]
        this.items         = [_partNew()];
        this.activeId      = this.items[0].id;
        this._seq          = null;
        this._playing      = false;
        this._looping      = true;
        this.onStateChange = () => {};
        this._domdest      = null;
        this._playBtn      = null;
        this._colEls       = [];
        this._prevPH       = -1;
        this._noteDur      = 1;
        // injectés par Application
        this.applyChord      = () => {};
        this.getCurrentChord = () => null;
    }

    // ── persistence ──────────────────────────────────────────────────────────
    get data () { return { items: this.items, activeId: this.activeId }; }
    set data (d) {
        this.items = (d.items || []).map(item => {
            const m = _partMigrateItem(item);
            m.chords = (m.chords || []).map(c => ({ ...c, chord: c.chord ? _partReviveChord(c.chord) : null }));
            // migration boolean → integer pour les patterns sauvegardés avant v1.9.5.6
            if (m.pattern) m.pattern = m.pattern.map(row => (row || []).map(v => v === true ? 1 : v === false ? 0 : (v || 0)));
            return m;
        });
        this.activeId = d.activeId || (this.items[0] && this.items[0].id) || null;
        if (this._domdest) this._render();
    }

    _active () { return this.items.find(p => p.id === this.activeId) || null; }

    // ── utils ─────────────────────────────────────────────────────────────────
    _secPerUnit (p) {
        const divs = { '8n': 2, '16n': 4, '32n': 8 };
        return 60 / p.bpm / (divs[p.division] || 4);
    }
    _activeChordAt (p, unit) {
        let result = null;
        for (const c of [...p.chords].sort((a, b) => a.at - b.at)) {
            if (c.at <= unit) result = c; else break;
        }
        return result;
    }

    // ── extension automatique ─────────────────────────────────────────────────
    // Garantit 4 unités libres après la dernière entrée (accord ou cellule active).
    // Retourne true si la grille a été étendue.
    _autoExtend (p) {
        let last = -1;
        for (const c of p.chords) if (c.chord !== null && c.at > last) last = c.at;
        for (let s = 0; s < 6; s++)
            for (let u = 0; u < p.length; u++) {
                const dur = p.pattern[s]?.[u] || 0;
                if (dur) last = Math.max(last, u + dur - 1);
            }
        const needed = Math.ceil((last + 5) / 4) * 4; // last+1 + 4 unités libres, arrondi à 4
        if (needed > p.length) {
            for (let s = 0; s < 6; s++) {
                if (!p.pattern[s]) p.pattern[s] = [];
                while (p.pattern[s].length < needed) p.pattern[s].push(0);
            }
            p.length = needed;
            return true;
        }
        return false;
    }

    // ── lecture ──────────────────────────────────────────────────────────────
    play () {
        this.stop();
        const p = this._active();
        if (!p) return;
        const strings = this.getStrings();
        const secPerUnit = this._secPerUnit(p);

        // Le premier délimitateur de fin ({chord:null}) définit la durée de la séquence
        const firstDelim = [...p.chords].sort((a, b) => a.at - b.at).find(c => c.chord === null);
        const effectiveLen = firstDelim ? firstDelim.at : p.length;
        const totalSec = effectiveLen * secPerUnit;

        // Un événement tick par unité — lecture live des données à chaque tick
        const tickEvents = Array.from({ length: effectiveLen }, (_, u) => [u * secPerUnit, u]);

        this._seq = new Tone.Part((time, unit) => {
            const ap = this._active();
            if (!ap) return;
            const chordEntry = this._activeChordAt(ap, unit);

            // changement d'accord → mise à jour guitare virtuelle
            if (chordEntry && chordEntry.at === unit)
                setTimeout(() => this.applyChord(chordEntry.chord), 0);

            // notes de picking
            if (chordEntry) {
                for (let s = 0; s < strings.length; s++) {
                    const dur = ap.pattern[s]?.[unit] || 0;
                    if (!dur) continue;
                    const fret = chordEntry.chord.frets[s];
                    if (fret === 'x') continue;
                    const openIdx = allnotes.indexOf(strings[s].name);
                    if (openIdx === -1) continue;
                    const note = allnotes[openIdx + parseInt(fret)];
                    if (note) strings[s].synth.triggerAttackRelease(note, Math.max(secPerUnit * dur * 0.9, 0.05), time);
                }
            }

            // curseur de lecture
            setTimeout(() => this._updatePlayhead(unit), 0);
        }, tickEvents);

        this._seq.loop    = this._looping;
        this._seq.loopEnd = totalSec;
        this._seq.start(0);
        Tone.Transport.start();
        this._playing = true;
        this._updatePlayBtn();

        // fin de séquence sans boucle → réinitialiser le bouton
        if (!this._looping) {
            this._endEvent = Tone.Transport.scheduleOnce(() => {
                setTimeout(() => this.stop(), 0);
            }, totalSec);
        }
    }

    stop () {
        if (this._endEvent !== undefined) { Tone.Transport.clear(this._endEvent); this._endEvent = undefined; }
        if (this._seq) { this._seq.stop(); this._seq.dispose(); this._seq = null; }
        Tone.Transport.stop();
        this._playing = false;
        this._updatePlayhead(-1);
        this._updatePlayBtn();
    }

    _updatePlayBtn () {
        if (this._playBtn) this._playBtn.textContent = this._playing ? '■' : '▶';
    }

    _updatePlayhead (unit) {
        if (this._prevPH >= 0 && this._colEls[this._prevPH])
            this._colEls[this._prevPH].forEach(c => c.classList.remove('playhead'));
        if (unit >= 0 && this._colEls[unit])
            this._colEls[unit].forEach(c => c.classList.add('playhead'));
        this._prevPH = unit;
    }

    // ── DOM ───────────────────────────────────────────────────────────────────
    mount (domdest) {
        this._domdest = domdest;
        this._render();
    }

    _render () {
        const root = this._domdest;
        if (!root) return;
        const savedScroll = root.querySelector('.partition-editor')?.scrollLeft ?? 0;
        this._colEls = [];
        root.innerHTML = '';

        // ── pills partitions ──
        const pillRow = document.createElement('div');
        pillRow.classList.add('part-pill-row');
        this.items.forEach(item => {
            const pill = document.createElement('button');
            pill.classList.add('part-pill');
            if (item.id === this.activeId) pill.classList.add('active');
            pill.textContent = item.name;
            pill.addEventListener('click', () => {
                if (item.id === this.activeId) return;
                this.activeId = item.id;
                this.onStateChange(); this._render();
            });
            pillRow.appendChild(pill);
        });
        const addPill = document.createElement('button');
        addPill.classList.add('part-pill', 'part-pill--add');
        addPill.textContent = '+';
        addPill.addEventListener('click', () => {
            const np = _partNew(); this.items.push(np); this.activeId = np.id;
            this.onStateChange(); this._render();
        });
        pillRow.appendChild(addPill);
        root.appendChild(pillRow);

        const p = this._active();
        if (!p) return;

        // ── contrôles BPM + lecture + division ──
        const controls = document.createElement('div');
        controls.classList.add('partition-controls');

        // ── nom de la partition (éditable) ──
        const nameWrap = document.createElement('div');
        nameWrap.classList.add('partition-name-wrap');

        const nameEl = document.createElement('span');
        nameEl.classList.add('partition-name');
        nameEl.contentEditable = 'true';
        nameEl.textContent = p.name;
        nameEl.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); } });
        nameEl.addEventListener('blur', () => {
            const v = nameEl.textContent.trim();
            if (v && v !== p.name) { p.name = v; this.onStateChange(); this._render(); }
        });

        const delBtn = document.createElement('span');
        delBtn.classList.add('partition-name-del');
        delBtn.textContent = '×';
        delBtn.title = 'Supprimer la partition';
        delBtn.addEventListener('click', () => {
            if (this.items.length === 1) return;
            this.stop();
            this.items = this.items.filter(i => i.id !== p.id);
            if (this.activeId === p.id) this.activeId = this.items[0].id;
            this.onStateChange(); this._render();
        });
        nameWrap.append(nameEl, delBtn);

        const bpmWrap = document.createElement('div');
        bpmWrap.classList.add('partition-bpm-wrap');

        const bpmDown = document.createElement('button');
        bpmDown.classList.add('partition-bpm-btn');
        bpmDown.textContent = '−';

        const bpmDisplay = document.createElement('span');
        bpmDisplay.classList.add('partition-bpm-display');
        bpmDisplay.textContent = p.bpm;

        const bpmUp = document.createElement('button');
        bpmUp.classList.add('partition-bpm-btn');
        bpmUp.textContent = '+';

        const applyBpm = (v) => {
            v = Math.max(40, Math.min(300, v));
            p.bpm = v;
            bpmDisplay.textContent = v;
            this.onStateChange();
            if (this._playing) { this.stop(); this.play(); }
        };
        bpmDown.addEventListener('click', () => applyBpm(p.bpm - 5));
        bpmUp.addEventListener('click',   () => applyBpm(p.bpm + 5));
        bpmDisplay.addEventListener('click', () => {
            const v = parseInt(prompt('BPM (40–300)', p.bpm));
            if (!isNaN(v)) applyBpm(v);
        });
        bpmWrap.append(bpmDown, bpmDisplay, bpmUp);

        this._playBtn = document.createElement('button');
        this._playBtn.classList.add('partition-play-btn');
        this._updatePlayBtn();
        this._playBtn.addEventListener('click', () => { if (this._playing) this.stop(); else this.play(); });

        const loopBtn = document.createElement('button');
        loopBtn.classList.add('partition-loop-btn');
        loopBtn.classList.toggle('active', this._looping);
        loopBtn.textContent = '↺';
        loopBtn.title = 'Boucle';
        loopBtn.addEventListener('click', () => {
            this._looping = !this._looping;
            loopBtn.classList.toggle('active', this._looping);
            if (this._seq) this._seq.loop = this._looping;
        });

        // sélecteur de division rythmique
        const divWrap = document.createElement('div');
        divWrap.classList.add('part-div-wrap');
        const divLabel = document.createElement('span');
        divLabel.className = 'part-div-label';
        divLabel.textContent = 'unité';
        divWrap.appendChild(divLabel);
        ['8n', '16n', '32n'].forEach(div => {
            const btn = document.createElement('button');
            btn.classList.add('part-div-btn');
            btn.textContent = div === '8n' ? '÷8' : div === '16n' ? '÷16' : '÷32';
            btn.classList.toggle('active', p.division === div);
            btn.addEventListener('click', () => {
                p.division = div;
                this.onStateChange();
                if (this._playing) { this.stop(); this.play(); } else this._render();
            });
            divWrap.appendChild(btn);
        });

        // ── barre de sélection de durée ──
        const durBar = document.createElement('div');
        durBar.classList.add('part-dur-bar');
        [1, 2, 4, 8].forEach(d => {
            const btn = document.createElement('button');
            btn.classList.add('part-dur-btn');
            btn.classList.toggle('active', d === this._noteDur);
            btn.textContent = String(d);
            btn.title = `Durée : ${d} unité${d > 1 ? 's' : ''}`;
            btn.addEventListener('click', () => {
                this._noteDur = d;
                durBar.querySelectorAll('.part-dur-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
            durBar.appendChild(btn);
        });

        // ── sauvegarder / charger séquence ──
        const saveBtn = document.createElement('button');
        saveBtn.className = 'part-io-btn';
        saveBtn.innerHTML = '<i class="icon-doc"></i>';
        saveBtn.title = 'Sauvegarder la séquence';
        saveBtn.addEventListener('click', () => {
            const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href = url; a.download = (p.name || 'sequence') + '.json'; a.click();
            URL.revokeObjectURL(url);
        });

        const loadInput = document.createElement('input');
        loadInput.type = 'file'; loadInput.accept = '.json,application/json';
        loadInput.style.display = 'none';
        loadInput.addEventListener('change', (e) => {
            const file = e.target.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const raw  = JSON.parse(ev.target.result);
                    const item = _partMigrateItem(raw);
                    item.chords = (item.chords || []).map(c => ({ ...c, chord: c.chord ? _partReviveChord(c.chord) : null }));
                    item.id = 'p' + Date.now().toString(36);
                    this.items.push(item);
                    this.activeId = item.id;
                    this.onStateChange(); this._render();
                } catch {}
            };
            reader.readAsText(file); loadInput.value = '';
        });
        const loadBtn = document.createElement('button');
        loadBtn.className = 'part-io-btn';
        loadBtn.innerHTML = '<i class="icon-folder-open-empty"></i>';
        loadBtn.title = 'Charger une séquence';
        loadBtn.addEventListener('click', () => loadInput.click());

        controls.append(nameWrap, bpmWrap, this._playBtn, loopBtn, divWrap, durBar, saveBtn, loadInput, loadBtn);
        root.appendChild(controls);

        // ── éditeur — grille CSS unifiée ──
        const editor = document.createElement('div');
        editor.classList.add('partition-editor');

        // durée effective : premier délimitateur de fin, ou p.length par défaut
        const firstDelimAt    = [...p.chords].sort((a, b) => a.at - b.at).find(c => c.chord === null)?.at ?? p.length;
        const unitsPerBeat    = { '8n': 2, '16n': 4, '32n': 8 }[p.division] || 4;
        const unitsPerMeasure = unitsPerBeat * 4;

        // Précomputation des positions couvertes (milieu d'une note longue)
        const covered = Array.from({ length: 6 }, (_, s) => {
            const set = new Set();
            for (let u = 0; u < p.length; u++) {
                const dur = p.pattern[s]?.[u] || 0;
                for (let d = 1; d < dur; d++) set.add(u + d);
            }
            return set;
        });

        // Grille unique — toutes les rangées partagent les mêmes colonnes
        // Placement explicite sur chaque cellule → ordre DOM libre
        const seqGrid = document.createElement('div');
        seqGrid.classList.add('part-seq-grid');
        seqGrid.style.gridTemplateColumns = `repeat(${p.length}, minmax(0.85em, 3rem))`;

        this._colEls = Array.from({ length: p.length }, () => []);

        for (let u = 0; u < p.length; u++) {
            const activeEntry = this._activeChordAt(p, u);
            const chordStart  = p.chords.find(c => c.at === u && c.chord !== null) || null;
            const delimHere   = p.chords.find(c => c.at === u && c.chord === null)  || null;
            const oor         = u >= firstDelimAt;
            const beatStart   = u % 4 === 0;
            const col         = u + 1; // CSS grid column (1-based)

            // ── cellule accord (row 1) ──
            const cCell = document.createElement('div');
            cCell.classList.add('part-ctrack-cell');
            cCell.style.gridColumn = String(col);
            cCell.style.gridRow    = '1';
            if (beatStart)   cCell.classList.add('beat-start');
            if (activeEntry) cCell.classList.add('chord-active');
            if (chordStart)  cCell.classList.add('chord-start');
            if (oor)         cCell.classList.add('out-of-range');
            if (chordStart) {
                const nameEl = document.createElement('div');
                nameEl.classList.add('part-chord-name-label');
                nameEl.textContent = chordStart.chord.name || '?';
                cCell.appendChild(nameEl);
                cCell.title = `${chordStart.chord.name} — cliquer pour supprimer`;
                cCell.addEventListener('click', () => {
                    p.chords = p.chords.filter(c => c.at !== u || c.chord === null);
                    this.onStateChange(); this._render();
                });
            } else {
                cCell.title = "Assigner l'accord actuel ici";
                cCell.addEventListener('click', () => {
                    const c = this.getCurrentChord();
                    if (!c) return;
                    p.chords = p.chords.filter(c2 => c2.at !== u);
                    p.chords.push({ at: u, chord: c });
                    this._autoExtend(p);
                    this.onStateChange(); this._render();
                });
            }
            seqGrid.appendChild(cCell);
            this._colEls[u].push(cCell);

            // ── cellule délimiteur (row 2) ──
            const dCell = document.createElement('div');
            dCell.classList.add('part-ctrack-delim-cell');
            dCell.style.gridColumn = String(col);
            dCell.style.gridRow    = '2';
            if (beatStart)        dCell.classList.add('beat-start');
            if (u > firstDelimAt) dCell.classList.add('out-of-range');
            if (delimHere) {
                dCell.classList.add('delim-active');
                dCell.textContent = '⊣';
                dCell.title = 'Supprimer le délimiteur de fin';
                dCell.addEventListener('click', () => {
                    p.chords = p.chords.filter(c => !(c.at === u && c.chord === null));
                    this.onStateChange(); this._render();
                });
            } else {
                dCell.title = 'Ajouter un délimiteur de fin ici';
                dCell.addEventListener('click', () => {
                    if (!activeEntry) return;
                    p.chords = p.chords.filter(c => c.at !== u);
                    p.chords.push({ at: u, chord: null });
                    this.onStateChange(); this._render();
                });
            }
            seqGrid.appendChild(dCell);
            this._colEls[u].push(dCell);

            // ── rangées picking (rows 3–8) ──
            for (let s = 0; s < 6; s++) {
                const dur     = p.pattern[s]?.[u] || 0;
                const gridRow = String(s + 3);

                // Zone de clic (toujours 1 colonne)
                const cell = document.createElement('div');
                cell.classList.add('part-cell');
                cell.style.gridColumn = String(col);
                cell.style.gridRow    = gridRow;
                if (beatStart) cell.classList.add('beat-start');
                if (oor)       cell.classList.add('out-of-range');
                cell.addEventListener('pointerdown', e => {
                    e.preventDefault();
                    if (!p.pattern[s]) p.pattern[s] = Array(p.length).fill(0);
                    if (p.pattern[s][u] > 0) {
                        p.pattern[s][u] = 0;
                    } else if (!covered[s].has(u)) {
                        p.pattern[s][u] = this._noteDur;
                        this._autoExtend(p);
                    }
                    this.onStateChange(); this._render();
                });
                seqGrid.appendChild(cell);
                this._colEls[u].push(cell);

                // Barre de note (si une note démarre ici — par-dessus la click zone)
                if (dur > 0) {
                    const bar = document.createElement('div');
                    bar.classList.add('part-note-bar');
                    if (oor) bar.classList.add('out-of-range');
                    bar.style.gridColumn = `${col} / span ${Math.min(dur, p.length - u)}`;
                    bar.style.gridRow    = gridRow;
                    seqGrid.appendChild(bar);
                }
            }

            // ── cellule règle mesure (row 9) ──
            const rCell = document.createElement('div');
            rCell.classList.add('part-ruler-cell');
            rCell.style.gridColumn = String(col);
            rCell.style.gridRow    = '9';
            if (beatStart) rCell.classList.add('beat-start');
            if (oor)       rCell.classList.add('out-of-range');
            if (u % unitsPerMeasure === 0)
                rCell.textContent = String(Math.floor(u / unitsPerMeasure) + 1);
            seqGrid.appendChild(rCell);
            this._colEls[u].push(rCell);
        }

        editor.appendChild(seqGrid);
        root.appendChild(editor);
        editor.scrollLeft = savedScroll;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Constantes de catalogue — définies une seule fois au niveau du module

const VOICING_BADGES = [
    { key: 'ordered',    sym: '↑', title: 'Intervalles en ordre croissant',         cls: 'badge-ordered'  },
    { key: 'noMuteGap',  sym: '▬', title: 'Pas de corde mutée intérieure',          cls: 'badge-nomute'   },
    { key: 'strictTriad',sym: '▲', title: 'Triade stricte — 3 cordes consécutives', cls: 'badge-triad'    },
    { key: 'triad',      sym: '△', title: 'Triade — 3 cordes avec discontinuité',   cls: 'badge-triad'    },
    { key: 'unique',     sym: '◇', title: 'Aucune note répétée',                    cls: 'badge-unique'   },
];

function _makeBadgeSpan (sym, cls, title) {
    const b = document.createElement('span');
    b.classList.add('vc-badge', cls);
    b.textContent = sym;
    if (title) b.title = title;
    return b;
}

// ─────────────────────────────────────────────────────────────────────────────

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
        if (!this._result || this._result.notes.length === 0) return;

        const { founded, notes, frets } = this._result;
        const recognized = founded.length > 0;

        const aguess = document.createElement('div');
        aguess.classList.add('chord-guess');

        // ── titre + bouton pin ──
        const aguesstitle = document.createElement('div');
        aguesstitle.classList.add('chord-guess-title');

        const chord = recognized
            ? founded[0].chord
            : new Chord(frets, '?', '', '', '', '', notes.map(n => n.octavednote), []);

        const pinbtn = document.createElement('span');
        pinbtn.classList.add('pin-btn');
        pinbtn.innerHTML = '<i class="icon-attach-2"></i>';
        if (this.chordpinboard.has(chord)) pinbtn.classList.add('blast');
        pinbtn.addEventListener('click', () => {
            this.chordpinboard.pinchord(chord);
            this.print(domdest); // rafraîchit l'état du bouton
        }, true);

        if (recognized) {
            aguesstitle.innerHTML = '<strong>' + founded[0].chordtype + ' </strong><span class="score">' + founded[0].score.toFixed(1) + '</span>';
        } else {
            aguesstitle.innerHTML = '<span class="chord-unknown">?</span>';
        }
        aguesstitle.prepend(pinbtn);

        // ── frettes + notes ──
        const aguessdesc = document.createElement('div');
        aguessdesc.classList.add('chord-guess-desc');

        let sheme = '';
        for (let j = 0; j < notes.length; j++) {
            if (notes[j].basenote !== undefined) {
                const itv = recognized
                    ? this.getinterval(founded[0].root, notes[j].basenote).replace('#', 'm')
                    : 'root';
                sheme += '<span class="itv itv-' + itv + '">' + notes[j].basenote + '</span>';
            }
        }
        aguessdesc.innerHTML = frets.join(' ') + '<br>' + sheme;

        aguess.append(aguesstitle, aguessdesc);
        domdest.appendChild(aguess);
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
                if (noInteriorMutes && this._hasInteriorMute(current)) return;
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

    // ── helpers privés ──────────────────────────────────────
    // Retourne [{basenote, octavednote}|null] pour chaque corde
    _getFretNotes (frets) {
        const tuning = this._instrument?.tuning;
        if (!tuning) return frets.map(() => null);
        return frets.map((fret, i) => {
            if (fret === 'x') return null;
            const openIdx = allnotes.indexOf(tuning[i]);
            const octavednote = allnotes[openIdx + parseInt(fret)];
            return octavednote ? { basenote: octavednote.replace(/\d/g, ''), octavednote } : null;
        });
    }
    // Vrai si une corde mutée se trouve entre deux cordes jouées
    _hasInteriorMute (frets) {
        const first = frets.findIndex(f => f !== 'x');
        if (first === -1) return false;
        const last = frets.length - 1 - [...frets].reverse().findIndex(f => f !== 'x');
        return frets.slice(first, last + 1).some(f => f === 'x');
    }

    // Reconstruction non-mutante : retourne {root, chordtypeindex} du meilleur score pour un voicing
    _guessFromVoicing (voicing) {
        if (!this._instrument) return null;

        const heldNotes = this._getFretNotes(voicing.frets).filter(Boolean);
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

    // Calcule les propriétés notables d'un voicing pour un accord donné
    _voicingProps (v, root, cti) {
        const chordIntervals = chordtypes[cti].intervals;

        // intervalle de chaque corde jouée (null si mutée)
        const ivList = this._getFretNotes(v.frets)
            .map(fn => fn ? this.getinterval(root, fn.basenote) : null);
        const playedIvs   = ivList.filter(x => x !== null);
        const playedCount = playedIvs.length;
        const semitones   = playedIvs.map(iv => intervals.indexOf(iv));

        // 1. Intervalles en ordre croissant (bass → treble)
        const ordered = semitones.every((s, i) => i === 0 || s >= semitones[i - 1]);

        // 2. Pas de corde mutée intérieure (pertinent à partir de 4 cordes jouées)
        const noGapRaw    = !this._hasInteriorMute(v.frets);
        const noMuteGap   = playedCount >= 4 && noGapRaw;

        // 3. Triade stricte (3 cordes consécutives) ou simple (3 cordes avec discontinuité)
        const strictTriad = playedCount === 3 && noGapRaw;
        const triad       = playedCount === 3 && !noGapRaw;

        // 4. Tous les intervalles de l'accord présents
        const complete = chordIntervals.every(iv => playedIvs.includes(iv));

        // 5. Aucune note répétée
        const unique = new Set(playedIvs).size === playedCount;

        return { ordered, noMuteGap, strictTriad, triad, complete, unique };
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

            const fretsDiv = document.createElement('div');
            fretsDiv.classList.add('vc-frets');
            fretsDiv.textContent = v.frets.join(' ');

            const badgesDiv = document.createElement('div');
            badgesDiv.classList.add('vc-badges');
            const props = this._voicingProps(v, state.root, state.chordTypeIndex);
            VOICING_BADGES.forEach(({ key, sym, title, cls }) => {
                if (props[key]) badgesDiv.appendChild(_makeBadgeSpan(sym, cls, title));
            });

            card.append(fretsDiv, badgesDiv);
            card.addEventListener('click', () => onApplyVoicing(v, chordName));
            return card;
        };

        const render = () => {
            const chordName = state.root + chordtypes[state.chordTypeIndex].sym;

            // grille principale
            grid.innerHTML = '';
            // minNotes plafonné par le nombre d'intervalles du type (ex: quinte = 2, fondamentale = 1)
            const effectiveMinNotes = Math.min(state.minNotes, chordtypes[state.chordTypeIndex].intervals.length);
            const voicings = this.buildVoicings(state.root, state.chordTypeIndex, {
                maxSpan:        state.maxSpan,
                minNotes:       effectiveMinNotes,
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
            header.textContent = '';

            // groupement par position (minPressed)
            const groups = new Map();
            validated.forEach(v => {
                const pos = minPressed(v);
                if (!groups.has(pos)) groups.set(pos, []);
                groups.get(pos).push(v);
            });
            groups.forEach((vs, pos) => {
                const row = document.createElement('div');
                row.classList.add('catalog-position-row');

                const label = document.createElement('div');
                label.classList.add('catalog-pos-label');
                label.textContent = pos === 0 ? '○' : pos;

                const cards = document.createElement('div');
                cards.classList.add('catalog-pos-cards');
                const sortPrio = v => {
                    const p = this._voicingProps(v, state.root, state.chordTypeIndex);
                    if (p.noMuteGap)   return 0;
                    if (p.strictTriad) return 1;
                    return 2;
                };
                vs.slice().sort((a, b) => sortPrio(a) - sortPrio(b))
                  .forEach(v => cards.appendChild(makeCard(v, chordName)));

                row.append(label, cards);
                grid.appendChild(row);
            });

            // légende en bas de la zone scrollable
            const legend = document.createElement('div');
            legend.classList.add('catalog-legend');
            VOICING_BADGES.forEach(({ sym, title, cls }) => {
                const row = document.createElement('div');
                row.classList.add('catalog-legend-row');
                const lbl = document.createElement('span');
                lbl.textContent = title;
                row.append(_makeBadgeSpan(sym, cls, ''), lbl);
                legend.appendChild(row);
            });
            grid.appendChild(legend);

        };

        // ── header ──
        const header = document.createElement('div');
        header.classList.add('catalog-header');
        domdest.appendChild(header);

        // ── filtres ──
        const filters = document.createElement('div');
        filters.classList.add('catalog-filters');

        // ── ligne tonique (pills) ──
        const rootRow = document.createElement('div');
        rootRow.className = 'catalog-pill-row';
        notes.forEach(n => {
            const pill = document.createElement('span');
            pill.className = 'catalog-pill' + (n === state.root ? ' catalog-pill--active' : '');
            pill.textContent = n;
            pill.addEventListener('click', () => {
                if (n === state.root) return;
                state.root = n;
                rootRow.querySelectorAll('.catalog-pill').forEach(p => p.classList.remove('catalog-pill--active'));
                pill.classList.add('catalog-pill--active');
                saveState(); render();
            });
            rootRow.appendChild(pill);
        });

        // ── ligne qualité (pills) ──
        const typeRow = document.createElement('div');
        typeRow.className = 'catalog-pill-row';
        chordtypes.forEach((ct, idx) => {
            const label = ct.sym !== '' ? ct.sym : ct.intervals.length === 1 ? 'R' : 'Maj';
            const pill = document.createElement('span');
            pill.className = 'catalog-pill' + (idx === state.chordTypeIndex ? ' catalog-pill--active' : '');
            pill.textContent = label;
            pill.addEventListener('click', () => {
                if (idx === state.chordTypeIndex) return;
                state.chordTypeIndex = idx;
                typeRow.querySelectorAll('.catalog-pill').forEach(p => p.classList.remove('catalog-pill--active'));
                pill.classList.add('catalog-pill--active');
                saveState(); render();
            });
            typeRow.appendChild(pill);
        });

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

        filters.append(spanLabel, invLabel, minFretLabel, maxFretLabel);
        domdest.appendChild(rootRow);
        domdest.appendChild(typeRow);
        domdest.appendChild(filters);

        // ── grille explorateur ──
        const grid = document.createElement('div');
        grid.classList.add('catalog-positions');
        domdest.appendChild(grid);

        render();
    }
}
// ── Cadrages prédéfinis ───────────────────────────────────────────────────────
// pos/target : coordonnées 3D de la caméra / du point visé
// screen     : position cible (cx, cy) normalisée 0..1 où doit atterrir `target`
//              sur l'écran après l'animation (auto-alignement par pan).
//              cx=0.5 cy=0.5 = centré. cx<0.5 = décalé vers la gauche.
// frets : { strMin, strMax, fretIdx1, fretIdx2 }
// fretIdx est 0-basé dans fingerprints[] : idx 0 = frette 1, idx 17 = frette 18
const CAMERA_FRAMES = [
    {
        id: 'full',  label: '1–18',
        pos:    { x: 0.13, y: -0.06, z: 1.55 },
        target: { x: 0.13, y:  0.06, z: -0.02 },
        screen: { cx: 0.165, cy: 0.5 },
        frets:  { strMin: 0, strMax: 5, fretIdx1: 0, fretIdx2: 17 },
    },
    {
        id: 'open',  label: 'I',
        pos:    { x: 0.13, y:  0.12, z: 0.88 },
        target: { x: 0.13, y:  0.24, z: -0.02 },
        screen: { cx: 0.165, cy: 0.5 },
        frets:  { strMin: 0, strMax: 5, fretIdx1: 0, fretIdx2: 3 },
    },
    {
        id: 'pos5',  label: 'V',
        pos:    { x: 0.13, y: -0.01, z: 0.88 },
        target: { x: 0.13, y:  0.11, z: -0.02 },
        screen: { cx: 0.165, cy: 0.5 },
        frets:  { strMin: 0, strMax: 5, fretIdx1: 3, fretIdx2: 7 },
    },
    {
        id: 'pos9',  label: 'IX',
        pos:    { x: 0.13, y: -0.07, z: 0.88 },
        target: { x: 0.13, y:  0.05, z: -0.02 },
        screen: { cx: 0.165, cy: 0.5 },
        frets:  { strMin: 0, strMax: 5, fretIdx1: 7, fretIdx2: 11 },
    },
    {
        id: 'pos12', label: 'XII',
        pos:    { x: 0.13, y: -0.15, z: 0.88 },
        target: { x: 0.13, y: -0.03, z: -0.02 },
        screen: { cx: 0.165, cy: 0.5 },
        frets:  { strMin: 0, strMax: 5, fretIdx1: 10, fretIdx2: 14 },
    },
];

class Cameraman {
    constructor (onNeedRender = () => {}, domElement = document.body) {

        this.onNeedRender = onNeedRender;
        this.viewRatio = 1.0;
        this.normalisedmouse = {x: 0, y: 0};
        this._flyRaf = null;
        this.scene = null;          // injecté depuis GroundRender après init
        this._debugMeshes = [];
        this._debug = false;        // activer pour les outils de calibration cadrages
        this._activeFrame   = null; // cadrage actif (null = vue libre)
        this._activeStrings = null;

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
    flyTo (frame, durationMs = 550, strings = null) {
        if (this._flyRaf) { cancelAnimationFrame(this._flyRaf); this._flyRaf = null; }
        this._activeFrame   = frame;
        this._activeStrings = strings;
        this._debugSpheres(frame, strings);

        // Précalcule le pan d'alignement depuis la position finale frame.pos/target,
        // puis l'intègre dans la destination du lerp — pas de saut en fin d'animation.
        const alignPan = this._computeAlignPan(frame, strings);

        const p0 = this.camera.position.clone();
        const t0 = this.controls.target.clone();
        const p1 = new THREE.Vector3(frame.pos.x,    frame.pos.y,    frame.pos.z).add(alignPan);
        const t1 = new THREE.Vector3(frame.target.x, frame.target.y, frame.target.z).add(alignPan);
        const t_start = performance.now();
        const tick = (now) => {
            const raw  = Math.min((now - t_start) / durationMs, 1);
            const ease = raw < 0.5 ? 2 * raw * raw : -1 + (4 - 2 * raw) * raw;
            this.camera.position.lerpVectors(p0, p1, ease);
            this.controls.target.lerpVectors(t0, t1, ease);
            this.controls.update();
            this.onNeedRender();
            if (raw < 1) {
                this._flyRaf = requestAnimationFrame(tick);
            } else {
                this._flyRaf = null;
                this._logAlign(frame, strings);  // vérification log + overlay, sans bouger
            }
        };
        this._flyRaf = requestAnimationFrame(tick);
    }

    // Calcule le vecteur de pan nécessaire pour centrer l'ancre sur frame.screen,
    // en simulant la caméra à frame.pos/target sans la déplacer réellement.
    _computeAlignPan (frame, strings = null) {
        if (!frame.screen) return new THREE.Vector3();
        const { cx = 0.5, cy = 0.5 } = frame.screen;
        const tNdcX = cx * 2 - 1;
        const tNdcY = -(cy * 2 - 1);

        // Ancre = milieu des coins de frettes ou frame.target
        let anchor;
        if (strings && frame.frets) {
            const f  = frame.frets;
            const p1 = strings[f.strMin].fingerprints[f.fretIdx1];
            const p2 = strings[f.strMax].fingerprints[f.fretIdx2];
            anchor = new THREE.Vector3(
                (p1.x + p2.x) / 2, (p1.y + p2.y) / 2, (p1.z + p2.z) / 2,
            );
        } else {
            anchor = new THREE.Vector3(frame.target.x, frame.target.y, frame.target.z);
        }

        // Simule la vue depuis frame.pos regardant frame.target
        const camPos  = new THREE.Vector3(frame.pos.x,    frame.pos.y,    frame.pos.z);
        const viewDir = new THREE.Vector3(frame.target.x, frame.target.y, frame.target.z)
            .sub(camPos).normalize();
        // right = vecteur droit caméra
        const right  = new THREE.Vector3().crossVectors(viewDir, this.camera.up).normalize();
        // camUp = vecteur haut réel de la vue, orthogonal à viewDir
        // (this.camera.up n'est pas perpendiculaire à viewDir quand la caméra est inclinée)
        const camUp  = new THREE.Vector3().crossVectors(right, viewDir).normalize();

        // Projection manuelle de l'ancre depuis cette position simulée
        const toAnchor = anchor.clone().sub(camPos);
        const depth    = toAnchor.dot(viewDir);
        const halfH    = Math.tan(this.camera.fov * Math.PI / 360) * Math.max(depth, 0.01);
        const halfW    = halfH * this.camera.aspect;
        const ndcX     = toAnchor.dot(right) / halfW;
        const ndcY     = toAnchor.dot(camUp)  / halfH;  // camUp orthogonal à viewDir

        const errX = ndcX - tNdcX;
        const errY = ndcY - tNdcY;
        return right.clone().multiplyScalar(errX * halfW)
            .addScaledVector(camUp, errY * halfH);
    }

    // Log + overlay post-animation (vérification uniquement, sans mouvement caméra).
    _logAlign (frame, strings = null) {
        if (!frame.screen) return;
        const { cx = 0.5, cy = 0.5 } = frame.screen;
        const tNdcX = cx * 2 - 1;
        const tNdcY = -(cy * 2 - 1);

        let anchor;
        if (strings && frame.frets) {
            const f  = frame.frets;
            const p1 = strings[f.strMin].fingerprints[f.fretIdx1];
            const p2 = strings[f.strMax].fingerprints[f.fretIdx2];
            anchor = new THREE.Vector3(
                (p1.x + p2.x) / 2, (p1.y + p2.y) / 2, (p1.z + p2.z) / 2,
            );
        } else {
            anchor = new THREE.Vector3(frame.target.x, frame.target.y, frame.target.z);
        }

        this.camera.updateMatrixWorld();
        const ndc     = anchor.clone().project(this.camera);
        const reached = { cx: (ndc.x + 1) / 2, cy: (1 - ndc.y) / 2 };
        if (!this._debug) return;
        console.log(`[Cameraman] ${frame.id} — cible: cx=${cx.toFixed(3)} cy=${cy.toFixed(3)} | atteint: cx=${reached.cx.toFixed(3)} cy=${reached.cy.toFixed(3)}`);
        this._debugOverlay(frame.id, cx, cy, reached.cx, reached.cy);
    }

    // Sphères debug 3D : coin 1 (bleu) + coin 2 (orange) de la boîte de frettes.
    // Remplacées à chaque flyTo.
    _debugSpheres (frame, strings = null) {
        if (!this._debug || !this.scene) return;
        this._debugMeshes.forEach(m => {
            this.scene.remove(m);
            m.geometry.dispose();
            m.material.dispose();
        });
        this._debugMeshes = [];

        const mkSphere = (pos, color) => {
            const mesh = new THREE.Mesh(
                new THREE.SphereGeometry(0.008, 10, 8),
                new THREE.MeshBasicMaterial({ color, depthTest: false })
            );
            mesh.position.set(pos.x, pos.y, pos.z);
            mesh.renderOrder = 999;
            this.scene.add(mesh);
            this._debugMeshes.push(mesh);
        };

        if (strings && frame.frets) {
            const f = frame.frets;
            const p1 = strings[f.strMin].fingerprints[f.fretIdx1];
            const p2 = strings[f.strMax].fingerprints[f.fretIdx2];
            mkSphere(p1, 0x4488ff);  // bleu   — coin strMin/fretIdx1
            mkSphere(p2, 0xff8800);  // orange — coin strMax/fretIdx2
        } else {
            mkSphere(frame.pos,    0x4488ff);
            mkSphere(frame.target, 0xff8800);
        }
    }

    // Overlay debug : rectangle englobant le point cible (vert) et le point atteint (rouge)
    // + croix sur chacun. Disparaît après 4 secondes.
    _debugOverlay (frameId, tcx, tcy, rcx, rcy) {
        const prev = document.getElementById('cam-debug-overlay');
        if (prev) prev.remove();

        const W = window.innerWidth, H = window.innerHeight;
        // Pixels des deux points
        const tx = tcx * W, ty = tcy * H;  // cible (vert)
        const rx = rcx * W, ry = rcy * H;  // atteint (rouge)

        const minX = Math.min(tx, rx) - 12, maxX = Math.max(tx, rx) + 12;
        const minY = Math.min(ty, ry) - 12, maxY = Math.max(ty, ry) + 12;

        const ov = document.createElement('div');
        ov.id = 'cam-debug-overlay';
        Object.assign(ov.style, {
            position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999,
        });

        const mkCross = (x, y, color) => {
            const s = `position:absolute;background:${color};pointer-events:none;`;
            const h = document.createElement('div');
            h.style.cssText = s + `left:${x-10}px;top:${y-1}px;width:20px;height:2px;`;
            const v = document.createElement('div');
            v.style.cssText = s + `left:${x-1}px;top:${y-10}px;width:2px;height:20px;`;
            ov.appendChild(h); ov.appendChild(v);
        };

        // Rectangle englobant
        const box = document.createElement('div');
        Object.assign(box.style, {
            position: 'absolute',
            left: `${minX}px`, top: `${minY}px`,
            width: `${maxX - minX}px`, height: `${maxY - minY}px`,
            border: '1px dashed #fff8',
            boxSizing: 'border-box',
            pointerEvents: 'none',
        });
        ov.appendChild(box);

        mkCross(tx, ty, '#00ff88');  // cible  — vert
        mkCross(rx, ry, '#ff4444');  // atteint — rouge

        // Label
        const lbl = document.createElement('div');
        Object.assign(lbl.style, {
            position: 'absolute', left: `${minX}px`, top: `${minY - 18}px`,
            color: '#fff', fontSize: '11px', fontFamily: 'monospace',
            background: '#0008', padding: '1px 4px', borderRadius: '3px',
            whiteSpace: 'nowrap',
        });
        lbl.textContent = `${frameId}  ●cible(${tcx.toFixed(2)},${tcy.toFixed(2)})  ●atteint(${rcx.toFixed(2)},${rcy.toFixed(2)})`;
        ov.appendChild(lbl);

        document.body.appendChild(ov);
        setTimeout(() => ov.remove(), 4000);
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
        this.cameraman.scene = this.scene;


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

        this.scene.add( new THREE.HemisphereLight( 0xcccccc, 0x7777aa ) );

        this.addShadowedLight(  1,   1,  1, 0xffffff, 1.4 );
        this.addShadowedLight(  0.5, 1, -1, 0xffffff, 1.2 );
        this.addShadowedLight( -1,   0.5, 0.5, 0xfff4e0, 0.5 );
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
    _makeSpruceTexture () {
        const tex = new THREE.TextureLoader().load('assets/wood-42.png', () => {
            tex.needsUpdate = true;
            this.render();
        });
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(1, 2);
        return tex;
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
                const spruceTexture = this._makeSpruceTexture();
                object.traverse( function ( child )
                {
                    if ( child instanceof THREE.Mesh )
                    {
                        child.material.side = THREE.DoubleSide;
                        child.castShadow = true;
                        child.receiveShadow = true;
                        if (child.name == "frame" || child.name == "vitrages")
                        {
                            child.material.side = THREE.DoubleSide;
                        }
                        if (child.name === 'guitar.top')
                        {
                            // pas de vt dans l'OBJ — projection planaire XY depuis la bbox
                            child.geometry.computeBoundingBox();
                            const bb  = child.geometry.boundingBox;
                            const pos = child.geometry.attributes.position;
                            const uv  = new Float32Array(pos.count * 2);
                            const rX  = 1 / (bb.max.x - bb.min.x);
                            const rY  = 1 / (bb.max.y - bb.min.y);
                            for (let i = 0; i < pos.count; i++) {
                                uv[i * 2]     = (pos.getX(i) - bb.min.x) * rX;
                                uv[i * 2 + 1] = (pos.getY(i) - bb.min.y) * rY;
                            }
                            child.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
                            child.material = new THREE.MeshPhongMaterial({
                                map: spruceTexture,
                                side: THREE.DoubleSide,
                                shininess: 60,
                                specular: new THREE.Color(0x553322),
                            });
                        }
                    }
                }.bind(this) );
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
                elem.innerHTML = '<i class="icon-sliders"></i> Guitar Lab <span class="app-version">1.9.5.6</span>';
            }
        }
    }
    onError ( xhr ) {
    }
    onWindowResize() {
        // Différer pour laisser le navigateur finaliser les dimensions après rotation
        clearTimeout(this._resizeTimer);
        this._resizeTimer = setTimeout(() => {
            this.cameraman.resize( window.innerWidth, window.innerHeight );
            this.renderer.setSize( window.innerWidth, window.innerHeight * this.cameraman.viewRatio );
            if (this.cameraman._activeFrame) {
                this.cameraman.flyTo(this.cameraman._activeFrame, 0, this.cameraman._activeStrings);
            }
            this.render();
        }, 150);
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
    getView ()            { return this.cameraman.getView(); }
    setView (v)           { this.cameraman.setView(v); }
    onViewChange (cb)     { this.cameraman.onViewChange(cb); }
    flyTo (frame, ms)     { this.cameraman.flyTo(frame, ms, this.strings); }
    clearZone ()          { this.cameraman.camera.clearViewOffset(); this.cameraman.camera.updateProjectionMatrix(); }
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
    clear () {
        const prefix = this.ns + ':';
        Object.keys(localStorage)
            .filter(k => k.startsWith(prefix))
            .forEach(k => localStorage.removeItem(k));
    }
    exportAll (exclude = []) {
        const prefix = this.ns + ':';
        const out = {};
        Object.keys(localStorage)
            .filter(k => k.startsWith(prefix) && !exclude.includes(k.slice(prefix.length)))
            .forEach(k => { out[k.slice(prefix.length)] = JSON.parse(localStorage.getItem(k)); });
        return out;
    }
    importAll (data, exclude = []) {
        Object.entries(data)
            .filter(([k]) => !exclude.includes(k))
            .forEach(([k, v]) => this.set(k, v));
    }
}

// ── UXPanel : classe de base pour chaque panneau de la pile ─────────────────
class UXPanel {
    constructor (id, label, icon, fullLabel = null) {
        this.id        = id;
        this.label     = label;
        this.icon      = icon;
        this.fullLabel = fullLabel;
        this.expanded = false;
        this._stack   = null;   // injecté par UXStack
        this._panelEl = null;
        this._btnEl   = null;
        this._contentEl = null;
        this._mounted = false;
    }
    // à surcharger : monte le contenu dans container (appelé une seule fois)
    mountContent (container) {}
    // à surcharger : appelé à chaque fois que le panneau est déplié
    onExpanded () {}
    // à surcharger : appelé à chaque fois que le panneau est replié
    onCollapsed () {}

    getPanel () {
        if (!this._panelEl) {
            this._panelEl = document.createElement('div');
            this._panelEl.className = 'ux-panel';
            const header = document.createElement('div');
            header.className = 'ux-panel-header';
            header.innerHTML = `<i class="${this.icon}"></i><span>${this.fullLabel || this.label}</span>`;
            header.addEventListener('click', () => this._stack && this._stack.collapse(this));
            this._panelEl.appendChild(header);
            this._contentEl = document.createElement('div');
            this._contentEl.className = 'ux-panel-content';
            this._panelEl.appendChild(this._contentEl);
        }
        if (!this._mounted) {
            this.mountContent(this._contentEl);
            this._mounted = true;
        }
        this.onExpanded();
        return this._panelEl;
    }

    getButton () {
        if (!this._btnEl) {
            this._btnEl = document.createElement('button');
            this._btnEl.className = 'ux-panel-btn';
            this._btnEl.innerHTML = `<i class="${this.icon}"></i><span>${this.label}</span>`;
            this._btnEl.addEventListener('click', () => this._stack && this._stack.expand(this));
        }
        return this._btnEl;
    }
}

// ── Panneaux ─────────────────────────────────────────────────────────────────
class PanelBibliotheque extends UXPanel {
    constructor (chordwizard) {
        super('bibliotheque', 'Bibliothèque', 'icon-attach-2', 'Bibliothèque de jeux d\'accords');
        this.chordwizard = chordwizard;
    }
    mountContent (container) {
        const favctnr = document.createElement('div');
        favctnr.id = 'fav-ctnr';
        container.appendChild(favctnr);
        this.chordwizard.mountPinBoard(favctnr);
    }
}

class PanelCatalogue extends UXPanel {
    constructor (chordwizard, computedguitar, groundrender, storage) {
        super('catalogue', 'Catalogue', 'icon-book', 'Catalogue d\'accords');
        this.chordwizard    = chordwizard;
        this.computedguitar = computedguitar;
        this.groundrender   = groundrender;
        this.storage        = storage;
        this._catalogContent = null;
    }
    mountContent (container) {
        this._catalogContent = document.createElement('div');
        container.appendChild(this._catalogContent);
    }
    onExpanded () {
        if (!this._catalogContent) return;
        this.chordwizard.printCatalog(
            this._catalogContent,
            (voicing) => {
                for (let i = 0; i < voicing.frets.length; i++)
                    this.computedguitar.strings[i].forcehold(voicing.frets[i]);
                this.groundrender.render();
            },
            this.storage
        );
    }
}

class PanelPartitions extends UXPanel {
    constructor (partitions) {
        super('partitions', 'Séquenceur', 'icon-note-beamed');
        this.partitions = partitions;
        this._partitionsContent = null;
    }
    mountContent (container) {
        this._partitionsContent = document.createElement('div');
        this._partitionsContent.id = 'partitions-content';
        container.appendChild(this._partitionsContent);
    }
    onExpanded () {
        if (this._partitionsContent && !this.partitions._domdest)
            this.partitions.mount(this._partitionsContent);
    }
}

class PanelParametres extends UXPanel {
    constructor (storage) {
        super('parametres', 'Paramètres', 'icon-cog-alt');
        this.storage = storage;
    }
    mountContent (container) {
        const resetBtn = document.createElement('button');
        resetBtn.className = 'settings-link settings-link--danger';
        resetBtn.innerHTML = '<i class="icon-trash"></i> Réinitialiser l\'application';
        resetBtn.addEventListener('click', () => {
            if (!confirm('Effacer toutes les données et recharger l\'application ?')) return;
            this.storage.clear();
            location.reload();
        });
        container.appendChild(resetBtn);

        const exportBtn = document.createElement('button');
        exportBtn.className = 'settings-link';
        exportBtn.innerHTML = '<i class="icon-doc"></i> Exporter la session';
        exportBtn.addEventListener('click', () => {
            if (this._stack) this._stack.collapse(this);
            const data = this.storage.exportAll(['partitions']);
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'guitarlab-session.json';
            a.click();
            URL.revokeObjectURL(url);
        });
        container.appendChild(exportBtn);

        const importLabel = document.createElement('label');
        importLabel.className = 'settings-link';
        importLabel.innerHTML = '<i class="icon-folder-open-empty"></i> Charger une session';
        const importInput = document.createElement('input');
        importInput.type = 'file';
        importInput.accept = '.json,application/json';
        importInput.style.display = 'none';
        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    this.storage.importAll(data, ['partitions']);
                    location.reload();
                } catch { alert('Fichier de session invalide.'); }
            };
            reader.readAsText(file);
            importInput.value = '';
        });
        importLabel.appendChild(importInput);
        container.appendChild(importLabel);
    }
}

class PanelReperes extends UXPanel {
    constructor () {
        super('notation', 'Notation', 'icon-help', 'Système de notation');
    }
    mountContent (container) {
        container.id = 'notation-content';

        const INTERVALS = [
            { key: 'r',  label: 'R',  name: 'Tonique'              },
            { key: 'b2', label: 'b2', name: '2de mineure'          },
            { key: '2',  label: '2',  name: '2de majeure'          },
            { key: 'b3', label: 'b3', name: '3ce mineure'          },
            { key: '3',  label: '3',  name: '3ce majeure'          },
            { key: '4',  label: '4',  name: '4te juste'            },
            { key: 'b5', label: 'b5', name: 'Triton'               },
            { key: '5',  label: '5',  name: '5te juste'            },
            { key: 'm5', label: '#5', name: '5te augmentée'        },
            { key: '6',  label: '6',  name: '6te majeure'          },
            { key: 'b7', label: 'b7', name: '7ème mineure'         },
            { key: '7',  label: '7',  name: '7ème majeure'         },
        ];

        const BADGES = [
            { sym: '▬', label: 'pas de corde mutée intérieure' },
            { sym: '▲', label: 'triade stricte (3 cordes consécutives)' },
            { sym: '△', label: 'triade avec discontinuité' },
            { sym: '◇', label: 'aucune note répétée' },
        ];

        const section = (title) => {
            const el = document.createElement('div');
            el.className = 'reperes-section-title';
            el.textContent = title;
            container.appendChild(el);
        };

        // ── intervalles — forme complète ──
        section('Intervalles — forme complète');
        const rowFull = document.createElement('div');
        rowFull.className = 'reperes-row';
        INTERVALS.forEach(({ key, label, name }) => {
            const cell = document.createElement('div');
            cell.className = 'reperes-cell';
            cell.innerHTML = `<i class="icon-it-${key}"></i><span class="reperes-cell-label">${label}</span><span class="reperes-cell-name">${name}</span>`;
            rowFull.appendChild(cell);
        });
        container.appendChild(rowFull);

        // ── intervalles — forme manche ──
        section('Intervalles — forme manche');
        const rowNeck = document.createElement('div');
        rowNeck.className = 'reperes-row';
        INTERVALS.forEach(({ key, label }) => {
            const nkey = key === 'r' ? 'root' : key;
            const cell = document.createElement('div');
            cell.className = 'reperes-cell';
            cell.innerHTML = `<i class="icon-nit-${nkey}"></i><span class="reperes-cell-label">${label}</span>`;
            rowNeck.appendChild(cell);
        });
        container.appendChild(rowNeck);

        // ── qualificatifs de voicing ──
        section('Qualificatifs de voicing');
        const badgeList = document.createElement('div');
        badgeList.className = 'reperes-badges';
        BADGES.forEach(({ sym, label }) => {
            const item = document.createElement('div');
            item.className = 'reperes-badge-item';
            item.innerHTML = `<span class="reperes-badge-sym">${sym}</span><span class="reperes-badge-label">${label}</span>`;
            badgeList.appendChild(item);
        });
        container.appendChild(badgeList);
    }
}

// ── PanelEcoute : visualiseur micro + détection de note ──────────────────────
class PanelEcoute extends UXPanel {
    constructor () {
        super('ecoute', 'Accordeur', 'icon-mic', 'Accordeur');
        this._stream     = null;
        this._audioCtx   = null;
        this._analyser   = null;
        this._source     = null;
        this._rafId      = null;
        this._active     = false;
        this._canvas     = null;
        this._toggleBtn  = null;
        this._noteEl     = null;
        this._centsEl    = null;
        this._needleEl   = null;
        this._timeBuf    = null;
        this._freqBuf    = null;
        this._freqHist   = [];
        this._showViz    = false;  // visualiseur désactivé par défaut
        this._vizBtn     = null;
    }

    mountContent (container) {
        container.id = 'ecoute-content';

        this._toggleBtn = document.createElement('a');
        this._toggleBtn.className = 'settings-link';
        this._toggleBtn.innerHTML = '<i class="icon-mic"></i><span>Activer le micro</span>';
        this._toggleBtn.addEventListener('click', () => this._toggle());
        container.appendChild(this._toggleBtn);

        this._vizBtn = document.createElement('a');
        this._vizBtn.className = 'settings-link';
        this._vizBtn.innerHTML = '<i class="icon-sliders"></i><span>Afficher le visualiseur</span>';
        this._vizBtn.addEventListener('click', () => {
            this._showViz = !this._showViz;
            this._vizBtn.innerHTML = `<i class="icon-sliders"></i><span>${this._showViz ? 'Masquer' : 'Afficher'} le visualiseur</span>`;
            this._canvas.style.display = this._showViz ? 'block' : 'none';
        });
        container.appendChild(this._vizBtn);

        // affichage note + cents
        const noteRow = document.createElement('div');
        noteRow.id = 'ecoute-note';
        this._noteEl  = document.createElement('span');
        this._noteEl.className = 'en-note';
        this._noteEl.textContent = '—';
        this._centsEl = document.createElement('span');
        this._centsEl.className = 'en-cents';
        noteRow.appendChild(this._noteEl);
        noteRow.appendChild(this._centsEl);
        container.appendChild(noteRow);

        // aiguille accordeur
        const needle = document.createElement('div');
        needle.id = 'ecoute-needle';
        // graduations : bornes ±50¢, zone verte ±10¢, centre 0¢
        [
            { pct:   0, cls: 'en-grad-bound' },
            { pct:  40, cls: 'en-grad-zone'  },  // -10¢
            { pct:  50, cls: 'en-grad-center'},  //   0¢
            { pct:  60, cls: 'en-grad-zone'  },  // +10¢
            { pct: 100, cls: 'en-grad-bound' },
        ].forEach(({ pct, cls }) => {
            const g = document.createElement('span');
            g.className = 'en-grad ' + cls;
            g.style.left = pct + '%';
            needle.appendChild(g);
        });
        this._needleEl = document.createElement('div');
        this._needleEl.id = 'ecoute-needle-cursor';
        needle.appendChild(this._needleEl);
        container.appendChild(needle);

        // canvas EQ (caché par défaut)
        this._canvas = document.createElement('canvas');
        this._canvas.id = 'ecoute-canvas';
        this._canvas.style.display = 'none';
        container.appendChild(this._canvas);
    }

    onExpanded () {
        if (this._canvas) {
            this._canvas.width  = this._canvas.offsetWidth || 300;
            this._canvas.height = 56;
        }
        if (this._active && !this._rafId) this._draw();
    }

    onCollapsed () {
        if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
    }

    async _toggle () {
        if (this._active) this._stop();
        else await this._start();
    }

    async _start () {
        try {
            this._stream   = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            this._audioCtx = new AudioContext();
            this._analyser = this._audioCtx.createAnalyser();
            this._analyser.fftSize         = 2048;
            this._analyser.smoothingTimeConstant = 0.5;
            this._timeBuf  = new Float32Array(this._analyser.fftSize);
            this._freqBuf  = new Uint8Array(this._analyser.frequencyBinCount);
            this._source   = this._audioCtx.createMediaStreamSource(this._stream);
            this._source.connect(this._analyser);
            this._active   = true;
            this._freqHist = [];
            this._toggleBtn.innerHTML = '<i class="icon-mic"></i><span>Désactiver le micro</span>';
            this._draw();
        } catch (e) {
            console.warn('Micro non disponible :', e);
        }
    }

    _stop () {
        if (this._rafId)    { cancelAnimationFrame(this._rafId); this._rafId = null; }
        if (this._source)   { this._source.disconnect(); this._source = null; }
        if (this._audioCtx) { this._audioCtx.close();    this._audioCtx = null; }
        if (this._stream)   { this._stream.getTracks().forEach(t => t.stop()); this._stream = null; }
        this._analyser = null;
        this._active   = false;
        this._freqHist = [];
        this._toggleBtn.innerHTML = '<i class="icon-mic"></i><span>Activer le micro</span>';
        this._noteEl.textContent  = '—';
        this._centsEl.textContent = '';
        this._centsEl.className   = 'en-cents';
        if (this._needleEl) this._needleEl.style.left = '50%';
        if (this._canvas) {
            const ctx = this._canvas.getContext('2d');
            ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        }
    }

    _draw () {
        if (!this._active || !this._analyser) return;
        this._rafId = requestAnimationFrame(() => this._draw());

        // ── EQ (optionnel) ───────────────────────────────────────────────────
        if (this._showViz) {
            const canvas = this._canvas;
            const W = canvas.offsetWidth || 300;
            if (canvas.width !== W) canvas.width = W;
            const H   = canvas.height;
            const ctx = canvas.getContext('2d');
            this._analyser.getByteFrequencyData(this._freqBuf);
            ctx.clearRect(0, 0, W, H);
            const bins = Math.min(128, this._freqBuf.length);
            const barW = W / bins;
            for (let i = 0; i < bins; i++) {
                const v = this._freqBuf[i] / 255;
                const h = v * H;
                ctx.fillStyle = 'rgba(0,0,0,0.75)';
                ctx.fillRect(i * barW, 0, Math.max(barW - 1, 1), h);
            }
        }

        // ── Pitch ────────────────────────────────────────────────────────────
        this._analyser.getFloatTimeDomainData(this._timeBuf);
        const freq = this._detectPitch(this._timeBuf, this._audioCtx.sampleRate);

        if (freq > 0) {
            // lissage : moyenne des 6 dernières valeurs
            this._freqHist.push(freq);
            if (this._freqHist.length > 6) this._freqHist.shift();
            const smoothed = this._freqHist.reduce((a, b) => a + b, 0) / this._freqHist.length;
            const { name, cents } = this._freqToNote(smoothed);
            this._noteEl.textContent  = name;
            const sign = cents >= 0 ? '+' : '';
            this._centsEl.textContent = `${sign}${cents}¢`;
            const absCents = Math.abs(cents);
            this._centsEl.className   = 'en-cents ' + (absCents < 10 ? 'en-cents--good' : absCents < 25 ? 'en-cents--warn' : 'en-cents--bad');
            // aiguille : 0 cents → 50%, ±50 cents → 0% / 100%
            const pos = 50 + (cents / 50) * 50;
            this._needleEl.style.left = `${Math.max(2, Math.min(98, pos))}%`;
        } else {
            this._freqHist = [];
            this._noteEl.textContent  = '—';
            this._centsEl.textContent = '';
            this._centsEl.className   = 'en-cents';
            this._needleEl.style.left = '50%';
        }
    }

    _detectPitch (buf, sampleRate) {
        // vérification silence
        let rms = 0;
        for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
        if (Math.sqrt(rms / buf.length) < 0.015) return -1;

        const half = Math.floor(buf.length / 2);
        // autocorrélation
        const corr = new Float32Array(half);
        for (let lag = 0; lag < half; lag++) {
            let sum = 0;
            for (let i = 0; i < half; i++) sum += buf[i] * buf[i + lag];
            corr[lag] = sum;
        }

        // sauter le pic initial (lag 0), trouver le premier creux puis le premier pic
        let d = 1;
        while (d < half - 1 && corr[d] > corr[d - 1]) d++;
        while (d < half - 1 && corr[d] < corr[d - 1]) d++;
        if (d >= half - 1) return -1;

        let maxVal = -Infinity, maxPos = d;
        for (let i = d; i < half; i++) {
            if (corr[i] > maxVal) { maxVal = corr[i]; maxPos = i; }
        }

        // confiance minimale
        if (corr[0] === 0 || maxVal / corr[0] < 0.5) return -1;

        // interpolation parabolique pour précision sub-sample
        const y1 = maxPos > 0     ? corr[maxPos - 1] : corr[maxPos];
        const y2 = corr[maxPos];
        const y3 = maxPos < half - 1 ? corr[maxPos + 1] : corr[maxPos];
        const delta = (y3 - y1) / (2 * (2 * y2 - y1 - y3)) || 0;

        return sampleRate / (maxPos + delta);
    }

    _freqToNote (freq) {
        const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
        const semitones  = 12 * Math.log2(freq / 440) + 57; // 57 = A4 est le 57e demi-ton depuis C0
        const rounded    = Math.round(semitones);
        const cents      = Math.round((semitones - rounded) * 100);
        const octave     = Math.floor(rounded / 12);
        const name       = NOTE_NAMES[((rounded % 12) + 12) % 12] + octave;
        return { name, cents };
    }
}

// ── UXStack : gestionnaire de la pile ────────────────────────────────────────
class UXStack {
    constructor (storage) {
        this.storage        = storage;
        this.panels         = [];
        this._expandedArea  = null;
        this._collapsedArea = null;
    }

    add (panel) {
        panel._stack = this;
        this.panels.push(panel);
    }

    mount (parent) {
        this._expandedArea = document.createElement('div');
        this._expandedArea.id = 'ux-expanded';
        this._collapsedArea = document.createElement('div');
        this._collapsedArea.id = 'ux-collapsed';
        parent.appendChild(this._expandedArea);
        parent.appendChild(this._collapsedArea);

        const saved = this.storage.get('ux-stack', null);
        if (saved) {
            const ordered = [];
            (saved.order || []).forEach(id => {
                const p = this.panels.find(p => p.id === id);
                if (p) { p.expanded = saved.states?.[id] ?? false; ordered.push(p); }
            });
            this.panels.forEach(p => { if (!ordered.includes(p)) ordered.push(p); });
            this.panels = ordered;
        }

        this._render();
    }

    expand (panel) {
        panel.expanded = true;
        this.panels = [panel, ...this.panels.filter(p => p !== panel)];
        this._save();
        this._render();
    }

    collapse (panel) {
        panel.expanded = false;
        panel.onCollapsed();
        const expanded  = this.panels.filter(p => p.expanded);
        const collapsed = this.panels.filter(p => !p.expanded && p !== panel);
        this.panels = [...expanded, panel, ...collapsed];
        this._save();
        this._render();
    }

    _render () {
        this._expandedArea.innerHTML = '';
        this._collapsedArea.innerHTML = '';
        this.panels.forEach(p => {
            if (p.expanded) this._expandedArea.appendChild(p.getPanel());
            else            this._collapsedArea.appendChild(p.getButton());
        });
    }

    _save () {
        this.storage.set('ux-stack', {
            order:  this.panels.map(p => p.id),
            states: Object.fromEntries(this.panels.map(p => [p.id, p.expanded]))
        });
    }
}

// la classe application utilisera différentes instances des objets précédents. le lancement complet de l'application intervient a l'appel de son constructeur.
class Application {
  constructor (onReady = () => {}, guitardef = null) {
        this._guitardef = guitardef;
        this.storage = new AppStorage();
        this._orientKey = () => window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
        this.appbody = document.createElement('div');
        this.appbody.id = 'app-body';
        document.body.appendChild (this.appbody);
        this.appstamp = document.createElement('div');
        this.appstamp.id = 'app-stamp';
        this.appstamp.innerHTML = '<i class="icon-sliders"></i> Guitar Lab <span class="app-version">1.9.5.6</span>';
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
                // cadrage 1–18 systématique au lancement
                const fullFrame = CAMERA_FRAMES.find(f => f.id === 'full');
                if (fullFrame) this.groundrender.flyTo(fullFrame, 800, this.groundrender.strings);
                // sauvegarder à chaque mouvement de caméra
                this.groundrender.onViewChange(() => {
                    const views = this.storage.get('camera-views', {});
                    views[this._orientKey()] = this.groundrender.getView();
                    this.storage.set('camera-views', views);
                });
                // cadrage 1–18 systématique au changement d'orientation
                window.matchMedia('(orientation: portrait)').addEventListener('change', () => {
                    if (fullFrame) this.groundrender.flyTo(fullFrame, 600, this.groundrender.strings);
                });
                // boutons de cadrage
                this._buildCameraFrameButtons();
            }
        );
        this.ux = document.createElement('div');
        this.ux.id = 'ux';
        this.appbody.appendChild(this.ux);

        this.onairchord = document.createElement('div');
        this.onairchord.id = 'onair-chord';
        this.ux.appendChild(this.onairchord);

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

        const sguitar = this._guitardef;
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
            (chord) => { for (let i = 0; i < chord.frets.length; i++) this.computedguitar.strings[i].forcehold(chord.frets[i]); this.groundrender.render(); },
            onStateChange
        );
        // ── restauration on-air ──
        const savedFrets = this.storage.get('onair-frets', null);
        if (savedFrets) {
            for (let i = 0; i < savedFrets.length; i++)
                this.computedguitar.strings[i].forcehold(savedFrets[i]);
        } else {
            // Première utilisation : La mineur x 0 2 2 1 0
            ['x', 0, 2, 2, 1, 0].forEach((f, i) => this.computedguitar.strings[i].forcehold(f));
        }
        // Initialise le panel on-air dès le démarrage (première utilisation incluse)
        onStateChange();

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
            frets: sguitar.stringdefs[0].nfret
        });

        // ── Partitions ────────────────────────────────────────────────────────
        this.partitions = new PartitionManager(() => this.computedguitar.strings);
        this.partitions.applyChord = (chord) => {
            for (let i = 0; i < chord.frets.length; i++)
                this.computedguitar.strings[i].forcehold(chord.frets[i]);
            onStateChange();
            this.groundrender.render();
        };
        this.partitions.getCurrentChord = () => {
            const res = this.chordwizard._result;
            if (!res || res.notes.length === 0) return null;
            if (res.founded.length > 0) return res.founded[0].chord;
            return new Chord(res.frets, '?', '', '', '', '', res.notes.map(n => n.octavednote), []);
        };

        const savedPartitions = this.storage.get('partitions', null);
        if (savedPartitions) this.partitions.data = savedPartitions;
        this.partitions.onStateChange = () => { this.storage.set('partitions', this.partitions.data); };

        // ── UXStack ───────────────────────────────────────────────────────────
        this.uxstack = new UXStack(this.storage);
        this.uxstack.add(new PanelBibliotheque(this.chordwizard));
        this.uxstack.add(new PanelCatalogue(this.chordwizard, this.computedguitar, this.groundrender, this.storage));
        this.uxstack.add(new PanelPartitions(this.partitions));
        this.uxstack.add(new PanelEcoute());
        this.uxstack.add(new PanelParametres(this.storage));
        this.uxstack.add(new PanelReperes());
        this.uxstack.mount(this.ux);

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
            if (!p) return;
            requestAnimationFrame(() => {
                const r = pluckWrap.getBoundingClientRect();
                // support format normalisé {rx, ry} et legacy {left, top}
                const rawLeft = p.rx !== undefined ? p.rx * window.innerWidth  : parseFloat(p.left);
                const rawTop  = p.ry !== undefined ? p.ry * window.innerHeight : parseFloat(p.top);
                const left = Math.min(Math.max(0, rawLeft), window.innerWidth  - r.width);
                const top  = Math.min(Math.max(0, rawTop),  window.innerHeight - r.height);
                pluckWrap.style.left   = left + 'px';
                pluckWrap.style.top    = top  + 'px';
                pluckWrap.style.bottom = 'auto';
            });
        };
        const savePluckPos = () => {
            const r = pluckWrap.getBoundingClientRect();
            const pos = this.storage.get('pluck-pos', {});
            pos[this._orientKey()] = {
                rx: r.left / window.innerWidth,
                ry: r.top  / window.innerHeight,
            };
            this.storage.set('pluck-pos', pos);
        };
        applyPluckPos();
        window.matchMedia('(orientation: portrait)').addEventListener('change', () => setTimeout(applyPluckPos, 150));

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
    _buildCameraFrameButtons () {
        const strip = document.createElement('div');
        strip.id = 'cam-frames';

        // bouton "Libre" — restaure la vue utilisateur et annule le zone offset
        const freeBtn = document.createElement('button');
        freeBtn.className = 'cam-frame-btn cam-frame-btn--active';
        freeBtn.textContent = '↺';
        freeBtn.title = 'Vue libre';
        freeBtn.addEventListener('click', () => {
            this.groundrender.cameraman._activeFrame = null;
            this.groundrender.clearZone();
            const v = this.storage.get('camera-views', {})[this._orientKey()];
            if (v) { this.groundrender.setView(v); this.groundrender.render(); }
            strip.querySelectorAll('.cam-frame-btn').forEach(b => b.classList.remove('cam-frame-btn--active'));
            freeBtn.classList.add('cam-frame-btn--active');
        });
        strip.appendChild(freeBtn);

        CAMERA_FRAMES.forEach(frame => {
            const btn = document.createElement('button');
            btn.className = 'cam-frame-btn';
            btn.textContent = frame.label;
            btn.title = frame.label;
            btn.addEventListener('click', () => {
                this.groundrender.flyTo(frame);
                strip.querySelectorAll('.cam-frame-btn').forEach(b => b.classList.remove('cam-frame-btn--active'));
                btn.classList.add('cam-frame-btn--active');
            });
            strip.appendChild(btn);
        });

        this.appbody.appendChild(strip);
    }

    start () {

    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const splash = document.getElementById('start');
    const hint   = document.getElementById('start-hint');

    // session par défaut si jamais initialisée
    if (!localStorage.getItem('guitarlab:ux-stack')) {
        try {
            const def = await fetch('default-session.json').then(r => r.json());
            Object.entries(def).forEach(([k, v]) => localStorage.setItem('guitarlab:' + k, JSON.stringify(v)));
        } catch {}
    }

    // charge la définition de guitare puis démarre l'app en arrière-plan
    const guitardef = await fetch('guitars/classique-6.json').then(r => r.json());
    window.application = new Application(() => {
        hint.classList.add('ready');
    }, guitardef);

    splash.addEventListener('click', () => {
        Tone.start();
        splash.classList.add('dissolve');
        splash.addEventListener('transitionend', () => splash.remove(), { once: true });
    }, true);
});
