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
        tl.innerHTML = 'print layer';
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

    constructor (domdest, onApplyChord = () => {}, onStateChange = () => {}) {
        this.onApplyChord = onApplyChord;
        this.onStateChange = onStateChange;
        this.domctnr = document.createElement('div');
        this.domctnr.classList.add('chord-set');
        domdest.appendChild(this.domctnr);
        this.pinnedchords = [];
    }
    pinchord (chord) {
      if ( this.has(chord))
        this.kickchord(chord);
      else {
        this.pinnedchords.push(chord);
        this.update();
      }
    }
    pushchord (chord) {
        this.onApplyChord(chord);
    }
    kickchord (chord) {
        //-console.log('kick chord');
        //-console.log(chord);
        let comp = chord.frets.join('');
        for (let i = 0; i < this.pinnedchords.length ; i++) {
          if ( this.pinnedchords[i].comp == comp )
            this.pinnedchords.splice(i, 1)
        }
        this.update();
    }

    has (chord) {
      for (let i = 0; i < this.pinnedchords.length; i++) {
        if ( this.pinnedchords[i].sameAs(chord) )
          return true
      }
      return false;
    }
    update () {
        this.domctnr.innerHTML = '';
        for (let i = 0; i < this.pinnedchords.length; i++) {
            let achord = document.createElement('div');
            achord.classList.add ('pinned-chord');
            //-console.log(this.pinnedchords[i]);
            let inner = this.pinnedchords[i].name+'<br><span class="small-2">'+this.pinnedchords[i].frets.join(' ')+'</span>';
            achord.innerHTML = inner;
            let ii = i;
            achord.addEventListener('click', function () {
                //-console.log(this);
                //-console.log(ii);
                //-console.log(this.pinnedchords);
                this.pushchord (this.pinnedchords[ii]);
            }.bind(this), true);
            this.domctnr.appendChild(achord);
        }
        this.onStateChange();
    }
}
class PluckPad {
    constructor (strings, domdest) {
        this.domctnr = document.createElement('div');
        this.domctnr.id ='PluckPad';
        this.domctnr.innerHTML = '';
        domdest.appendChild(this.domctnr);
        this.pads = [];
        this.strings = strings;
        //-console.log (this);
        //-console.log (strings);
        // Log events flag
        this.logEvents = false;

        // Touch Point cache
        this.tpCache = [];
        this.update();
    }
    pluck (string) {

         let timing = Tone.now();
         string.synth.triggerAttack(string.getstate().octavednote, timing);
           //     this.strings[i].synth.triggerAttack(this.strings[i].getstate().octavednote, timing);
    }
    update() {
      this.domctnr.innerHTML = '';
      for (let i = 0; i < this.strings.length; i++) {

            let ctnr = document.createElement('div');
            //ctnr.style.dispay = 'inine-block';
            ctnr.classList.add('p-pad');
            ctnr.style.flexGrow = "3";
            ctnr.style.textAlign = "center";
   /*ù         ctnr.style.background = "#fffa";
            ctnr.style.color = "#333";
            ctnr.style.textShadow = "0 0 0.15em #fff5";



            ctnr.style.marginLeft = "0.5em";
            ctnr.style.marginBottom = "0.5em";
      */      ctnr.style.lineHeight = "3em";

        /*/ Install event handlers for the given element
            ctnr.ontouchstart = this.start_handler;
            ctnr.ontouchmove = this.move_handler;
        // Use same handler for touchcancel and touchend
            ctnr.ontouchcancel = this.end_handler;
            ctnr.ontouchend = this.end_handler;
            */
         //   ctnr.ontouchstart = this.pluck;


            ctnr.addEventListener("touchstart", function (ev) {
                                //-console.log(ev);

                this.pluck(this.strings[i]);
            }.bind(this));


            ctnr.addEventListener("touchmove", function (ev) {
                //-console.log(ev)
             //   this.pluck(this.strings[i]);
            }.bind(this));

       /*     ctnr.addEventListener('click', function() {
                this.pluck(this.strings[i]);
            }.bind(this), false);*/
   /*       ctnr.addEventListener('mouseenter', function() {
                this.pluck(this.strings[i]);
            }.bind(this), false);*/



           // ctnr.style.width = '3em';
            //ctnr.style.height = '3em';
            ctnr.innerHTML = this.strings[i].getstate().octavednote;

            let apad = {
                string: this.strings[i],
                ctnr : ctnr

            }
            this.pads.push(apad);
            this.domctnr.appendChild(ctnr);

        }
    }
}
class ChordGuesser {

    constructor (domdest, computedguitar) {
        this.computedguitar = computedguitar;
        this.domctnr = document.createElement('div');
        this.domctnr.classList.add('sub-tool');
        domdest.appendChild(this.domctnr);

        this.favctnr = document.createElement('div');
     //   this.favctnr.innerHTML = '<i class="icon-star-1"></i> Chord Set';
        this.favctnr.classList.add('sub-tool');
        domdest.appendChild(this.favctnr);

        this.chordpinboard = new ChordPinBoard(
            this.favctnr,
            (chord) => { for (let i = 0; i < chord.frets.length; i++) this.computedguitar.strings[i].forcehold(chord.frets[i]); },
            () => this.description()
        );


        this.pickingpaterners = document.createElement('div');
        this.pickingpaterners.innerHTML = '<i class="icon-note-beamed"></i> Picking paterns';
        this.pickingpaterners.classList.add('sub-tool');
//        domdest.appendChild(this.pickingpaterners);

        this.dictionary = document.createElement('div');
        this.dictionary.innerHTML = '<i class="icon-book"></i> Dictionary';
        this.dictionary.classList.add('sub-tool');
 //       domdest.appendChild(this.dictionary);

        this.tuner = document.createElement('div');
        this.tuner.innerHTML = '<i class="icon-sliders"></i> Tuner';
        this.tuner.classList.add('sub-tool');
  //      domdest.appendChild(this.tuner);

        this.looper = document.createElement('div');
        this.looper.innerHTML = '<i class="icon-loop"></i> Looper';
        this.looper.classList.add('sub-tool');
 //       domdest.appendChild(this.looper);

        this.statebar = document.createElement('div');
        this.statebar.classList.add('statebar');
  //      domdest.appendChild(this.statebar);
    }
    description () {
        for (var j = 0; j < this.computedguitar.strings.length; j++) {
            this.computedguitar.strings[j].interval = undefined;
        }

        this.domctnr.innerHTML = '<i class="icon-note"></i> OnAir';
        this.domctnr.innerHTML = '';
        this.rawchord = this.computedguitar.getholdedstrings();

        this.rawnotes = [];
        for ( let i = 0 ; i < this.rawchord.length ; i++ ) {
            this.rawnotes.push(this.rawchord [i].octavednote);
        }
       // window.application.rollkeys.update(this.rawnotes);

        let basenotes = [];
        for ( let i = 0 ; i < this.rawchord.length ; i++ ) {
            if (basenotes.indexOf(this.rawchord[i].basenote) == -1)
                basenotes.push(this.rawchord[i].basenote);
        }
        let founded = [];

        this.statebar.innerHTML = '';


        for ( let i = 0 ; i < basenotes.length ; i++ )
        {
            let highscore = {chordtypeindex: -1, score: -1000};

            let its = [];

            let root = basenotes[i];
            for ( let j = 0 ; j < basenotes.length ; j++ ) {
                its.push(this.getinterval (root, basenotes[j] ));
            }
            for ( let k= 0 ; k < chordtypes.length ; k++ )
            {
                let tableau1 = chordtypes[k].intervals;
                let required = chordtypes[k].musthave;

                let intersection = tableau1.filter(val => its.includes(val));

                let missing = tableau1.filter(val => !its.includes(val));
                let mismatch = its.filter(val => !tableau1.includes(val));

                let score = intersection.length;
                if ( missing.length > 0 ) score *= 0.8;
                if ( missing.length > 1 ) score *= 0.8;
                if ( missing.length > 2 ) score *= 0.8;
                if ( mismatch.length > 0 ) score = 0;
                let fail = required.filter(val => missing.includes(val));
                if (fail.length > 0 ) score *= 0.0;
                if (its[0] == 'root') score *= 1.1;


                let bass = '';
                if ( its.indexOf('root') != 0 ) bass = '/'+basenotes[0];

                if (score>highscore.score && mismatch.length == 0)
                {
                    highscore.score = score;
                    highscore.chordtype = root+chordtypes[k].sym+bass;
                    highscore.type = chordtypes[k].sym;
                    highscore.desc = chordtypes[k].desc;

                    highscore.chordtypeindex = k;
                    highscore.root = root;
                    highscore.missing = missing;
                    highscore.matching = intersection;
                    highscore.bass = bass;
                }
            }
            if ( highscore.score > 0 )
            {
                let rawthings = this.computedguitar.getholdedstrings();
                let rawnotes = [];
                for (var j = 0; j < rawthings.length; j++) {
                    rawnotes.push(rawthings[j].octavednote);
                }
                let rawintervals = [];
                for (var j = 0; j < rawthings.length; j++) {
                    rawintervals.push(this.getinterval( highscore.root,  rawthings[j].basenote));
                }
                highscore.chord =
                new Chord (
                    this.computedguitar.getholdedfrets(),
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

        let someguessing = document.createElement('div');
        founded.sort((a, b) => b.score - a.score);
        for (var i = 0; i < founded.length; i++) {
          if ( i == 1) break;
            let aguess = document.createElement('div');
            aguess.classList.add ('chord-guess');
            let aguesstitle = document.createElement('div');
            aguesstitle.classList.add ('chord-guess-title');
            aguesstitle.innerHTML = '<strong>'+founded[i].chordtype+' </strong><span class="score">'+founded[i].score.toFixed(1)+'</span>';

            let aguessintervals = document.createElement('div');
            aguessintervals.classList.add ('chord-guess-intervals');

            let somehtml = ''+founded[i].matching.join(', ');
            somehtml = '<i class="it icon-it-r"></i><i class="icon-it-'+founded[i].matching.join('"></i><i class="it icon-it-')+'"></i>';
            if ( founded[i].missing.length != 0 ) somehtml += ' (<span class="missing">'+founded[i].missing.join(', ')+'</span>)';
            aguessintervals.innerHTML = somehtml;

            let aguessdesc = document.createElement('div');
            aguessdesc.classList.add ('chord-guess-desc');
            let desc = '';
            let rawthings = this.computedguitar.getholdedstrings();
            //-console.log(rawthings);
            let sheme = '';

            let rawnotes = [];
            for (var j = 0; j < rawthings.length; j++) {
                if (rawthings[j].fret != -1)
                rawnotes.push(rawthings[j].basenote);

            }

            //////////////////////////////////////////////
            //////////////////////////////////////////////
            //////////////////////////////////////////////



            for (var j = 0; j < rawthings.length; j++) {
                //-console.log(rawthings[j].basenote);
                this.computedguitar.strings[rawthings[j].stringnumber].interval = this.getinterval( founded[i].root,  rawthings[j].basenote).replace('\#', 'm');
                if (rawthings[j].basenote != undefined)
                sheme+='<span class="itv itv-'+this.getinterval( founded[i].root,  rawthings[j].basenote).replace('\#', 'm')+'">'+rawthings[j].basenote+'</span>';
            }


            let rawintervals = [];
            for (var j = 0; j < rawthings.length; j++) {
                if (rawthings[j].fret != -1)
                rawintervals.push(this.getinterval( founded[i].root,  rawthings[j].basenote));
            }
            desc+= this.computedguitar.getholdedfrets().join(' ');
            desc+='<br>'+sheme;
          //  desc+='<br> description ';
          //  desc+='<br>'+founded[i].desc;

            aguessdesc.innerHTML = desc;

            aguess.appendChild(aguesstitle);
          //  aguess.appendChild(aguessintervals);
            if ( i == 0 ) {
                let pinbtn = document.createElement('span');
                pinbtn.classList.add('pin-btn');
                pinbtn.classList.add('blast');
                pinbtn.innerHTML = '<i class="icon-star-1"></i>';
                pinbtn.innerHTML = '<i class="icon-attach-2"></i>';


              if (this.chordpinboard.has(founded[0].chord)  == true)
                aguesstitle.prepend(pinbtn);
              else {
                pinbtn.classList.remove('blast');
                pinbtn.innerHTML = '<i class="icon-attach-2"></i>';

                aguesstitle.prepend(pinbtn);
              }


                pinbtn.addEventListener ('click', function () {
                    //-console.log(this);
                    //-console.log(founded);
                    this.chordpinboard.pinchord( founded[0].chord );
                }.bind(this), true);
            }

            aguess.appendChild(aguessdesc);
            someguessing.appendChild(aguess);
        }
        this.computedguitar.fingerprintsrender();

        this.domctnr.appendChild(someguessing);
    }
    getinterval (r, n) {
        let rpos = notes.indexOf(r);
        let  npos = notes.indexOf(n);
        let it = npos - rpos;
        if ( it < 0 ) it += 12;

        let interval = intervals[it];
        return interval
    }
}
class Cameraman {
    constructor (onNeedRender = () => {}) {

        this.onNeedRender = onNeedRender;
        this.viewRatio = 1.0;
        this.normalisedmouse = {x: 0, y: 0};

        this.camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 0.1, 15 );
        this.camera.position.set( 0.13203648995258088, -0.05773723849390569, 1.104895121140156 );

        this.controls = new OrbitControls( this.camera, document.getElementById('app-body') || document.body );
        this.controls.maxDistance = 2;
        this.controls.minDistance = 0.3;
        this.controls.maxPolarAngle = Math.PI/1.2;
        this.controls.minPolarAngle = Math.PI/5;
        this.controls.minAzimuthAngle = 0;
        this.controls.maxAzimuthAngle = 0;
        this.controls.target = new THREE.Vector3( 0.13203648995258088, 0.1, -0.01832311632648151 );
        document.getElementById('app-body').addEventListener( 'mousemove', (e) => {
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
        window.addEventListener( 'touchstart', updateFromTouch, { passive: true });
        window.addEventListener( 'touchmove',  updateFromTouch, { passive: true });
        window.addEventListener( 'wheel',      () => this.onNeedRender(), false );
    }
    update () {
        this.controls.update();
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
    constructor (domdest, onFretClick = () => {}, onAfterRender = () => {}) {

        this.onFretClick = onFretClick;
        this.onAfterRender = onAfterRender;
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

        this.cameraman = new Cameraman( () => this.render() );

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

            }.bind(this), this.onProgress, this.onError);

        }.bind(this) );
    }
    onProgress ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '%' );
            var elem = document.getElementById('app-stamp');
            elem.textContent = Math.round(percentComplete, 2) + ' %';
             //       this.appstamp.innerHTML = '<i class="icon-sliders"></i> Guitar Lab';

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
// la classe application utilisera différentes instances des objets précédents. le lancement complet de l'application intervient a l'appel de son constructeur.
class Application {
  constructor () {
        Tone.start();
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
            () => { if (this.computedguitar) this.computedguitar.fingerprintsrender(); }
        );
        this.analyserside = document.createElement('div');
        this.analyserside.id = 'analyser-side';
        this.appbody.appendChild (this.analyserside);

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

        this.appbody.addEventListener('click', function (argument) {

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
            this.analyser.description();
            this.pluckpad.update();
        };
        this.model = new GuitarModel(stringNames, onStateChange);
        this.computedguitar = new ComputedGuitar(sguitar, this.neckboard, this.groundrender, this.model);
        this.analyser = new ChordGuesser(this.analyserside, this.computedguitar);
        this.pluckpad = new PluckPad(this.computedguitar.strings, this.appbody);
    }
    start () {

    }
}

document.addEventListener('DOMContentLoaded', () => {
    const useraction = document.getElementById('start');
    useraction.addEventListener('click', function() {
        this.remove();
        window.application = new Application();
        window.application.start();
    }, true);
});
