/******************************************
 * Author: 
 *  Muhammad Umer (m.umer@sap.com)
 *  Short Code Master Algorithm A.K.A "Linguistic Combinator"
 * Developed by: 
 *  Muhammad Umer (m.umer@sap.com) at "SAP HYBRIS Montreal".
 ******************************************/
app.service('$codeGenerator', function () {
    //Global Variables
var debug = false;
var stopChars = ["a", "e", "i", "o", "u", "y"]; //Vovels + extra char to remove from each word.
var stopWords = ["to", "in", "of", "as", "the"]; // Short Stop words
var stopWords_long = ["and", "And", "to", "To", "in", "In", "Of", "of", "As", "as", "The", "the"];

var register_short_code = "";
var register_company_name = "";
//French Stop Words = https://websitebuilders.com/tools/html-codes/french/

//Verify existing short codes of DB with the newly generated one. If they are found, concatenate the company name of the existing one for UI.
this.checkExistingCode = function checkExistingCodes(arr, masterarr) {
    for (var k = 0; k < arr.length; k++) {
        var ck = arr[k].toString().trim();
        for (var j = 0; j < masterarr.length; j++) {
            var jk = masterarr[j]['CUSTOMERCODE'].toString().trim().toUpperCase();
            if (ck === jk) {
                if (masterarr[j]['CUSTOMERNAME'] !== null) {
                    ck += " - (" + masterarr[j]['CUSTOMERNAME'].toString() + ")";
                    //ck += " - " + masterarr[j]['short_company_name'].toString() + ")";
                } else {
                    ck += " - (" + masterarr[j]['CUSTOMERNAME'].toString() + ")";
                }
                //ck+=" - ("+jk+")";
                arr[k][0] = ck;
                //arr.splice(k, 1);
            }
        }
    }
    return arr;
}

//Verify existing short codes of DB with the newly generated one. If they are found, concatenate the company name of the existing one for UI.
this.checkExistingCodeV2 = function checkExistingCodesV2(arr, masterarr) {
    for (var k = 0; k < arr.length; k++) {
        var ck = arr[k].toString().trim();
        for (var j = 0; j < masterarr.length; j++) {
            var jk = masterarr[j]['CUSTOMERCODE'].toString().trim().toUpperCase();
            if (ck === jk) {
                arr.splice(k,1);
            }
        }
    }
    return arr;
}

function isUpperCase(word) {
    return (word >= 'A') && (word <= 'Z');
}

//Return all uppercase letter in a given string.
function getAllUpperCase(word) {
    var output = Array();
    for (var k = 0; k < word.length; k++) {
        if (isUpperCase(word[k])) {
            output.push(word[k]);
        }
    }
    return output;
}

//Remove all consecutive duplicate word from the given string but keep one of them and increase its weight.
function removeReoccurence(char_array, weight_array) {
    for (var k = 0; k < char_array.length; k++) {
        if (char_array[k] === char_array[k + 1]) {
            char_array.splice(k, 1);
            weight_array.splice(k, 1);
            weight_array[k] = 1;
        }
    }
}

function removeStopChars(char_array, weight_array) {
    for (var k = 0; k < char_array.length; k++) {
        for (var i = 0; i < stopChars.length; i++) {
            if (char_array[k] === stopChars[i]) {
                char_array.splice(k, 1);
                weight_array.splice(k, 1);
            }
        }
    }
}
function removeStopWords(splits, stopWordsarr) {
    for (var k = 0; k < splits.length; k++) {
        for (var i = 0; i < stopWordsarr.length; i++) {
            if (splits[k] === stopWordsarr[i]) {
                splits.splice(k, 1);
            }
        }
    }
}



//Split the company name by space.
function splitify(word) {
    var splits = word.split(" ");
    var new_splits = [];
    for (var k = 0; k < splits.length; k++) {
        var innerSplit = splits[k].match(/[A-Z][a-z]+/g);
        if (innerSplit !== null && innerSplit.length > 1) {
            for (var j = 0; j < innerSplit.length; j++) {
                new_splits.push(innerSplit[j]);
            }
        } else {
            new_splits.push(splits[k].trim());
        }
    }
    //if(debug) console.log("Calling Splitify: \r\n" + new_splits);
    return new_splits;
}



function getCombinations(chars) {
    var result = [];
    var f = function (prefix, chars) {
        for (var i = 0; i < chars.length; i++) {
            result.push(prefix + chars[i]);
            f(prefix + chars[i], chars.slice(i + 1));
        }
    }
    f('', chars);
    return result;
}

//Generate a list of possible short code pieces by computing the weighted distance
//of each character and its important in the whole word.
this.generateCode = function generateCode(word, isForceGeneration) {
    var result = new Object();
    
    
    //If the word is already 3 letter long, return same.
    if (word.length < 3 && (isForceGeneration === true || isForceGeneration === false)) {
        result.data = word;
        //result.len = 1;
        return result; //Recursion base Condition
    } else if (word.length === 3 && isForceGeneration === true) {     //If word is 3 letter long but we need more combinations
        result.data = getCombinations(word);
        //result.len = result.data.length;
        return result; //Recursion base Condition
    } else if (word.length === 3 && isForceGeneration === false) {
        result.data = word;
        result.len = 1;
        return result; //Recursion base Condition
    }


    var splits = splitify(word);    //Split the company name by space and recursively apply the same algo on each word.
    if (splits.length === 3 && isForceGeneration === false) {     //If Split length is 3, return the first char of each word (Makes BEST CASE)
        var output = splits[0][0] + splits[1][0] + splits[2][0];
        //if(debug) console.log(output);
        result.data = output;
        result.len = 1;
        return result; //Recursion base Condition # 2
    } else if (splits.length > 1 && splits.length < 4) {        //Force generation of code on 3 word company name.
        removeStopWords(splits, stopWords);
        var output = Array();
        for (var k = 0; k < splits.length; k++) {
            output[k] = generateCode(splits[k], isForceGeneration); //Exit - Calling Recursion
        }
        output.len = output.length;
        return output;
    } else if (splits.length > 3) {     //If Company Name is greater than 3 word, do the magic.
        //Exception case for JJ Vision Care.

        removeStopWords(splits, stopWords_long);        //Remove all the stop words from the given word.
        var output = Array();
        for (var k = 0; k < splits.length; k++) {       //Recursively generate combinations of code on each word of the company name.
            output[k] = generateCode(splits[k], isForceGeneration); //Exit - Calling Recursion
        }
        output.len = output.length;
        return output;
    } else {
        //This is where we make combinations of codes out of a word.
        word = word[0].toUpperCase() + word.substring(1, word.length);      //Upper Case first letter so it always comes in the Short Code.
        var upperCases = getAllUpperCase(word);     //Get all uppercases, it shows the important of those word in company name.
        if (upperCases.length == 3) {
            return upperCases.toString(); //Exit - //Recursion base Condition # 3
        }

        var char_array = word.split("");
        var weight_array = Array.apply(null, Array(char_array.length)).map(Number.prototype.valueOf, 0);        //Generate a new weighted array filled with 0

        for (var k = 0; k < char_array.length; k++) {       //For every upper case letter in word, increase the weight of that letter.
            if (isUpperCase(char_array[k])) {
                weight_array[k] = 1;
            }
        }

        removeReoccurence(char_array, weight_array);        //Remove consecutive double words and increase its weight (Important)
        removeStopChars(char_array, weight_array);          //Remove the Vovels from the word.

        var weight_count = 0;
        var weight_count_indexes = [];
        var perm_arra = [];
        var char_word = char_array.join("");

        for (var k = 0; k < weight_array.length; k++) {     //Generate a string of the weighted word and leftover words.
            if (weight_array[k] === 1) {
                weight_count++;
                weight_count_indexes.push(k);
                if (k != 0) {
                    perm_arra.push(char_word.substring(1, k - 1));
                }
            }
        }
        if (perm_arra.length < 1) {
            perm_arra.push(char_word.substring(1, char_word.length));
        }

        var combinations = getCombinations(perm_arra[0].split(''));     //Get Combinations of the generated letter as 3 letter short codes.
        var output = [];
        if (char_word.length === 3) {
            output.push(char_word);
        }
        for (var k = 0; k < weight_count_indexes.length; k++) {
            output.push(char_array[weight_count_indexes[k]]);
            for (var j = 0; j < combinations.length; j++) {
                output.push(char_array[weight_count_indexes[k]] + combinations[j]);
            }
        }
        var result = new Object();
        result.data = output;
        return result;
    }
}



//Generate the permuation of the final letter generated by the algorithm and discard everything with the length > 3.
this.generateFinalOutput = function generateFinalOutput(input) {
    var final_output = [];
    if (input.len === undefined) {
        var data = input.data;
        for (var k = 0; k < data.length; k++) {
            if (data[k].length === 3) {
                final_output.push(data[k].toUpperCase());
            }
        }
    } else if (input.len === 1) {
        var data = input.data;
        final_output.push(data.toUpperCase());
    } else {
        var mergeArr = [];
        for (var k = 0; k < input.length; k++) {
            mergeArr.push(input[k].data);
        }
        final_output = mergeCombinations(mergeArr);
    }
    return final_output;
}

function arrayValueExists(arr, val) {
    return arr.indexOf(val) > -1
}


this.removeDuplicatesInPlace = function (arr) {
    //var output = array();
    if (arr.length > 1) {
        for (var k = 0; k < arr.length; k++) {
            var ck = arr[k].toString().trim();
            for (var j = k + 1; j < arr.length; j++) {
                var jk = arr[j].toString().trim();
                if (ck === jk) {
                    arr.splice(k, 1);
                }
            }
        }
    }
    return arr;
}

function mergeCombinations(arraysToCombine) {
    var divisors = [];
    for (var i = arraysToCombine.length - 1; i >= 0; i--) {
        divisors[i] = divisors[i + 1] ? divisors[i + 1] * arraysToCombine[i + 1].length : 1;
    }

    function getPermutation(n, arraysToCombine) {
        var result = [],
            curArray;
        for (var i = 0; i < arraysToCombine.length; i++) {
            curArray = arraysToCombine[i];
            result.push(curArray[Math.floor(n / divisors[i]) % curArray.length]);
        }
        return result;
    }

    var numPerms = arraysToCombine[0].length;
    for (var i = 1; i < arraysToCombine.length; i++) {
        numPerms *= arraysToCombine[i].length;
    }

    var combinations = [];
    for (var i = 0; i < numPerms; i++) {
        var comb_code = getPermutation(i, arraysToCombine);
        if (comb_code.length > 3) {
            var temp_comb = getCombinations(comb_code);
            for (var j = 0; j < temp_comb.length; j++) {
                if (temp_comb[j].length === 3 && !arrayValueExists(combinations, temp_comb[j].toUpperCase())) {
                    combinations.push(temp_comb[j].toUpperCase());
                }
            }
        } else {
            if (comb_code.join("").length === 3 && !arrayValueExists(combinations, comb_code.join("").toUpperCase())) {
                combinations.push(comb_code.join("").toUpperCase());
            } else if (comb_code[0].length === 3 && !arrayValueExists(combinations, comb_code[0].toUpperCase())) {
                combinations.push(comb_code[0].toUpperCase());
            } else if (comb_code[1].length === 3 && !arrayValueExists(combinations, comb_code[1].toUpperCase())) {
                combinations.push(comb_code[1].toUpperCase());
            }
        }
    }
    return combinations;
}



function cleanUpReserve() {
    register_short_code = "";
    register_company_name = "";
}
});
