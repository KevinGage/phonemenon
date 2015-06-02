var through2 = require('through2');
var typesofphonemes = require('phoneme-types');

function createStream() {
  var syllablizeThroughStream = through2({
      objectMode: true
    },
    function syllablize(phonemeGroup, enc, callback) {

      this.push(syllablizePhonemeGroup(phonemeGroup));
      callback();
    }
  );

  return syllablizeThroughStream;  
}

// Program Input:
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
// }

//Program Output:

// "syllables":[["AE"],["B","AH"],["L","OW"],["N","IY"]]}

//goal: we take in a given phoneme and check whether it should belong to the current syllable or a new syllable

function shouldBreakToNextSyllable(currentPhoneme, nextPhoneme, 
  currentSyllableHasAVowel) {

  // if current syllable does not have a vowel, then don't break to the next syllable (this implies that every syllable should have a vowel)
  if (!currentSyllableHasAVowel) {
    return false;
  }
  //"AE" does not return false
  //"B" returns false


  // if current syllable has a vowel, then check the stress of the current phoneme
  // if the stress is not negative, then break to the next syllable
  else if (currentPhoneme.stress > -1) {
    return true;
  }
  //"AE" returns true
  //"B" does not return true

 
  //if there is a next phoneme after the current one, and the next phoneme stress is not negative, then break to the next syllable
  else if (nextPhoneme && nextPhoneme.stress > -1) {
    return true;
  }
  //"B" returns true because "AH" has a non-negative stress
 
  
  //if neither of the two above cases are true, then stay on the same syllable
 else {
    return false;
  }
}
  //no example of this case in this particular word

function syllablizePhonemeGroup(phonemeGroup) {
  var syllables = [];
  var currentSyllable = [];
  var currentSyllableHasAVowel = false;
  var phonemes = phonemeGroup.phonemes;

  for (var i = 0; i < phonemes.length; ++i) {
    var phonemeInfo = phonemes[i];
    var nextPhonemeInfo = null;
    if (i + 1 < phonemes.length) {
      nextPhonemeInfo = phonemes[i + 1];
    }

    if (shouldBreakToNextSyllable(phonemeInfo, nextPhonemeInfo, 
      currentSyllableHasAVowel)) {

      syllables.push(currentSyllable);
      currentSyllable = [phonemeInfo.phoneme];
      currentSyllableHasAVowel = typesofphonemes.isVowelish(phonemeInfo.phoneme);
    }
    else {
      currentSyllable.push(phonemeInfo.phoneme);
      if (!currentSyllableHasAVowel) {
        currentSyllableHasAVowel = 
          typesofphonemes.isVowelish(phonemeInfo.phoneme);
      }
    }
  }

  if (currentSyllable.length > 0) {
    syllables.push(currentSyllable);
  }

  phonemeGroup.syllables = syllables;

  return phonemeGroup;
}


module.exports = {createStream: createStream};
