// DOM elements
var mainOptions = $("#options");
var settingsBtn = $("#settings-btn");
var saveBtn = $("#save-btn");
var cancelBtn = $("#cancel-btn");
var dataBtn = $("#data-btn");
var startExpBtn = $("#start-exp-btn");
var startTrialBtn = $("#start-trial-btn");
var settings = $("#settings");
var notify = $("#notify");
var notifyLB = $("#notify-body");
var okBtn = $(".ok-btn");
var backBtn = $(".back-btn");
var instructions = $("#instructions");
var trial = $("#trial-body");
var mainImage = $("#main-image");
var categories = $("#category");
var clarityReward = $("#clarity-reward");
var numTrials = $("#num-trials");
var trialDuration = $("#trial-duration");
var buttonRateLB = $("#button-rate");
var buttonCountLB = $("#button-count");
var buttonNCountLB = $("#button-n-count");
var secondsLB = $("#seconds");
var border = $("#border");
var loadingLB = $(".loading");
var dataView = $("#data-view");
var tableEnd = $("#data-table > tbody:last");
var showStats = $("#show-stats");
var trialStatsLB = $("#trial-stats");
var blackOut = $("#black-out");

// global variables
var settingsObj = null;
var responseObj = null;
var trials = [];
var trialComps = [];
var imageList = [];
var dataLog = {
    "summary": "",
    "trials": []
};
var dataLogAll = null;

var participantID = "";
var categoryID = 0;
var clarityRewardVal = 0;
var numTrialsVal = 0;
var trialDurationVal = 0;
var buttonACnt = 0;
var buttonNCnt = 0;
var buttonARate = 0.0;
var buttonNRate = 0.0;

var timer = null;
var timeRemaining = 0;
var isTrial = false;
var isShowStats = false;
var currClarityVal = 100;
var clarityPunishVal = 0;
var buttonIntervalCnt = 0;
var currColorVal = "";
var style = {
    "opacity": "1",
    "-webkit-filter": "blur(" + currClarityVal + "px)",
    "filter": "blur(" + currClarityVal + "px)"
};

// constants
const componentsCnt = 6;

// BEGIN - Event handling of DOM elements ========================

settingsBtn.click(function () {
    $.when(loadSettings()).then(function() {
        mainOptions.hide();
        settings.toggleClass("show");
    });
});

saveBtn.click(function () {
    $.when(saveSettings()).then(function () {
        loadSettings();
    });
});

cancelBtn.click(function () {
    settings.toggleClass("show");
    mainOptions.show();
});

okBtn.click(function () {
    notify.toggleClass("show");
    mainOptions.show();
});

startExpBtn.click(function () {
    loadingLB.show();
    mainOptions.hide();

    $.when(loadSettings()).then(function () {
        loadImages();
    }).then(function(){
        if (setupTrials()) {
            loadingLB.hide();           
            instructions.toggleClass("show");
        }
    });
    
});

startTrialBtn.click(function () {
    instructions.toggleClass("show");
    trial.show();

    if (isShowStats) trialStatsLB.show();
    else trialStatsLB.hide();

    runTrial();
});

dataBtn.click(function () {
    mainOptions.hide();
    loadData();
});

backBtn.click(function () {
    dataView.toggleClass("show");
    mainOptions.show();
})

$(document).keyup(function (e) {
    if (isTrial) {
        if (e.which == 65) {
            buttonACnt++;
            buttonCountLB.text("Button A Count: " + buttonACnt);
            buttonIntervalCnt++;
            increaseClarity();
        }

        if (e.which == 78) {
            buttonNCnt++;
            buttonNCountLB.text("Button N Count: " + buttonNCnt);
            changeImage();
        }
    }
});

// END - Event handling of DOM elements ========================

// BEGIN - Functions ===========================================

function loadSettings() {
   return $.get("../Settings/Load", function (data) {
        if (data != null) settingsObj = data;

        if (settingsObj["error"] != null) {
            notifyLB.text(settingsObj["error"]);
            notify.show();
            return;
        }
        //console.log(settingsObj);
        mapSettings();
    });
}

function loadImages() {
   return $.get("../Images/Load", "catID=" + categoryID, function (data) {
        if (data["error"] != null) {
            raiseNotify(data["error"]);
        } else {
            imageList = data;
        }
        console.log(imageList);
    });
}

function mapSettings() {
    var tmpValue = null;

    tmpValue = settingsObj["categoryID"];
    if (tmpValue != null && tmpValue > 0) {
        $("#category option:eq(" + (tmpValue - 1) + ")").prop('selected', true);
        categoryID = parseInt(tmpValue);
    } else {
        categoryID = 1;
    }

    tmpValue = settingsObj["clarityReward"];
    if (tmpValue != null) {
        clarityReward.val(tmpValue);
        clarityRewardVal = parseFloat(tmpValue);
    } else {
        clarityReward.val(0.05);
        clarityRewardVal = 0.05;
    }

    tmpValue = settingsObj["numTrials"];
    if (tmpValue != null) {
        numTrials.val(tmpValue);
        numTrialsVal = parseInt(tmpValue);
    } else {
        numTrials.val(4);
        numTrialsVal = 4;
    }

    tmpValue = settingsObj["trialDuration"];
    if (tmpValue != null) {
        trialDuration.val(tmpValue);
        trialDurationVal = parseInt(tmpValue);
    } else {
        trialDuration.val(60);
        trialDurationVal = 60;
    }

    tmpValue = settingsObj["showStats"];
    if (tmpValue != null && parseInt(tmpValue) > 0) {
        showStats.prop("checked", true);
        isShowStats = true;
    } else {
        showStats.prop("checked", false);
        isShowStats = false;
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

    loadingLB.show();
    settings.toggleClass("show");

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

    if (showStats.is(":checked")) {
        settingsObj["showStats"] = 1;
    } else {
        settingsObj["showStats"] = 0;
    }

    trialDurationVal = settingsObj["trialDuration"];

    for (var i = 0; i < componentsCnt; i++) {
        if ($("#clarity-" + (i + 1)).val() != "") {
            settingsObj.components[i] = $("#clarity-" + (i + 1)).val();
        }
    }

    currJSON = JSON.stringify(settingsObj);

    return $.post("../Settings/Save", currJSON, function (data) {
        // delay for user experience
        setTimeout(function () {          
                     
            if (data["error"] != null) {              
                raiseNotify(data["error"]);
            } else {
                raiseNotify(data["success"]);
            }

            loadingLB.hide();
        }, 1000);     
    });
}

function raiseNotify(noticeStr) {
    notifyLB.html(noticeStr)
    notify.toggleClass("show");
}

function setupTrials() {
    var temp = 0;
    dataLog.length = 0;
    trials.length = 0;
    trialComps.length = 0;

    try {
        participantID = randomString(10);

        dataLog["summary"] = {
            "participantID": participantID,
            "categoryID": categoryID,
            "clarityReward": clarityRewardVal,
            "numTrials": numTrialsVal,
            "trialDuration": trialDurationVal,
            "components": settingsObj.components.slice()
        };

        for (var i = 0; i < componentsCnt; i++) {
            trialComps.push({
                "clarityPunish": settingsObj.components[i],
                "color": settingsObj.colors[i]
            });
        }

        // Randomize trial 1, push to trialSet, randomize trial 2,
        // push to trialSet, repeat.
        // Check if last component of trial 1 matches the first 
        // component of trial 2. If yes, then switch [0] and [1] 
        // of trial 2. Push to trialSet.
        for (var i = 0; i < numTrialsVal; i++) {
            shuffleArray(trialComps);

            if (i > 0) {
                if (trials[trials.length - 1].clarityPunish == trialComps[0].clarityPunish) {
                    temp = trialComps[0];
                    trialComps[0] = trialComps[1];
                    trialComps[1] = temp;
                }
            }

            Array.prototype.push.apply(trials, trialComps);
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

function runTrial() {
    var currObj = null;

    if (trials.length > 0) {
        isTrial = true;

        currObj = trials.pop();
        clarityPunishVal = currObj["clarityPunish"];
        currColorVal = currObj["color"];

        currClarityVal = 100;
        buttonACnt = 0;
        buttonNCnt = 0;
        buttonARate = 0;
        buttonNRate = 0;
        timeRemaining = trialDurationVal;

        setBorderColor();
        changeImage();

        buttonCountLB.text("Button A Count: " + buttonACnt);
        buttonNCountLB.text("Button N Count: " + buttonNCnt);

        timer = setInterval(function () {
            timeRemaining--;

            if (timeRemaining <= 0) {
                clearInterval(timer);
                recordData();

                blackOut.show();

                setTimeout(function(){
                    blackOut.hide();
                    runTrial();
                },5000);
            }

            if (buttonACnt > 0) {
                buttonARate = parseFloat(buttonACnt / (trialDurationVal - timeRemaining)).toFixed(2);
            }

            if (buttonNCnt > 0) {
                buttonNRate = parseFloat(buttonNCnt / (trialDurationVal - timeRemaining)).toFixed(2);
            }

            if (buttonIntervalCnt == 0) decreaseClarity();

            buttonIntervalCnt = 0;

            secondsLB.text(timeRemaining + " second(s) remaining");
            buttonRateLB.text("Button A Rate: " + buttonARate + " per second");
        }, 1000);
    } else {
        isTrial = false;
        trial.hide();
        border.hide();
        saveData();       
        console.log(JSON.stringify(dataLog));
    }  
}

function recordData() {
    dataLog["trials"].push({
            "clarityPunish": clarityPunishVal,
            "buttonACnt": buttonACnt,
            "buttonARate": buttonARate,
            "buttonNCnt": buttonNCnt,
            "buttonNRate": buttonNRate
    });
}

function increaseClarity() {
    currClarityVal -= (clarityRewardVal * 100);

    if (currClarityVal <= 0) currClarityVal = 0;

    style["opacity"] = 1;
    style["-webkit-filter"] = "blur(" + currClarityVal + "px)";
    style["filter"] = "blur(" + currClarityVal + "px)";
    mainImage.css(style);
}

function decreaseClarity() {
    currClarityVal += (clarityPunishVal * 100);

    if (currClarityVal >= 100) {
        currClarityVal = 100;
        style["opacity"] = 0;
    }

    style["-webkit-filter"] = "blur(" + currClarityVal + "px)";
    style["filter"] = "blur(" + currClarityVal + "px)";
    mainImage.css(style);
}

function changeImage() {
    var currIndex = 0;
    var currImagePath = "";

    // get our random image, then remove it from the array
    currIndex = Math.floor(Math.random() * (imageList.length - 1));

    currImagePath = imageList[currIndex];

    imageList.splice(currIndex, 1);

    // reset the clarity value and hide the image
    currClarityVal = 100;

    // wait for the image to be fully loaded before showing
    var img = new Image();
    img.onload = function () {
        mainImage.attr("src", currImagePath);
        mainImage.css("opacity", 0);
    };

    img.src = currImagePath;
}

function setBorderColor() {
    $("#top, #right, #bottom, #left").css("background", currColorVal);
    border.show();
}

function saveData() {
    var currJSON = JSON.stringify(dataLog);

    loadingLB.show();

    return $.post("../Data/Save", currJSON, function (data) {
        setTimeout(function () {
            
            if (data != null) raiseNotify(data + "<p>Experiment complete! Thank you for participating!<p>");
            loadingLB.hide();
        }, 1000);      
    });
}

function loadData() {
    loadingLB.show();

    return $.get("../Data/Load", function (data) {
        setTimeout(function () {          
            dataLogAll = data;

            if (dataLogAll["error"] != null) {
                raiseNotify(dataLogAll["error"]);
                loadingLB.hide();
                return;
            }
            
            mapData();
            loadingLB.hide();
        }, 1000);        
    });
}

function mapData() {
    var currFileName = "";
    var currCreationDtm = "";
    var currFilePath = "";
    // empty our table
    $("#data-table tr").slice(1).remove();

    for (var i = 0; i < dataLogAll.length; i++) {
        currFileName = dataLogAll[i].FileName;
        currFilePath = dataLogAll[i].FilePath;
        currCreationDtm = dataLogAll[i].FileCreationDtm;

        //console.log(currFileName);

        tableEnd.append("<tr><td>" + currFileName + "</td><td>" + currCreationDtm +
            "</td><td><a href=\"../Data/" + currFileName + "\">Download</a></td></tr>");
    }

    dataView.toggleClass("show");
}

function randomString(length) {
    var charSet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += charSet[Math.round(Math.random() * (charSet.length - 1))];
    return result;
}

function downloadLink(name, type) {
    $.get("../Data/Download", {"name":name, "type":type});
}

// END - Functions ===========================================