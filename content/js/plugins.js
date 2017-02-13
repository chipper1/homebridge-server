/* eslint-env browser, jquery */

/* exported listInstalledPlugins */
/* exported callPluginOperation */
/* exported addPlatformConfig */


function listInstalledPlugins() {
    $.getJSON("/api/installedPlugins", function(installedPlugins) {
        $("#installedPluginsTable").empty();
        $.each( installedPlugins, function( id_plugin, plugin ) {
            var activeInfo = "<span class='activityActive'></span>";
            var usageInfo = "Platforms: " + plugin.platformUsage + ", Accessories: " + plugin.accessoryUsage;
            var versionInfo = "Version: " + plugin.version;
            var action = "";
            var buttonStyle = "style='height: 34px; line-height: 16px; vertical-align:middle;outline:none !important;'";
            if (plugin.isLatestVersion === "0") {
                action += "<a href='#' class='btn btn-success center-block' " + buttonStyle + " onclick='callPluginOperation(\"" + plugin.name + "@" + plugin.latestVersion + "\", \"update\");'><span style='font-size:25px;' title='Available Version: " + plugin.latestVersion + "'>Update</span></a>";
            }
            action += "<a href='#' class='btn btn-danger center-block' " + buttonStyle + " onclick='callPluginOperation(\"" + plugin.name + "\", \"remove\");'><span style='font-size:25px;'>Uninstall</span></a>";
            var row =  "<div class='row content' title='" + versionInfo + ", " + usageInfo + "'> \
                            <div>" + activeInfo + "</div>\
                            <div><a href='" + plugin.homepage + "' target=_blank>" + plugin.name + "</a></div>\
                            <div>" + plugin.author + "</div>\
                            <div>" + plugin.description + "</div>\
                            <div>" + action + "</div>\
                       </div>";
            $("#installedPluginsTable").append(row);
        });
    });
}

function callPluginOperation(pluginName, operation) {
    $('#progressModal').modal('show');

    var opsName = "";
    var opsCall = "";
    switch (operation) {
        case 'install':
            opsName = "Installing: ";
            opsCall = "/api/installPlugin?" + pluginName;
            break;
        case 'update':
            opsName = "Updating: ";
            opsCall = "/api/updatePlugin?" + pluginName;
            break;
        case 'remove':
            opsName = "Removing: ";
            opsCall = "/api/removePlugin?" + pluginName;
            break;
        default:
            return;
    }

    $("#progressModalLogContainer").text("");
    $("#progressModalTitle").text(opsName + pluginName);
    $("#progressModalStatus").text("Working...");
    $.get( opsCall, function( data ) {
        var lines = data.split(/\r?\n/);
        for (var lineID in lines) {
            if (lines[lineID].startsWith("{\"hbsAPIResult\":")) {
                var apiResult = JSON.parse(lines[lineID]).hbsAPIResult;
                if (apiResult.success) {
                    $("#progressModalStatus").text("Finished!");
                    listInstalledPlugins();
                } else {
                    $("#progressModalStatus").text("Finished with error: " + apiResult.msg);
                }
            } else {
                $("#progressModalLogContainer").append(lines[lineID] + "\n");
            }
            $("#progressModalLogContainer").scrollTop($("#progressModalLogContainer").prop("scrollHeight"));
        }
    });
}