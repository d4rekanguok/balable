import * as Tone from 'tone';

const wrapInstrument = (instrument) => {
  return {
    play: (args, cb) => {
      instrument.triggerAttackRelease(...args);
      if (cb) cb()
    }
  }
}

export const getInstruments = () => {
  const wah = new Tone.AutoWah(50, 6, -30).toDestination();
  wah.Q.value = 6;
  const wahSynth = new Tone.Synth().connect(wah);

  return [
    new Tone.Synth().toDestination(),
    wahSynth,
    new Tone.AMSynth().toDestination(),
    new Tone.MembraneSynth().toDestination(),
    new Tone.FMSynth().toDestination()
  ].map(instrument => wrapInstrument(instrument));
}