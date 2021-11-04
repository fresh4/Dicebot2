# Dicebot2
Dicebot, the second one

The project in this repository is a total rewrite of the original Dicebot code for better readability, maintainability, and to adhere to programming practices (for once). The original was also not on github, so this is an opportunity to use version control *shrug*.

Dicebot is a Discord bot using NodeJS, with an extensive amount of dice rolling options and other capabilities to make playing/running D&D with Discord easier.

### Install Locally
If you want to install and run Dicebot for yourself, doing so should be straightforward. After cloning the directory, in the root folder you'll need to create 3 files.

`server_info.json`: you can leave this empty. (NOTE: An empty .json should just contain `{}`, rather than literally empty.)

`reminderQueue.txt`: you can leave this empty.

`botconfig.json`: this will need some formatting for the bot to run properly, as shown below

```
{
    "token": "<your discord bot token>",
    "prefix": "!",
    "dicecloudKey": "<optional, dicecloud API key>",
    "owner": "<your discord id; it's like, a long number, not your username>"
}
```

After creating these files, `cd` to your directory and run `npm install` to download all depencies. You do, of course, need to install Node on your machine. This should create a `node_modules` folder.

Finally, once you've filled out `botconfig.json` with the necessary credentials, you can run `node index.js` to start up your bot.

# Documentation
The documentation here is split into docs for the user side (using the bot on discord) and developer side (using the code)
## User Documentation
The easiest way to figure out how to use the bot is to invoke the `help` command.
## Dev Documentation
The code base is split off for compartmentalization, so here's a quick overview of each file in the root folder.

`5eTools`: Contains a `data` subfolder which contains all the data the bot uses for lookups. And I mean like, all the data.

`commands`: Contains a separate .js file for every command. Documentation for each command is listed at the end of each file (which is where the data for the `help` command comes from). You may notice a few commands are here that aren't otherwise advertised and are for developer use:
* `reload`: which reloads a command without needing to restart the entire bot. Used after making backend changes. Usage is `!reload monster`, if you changed that file.
* `setactivity`: changes the "playing" message from Discord without you having to change it in the backend and restart the whole bot.

`events`: Manages particular DiscordJS events. Currently only two exist; `ready` which runs directly after the bot starts, and `message` which runs after every message that is sent. If you want to add a new (DiscordJS compatible) event, simply make a new file with the exact name of that event and run what you want in the exports block. For example if you wanted the bot to do something whenever a message is deleted, you'd create a new file called `messageDelete` and write your code in there. The `index.js` file should import it and use it after a reboot.

`functions`: Contains a series of files that basically handle everything the bot can do, mostly separated into categories based on the command or functionality type. For example, `diceFunctions.js` handles any commands to do with dice rolling (perhaps a bit redundant with `RNGFunctions.js` but whatever), `lookupFunctions.js` handles all the lookup commands, `parseFunctions.js` handles *generally* parsing the JSON data from 5eTools whereas `parseMonsterFunctions.js` and other similar files handle parsing specific to the type of file for outputs, etc.

`misc`: Contains more miscellanious 'commands', `eggs.js` contains easter eggs and `math.js` contains a basic math parser. Stuff that doesn't really count as a "command" goes here.

`cron.js`: Contained in the root folder for probably no good reason, but handles keeping track of time for the `reminder` command.

`index.js`: Is the central hub for the whole project. For the most part, it shouldn't be touched. It dynamically imports stuff from `command` and `events` folders, sets up necessary global variables etc. so that making a new command or event is as easy and dynamic as possible.

`package.json` and `package-lock.json`: Package dependencies. If you happen to install new npm packages for functionalities, they should be documented in these files automatically. If you somehow manage to lose your `node_modules` file, you should then be able to get it back with a quick and easy `npm install`.
