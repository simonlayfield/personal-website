

var oneWords = ['saint', 'stone', 'fray', 'bay', 'lake', 'break', 'kid', 'fire', 'slate', 'wake', 'trip', 'tape', 'park', 'fair', 'trade', 'cross', 'war', 'cold', 'part', 'march', 'tide', 'may', 'way', 'mark', 'wild', 'line', 'suns', 'sail', 'trace', 'light', 'raid', 'plan', 'bond', 'shore', 'day', 'kite', 'switch', 'lock', 'turn', 'maps', 'tour', 'leaves', 'chime', 'grace', 'score', 'wait', 'beat', 'joy', 'catch', 'coast', 'road', 'tilt', 'wave', 'burst', 'pale', 'ale', 'stars', 'church', 'bells', 'bell', 'end', 'trail', 'seal', 'coil', 'risk', 'notes', 'soar', 'ray'];

var twoWords = ['future', 'amber', 'tiger', 'china', 'border', 'river', 'cinder', 'armour', 'raven', 'reader', 'aero', 'fever', 'taper', 'savour', 'circle', 'karma', 'pilot', 'mirror', 'awake', 'service', 'skyline', 'silence', 'silver', 'zebra', 'echo', 'haven', 'idle', 'arrow', 'promise', 'open', 'timber', 'teardrop', 'paper', 'maven', 'spirit', 'cover', 'further', 'second', 'every', 'weather', 'moment', 'pressure', 'retreat', 'pheonix', 'glory', 'waiver', 'spiral', 'mission', 'circuit', 'sabre', 'fleeting', 'liner', 'bearing', 'glimmer', 'halo'];

var threeWords = ['memory', 'kindling', 'origin', 'radio', 'union', 'waterfall', 'whitewater', 'collective', 'priory'];

var latch = true,
minimum = 0,
maximum = 10,
randNumber = null;

window.onload = function () {
    var randomnumber = Math.floor(Math.random() * (maximum - minimum)) + minimum;
    document.getElementById('one').innerText = oneWords[randomNumber(maximum)];
    document.getElementById('two').innerText = twoWords[randomNumber(maximum)];
}

function randomNumber (maximum) {

    var generatedNumber = Math.floor(Math.random() * (maximum - minimum)) + minimum;
    // Make sure we don't generate the same number consecutively
    // This doesn't work if it's 0
    // Duh.
    if (generatedNumber != randNumber) {
        randNumber = generatedNumber;
        return generatedNumber;
    } else {
        return randNumber -1;
    }
}

function swapWord() {
    var word = document.getElementById('word--three');

    if (word.classList.contains('swapped')) {
        word.classList.remove('swapped');
    } else {
        word.classList.add('swapped');
    }
}

function switchWord (word) {

    if (word === 'the') {

        if (latch) {
            document.getElementById('the').classList.remove('active');
            latch = false;
        } else {
            document.getElementById('the').classList.add('active');
            latch = true;
        }

    }

    if (word === 'one') {

        var el = document.getElementById('one');
        el.classList.remove('active');
        setTimeout(function(){
            el.innerText = oneWords[randomNumber(oneWords.length)];
            el.classList.add('active');
        }, 200);

    } else if (word === 'two') {

        var el = document.getElementById('two');
        el.classList.remove('active');
        setTimeout(function(){
            el.innerText = twoWords[randomNumber(twoWords.length)];
            el.classList.add('active');
        }, 200);


    }

}
