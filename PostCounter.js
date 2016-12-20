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
	
	// SET THIS TO THE LOUNGE THREAD WHOSE POSTS YOU DON'T WANT TO COUNT
    var loungeThreadID = "5461783";
	
	// SET THIS ARRAY TO THE USER IDs OF THE GROUP MEMBERS
    var members = ["3176965", "1680975", "1915596", "504910", "1453525", "2667861", "2181175", "2504443", "2015410", "1610871", "525019", "1343812", "2947999"], postcounts = [], i, finalBB = [], done = 0;    
    
	// SET THIS TO THE OUTPUT OF THE SCRIPT FROM THE PREVIOUS WEEK TO TRACK WEEKLY POSTS
	var lastWeekInfo = "3176965-188|1680975-91|1915596-139|504910-284|1453525-169|2667861-62|2181175-292|2504443-138|2015410-234|1610871-154|525019-222|1343812-7|2947999-736|";
    
	// SET THIS TO THE NAME OF THE SUBFORUM YOU WANT TO TRACK
	var subforumName = "Eclipse";
	
	var loungeURL = "https://hackforums.net/misc.php?action=whoposted&tid=" + loungeThreadID;
	var loungePostContent;
    var thisWeekInfo = "";
    
    $.ajax({
            async: false,
            type: 'GET',
            url: loungeURL,
            success: function(response) {
                loungePostContent = response;
            },
            error: function(xhr, textStatus, errorThrown ) {
                $.ajax(this);
                return;
            }
        });
    
    finalBB.push('[size=x-large][b]' + subforumName + ' SF Poster Leaderboard[/b][/size]');
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

                if(loungePostContent.indexOf(username + "</span></a></a></td>\r\n<td class=\"trow2\">") != -1){
                    loungePosts = (loungePostContent.split(username + "</span></a></a></td>\r\n<td class=\"trow2\">")[1]).split("</td>")[0];
                } else if(loungePostContent.indexOf(username + "</span></a></a></td>\r\n<td class=\"trow1\">") != -1) {
                     loungePosts = (loungePostContent.split(username + "</span></a></a></td>\r\n<td class=\"trow1\">")[1]).split("</td>")[0];
                } else {
                    loungePosts = 0;
                }
                
                thisWeekInfo += uid + "-" + (postcount - loungePosts) + "|";
                if(lastWeekInfo.indexOf(uid + "-") != -1) {
                    lastWeek = (lastWeekInfo.split(uid + "-")[1]).split("|")[0];
                }
                else {
                    lastWeek = 0;
                }
                thisWeek = (postcount - loungePosts) - lastWeek;
                bbcode = "[url=https://hackforums.net/member.php?action=profile&uid=" + uid + "]" + username + "[/url] - " + postcount + " (" + (postcount - loungePosts) + ") | " + thisWeek + " | " + (2500 - postcount - (-1*loungePosts));
                finalBB.push(bbcode);
            },
            error: function(xhr, textStatus, errorThrown ) {
                $.ajax(this);
                return;
            }
        });
    }

    finalBB.push("\n" + thisWeekInfo);
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