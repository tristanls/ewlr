/*

readme.js - readme example script

The MIT License (MIT)

Copyright (c) 2013 Dale Schumacher, Tristan Slominski

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict";

var EWLR = require('../index.js');

// keep track of last tick and tick interval
var lastTick = EWLR.getTime();
var tickInterval = 1000; // 1 second (in milliseconds)

var ewlr = new EWLR();

// update with success
ewlr.update();

// update with failure
ewlr.update(1, 1);

// update with 20% loss rate
ewlr.update(1000, 200);

// or a less precise 20% loss rate
for (var i = 0; i < 1000; i++) {
    ewlr.update(1, (Math.random() < 0.2 ? 1 : 0));
}

// tick the required number of times in order to get an accurate loss rate
var shouldTick = EWLR.tickIfNecessary(lastTick, tickInterval);
if (shouldTick) {
    lastTick = shouldTick.newLastTick;
    for (var i = 0; i < shouldTick.requiredTicks; i++) {
        ewlr.tick();
    }
}

console.dir(ewlr.rate()); // may be 0 if we haven't tick()'ed yet

setTimeout(function () {
    shouldTick = EWLR.tickIfNecessary(lastTick, tickInterval);
    if (shouldTick) {
        lastTick = shouldTick.newLastTick;
        for (var i = 0; i < shouldTick.requiredTicks; i++) {
            ewlr.tick();
        }
    }

    console.dir(ewlr.rate());
}, 3000); // will get 3 ticks if we wait 3 seconds
