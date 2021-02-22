![Uyn logo](https://i.imgur.com/1UHPT0e.png)

# Uyn BOT Changelogs

### February 22, 2021
* Updated setquote, showquote and deletequote commands

### February 20, 2021

* Fixed a typo and added a new property in the `help` command to help the later use.

### February 18, 2021

* Fixed a serious bug in the `setquote` command that caused the `Connection Error` while setting the ping-responsing message.

### February 16, 2021

* Added the `deleterole` and `togglequote` command.
* Fixed some typos in `setquote` and `deletequote` command.
* Fixed a bug in the `GetAllQuotes.php` file that may cause a serious error if there's no ping-responsing quote set in the database.
* Removed some unnecessary packages required in the `package.json` file.

### February 15, 2021

* Initial open-source release.
* Fixed some serious typos in the `index.js` and `ready.js` file that may cause some serious errors.
* Changed some permissions required in the moderation commands to make sure these command don't need the wrong permissions.
* Changed some parts of the BOT core to make it compatible with the open-source release.