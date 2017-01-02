// ==UserScript==
// @name         Member Post tracker
// @namespace    meshcollider.github.io
// @version      0.1
// @description  Finds member posts in a subforum and compiles a leaderboard of posts
// @author       MeshCollider
// @match        http://*/*
// @include     *hackforums.net/*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// ==/UserScript==

debug = false;

(function() {
    'use strict';
    if(checkThreadURL()){
        var docSplit = document.getElementById('content').innerHTML.split('\n');
        for(var i=0; i< docSplit.length; i++){
            if(docSplit[i].indexOf('start: showthread_quickreply ') != -1){
                docSplit[i] = "<br /><a href=\"#\" id=\"leaderboardButton\" class=\"bitButton\" title=\"Load Leaderboard\">Load Leaderboard</a><br />"+docSplit[i];
                document.getElementById('content').innerHTML = docSplit.join('\n');
            }
        }
        document.getElementById ("leaderboardButton").addEventListener (
            "click", ButtonClickAction, false
        );
    }


})();

function ButtonClickAction (zEvent) {
    createPostCountBox();
}

function checkThreadURL() {
	// SET THIS TO THE THREAD YOU WILL POST THE LEADERBOARD ON
	var threadID = "5461174";

    if(document.URL.indexOf("showthread.php?tid=" + threadID) != -1 && document.URL.indexOf("&page=") == -1) {
        return true;
    }
    return false;
}

function createPostCountBox() {
	var postcounts = [], i, finalBB = [], done = 0;

	// SET THIS TO THE LOUNGE THREAD WHOSE POSTS YOU DON'T WANT TO COUNT
    var loungeThreads = ["5461783", "5500795"];

	// SET THIS ARRAY TO THE USER IDs OF THE GROUP MEMBERS
    var members = ["3176965", "1680975", "1915596", "504910", "1453525", "2667861", "2181175", "2504443", "2015410", "1610871", "525019", "1343812", "2947999"];

	// SET THIS TO THE OUTPUT OF THE SCRIPT FROM THE PREVIOUS WEEK TO TRACK WEEKLY POSTS
	var lastWeekInfo = "3176965-188|1680975-97|1915596-151|504910-347|1453525-170|2667861-74|2181175-363|2504443-150|2015410-271|1610871-210|525019-265|1343812-7|2947999-835|";

	// SET THIS TO THE NAME OF THE SUBFORUM YOU WANT TO TRACK
	var subforumName = "Eclipse";

	var loungePostContents = [];
    var thisWeekInfo = "";

    for (i = 0; i < loungeThreads.length; i++) {
        var loungeURL = "https://hackforums.net/misc.php?action=whoposted&tid=" + loungeThreads[i];
        $.ajax({
            async: false,
            type: 'GET',
            url: loungeURL,
            success: function(response) {
                loungePostContents[i] = response;
            },
            error: function(xhr, textStatus, errorThrown ) {
                $.ajax(this);
                return;
            }
        });
    }

    finalBB.push('[size=x-large][b]' + subforumName + ' SF Poster Leaderboard[/b][/size]');
    var sortable = [];

    for(i = 0; i < members.length; i++){
        uid = members[i];
        var postactivityURL = "hackforums.net/postactivity.php?uid=" + uid;

        $.ajax({
            async: false,
            type: 'GET',
            url: 'postactivity.php?uid=' + uid,
            success: function(response) {
                uid = this.url.split("uid=")[1];
                username = (response.split("uid=" + uid + "\">")[1]).split("</a>")[0];
                postcount = (response.split("<a href=\"forumdisplay.php?fid=250\">" + subforumName +"</a></td>\r\n<td class=\"trow1\">")[1]).split("</td>")[0];
                loungePosts = 0;

                var j = 0;
                for (j = 0; j < loungePostContents.length; j++) {
                    loungePostContent = loungePostContents[j];
                    if(loungePostContent.indexOf(username + "</span></a></a></td>\r\n<td class=\"trow2\">") != -1){
                        loungePosts += parseInt((loungePostContent.split(username + "</span></a></a></td>\r\n<td class=\"trow2\">")[1]).split("</td>")[0]);
                    } else if(loungePostContent.indexOf(username + "</span></a></a></td>\r\n<td class=\"trow1\">") != -1) {
                        loungePosts += parseInt((loungePostContent.split(username + "</span></a></a></td>\r\n<td class=\"trow1\">")[1]).split("</td>")[0]);
                    }
                }

                thisWeekInfo += uid + "-" + (postcount - loungePosts) + "|";
                if(lastWeekInfo.indexOf(uid + "-") != -1) {
                    lastWeek = (lastWeekInfo.split(uid + "-")[1]).split("|")[0];
                }
                else {
                    lastWeek = 0;
                }
                thisWeek = (postcount - loungePosts) - lastWeek;
                sortable.push([uid, username, postcount, (postcount - loungePosts), thisWeek, (2500 - postcount - (-1*loungePosts))]);
            },
            error: function(xhr, textStatus, errorThrown ) {
                $.ajax(this);
                return;
            }
        });
    }

    sortable.sort(function(a, b) {
        return b[3] - a[3];
    });

    for(i = 0; i < sortable.length; i++)
    {
        var bbcode = (i+1) + ") [url=https://hackforums.net/member.php?action=profile&uid=" + sortable[i][0] + "]" + sortable[i][1] + "[/url] - " + sortable[i][2] + " (" + sortable[i][3] + ") | " + sortable[i][4] + " | " + sortable[i][5];
        finalBB.push(bbcode);
    }

    var keyText = "Key: Username - Total Posts (Total Posts without lounge) | Posts this week | Posts til award";
    finalBB.push("\n" + keyText + "\n" + thisWeekInfo);
    finalBB = finalBB.join('\n');

    textboxHTML = '<textarea rows="5" cols=100%>' + finalBB + '</textarea>';
    tableHTML = '<br /><table border="0" cellspacing="1" cellpadding="4" class="tborder" id="EclipsePostingLeaderboard"><tbody><tr><td class="thead" colspan="6"><strong>Eclipse SF Posting Leaderboard</strong></td></tr><tr><td class="trow1">Code:      </td><td class="trow1">'+textboxHTML+'</td></tr></tbody></table><br>';

    docSplit = document.getElementById('content').innerHTML.split('\n');
    for(i=0; i< docSplit.length; i++){
        if(docSplit[i].indexOf('start: showthread_quickreply ') != -1){
            docSplit[i] = tableHTML+docSplit[i];
            document.getElementById('content').innerHTML = docSplit.join('\n');
            return;
        }
    }
}