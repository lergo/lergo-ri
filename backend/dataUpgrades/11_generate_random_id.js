function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

var pins = [];
for (var i = 100000; i < 1000000; i++) {
    pins.push(i);
}

var shufflePins = shuffle(pins);

var bulk = db.pins.initializeUnorderedBulkOp();

for (var j = 0; j < shufflePins.length; j++) {
    bulk.insert({pin: shufflePins[j]});
}

bulk.execute();
