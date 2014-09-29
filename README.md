# ewlr

_Stability: 1 - [Experimental](https://github.com/tristanls/stability-index#stability-1---experimental)_

[![NPM version](https://badge.fury.io/js/ewlr.png)](http://npmjs.org/package/ewlr)

Exponentially Weighted Loss Rate.

## Contents

  * [Installation](#installation)
  * [Overview](#overview)
  * [Usage](#usage)
  * [Tests](#tests)
  * [Documentation](#documentation)
    * [EWLR](#ewlr)

## Installation

    npm install ewlr

## Overview

EWLR is an Exponentially Weighted Loss Rate calculation module to estimate event loss rate.

## Usage

To run the below example run:

    npm run readme

```javascript
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

```

## Tests

    npm test

## Documentation

  * [EWLR](#ewlr-1)

### EWLR

**Public API**

  * [EWLR.getTime()](#ewlrgettime)
  * [EWLR.tickIfNecessary(lastTick, tickInterval)](#ewlrtickifnecessarylasttick-tickinterval)
  * [new EWLR(config)](#new-ewlrconfig)
  * [ewlr.rate()](#ewlrrate)
  * [ewlr.tick()](#ewlrtick)
  * [ewlr.update(\[n\], \[lost\])](#ewlrupdaten-lost)

### EWLR.getTime()

  * Return: _Number_ Time in milliseconds (for example: 109.372263)

### EWLR.tickIfNecessary(lastTick, tickInterval)

  * `lastTick`: _Number_ Time of last tick in milliseconds.
  * `tickInterval`: _Number_ Tick interval in milliseconds.
  * Return: _undefined_ If no tick necessary.
  * Return: _Object_ If tick is necessary
    * `lastTick`: _Number_ Time of new last tick to set in milliseconds
    * `requiredTicks`: _Number_ The number of ticks to execute to catch up.

Determines if and how many ticks are necessary.

### new EWLR(config)

  * `config`: _Object_
    * `timePeriod`: _Number_ _(Default: 1000)_ Time period in milliseconds.
    * `tickInterval`: _Number_ _(Default: 1000)_ Tick inteval in milliseconds.

Creates a new EWLR instance.

### ewlr.rate()

  * Return: _Object_
    * `rate`: _Number_ Rate of events. Rate is returned so that it can be determined if `lossRate` is meaningful. For example, if rate is 2.504763981949714e-32 events per second, the loss rate (even if 20%), may not be meaningful since the tiny rate may mean that no updates have happened for a long time.
    * `lossRate`: _Number_ Normalized ([0..1]) loss rate of events
    * `lossRate`: _Number_ Normalized ([0..1]) loss rate of events

Returns the event rate and the normalized loss rate. **The `rate` is only meant as a liveness/recency measure to see if `lossRate` is meaningful.**

### ewlr.tick()

Update the rate and loss rate estimates in accordance with time period and tick interval.

### ewlr.update([n], [lost])

  * `n`: _Integer_ _(Default: 1)_ Number of events to update with.
  * `lost`: _Integer_ _(Default: 0)_ Number of lost events to update with (0 < lost <= n)
