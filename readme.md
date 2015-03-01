Speech Demo
===========



#Deployment

    git push heroku master
    heroku ps:scale web=1
    heroku open

#Run locally

    NODE_ENV=local node app.js