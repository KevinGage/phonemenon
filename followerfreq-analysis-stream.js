// It's a stream that analyzes phoneme groups you write to it, then returns the 
// analysis via the callback when the end is reached.

var Writable = require('stream').Writable;
var util = require('util');
var _ = require('lodash');

function createAnalyzeFollowerStream(opts) {
  var followerFreqsForPhonemes = {};

  // Must use object mode.
  if (!opts.objectMode) {
    opts.objectMode = true;
  }

  var analyzeStream = new Writable(opts);

  analyzeStream._write = function writeToStream(group, encoding, callback) {
    recordPhonemeGroupFollowFrequencies(group);
    callback();
  };

  analyzeStream.end = function end(callback) {
    if (opts.done) {
      opts.done(null, followerFreqsForPhonemes);
    }
  };

  // Incoming phoneme groups will look like this:
  // {
  //   "word": "ABALONE",
  //   "phonemes": [
  //     {"phoneme":"AE","stress":2},
  //     {"phoneme":"B","stress":-1},
  //     {"phoneme":"AH","stress":0},
  //     {"phoneme":"L","stress":-1},
  //     {"phoneme":"OW","stress":1},
  //     {"phoneme":"N","stress":-1},
  //     {"phoneme":"IY","stress":0}
  //   ]
  //  
  // }
  // 
  // They may also have this optional syllables array:
  //   "syllables": [
  //     [
  //       "AE"
  //     ],
  //     [
  //       "B",
  //       "AH"
  //     ],
  //     [
  //       "L",
  //       "OW"
  //     ],
  //     [
  //       "N",
  //       "IY"
  //     ]
  //   ]


  var previousPhoneme;

  function recordPhonemeGroupFollowFrequencies(group) {
    previousPhoneme = null;
    var phonemeSequence;
    // if (this.opts.analyzeInSyllables) {
    //   phonemeSequence = group.syllables
    // }
    // else {
      phonemeSequence = _.pluck(group.phonemes, 'phoneme');
      recordPhonemeSequenceFrequencies(phonemeSequence);
    // }
  }

  function recordPhonemeSequenceFrequencies(phonemeSequence) {
    for (var i = 0; i < phonemeSequence.length; ++i) {
      var phoneme = phonemeSequence[i];
      if (previousPhoneme) {
        var freqs = {};
        if (previousPhoneme in followerFreqsForPhonemes) {
          freqs = followerFreqsForPhonemes[previousPhoneme];
        }
        else {
          followerFreqsForPhonemes[previousPhoneme] = freqs;
        }

        var frequency = 0;
        if (phoneme in freqs) {
          frequency = freqs[phoneme];
        }
        frequency += 1;
        freqs[phoneme] = frequency;
      }
      previousPhoneme = phoneme;  
    }
  }

  return analyzeStream;
}

module.exports = createAnalyzeFollowerStream;
