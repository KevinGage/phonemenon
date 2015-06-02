//node test-cmu-text-to-phoneme.js {input_list.txt} {output_list.txt} 

var fs = require('fs');
var split = require('split');
var textToPhonemeStream = require('./cmu-text-to-phoneme');
var stringifyThrough = require('./stringify-through');

var writableFileStream = fs.createWriteStream(process.argv[3], {
  flags: 'w',
  encoding: 'utf8'
});

var options = { 
	flags: 'r',
	encoding: 'utf8'	
}

fs.createReadStream(process.argv[2], options)
	.pipe(split())
	.pipe(textToPhonemeStream)
//	.pipe(syllablizeThrough.createStream())
	.pipe(stringifyThrough.createStream({followupString: '\n'}))
	.pipe(writableFileStream);