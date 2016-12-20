# MyBB Post Counter

This is just a simple userscript to count MyBB forum member posts in specific subforums used for group leaders to track their members weekly post counts.
Mostly just for practice because I haven't got experience with userscripts before.
Had to make it asynchronous to avoid being caught by the firewall and hit with 503's.

### Usage
1) Just use Tampermonkey or another plugin for your browser and add the script

2) The parameters which need to be changed for each usage case have been commented.

3) It will add a button to the bottom of the first page of the specified thread, which when clicked will load a box of myCode for the leaderboard

4) At the bottom of the generated code it will also generate a weekly post code which needs to replace the old one in the script each week to track weekly post changes.
