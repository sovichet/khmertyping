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
