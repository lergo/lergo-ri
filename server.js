'use strict';
/**
 * Module dependencies.
 */

var port = 3000;

var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var errorHandler = require('errorhandler');
//var routes = require('./backend/Routes');
var swagger = require('swagger-node-express');
var passport = require('passport');
var OpenIDStrategy = require('passport-openid').Strategy;
var appContext = require('./backend/ApplicationContext');
var logger = appContext.logManager.getLogger('server');
//var errorManager = appContext.errorManager;

var app = module.exports = express();

/** swagger configuration: start **/

swagger.setHeaders = function setHeaders(res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-API-KEY');
    res.header('Content-Type', 'application/json; charset=utf-8');
};
swagger.configureSwaggerPaths('', '/api/api-docs', '');
swagger.setAppHandler(app);

/** swagger configuration :end **/

var controllers = require('./backend/controllers');


// Configuration
var useStatic = express.static(__dirname + '/swagger-ui/dist');
logger.info(typeof(useStatic));

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(bodyParser());
app.use(methodOverride());
app.use(cookieParser());
app.use(cookieSession( { 'secret' : appContext.conf.cookieSessionSecret } ));
app.use('/backend/user', controllers.users.loggedInMiddleware);


// Routes

app.get('/swagger', function (req, res, next) {
    if (req.url.indexOf('swagger/') < 0) {
        res.redirect('/swagger/');
    } else {
        next();
    }
});

// Serve up swagger ui at /docs via static route
var docsHandler = express.static('/swagger', __dirname + '/../../swagger-ui/');
app.get(/^\/docs(\/.*)?$/, function (req, res, next) {
    if (req.url === '/docs') { // express static barfs on root url w/o trailing slash
        res.writeHead(302, { 'Location': req.url + '/' });
        res.end();
        return;
    }
    // take off leading /docs so that connect locates file correctly
    req.url = req.url.substr('/docs'.length);
    return docsHandler(req, res, next);
});





swagger.addModels( require('./backend/ApiModels').models );
var actions = require('./backend/ApiActions').actions;



for ( var i in actions ){
    if ( actions.hasOwnProperty(i) ){
        var action = actions[i];
        logger.info('adding [%s]', action.spec.name);
        var method = action.spec.method;
        if ( method === 'POST' ){
            swagger.addPost( action );
        }else{
            swagger.addGet( action );
        }
    }
}

swagger.configure('http://localhost:3000', '0.1');
//app.use('/api-docs', swagger.resourceListing);


/**
 * Login code
 */


passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.use(new OpenIDStrategy({
        returnURL: 'http://localhost.lergodev.info:3000/auth/openid/return',
        realm: 'http://localhost.lergodev.info:3000/',
        profile: true
    },
    function (identifier, profile, done) {
        logger.info(['done with openid request', identifier, JSON.stringify(profile), done.toString()]);
        done(null, JSON.stringify('someuserid'), {'info': 'information'});
    }
));

// Accept the OpenID identifier and redirect the user to their OpenID
// provider for authentication.  When complete, the provider will redirect
// the user back to the application at:
//     /auth/openid/return
app.post('/auth/openid', passport.authenticate('openid'));

// The OpenID provider has redirected the user back to the application.
// Finish the authentication process by verifying the assertion.  If valid,
// the user will be logged in.  Otherwise, authentication has failed.
app.get('/auth/openid/return', function (req, res, next) {

    logger.info(req.url);

    passport.authenticate('openid', { session: false}, function (/*err, user, info*/) {
    })(req, res, next);
});
//successRedirect: '/public/success.html#',
//        failureRedirect: '/public/index.html#' }));


logger.info('trying to listen on ' + port);
var server = app.listen(port, function () {
    logger.info(arguments);
    logger.info('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
//    logger.info('possible routes are : ' +JSON.stringify(app.routes.routes,{},4));
});



app.use('/public', express.static(__dirname + '/public'));
app.use('/swagger', function () {
    return useStatic.apply(this, arguments);
});


app.use(errorHandler({ dumpExceptions: true, showStack: true }));

logger.info('catching all exceptions');
// catch the uncaught errors that weren't wrapped in a domain or try catch statement
// do not use this in modules, but only in applications, as otherwise we could have multiple of these bound
process.on('uncaughtException', function (err) {
    logger.info('catchall error happened');
    // handle the error safely
    logger.info(err);
});



