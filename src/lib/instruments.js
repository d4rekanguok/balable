import * as Tone from 'tone';

const synth = new Tone.Synth().toDestination();

const wah = new Tone.AutoWah(50, 6, -30).toDestination();
wah.Q.value = 6;
const wahSynth = new Tone.Synth().connect(wah);

export const instruments = [
  synth,
  wahSynth,
  new Tone.AMSynth().toDestination(),
  new Tone.MembraneSynth().toDestination(),
  new Tone.FMSynth().toDestination()
];