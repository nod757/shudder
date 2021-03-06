﻿(function (hud, $, undefined) {

    hud.degreesVisible = 114;
    hud.halfDegreesVisible = hud.degreesVisible / 2;
    hud.determineVisible = function (targetCompassAngle, targetGroundAngle) {
        if (
            (
                (targetCompassAngle >= (hud.compassAngle - hud.halfDegreesVisible) && targetCompassAngle <= (hud.compassAngle + hud.halfDegreesVisible))
                  || (targetCompassAngle >= (hud.compassAngle + 360 - hud.halfDegreesVisible) && targetCompassAngle <= (hud.compassAngle + 360 + hud.halfDegreesVisible))
                )
            && (
                (targetGroundAngle >= (hud.groundAngle - hud.halfDegreesVisible) && targetGroundAngle <= (hud.groundAngle + hud.halfDegreesVisible))
                  || (targetGroundAngle >= (hud.groundAngle + 360 - hud.halfDegreesVisible) && targetGroundAngle <= (hud.groundAngle + 360 + hud.halfDegreesVisible))
                )

            ) {
            return true;
        }
        else { return false; }
    };
    hud.determineSize = function (targetDistance) {
        //reduce size by .05% every meter
        percentAdjust = 100;
        if (targetDistance < 5)
        { percentAdjust = 100 + (2 * targetDistance); }
        else
        { percentAdjust = 100 - (3.5 * targetDistance); }
        if (percentAdjust < 10) { percentAdjust = 10; }
        return (percentAdjust);
    };
    hud.determineLocation = function (targetCompassAngle, targetGroundAngle) {
        newCompassAngle = hud.compassAngle;
        newGroundAngle = hud.groundAngle;
        newTargetCompassAngle = targetCompassAngle;
        newTargetGroundAngle = targetGroundAngle;
        if (Math.abs(newTargetCompassAngle - newCompassAngle) > hud.halfDegreesVisible) {
            if (newCompassAngle > (360 - hud.halfDegreesVisible)) {
                newTargetCompassAngle += 360;
            }
            else {
                newCompassAngle += 360;
            }
        }
        var w = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

        var h = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;

        var degreeW = w / hud.degreesVisible;
        var degreeH = h / hud.degreesVisible;
        var leftmostAngle = newCompassAngle - hud.halfDegreesVisible;
        if (leftmostAngle < 0)
        { leftmostAngle += 360; }
        var topMostAngle = newGroundAngle + hud.halfDegreesVisible;
        var topPosition = (topMostAngle - newTargetGroundAngle) * degreeH;

        if (newTargetCompassAngle < leftmostAngle)
        { newTargetCompassAngle += 360; }
        var leftPosition = (newTargetCompassAngle - leftmostAngle) * degreeW;
        var result = { left: leftPosition, top: topPosition }
        return (result);
    };
    hud.drawTargets = function () {
        //read array
        //console.log(window.targets.length);
        //delete all targets indiscriminatly, update this to avoid some of the lag
        $("img[id^='target']").remove();
        $("div[id^='target']").remove();
        hud.createRadar();
        //hud.clearTargetIndicators();
        //prepare for radar update
        var c = document.getElementById("radar-view");
        var ctx = c.getContext("2d");
        radianDegree = 0.01745329;
        //loop through targets
        for (var i = 0; i < window.targets.length; i++) {

            var theTarget = window.targets[i];
            if (hud.determineVisible(theTarget.position.bearing, theTarget.position.elevationAngle)) {
                var imgsize = hud.determineSize(theTarget.position.distance);
                var position = hud.determineLocation(theTarget.position.bearing, theTarget.position.elevationAngle);
                var targetName = "target" + theTarget.id;
                if ($("#" + targetName).length == 0) {
                    //it doesn't exist
                    if (theTarget.unitType == "Drone") {
                        $('#sphere-box2').append('<img src="/Content/Images/Source/uav-512.png" class="highlight"  style="position:absolute;opacity: 0.4;" id="' + targetName + '" />');
                    }
                    else {
                        $('#sphere-box2').append('<img src="/Content/Images/Source/r2d2-512.png" class="highlight" style="position:absolute;opacity: 0.4;" id="' + targetName + '" />');
                    }
                }
                var targetImage = document.getElementById(targetName);
                targetImage.style.height = imgsize + '%';
                targetImage.style.width = imgsize + '%';
                targetImage.style.top = (position.top - (targetImage.clientHeight / 2)) + 'px';
                targetImage.style.left = (position.left - (targetImage.clientWidth / 2)) + 'px';
                // Quick Target Indicator Details
                $('#sphere-box2').append('<div class="indicator" id="' + targetName + 'indicator" ></div>');
                var targetDetail = document.getElementById(targetName + 'indicator');
                targetDetail.innerHTML = Math.round(theTarget.position.distance) + 'm, '
                    + theTarget.position.totalObstructions + ' obstructions <br/>'
                + 'Id: ' + theTarget.id + '<br/>'
                + 'Last Update: ' + Math.round((theTarget.timestamp- Date.now()) / 1000)+'s';
                targetDetail.style.width = targetImage.style.width;
                targetDetail.style.top = ((position.top + (targetImage.clientHeight))) + 'px';
                targetDetail.style.left = (-20 + (position.left - (targetImage.clientWidth) / 2)) + 'px';
                

                //hud.drawTargetIndicator(targetImage.x, targetImage.y, theTarget.position.distance, theTarget.position.bearing, theTarget.position.totalObstructions);



                //update radar
                ctx.beginPath();
                var radius = 15;
                if (theTarget.position.distance > 100)
                { radius = 35 }
                var plotPosition = hud.compassAngle - 90 - theTarget.position.bearing;//subtracting 90 to get it to draw starting at up instead of right.
                if (plotPosition < 0) { plotPosition += 360; }
                ctx.arc(100, 75, radius, (plotPosition - 5) * radianDegree, (plotPosition + 5) * radianDegree);
                ctx.strokeStyle = "#F0F";
                ctx.stroke();
                ctx.closePath();
            }
            else {
                //update radar
                ctx.beginPath();
                var radius = 15;
                if (theTarget.position.distance > 100)
                { radius = 35 }
                var plotPosition = hud.compassAngle-90 - theTarget.position.bearing;//subtracting 90 to get it to draw starting at up instead of right.
                if (plotPosition < 0) { plotPosition += 360; }
                ctx.arc(100, 75, radius, (plotPosition - 5) * radianDegree, (plotPosition + 5) * radianDegree);
                ctx.strokeStyle = "#F0F";
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
    hud.createRadar = function () {
        //Create radar concentric circle with crosshair
        var c = document.getElementById("radar-view");
        var ctx = c.getContext("2d");
        //clear canvas
        ctx.clearRect(0, 0, c.width, c.height);
        var w = c.width;
        c.width = 1;
        c.width = w;
        //END clear canvas
        ctx.beginPath();
        ctx.arc(100, 75, 50, 0, 2 * Math.PI);
        ctx.strokeStyle = "red";
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.arc(100, 75, 25, 0, 2 * Math.PI);
        ctx.strokeStyle = "red";
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.moveTo(100, 125);
        ctx.lineTo(100, 25);
        ctx.moveTo(150, 75);
        ctx.lineTo(50, 75);
        ctx.strokeStyle = "red";
        ctx.stroke();
        ctx.closePath();
        //Add Target indicators

    };
    hud.updateRadar = function () {
        //Create radar concentric circle with crosshair
        var c = document.getElementById("radar-view");
        var ctx = c.getContext("2d");



        ctx.beginPath();
        ctx.arc(100, 75, 50, 0, 2 * Math.PI);
        ctx.strokeStyle = "red";
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.arc(100, 75, 25, 0, 2 * Math.PI);
        ctx.strokeStyle = "red";
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.moveTo(100, 125);
        ctx.lineTo(100, 25);
        ctx.moveTo(150, 75);
        ctx.lineTo(50, 75);
        ctx.strokeStyle = "red";
        ctx.stroke();
        ctx.closePath();
        //Add Target indicators

    };
    //hud.clearTargetIndicators = function () {
    //    //Create radar concentric circle with crosshair
    //    var c = document.getElementById("indicators");
    //    var ctx = c.getContext("2d");
    //    //clear canvas
    //    ctx.clearRect(0, 0, c.width, c.height);
    //    var w = c.width;
    //    c.width = 1;
    //    c.width = w;
    //    //move the call below into the resize method.
    //    var w = window.innerWidth
    //    || document.documentElement.clientWidth
    //    || document.body.clientWidth;

    //    var h = window.innerHeight
    //    || document.documentElement.clientHeight
    //    || document.body.clientHeight;
    //    c.height = h;
    //    c.width = w
    //    //END clear canvas
    //};
    //hud.drawTargetIndicator = function (sourceTop, sourceLeft, distance, orientation, obstructions) {
    //    //Create radar concentric circle with crosshair
    //    var c = document.getElementById("indicators");
    //    var ctx = c.getContext("2d");
    //    //outer circle
    //    ctx.beginPath();
    //    ctx.arc(sourceTop-50, sourceLeft + 20, 50, 0, 2 * Math.PI);
    //    ctx.strokeStyle = "red";
    //    ctx.stroke();
    //    ctx.closePath();
    //};

    hud.drawReticle = function () {
        //Create radar concentric circle with crosshair
        var c = document.getElementById("reticle");
        var ctx = c.getContext("2d");



        ctx.beginPath();
        ctx.arc(9, 9, 9, 0, 2 * Math.PI);
        ctx.strokeStyle = "red";
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.moveTo(9, 18);
        ctx.lineTo(9, 0);
        ctx.moveTo(0, 9);
        ctx.lineTo(18, 9);
        ctx.strokeStyle = "red";
        ctx.stroke();
        ctx.closePath();
    };

}(window.hud = window.hud || {}, jQuery));