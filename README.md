<b>BREAKING CHANGES: Passwords have been changed (7/30/2019). Contact @philku for new ones</b>

# Project Coyote Wallet
This is the <i>wallet</i> application for project coyote. It functions on
port 8080 and requires the <i>blockchain</i> application to be running on
port 3000 in order to function properly.

## Running the App
### Locally
1. Clone this repo
2. Run 'npm i' in the project root
3. Run the node server with '$ npm run start'
4. Navigate to http://localhost:8080 in your browser

The "start" script utilizes nodemon, which restarts your local server
every time you make a change in any .js file!

## External Connections
### Blockchain App
The blockchain application should be running on the host and port specified
in the <i>/src/scripts/utils.js => blockchainRequest()</i> function.
### Redis Memcached Instance
For session storage, this application uses an instance of Redis cloud's
Memcached. The connection information for this is near the top of app.js,
underneath the "Session Management" comment.
### IBM Cloudant
For user and organization storage, we use an instance of IBM Cloudant. The
connection information for this can be found in the <i>/src/scripts/auth.js</i>
file.
#### Databases
##### users
The "users" database stores information for individual users.
##### organizations
The "organizations" database stores information for organizations.

## package.json
### Scripts
- "<u>static</u>" - <i>npm run static</i> - Compiles the source "coyote.scss" and "coyote.js"
files into "coyote.min.css" and "coyote.min.js". These are minified and more compatible.
<b>If any changes are made to "coyote.scss" or "coyote.js" run <i>npm run static</i> or yor changes
will not be rendered.</b>
- The following scripts are executed by static so you shouldn't have to worry about them.

## Documentation
To access the documentation for this app...
