/*

index.js: Exponentially Weighted Loss Rate

The MIT License (MIT)

Copyright (c) 2014 Tristan Slominski

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

var assert = require('assert');

var EWLR = module.exports = function EWLR(config) {
    var self = this;

    config = config || {};

    self.timePeriod = config.timePeriod || 1000; // 1 second in milliseconds
    self.tickInterval = config.tickInterval || 1000; // 1 second
    self.alpha = 1 - Math.exp((-1 * self.tickInterval) / self.timePeriod);
    self.count = 0;
    self.lost = 0;
    self._lossRate = 0;
    self._rate = 0;
};

/*
  * Return: _Number_ Time in milliseconds (for example: 109.372263)
*/
EWLR.getTime = function getTime() {
    var hrtime = process.hrtime();
    return (hrtime[0] * 1000) + (hrtime[1] / (1000000)); // to milliseconds
};

/*
  * `lastTick`: _Number_ Time of last tick in milliseconds.
  * `tickInterval`: _Number_ Tick interval in milliseconds.
  * Return: _undefined_ If no tick necessary.
  * Return: _Object_ If tick is necessary
    * `newLastTick`: _Number_ Time of new last tick to set in milliseconds
    * `requiredTicks`: _Number_ The number of ticks to execute to catch up.
*/
EWLR.tickIfNecessary = function tickIfNecessary(lastTick, tickInterval) {
    var newTick = EWLR.getTime();

    var age = newTick - lastTick;
    if (age > tickInterval) {
        var newIntervalStartTick = newTick - age % tickInterval;
        var requiredTicks = age / tickInterval;
        return {newLastTick: newIntervalStartTick, requiredTicks: requiredTicks};
    }

    return null;
};

/*
  * Return: _Object_
    * `rate`: _Number_ Rate of events. Rate is returned so that it can be
        determined if `lossRate` is meaningful. For example, if rate is
        13 events per second, `lossRate` probably reflects current loss rate. However,
        if current rate is 2.504763981949714e-32 events per second, the loss
        rate (even if 20%), may not be meaningful since the tiny rate may mean
        that no updates have happened for a long time
    * `lossRate`: _Number_ Normalized ([0..1]) loss rate of events
*/
EWLR.prototype.rate = function rate() {
    var self = this;

    return {
        rate: self._rate || 0,
        lossRate: (self._lossRate / self._rate) || 0
    }
};

EWLR.prototype.tick = function tick() {
    var self = this;

    var instantRate = self.count / self.tickInterval;
    var instantLossRate = self.lost / self.tickInterval;

    self.count = 0;
    self.lost = 0;

    self._rate += (self.alpha * (instantRate - self._rate));
    self._lossRate += (self.alpha * (instantLossRate - self._lossRate));
};

/*
  * `n`: _Integer_ Number of events to update with.
  * `lost`: _Integer_ Number of lost events to update with (0 < lost <= n)
*/
EWLR.prototype.update = function update(n, lost) {
    var self = this;

    self.count += n || 1;
    self.lost += lost || 0;
};
