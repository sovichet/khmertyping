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

        if(tbc_type%95 === 0 && tbc_type !== 0 && tbc < textbox.scrollTopMax) {
            tbc += 36;
            textbox.scrollTop = tbc;
            tbc_type = 3;
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
