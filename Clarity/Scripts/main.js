var settingsBtn = $("#settingsBtn");
var settings = $("#settings");
var errorLB = $("#error");

var settingsObj;

settingsBtn.click(function () {
    $.get("../Settings/Get", function (data) {
        settingsObj = data;

        mapSettings();
    });
});

function mapSettings() {
    var tmpValue = null;

    if (settingsObj["error"] != null) {
        errorLB.text(settingsObj["error"]);
        errorLB.show();
        return;
    }

    tmpValue = settingsObj["categoryID"];
    if (tmpValue != null && tmpValue > 0) $("#category option:eq(" + tmpValue + ")").prop('selected', true);

    tmpValue = settingsObj["clarityReward"];
    if (tmpValue != null) {
        $("#clarity-reward").val(tmpValue);
    } else {
        $("#clarity-reward").val(0.05);
    }

    tmpValue = settingsObj["numTrials"];
    if (tmpValue != null) {
        $("#num-trials").val(tmpValue);
    } else {
        $("#num-trials").val(4);
    }

    tmpValue = settingsObj["trialDuration"];
    if (tmpValue != null) {
        $("#trial-duration").val(tmpValue);
    } else {
        $("#trial-duration").val(60);
    }

    for (var i = 0; i < settingsObj.components.length; i++) {
        tmpValue = settingsObj.components[i];
        if (tmpValue != null) {
            $("#clarity-" + (i + 1)).val(tmpValue);
        }      
    }

    settings.show();
}