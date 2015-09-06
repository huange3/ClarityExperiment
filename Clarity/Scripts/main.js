// DOM elements
var settingsBtn = $("#settings-btn");
var saveBtn = $("#save-btn");
var cancelBtn = $("#cancel-btn");
var startExpBtn = $("#start-exp-btn");
var startTrialBtn = $("#start-trial-btn");
var settings = $("#settings");
var notify = $("#notify");
var notifyLB = $("#notify-body");
var okBtn = $("#ok-btn");
var instructions = $("#instructions");
var trial = $("#trial-body");
var mainImage = $("#main-image");
var categories = $("#category");
var clarityReward = $("#clarity-reward");
var numTrials = $("#num-trials");
var trialDuration = $("#trial-duration");
var buttonRate = $("#button-rate");
var buttonCount = $("#button-count");
var secondsLB = $("#seconds");

// global variables
var settingsObj = null;
var responseObj = null;
var trials = [];
var trialComps = [];
var dataLog = [];
var imageList = [];
var categoryID = 0;
var clarityRewardVal = 0;
var numTrialsVal = 0;
var trialDurationVal = 60;
var buttonACnt = 0;
var buttonNCnt = 0;
var buttonARate = 0.0;
var buttonNRate = 0.0;
var timer = null;
var timeRemaining = 0;
var isTrial = false;
var currClarityVal = 100;
var clarityPunish = 0;
var buttonIntervalCnt = 0;
var style = {
    "opacity": "1",
    "-webkit-filter": "blur(" + currClarityVal + "px)"
};

const componentsCnt = 6;

loadSettings();
loadImages();

settingsBtn.click(function () {
    settings.toggleClass("show");
});

saveBtn.click(function () {
    saveSettings();
    // reload everything
    loadSettings();
    loadImages();
});

cancelBtn.click(function () {
    settings.toggleClass("show");
});

okBtn.click(function () {
    notify.toggleClass("show");
});

startExpBtn.click(function () {
    if (setupTrials()) {
        instructions.toggleClass("show");
    }
});

startTrialBtn.click(function () {
    instructions.toggleClass("show");
    trial.show();
    startExperiment();
});

$(document).keyup(function (e) {
    if (isTrial) {
        if (e.which == 65) {
            buttonACnt++;
            buttonIntervalCnt++;
            increaseClarity();
        }

        if (e.which == 78) {
            buttonNCnt++;
            changeImage();
        }
    }   
});

function loadSettings() {
    $.get("../Settings/Load", function (data) {
        if (data != null) settingsObj = data;
        //console.log(settingsObj);
        mapSettings();   
    });
}

function loadImages() {
    $.get("../Images/Load", "catID=" + categoryID, function (data) {
        if (data != null) imageList = data;

        //console.log(imageList);
    });
}

function mapSettings() {
    var tmpValue = null;

    if (settingsObj["error"] != null) {
        notifyLB.text(settingsObj["error"]);
        notify.show();
        return;
    } 

    tmpValue = settingsObj["categoryID"];
    if (tmpValue != null && tmpValue > 0) {
        $("#category option:eq(" + (tmpValue - 1) + ")").prop('selected', true);
        categoryID = tmpValue;
    } else {
        categoryID = 1;
    }

    tmpValue = settingsObj["clarityReward"];
    if (tmpValue != null) {
        $("#clarity-reward").val(tmpValue);
        clarityRewardVal = tmpValue;
    } else {
        $("#clarity-reward").val(0.05);
        clarityRewardVal = 0.05;
    }

    tmpValue = settingsObj["numTrials"];
    if (tmpValue != null) {
        $("#num-trials").val(tmpValue);
        numTrialsVal = tmpValue;
    } else {
        $("#num-trials").val(4);
        numTrialsVal = 4;
    }

    tmpValue = settingsObj["trialDuration"];
    if (tmpValue != null) {
        $("#trial-duration").val(tmpValue);
        trialDurationVal = tmpValue;
    } else {
        $("#trial-duration").val(60);
        trialDurationVal = 60;
    }

    for (var i = 0; i < componentsCnt; i++) {
        tmpValue = settingsObj.components[i];
        if (tmpValue != null) {
            $("#clarity-" + (i + 1)).val(tmpValue);
        }      
    }
}

function saveSettings() {
    var currJSON = "";

    if (categories.val() != "") {
        settingsObj["categoryID"] = categories.val();
    } else {
        settingsObj["categoryID"] = 1;
    }

    if (clarityReward.val() != "") {
        settingsObj["clarityReward"] = clarityReward.val();
    } else {
        settingsObj["clarityReward"] = 0.05;
    }

    if (numTrials.val() != "") {
        settingsObj["numTrials"] = numTrials.val();
    } else {
        settingsObj["numTrials"] = 4;
    }

    if (trialDuration.val() != "") {
        settingsObj["trialDuration"] = trialDuration.val();
    } else {
        settingsObj["trialDuration"] = 60;
    }

    for (var i = 0; i < componentsCnt; i++) {
        if ($("#clarity-" + (i + 1)).val() != "") {
            settingsObj.components[i] = $("#clarity-" + (i + 1)).val();
        }
    }

    currJSON = JSON.stringify(settingsObj);

    $.post("../Settings/Save", currJSON, function (data) {
        if (data != null) {
            notifyLB.text(data);
        }

        settings.toggleClass("show");
        notify.toggleClass("show");
    });
}

function raiseNotify(noticeStr) {
    notifyLB.text(noticeStr)
    notify.toggleClass("show");
}

function setupTrials() {
    var temp = 0;

    try{
        trialComps = settingsObj.components.slice();
        // Randomize trial 1, push to trialSet, randomize trial 2,
        // push to trialSet, repeat.
        // Check if last component of trial 1 matches the first 
        // component of trial 2. If yes, then switch [0] and [1] 
        // of trial 2. Push to trialSet.
        for (var i = 0; i < numTrialsVal; i++) {
            shuffleArray(trialComps);

            if (i > 0) {
                if (trials[i - 1][componentsCnt - 1] == trialComps[0]) {
                    temp = trialComps[0];
                    trialComps[0] = trialComps[1];
                    trialComps[1]= temp;
                }
            }

            trials.push(trialComps.slice());
        }
        //console.log(trials);
        return true;
    } catch (e) {
        raiseNotify("Error occurred while setting up trials: " + e.message);
        return false;
    }
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function startExperiment() {
    isTrial = true;

    for (var i = 0; i < trials.length; i++) {
        for (var j = 0; j < trials[i].length; j++) {
            clarityPunish = trials[i][j];
            
            runTrial();
        }
    }
}

function runTrial() {
    currClarityVal = 100;
    buttonACnt = 0;
    buttonNCnt = 0;
    buttonARate = 0;
    buttonNRate = 0;
    timeRemaining = trialDurationVal;

    changeImage();

    timer = setInterval(function () {
        timeRemaining--;
        secondsLB.text(timeRemaining);

        if (timeRemaining == 0) clearInterval(timer);

        if (buttonACnt > 0) {
            buttonARate = parseFloat(buttonACnt / (trialDurationVal - timeRemaining)).toFixed(2);
        }

        if (buttonIntervalCnt == 0) decreaseClarity();

        buttonIntervalCnt = 0;

        buttonRate.text(buttonARate + " per second");
        console.log(timeRemaining);
    }, 1000);

    console.log(timeRemaining);
}

function increaseClarity() {
    currClarityVal -= (clarityReward * 100);

    if (currClarityVal <= 0) currClarityVal = 0;

    style["opacity"] = 1;
    style["-webkit-filter"] = "blur(" + currClarityVal + "px)";
    mainImage.css(style);
}

function decreaseClarity() {
    currClarityVal += (clarityPunish * 100);

    if (currClarityVal >= 100) {
        currClarityVal = 100;
        style["opacity"] = 0;
    }

    style["-webkit-filter"] = "blur(" + currClarityVal + "px)";
    mainImage.css(style);
}

function changeImage() {
    var currIndex = 0;
    currIndex = Math.floor((Math.random() * (imageList.length - 1)) + 0);

    style["opacity"] = 0
    style["-webkit-filter"] = "blur(100px)"
    mainImage.css(style);
    mainImage.attr("src", imageList[currIndex]);   
}