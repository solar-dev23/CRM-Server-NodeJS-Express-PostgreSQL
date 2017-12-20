### To run server application: ###

1. Install Node.js platform, npm command should be available after that
2. Create new PostgreSQL database with name `boilerplate` and set database connection options in file `./src/env.js` (based on `./src/env.example.js`)
3. Set POST_ADDRESS, POST_PASSWORD, POST_SERVICE(https://community.nodemailer.com/2-0-0-beta/setup-smtp/well-known-services) variables
4. Install application certificate (`server.crt` file)
5. Run `npm run install-start` to install, build and run prod version, or `npm run install-start-dev` to install, build and run dev version
6. After you will see a message `Https server is running on port 8087` you can input in your browser this url: https://localhost:4200
7. Input in login form username `admin` password `Zaqwsx321`, this user will be created automatically

If you want to change backend url you need to configure it in frontend config (`env.json`)

### To heroku deploy: ###
1. Setup your project like in instruction: https://devcenter.heroku.com/articles/git
2. Setup env variables in settings tab of heroku app:

    * `DATABASE_URL: [url to database, it should be created automatically]`
    * `FRONTEND_URL: [url to frontend project]`
    * `HTTPS_DISABLED: true`
    * `NPM_CONFIG_PRODUCTION: false`
    * `POST_ADDRESS, POST_PASSWORD, POST_SERVICE(https://community.nodemailer.com/2-0-0-beta/setup-smtp/well-known-services)`

3. Run in project folder the following command: `git push heroku [your branch name]:master -f`

### Run the following commands to refresh heroku cache (project folder): ###
1. `heroku plugins:install heroku-repo`
2. `heroku repo:purge_cache -a [your application name]`
3. `git push heroku [your branch name]:master -f`

#### It fixes heroku problems with node_modules cache. ####
Source article: https://help.heroku.com/18PI5RSY/how-do-i-clear-the-build-cache