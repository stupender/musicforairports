// Sampler Instrument

let SAMPLE_LIBRARY = {
    'Sax': [
        { note: 'B',  octave: 2, file: 'Samples/Horns/TS - B2 (accent hold, warm).wav' },
        { note: 'B',  octave: 3, file: 'Samples/Horns/TS - B3 (accent hold, thin).wav' },
        { note: 'D',  octave: 3, file: 'Samples/Horns/TS - D3 (held, warm).wav' },
        { note: 'F#',  octave: 3, file: 'Samples/Horns/TS - F#3 (held).wav' },
        { note: 'G',  octave: 3, file: 'Samples/Horns/TS - G3 (held, warmer).wav' }
    ],
    'Guitar': [
        { note: 'B',  octave: 2, file: 'Samples/Guitar/B2.mp3' },
        { note: 'D',  octave: 3, file: 'Samples/Guitar/D3.mp3' },
        { note: 'F#',  octave: 3, file: 'Samples/Guitar/F#3.mp3' },
        { note: 'G',  octave: 3, file: 'Samples/Guitar/G3.mp3' },
        { note: 'A',  octave: 3, file: 'Samples/Guitar/A3.mp3' },
        { note: 'B',  octave: 3, file: 'Samples/Guitar/B3.mp3' },
        { note: 'D',  octave: 4, file: 'Samples/Guitar/D4.mp3' },
    ]
};

const OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

let audioContext = new AudioContext();

function fetchSample(path) {
  return fetch(encodeURIComponent(path))
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer));
}

function noteValue(note, octave) {
  return octave * 12 + OCTAVE.indexOf(note);
}

function getNoteDistance(note1, octave1, note2, octave2) {
  return noteValue(note1, octave1) - noteValue(note2, octave2);
}

function getNearestSample(sampleBank, note, octave) {
  let sortedBank = sampleBank.slice().sort((sampleA, sampleB) => {
    let distanceToA =
      Math.abs(getNoteDistance(note, octave, sampleA.note, sampleA.octave));
    let distanceToB =
      Math.abs(getNoteDistance(note, octave, sampleB.note, sampleB.octave));
    return distanceToA - distanceToB;
  });
  return sortedBank[0];
}

function flatToSharp(note) {
  switch (note) {
    case 'Bb': return 'A#';
    case 'Db': return 'C#';
    case 'Eb': return 'D#';
    case 'Gb': return 'F#';
    case 'Ab': return 'G#';
    default:   return note;
  }
}

function getSample(instrument, noteAndOctave) {
  let [, requestedNote, requestedOctave] = /^(\w[b\#]?)(\d)$/.exec(noteAndOctave);
  requestedOctave = parseInt(requestedOctave, 10);
  requestedNote = flatToSharp(requestedNote);
  let sampleBank = SAMPLE_LIBRARY[instrument];
  let sample = getNearestSample(sampleBank, requestedNote, requestedOctave);
  let distance =
    getNoteDistance(requestedNote, requestedOctave, sample.note, sample.octave);
  return fetchSample(sample.file).then(audioBuffer => ({
    audioBuffer: audioBuffer,
    distance: distance
  }));
}

function playSample(instrument, note, delaySeconds = 0) {
    getSample(instrument, note).then(({audioBuffer, distance}) => {
      let playbackRate = Math.pow(2, distance / 12);
      let bufferSource = audioContext.createBufferSource();
      bufferSource.buffer = audioBuffer;
      bufferSource.playbackRate.value = playbackRate;
      bufferSource.connect(audioContext.destination);
      bufferSource.start(audioContext.currentTime + delaySeconds);
    });
  }

// Temporary test code
// setTimeout(() => playSample('Guitar', 'B2'),  1000);
// setTimeout(() => playSample('Guitar', 'D3'), 2000);
// setTimeout(() => playSample('Guitar', 'F#3'),  3000);
// setTimeout(() => playSample('Guitar', 'G3'), 4000);
// setTimeout(() => playSample('Guitar', 'A3'), 5000);
// setTimeout(() => playSample('Guitar', 'B3'),  6000);
// setTimeout(() => playSample('Guitar', 'D4'), 7000);

// setTimeout(() => playSample('Sax', 'B2'),  1000);
// setTimeout(() => playSample('Sax', 'D3'), 2000);
// setTimeout(() => playSample('Sax', 'F#3'),  3000);
// setTimeout(() => playSample('Sax', 'G3'), 4000);
// setTimeout(() => playSample('Sax', 'A3'), 5000);
// setTimeout(() => playSample('Sax', 'B3'),  6000);
// setTimeout(() => playSample('Sax', 'D4'), 7000);


function startLoop(instrument, note, loopLengthSeconds, delaySeconds) {
    playSample(instrument, note, delaySeconds);
    setInterval(
      () => playSample(instrument, note, delaySeconds),
      loopLengthSeconds * 1000
    );
  }
  
  startLoop('Guitar', 'F3', 5, 4.0);
  startLoop('Guitar', 'Ab3', 5.5, 8.1);
  startLoop('Guitar', 'C4', 2, 5.6);
  startLoop('Guitar', 'Db4', 1, 12.6);
  startLoop('Guitar', 'Eb4', 4.6, 9.2);
  startLoop('Guitar', 'F4', 5.3, 14.1);
  startLoop('Guitar', 'Ab4', 10.1, 3.1);  