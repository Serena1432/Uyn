![Uyn logo](https://i.imgur.com/1UHPT0e.png)

# How to install and run the Uyn BOT:

## I. Configure the PHP and MySQL server

* **Step 1:** Download [UynServer](https://www.github.com/LilShieru/UynServer) and extract it into an empty folder.
* **Step 2:** Upload all the PHP files into any PHP servers or hostings that you like, make sure that your hosting isn't being API rate limited.
* **Step 3:** Configure the following variables in the `Config.php` file:

```php
$servername = "<your MySQL server URL>";
$username = "<your MySQL username>";
$password = "<your MySQL password>";
$dbname = "<your MySQL database name>";
$server_token = "<your secret token>";
```

* **Step 4:** After that, import the `UynServer.sql` file into your MySQL Control Panel. If you're using phpMyAdmin, select your database, go to the `Import` section, select the `UynServer.sql` file and import it.

![UynServer SQL import](https://i.imgur.com/fYF8ybo.png)

* **Step 5:** Run the PHP and MySQL server.

## II. Configure the Node.JS BOT server

### If you're using Node.JS:

* **Step 1:** Download the Uyn source code or clone this repository.
* **Step 2:** Create a file called `.env` in the same folder as the BOT folder and put these lines into the file:

```ini
BOT_TOKEN=<your BOT token here>
php_server_url=<your PHP server URL>
php_server_token=<your PHP server token as configured above>
tenor_api_key=<your Tenor API key>
```

* **Step 3:** Go to the `config.json` file and configure these variables:

```json
{
    "prefix": "<your BOT prefix>",
    "everyoneMention": true,
    "hostedBy": true,
    "defaultSettings": {
        "prefix": "<your BOT prefix>"
    },
    "ownerId": "<your Discord ID>"
}
```



* **Step 4:** Run the `npm install` command to install all the necessary dependencies.
* **Step 5:** After that, run the `node index.js` command to start the BOT.

### If you're using Heroku:

* **Step 1:** Download the Uyn source code or clone this repository.
* **Step 2:** Configure the `config.json` file as above:

```json
{
    "prefix": "<your BOT prefix>",
    "everyoneMention": true,
    "hostedBy": true,
    "defaultSettings": {
        "prefix": "<your BOT prefix>"
    },
    "ownerId": "<your Discord ID>"
}
```

* **Step 3:** Create these new *Config Variables* in the `Settings -> Config Vars` section:
  * `BOT_TOKEN` with your Discord BOT token.
  * `php_server_url` with your PHP server URL. Make sure that you used a domain, not `localhost` because you know, Heroku can't get it as well.
  * `php_server_token` with your secret token as configured in your PHP server.
  * `tenor_api_key` with your Tenor API Key.

* **Step 4:** Deploy the entire code into your Heroku app. You can use the Heroku CLI or deploy the code from your GitHub repository.
* **Step 5:** Make sure that you turned on the `web` dyno on the `Resources` tab. If you don't want to use the `worker` dyno instead to run it 24/7 (and you needn't to use the webpage), you can change this thing in the Procfile section:

```
web: node index.js
```

​		into:

```
worker: node index.js
```