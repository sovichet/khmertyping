/*! PROJECT_NAME - v0.1.0 - 2015-03-29
* http://PROJECT_WEBSITE/
* Copyright (c) 2015 YOUR_NAME; Licensed MIT */
angular.module('appModule',['coreModule','ui.bootstrap','lessons','keyboard','misc','ngCookies'])
.controller('IntroCtrl', ['$scope', '$cookieStore', function($scope, $cookieStore) {
    $scope.visited = $cookieStore.get('visited') || false;

    $scope.deleteCookie = function() {
        $cookieStore.remove('visited');
    };

    $scope.dismiss = function() {
        $cookieStore.put('visited', true);
        $scope.visited = true;
    };
}])

.controller('TypingCtrl', ['$scope', '$timeout', 'TypingService', '$modal', 'lessonList', '$interval', 'compositeVowels', '$detect', '$keyboard', function($scope,$timeout,TypingService,$modal,lessonList, $interval, compositeVowels, $detect, $keyboard){

    $scope.correct = 0; // correct type
    $scope.wrong = 0; // wrong type
    $scope.started = false; // check if typing started
    $scope.isMacintosh = false;
    $scope.wpm = 0;
    $scope.toType = "";
    $scope.title = "";
    $scope.lessonInfo = "";
    $scope.complete = 100; // in percent
    $scope.lessonLength = 0;

    var ccode = 0, // used in checkInput()
        index = 0,
        timer = 0,
        charIndex = 0,
        word = "", // contains a word from DOM
        error = null,
        counter = null,
        wordLastIndex = 0,
        isComposite = false, // is only used for onKeypressWindows
            charComposite = null,
            indexComposite = 0,
        detect = $detect.init(),
        selectLesson = document.getElementById("lesson-select"),
        textbox = document.getElementById("text"),
        tbc = 0, // textbox scrolling control
        tbc_type = 0; // associate with tbc

    selectLesson.disabled = false;

    if(detect.os.name === "Macintosh") {
        $scope.isMacintosh = true;
    }

    function typedCorrect() {
        $scope.correct = $scope.correct + 1; // increase correct by 1
        $scope.complete = $scope.correct * 100  / $scope.lessonLength;
        tbc_type++;

        if(tbc_type%90 === 0 && tbc_type !== 0 && tbc < textbox.scrollTopMax) {
            tbc += 36;
            textbox.scrollTop = tbc;
            tbc_type = 5;
        }

        // check if current word is a word, or the last letter of the last word
        if(index != wordLastIndex || charIndex != word.length-1) {
            if(charIndex < word.length-1) {
                charIndex++; // move to next letter of word
            } else { // move to next word
                charIndex = 0;
                TypingService.removeHighlight(index);
                index++;
                TypingService.addHighlight(index);
                word = TypingService.getWord(index);
            }

            $keyboard.setPos(word[charIndex]);

            $scope.$apply(function() {
                switch(word[charIndex]){
                    case ' ':
                        $scope.toType = "ដកឃ្លា";
                        break;
                    case '\u200b':
                        $scope.toType = "ចន្លោះ​មិន​ឃើញ";
                        break;
                    case "\r":
                        $scope.toType = "ចុះ​បន្ទាត់";
                        break;
                    default:
                        $scope.toType = word[charIndex];
                }
            });
        } else { // stop typing when reach last letter of last word
            $scope.stopTyping();
            $scope.finishModal();
        }
    }

    function checkInput(key, charCode) {

        ccode = charCode || word[charIndex].charCodeAt(0);

        if(word[charIndex] == "\r") {
            if(key.keyCode == 13) {
                typedCorrect();
            }
        } else if(key.charCode == ccode) { // if type corrected
            typedCorrect();
        } else { // increase wrong by 1
            if(error === true) {
                $scope.$apply(function() {
                    $scope.wrong += 1;
                });
            }
        }
    }

    function onKeypressLinux(key) {
    	key.preventDefault();
    	// var pk = key.keyCode || key.which;
        // console.log(key);

        switch(word[charIndex]) {
            case 'ុះ': ccode = compositeVowels[0]; break;
            case 'ុំ': ccode = compositeVowels[1]; break;
            case 'េះ': ccode = compositeVowels[2]; break;
            case 'ោះ': ccode = compositeVowels[3]; break;
            case 'ាំ': ccode = compositeVowels[4]; break;
            default: ccode = undefined;
        }

    	checkInput(key, ccode);
    }

    function onKeypressWindows(key) {
        key.preventDefault();

        console.log(key);

        switch(word[charIndex]) {
            case "ុះ":
            case "ុំ":
            case "េះ":
            case "ោះ":
            case "ាំ":
                isComposite = true;
                break;
            default:
                isComposite = false;
        }

        if(isComposite) {
            if(key.charCode === word[charIndex].charCodeAt(indexComposite)) {
                indexComposite++;

                if(indexComposite === 2) {
                    indexComposite = 0;
                    isComposite = false;
                    typedCorrect();
                }
            } else {
                $scope.$apply(function() {
                    $scope.wrong++;
                });
            }
        } else {
            checkInput(key);
        }
    }

    function startCounter() {
    	timer = timer + 1; // count timer in second
    	$scope.wpm = Math.round(($scope.correct / 5) / (timer / 60)); // gross word per minute
    }

    $scope.startTyping = function() {
        if(!$scope.started && lessonList.current !== "") {
            $scope.reset(); // reset everything before starting

    		// load new lesson from current selected lesson
        	TypingService.loadTextFromJSON(lessonList.current)
        	.then(function() { // do after text loaded

                var lo = TypingService.lesson();

                error = lo.error;
                word = TypingService.getWord(0);
	        	TypingService.addHighlight(0);
                textbox.scrollTop = 0;
	        	wordLastIndex = TypingService.getWordListLength() - 1;

        		$scope.started = true;
        		selectLesson.disabled = true; // disable <select> in html view
                $scope.title = lo.title;
                $scope.complete = 0;
                $scope.lessonLength = TypingService.getAllLetter().length;
	        	$scope.toType = word[0];
                $keyboard.init();
                $keyboard.setPos(word[0]);

                if(lo.textbox === true) {
                    $scope.textarea = lo.text;
                }

                if(lo.info) {
                    $scope.lessonInfo = lo.info;
                }

                if(lo.wpm === true) {
	        	  counter = $interval(startCounter,1000); // start calculating wpm
                }

	        	// start keypress event
                switch(detect.os.name) {
                    case "Linux":
                        angular.element(document).bind('keypress',onKeypressLinux);
                        break;
                    case "Windows":
                        angular.element(document).bind('keypress',onKeypressWindows);
                        break;
                }

        	});
        } else {
            console.log("សូម​ជ្រើសរើស​មេរៀន");
        }
    };

    $scope.stopTyping = function() {
        $scope.started = false;
    	selectLesson.disabled = false;

		if(counter !== null) {
            $interval.cancel(counter);
            counter = null;
        }
    	angular.element(document).unbind('keypress'); //unbind keypress event
    };

    $scope.reset = function() {
    	TypingService.clear();
        $scope.lessonInfo = "";
        $scope.textarea = "";
    	$scope.toType = "";
		$scope.wpm = 0;
        textbox.scrollTop = 0;
        error = null;
        tbc_type = 0;
        tbc = 0;
		timer = 0;
		charIndex = 0;
    	index = 0;
		word = "";

    	$scope.wrong = 0;
    	$scope.correct = 0;
    };

    $scope.finishModal = function() {
        $modal.open({
            templateUrl: 'finished.html',
            size: 'sm',
            backdrop: 'static',
            scope: $scope,
            controller: ['$scope', '$modalInstance', function($scope, $modalInstance) {
                $scope.gonext = function() {
                    $modalInstance.close("next");
                };

                $scope.closeModal = function() {
                    $modalInstance.dismiss('close');
                };
            }]
        }).result.then(function(option) {
            if(option === "next") {
                lessonList.gotoNext();
                $scope.startTyping();
            }
        });
    };

    $scope.openModal = function(modalID) {
        $modal.open({
            templateUrl: modalID,
            windowClass: 'infobox',
            controller: ['$scope', '$modalInstance', function($scope, $modalInstance) {
                $scope.closeModal = function() {
                    $modalInstance.dismiss('close');
                };
            }]
        });
    };

}])

.controller('lessonList', ['$scope', 'lessonList', '$modal', function($scope, lessonList, $modal){

    lessonList.init(); // initialize lesson list
	$scope.lessons = lessonList.getItemList(); // set a scope reference variable to list of lesson
	$scope.nextLesson = $scope.lessons[1].filename;
    $scope.lessonName = "ជ្រើស​រើស​មេរៀន";

    $scope.$on('finished', function(event, newLesson) {
        $scope.lessonName = newLesson;
    });

    $scope.openModal = function(size) {
        $modal.open({
            templateUrl: 'lessonModal.html',
            controller: 'lessonModal',
            size: size,
            resolve: {
                lessons: function() {
                    return $scope.lessons;
                }
            }
        }).result.then(function(selected) {
            $scope.lessonName = selected.name;
            lessonList.current = selected.filename;
            lessonList.index = selected.index;
        });
    };

}])

.controller('lessonModal', ['$scope', '$modalInstance', 'lessons', function($scope, $modalInstance, lessons) {
    $scope.selectedItem = "";
    $scope.lessons = lessons;

    $scope.choose = function(value) {
        $modalInstance.close(value);
    };

    $scope.closeModal = function() {
        $modalInstance.dismiss('close');
    };
}]);

angular.module('coreModule',[])
.factory('TypingService', ['$http', function($http){
	var ktWord = [];
    var ktLetter = [];
    var ktLoad = "";
    var screen = document.getElementById('text');
    var screenChild;

    if(screen) {
    	screenChild = screen.children;
    }

    // var lessonInfo = document.getElementById('text-info');

    /*
		Used for storing data retrieved from $http.get() in
		loadTextFromJSON() below. It contains json object keys:
		title, duration, textbox (boolean), wpm (boolean), text (string).
    */
   	var lessonObj = {};

    /*
        Split recieved text into an array of splited word.
        Space and ZWSP are independent character, each of them has its own
        index in "ktWord" array.
    */
    var splitWord = function() {
    	var i = 0;
		var word = [];
		ktLetter = [];
        var temp = ktLoad.split(''); // split given string into letter.
		var c = '';

		while(i < temp.length) {
			if(temp[i] == 'ុ') {
				c = temp[i];
				if(temp[i+1] == 'ំ' || temp[i+1] == 'ះ') {
					c += temp[i+1];
					i++;
				}
			} else if((temp[i] ==  'េ' && temp[i+1] == 'ះ') || (temp[i] == 'ោ' && temp[i+1] == 'ះ') || (temp[i] ==  'ា' && temp[i+1] == 'ំ')) {
				c = temp[i] + temp[i+1];
				i++;
			} else {
				c = temp[i];
			}

			ktLetter.push(c);
			i++;
		}

		i = 0;
		temp = [];

		while(i < ktLetter.length) {
			if(ktLetter[i] == '\u200b' || ktLetter[i] == ' ') {
				ktWord.push(word);
				ktWord.push(new Array(ktLetter[i]));
				word = [];
			} else {
				word.push(ktLetter[i]);

				if(i == ktLetter.length - 1)
				{
					ktWord.push(word);
				}
			}

			i++;
		}

		// console.log(ktWord);

    };

    /*
        This function displays the entire data from "ktWord" array on DOM,
        and add class to each word. This give opportunity to other functions
        to interact with displayed words on DOM, eg. addHighlight().
    */
    var displayText = function() {
    	var i = 0;
    	var j = 0;
    	var temp = "";
        if(ktWord.length !== 0) {
            while(i < ktWord.length) {
                while(j < ktWord[i].length) {
                	temp += ktWord[i][j];
                	j++;
                }

                screen.innerHTML += '<span class="w">' + temp + '</span>';

                j = 0;
                temp = "";
                i++;
            }
        } else {
            screen.innerHTML = "No word in list.";
        }
    };

	return {
		lesson: function() {
			return lessonObj;
		},
		addHighlight: function(index) {
	    	try {
	            screenChild[index].classList.add('ac');
	        } catch (e) {
	            console.log(e);
	        }
	    },
	    removeHighlight: function(index) {
	    	screenChild[index].classList.remove('ac');
	    },
		loadTextFromString: function(string) {
			ktLoad = string;
			splitWord();
		},
		loadTextFromJSON: function(filename) {
			return $http({
				method: 'GET',
				url: 'lessons/' + filename + '.js',
				cache: false
			})
			.success(function(data, status, headers, config) {
				lessonObj = data;
				ktLoad = lessonObj.text;
				splitWord();
				displayText();
			})
			.error(function(data, status, headers, config) {
				alert("There is something went wrong.\nError: " + status);
			});
		},
		clear: function() {
			screen.innerHTML = "";
			// lessonInfo.innerHTML = "";
			ktWord = [];
		},
		getWord: function(index) {
			return ktWord[index];
		},
		getAllLetter: function() {
			return ktLetter;
		},
		getWordListLength: function() {
			return screenChild.length;
		}
	};
}]);

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

angular.module('lessons',[])
.factory('lessonList', ['$rootScope', function($rootScope){
	var lesson_title = [
		["១.១ មូលដ្ឋាន​វាយ​អក្សរ","១.២ ហ្វឹកហាត់​ពាក្យ"],
		["២.១ គ្រាប់​ចុច​ថ្មី ៖ េ ិ","២.២ គ្រាប់​ចុច​ថ្មី ៖ ែ ី","២.៣ ហ្វឹកហាត់​ពាក្យ"],
		["៣.១ គ្រាប់​ចុច​ថ្មី ៖ រ ុ","៣.២ គ្រាប់​ចុច​ថ្មី ៖ ឬ ូ","៣.៣ ហ្វឹកហាត់​ពាក្យ"],
		["៤.១ គ្រាប់​ចុច​ថ្មី ៖ ង ហ","៤.២ គ្រាប់​ចុច​ថ្មី ៖ អ ះ","៤.៣ ហ្វឹកហាត់​ពាក្យ"],
		["៥.១ របៀប​ដាក់​ជើង និង វណ្ណយុត​បន្តក់ (់)","៥.២ ហ្វឹកហាត់​ពាក្យ"],
		["៦.១ គ្រាប់​ចុច​ថ្មី ៖ ច ុំ","៦.២ គ្រាប់​ចុច​ថ្មី ៖ ជ ុះ","៦.៣ ហ្វឹកហាត់​ពាក្យ"],
		["៧.១ គ្រាប់​ចុច​ថ្មី ៖ ម វ","៧.២ គ្រាប់​ចុច​ថ្មី ៖ ំ េះ","៧.៣ ហ្វឹកហាត់​ពាក្យ"],
		["៨.១ គ្រាប់​ចុច​ថ្មី ៖ យ ត","៨.២ គ្រាប់​ចុច​ថ្មី ៖ ួ ទ","៨.៣ ហ្វឹកហាត់​ពាក្យ"],
		["៩.១ គ្រាប់​ចុច​ថ្មី ៖ ាំ ៃ ឌ ធ ញ គ ឡ ោះ","៩.២ ហ្វឹកហាត់​ពាក្យ"],
		["១០.១ គ្រាប់​ចុច​ថ្មី ៖ ន ប","១០.២ គ្រាប់​ចុច​ថ្មី ៖ ណ ព","១០.៣ ហ្វឹកហាត់​ពាក្យ"],
		["១១.១ គ្រាប់​ចុច​ថ្មី ៖ ោ ឹ ៀ","១១.២ គ្រាប់​ចុច​ថ្មី ៖ ៅ ឺ ឿ","១១.៣ ហ្វឹកហាត់​ពាក្យ"],
		["១២.១ គ្រាប់​ចុច​ថ្មី ៖ ផ ឆ","១២.២ គ្រាប់​ចុច​ថ្មី ៖ ភ ឈ","១២.៣ ហ្វឹកហាត់​ពាក្យ"],
		["១៣.១ វណ្ណយុត្តិ ៖ ត្រីសព្ទ និង មូសិកទន្ដ","១៣.២ វណ្ណយុត្តិ ៖ ៍ ័ ៏ ៌"],
		["១៤.១ គ្រាប់​ចុច​ថ្មី ៖ ឋ ខ","១៤.២ គ្រាប់​ចុច​ថ្មី ៖ ឍ ឃ","១៤.៣ ហ្វឹកហាត់​ពាក្យ"],
		["១៥.១ ស្រៈ​ពេញ​តួ","១៥.៣ ហ្វឹកហាត់​ពាក្យ"],
		["១៦.១ ហ្វឹកហាត់​អត្ថបទ","១៦.២ ហ្វឹកហាត់​អត្ថបទ"]
	];
	var lesson = {};
	lesson.item = [];

	return {
		init: function() {
			var i, j, num = "", ind = 0;
			for(i = 0; i < 16; i++) {
				for(j = 0; j < lesson_title[i].length; j++) {
					num = ((i+1 < 10) ? '0' + (i+1).toString() : (i+1).toString()) + '.' + (j+1).toString();
					lesson.item.push({index: ind, title: lesson_title[i][j], name: "មេរៀន " + num,filename: "lesson" + num});
					ind++;
				}
			}

			this.index = 0;
			this.current = "";
		},
		index: 0,
		current: "",
		gotoNext: function() {
			this.index++;
			this.current = lesson.item[this.index].filename;

			$rootScope.$broadcast('finished', lesson.item[this.index].name);
		},
		getItemList: function() { return lesson.item; }
	};
}]);

angular.module('misc', [])

// is only used on Linux
.value("compositeVowels", [6139,6140,6141,6142,6143])

.factory('$detect', function() {
    /**
     * Detect Device, and Browser & Version - JSFiddle
     * Source: http://jsfiddle.net/kmturley/Gd6c8/
     */
    return {
        options: [],
        header: [navigator.platform, navigator.userAgent, navigator.appVersion, navigator.vendor, window.opera],
        dataos: [
            { name: 'Windows Phone', value: 'Windows Phone', version: 'OS' },
            { name: 'Windows', value: 'Win', version: 'NT' },
            { name: 'iPhone', value: 'iPhone', version: 'OS' },
            { name: 'iPad', value: 'iPad', version: 'OS' },
            { name: 'Kindle', value: 'Silk', version: 'Silk' },
            { name: 'Android', value: 'Android', version: 'Android' },
            { name: 'PlayBook', value: 'PlayBook', version: 'OS' },
            { name: 'BlackBerry', value: 'BlackBerry', version: '/' },
            { name: 'Macintosh', value: 'Mac', version: 'OS X' },
            { name: 'Linux', value: 'Linux', version: 'rv' },
            { name: 'Palm', value: 'Palm', version: 'PalmOS' }
        ],
        databrowser: [
            { name: 'Chrome', value: 'Chrome', version: 'Chrome' },
            { name: 'Firefox', value: 'Firefox', version: 'Firefox' },
            { name: 'Safari', value: 'Safari', version: 'Version' },
            { name: 'Internet Explorer', value: 'MSIE', version: 'MSIE' },
            { name: 'Opera', value: 'Opera', version: 'Opera' },
            { name: 'BlackBerry', value: 'CLDC', version: 'CLDC' },
            { name: 'Mozilla', value: 'Mozilla', version: 'Mozilla' }
        ],
        init: function () {
            var agent = this.header.join(' '),
                os = this.matchItem(agent, this.dataos),
                browser = this.matchItem(agent, this.databrowser);

            return { os: os, browser: browser };
        },
        matchItem: function (string, data) {
            var i = 0,
                j = 0,
                html = '',
                regex,
                regexv,
                match,
                matches,
                version;

            for (i = 0; i < data.length; i += 1) {
                regex = new RegExp(data[i].value, 'i');
                match = regex.test(string);
                if (match) {
                    regexv = new RegExp(data[i].version + '[- /:;]([\\d._]+)', 'i');
                    matches = string.match(regexv);
                    version = '';
                    if (matches) { if (matches[1]) { matches = matches[1]; } }
                    if (matches) {
                        matches = matches.split(/[._]+/);
                        for (j = 0; j < matches.length; j += 1) {
                            if (j === 0) {
                                version += matches[j] + '.';
                            } else {
                                version += matches[j];
                            }
                        }
                    } else {
                        version = '0';
                    }
                    return {
                        name: data[i].name,
                        version: parseFloat(version)
                    };
                }
            }
            return { name: 'unknown', version: 0 };
        }
    };
});
