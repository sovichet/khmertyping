angular.module("keyboard", [])

.factory("$keyboard", function() {
	var clipElem = angular.element(document.getElementById("kb-clip")).children()[0];
	var clipX = clipElem.x.baseVal;
	var clipY = clipElem.y.baseVal;

	var kbKey = angular.element(document.getElementById("kb-key"))[0].style;
	var shiftKey = angular.element(document.getElementById("shift-key"))[0].style;
	var spaceKey = angular.element(document.getElementById("space-key"))[0].style;
	var altgrKey = angular.element(document.getElementById("altgr-key"))[0].style;

	var xy = {
		"\u200b": {x: 182.038, y: 183.731, shift: false, altGr: false},
		" ": 	{x: 182.038, y: 183.731, shift: true, altGr: false},
		"្": 	{x: 361.950, y: 91.509, shift: false, altGr: false},
		"១": 	{x: 45.238, y: 0, shift: false, altGr: false},
		"២": 	{x: 90.483, y: 0, shift: false, altGr: false},
		"៣": 	{x: 135.727, y: 0, shift: false, altGr: false},
		"៤": 	{x: 180.972, y: 0, shift: false, altGr: false},
		"៥": 	{x: 226.216, y: 0, shift: false, altGr: false},
		"៦": 	{x: 271.461, y: 0, shift: false, altGr: false},
		"៧": 	{x: 316.705, y: 0, shift: false, altGr: false},
		"៨": 	{x: 361.950, y: 0, shift: false, altGr: false},
		"៩": 	{x: 407.194, y: 0, shift: false, altGr: false},
		"០": 	{x: 452.439, y: 0, shift: false, altGr: false},
		"ក": 	{x: 407.194, y: 91.509, shift: false, altGr: false},
		"ខ": 	{x: 158.350, y: 137.420, shift: false, altGr: false},
		"គ": 	{x: 407.194, y: 91.509, shift: true, altGr: false},
		"ឃ": 	{x: 158.350, y: 137.420, shift: true, altGr: false},
		"ង": 	{x: 271.461, y: 91.610, shift: false, altGr: false},
		"ច": 	{x: 203.594, y: 137.420, shift: false, altGr: false},
		"ឆ": 	{x: 67.861, y: 45.800, shift: false, altGr: false},
		"ជ": 	{x: 203.594, y: 137.420, shift: true, altGr: false},
		"ឈ": 	{x: 67.861, y: 45.800, shift: true, altGr: false},
		"ញ": 	{x: 361.950, y: 91.509, shift: true, altGr: false},
		"ដ": 	{x: 180.972, y: 91.610, shift: false, altGr: false},
		"ឋ": 	{x: 113.105, y: 137.420, shift: false, altGr: false},
		"ឌ": 	{x: 180.972, y: 91.610, shift: true, altGr: false},
		"ឍ": 	{x: 113.105, y: 137.420, shift: true, altGr: false},
		"ណ": 	{x: 339.328, y: 137.420, shift: true, altGr: false},
		"ត": 	{x: 248.839, y: 45.800, shift: false, altGr: false},
		"ថ": 	{x: 226.216, y: 91.610, shift: false, altGr: false},
		"ទ": 	{x: 248.839, y: 45.800, shift: true, altGr: false},
		"ធ": 	{x: 226.216, y: 91.610, shift: true, altGr: false},
		"ន": 	{x: 339.328, y: 137.420, shift: false, altGr: false},
		"ប": 	{x: 294.083, y: 137.420, shift: false, altGr: false},
		"ផ": 	{x: 475.061, y: 45.800, shift: false, altGr: false},
		"ព": 	{x: 294.083, y: 137.420, shift: true, altGr: false},
		"ភ": 	{x: 475.061, y: 45.800, shift: true, altGr: false},
		"ម": 	{x: 384.572, y: 137.420, shift: false, altGr: false},
		"យ": 	{x: 294.083, y: 45.800, shift: false, altGr: false},
		"រ": 	{x: 203.594, y: 45.800, shift: false, altGr: false},
		"ល": 	{x: 452.439, y: 91.610, shift: false, altGr: false},
		"វ": 	{x: 248.839, y: 137.420, shift: false, altGr: false},
		"ស": 	{x: 135.727, y: 91.610, shift: false, altGr: false},
		"ហ": 	{x: 316.705, y: 91.610, shift: false, altGr: false},
		"ឡ": 	{x: 452.439, y: 91.610, shift: true, altGr: false},
		"អ": 	{x: 271.461, y: 91.610, shift: true, altGr: false},
		"ឥ": 	{x: 497.683, y: 0, shift: false, altGr: false},
		"ឦ": 	{x: 384.572, y: 45.800, shift: false, altGr: true},
		"ឧ": 	{x: 565.550, y: 45.800, shift: true, altGr: false},
		"ឨ": 	{x: 248.839, y: 45.800, shift: false, altGr: true},
		"ឩ": 	{x: 520.306, y: 45.800, shift: false, altGr: true},
		"ឪ": 	{x: 565.550, y: 45.800, shift: false, altGr: false},
		"ឫ": 	{x: 203.594, y: 45.800, shift: false, altGr: true},
		"ឬ": 	{x: 203.594, y: 45.800, shift: true, altGr: false},
		"ឭ": 	{x: 588.172, y: 0, shift: true, altGr: false},
		"ឮ": 	{x: 588.172, y: 0, shift: false, altGr: false},
		"ឯ": 	{x: 158.350, y: 45.800, shift: false, altGr: true},
		"ឰ": 	{x: 475.061, y: 45.800, shift: false, altGr: true},
		"ឱ": 	{x: 429.817, y: 45.800, shift: false, altGr: true},
		"ឲ": 	{x: 542.928, y: 0, shift: false, altGr: false},
		"ឳ": 	{x: 565.550, y: 45.800, shift: false, altGr: true},
		"ា": 	{x: 90.483, y: 91.610, shift: false, altGr: false},
		"ិ": 	{x: 384.572, y: 45.800, shift: false, altGr: false},
		"ី": 	{x: 384.572, y: 45.800, shift: true, altGr: false},
		"ឹ": 	{x: 113.105, y: 45.800, shift: false, altGr: false},
		"ឺ": 	{x: 113.105, y: 45.800, shift: true, altGr: false},
		"ុ": 	{x: 339.328, y: 45.800, shift: false, altGr: false},
		"ូ": 	{x: 339.328, y: 45.800, shift: true, altGr: false},
		"ួ": 	{x: 294.083, y: 45.800, shift: true, altGr: false},
		"ើ": 	{x: 497.683, y: 91.610, shift: false, altGr: false},
		"ឿ": 	{x: 520.306, y: 45.800, shift: true, altGr: false},
		"ៀ": 	{x: 520.306, y: 45.800, shift: false, altGr: false},
		"េ": 	{x: 158.350, y: 45.800, shift: false, altGr: false},
		"ែ": 	{x: 158.350, y: 45.800, shift: true, altGr: false},
		"ៃ": 	{x: 135.727, y: 91.610, shift: true, altGr: false},
		"ោ": 	{x: 429.817, y: 45.800, shift: false, altGr: false},
		"ៅ": 	{x: 429.817, y: 45.800, shift: true, altGr: false},
		"ុំ": 	{x: 429.817, y: 137.420, shift: false, altGr: false},
		"ំ": 	{x: 384.572, y: 137.420, shift: true, altGr: false},
		"ាំ": 	{x: 90.483, y: 91.610, shift: true, altGr: false},
		"ះ": 	{x: 316.705, y: 91.610, shift: true, altGr: false},
		"ុះ": 	{x: 429.817, y: 137.420, shift: true, altGr: false},
		"េះ": 	{x: 248.839, y: 137.420, shift: true, altGr: false},
		"ោះ": 	{x: 497.683, y: 91.610, shift: true, altGr: false},
		"ៗ": 	{x: 90.483, y: 0, shift: true, altGr: false},
		"៛": 	{x: 180.972, y: 0, shift: true, altGr: false},
		"៍": 	{x: 271.461, y: 0, shift: true, altGr: false},
		"័": 	{x: 316.705, y: 0, shift: true, altGr: false},
		"៏": 	{x: 361.950, y: 0, shift: true, altGr: false},
		"ៈ": 	{x: 542.928, y: 91.610, shift: false, altGr: true},
		"៉": 	{x: 542.928, y: 91.610, shift: true, altGr: false},
		"៊": 	{x: 520.306, y: 137.420, shift: false, altGr: false},
		"់": 	{x: 542.928, y: 91.610, shift: false, altGr: false},
		"៌": 	{x: 497.683, y: 0, shift: true, altGr: false},
		"៎": 	{x: 542.928, y: 0, shift: false, altGr: true},
		"។": 	{x: 475.061, y: 137.420, shift: false, altGr: false},
		"៕": 	{x: 475.061, y: 137.420, shift: true, altGr: false},
		"៖": 	{x: 497.683, y: 91.610, shift: false, altGr: true}
	};

	// clipX.value = 407.194;
	// clipY.value = 91.509;

	return {
		init: function() {
			kbKey.display = "block";
		},
		hide: function() {
			shiftKey.display = "none";
			kbKey.display = "none";
		},
		setPos: function(ch) {
			if(xy[ch] !== undefined) {
				clipX.value = xy[ch].x;
				clipY.value = xy[ch].y;

				shiftKey.display = "none";
				spaceKey.display = "none";
				altgrKey.display = "none";

				if(xy[ch].shift === true) {
					shiftKey.display = "block";
				}

				if(xy[ch].altGr === true) {
					altgrKey.display = "block";
				}

				if(ch === ' ' || ch === '\u200b') {
					spaceKey.display = "block";
				}
			}
		}
	};
});
