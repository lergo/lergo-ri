'use strict';
/**
 * Module dependencies.
 */

var port = 3000;

var express = require('express');
var routes = require('./backend/Routes');
var swagger = require('swagger-node-express');
var passport = require('passport');
var OpenIDStrategy = require('passport-openid').Strategy;
var appContext = require('./backend/ApplicationContext');
var logger = appContext.logManager.getLogger('server');
//var errorManager = appContext.errorManager;


var app = module.exports = express.createServer();

// Configuration
var useStatic = express.static(__dirname + '/swagger-ui/dist');
logger.info(typeof(useStatic));
app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'your secret here' }));
    app.use(passport.initialize());

    app.use(app.router);
    app.use('/public', express.static(__dirname + '/public'));
    app.use('/swagger', function () {
        logger.info('in static');
        return useStatic.apply(this, arguments);
    });
});

app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));


// Routes

app.get('/', routes.index);
app.get('/swagger', function (req, res, next) {
    if (req.url.indexOf('swagger/') < 0) {
        res.redirect('/swagger/');
    } else {
        next();
    }
});

swagger.setHeaders = function setHeaders(res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-API-KEY');
    res.header('Content-Type', 'application/json; charset=utf-8');
};
swagger.configureSwaggerPaths('', '/api/api-docs', '');
swagger.setAppHandler(app);


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


var signupUser = {
    'spec': {
        'description': 'Sign up a new user',
        'path': '/user/signup',
        'notes': 'Returns 200 if everything went well, otherwise returns error response',
        'summary': 'Sign up a new user',
        'method': 'POST',
        'parameters': [swagger.bodyParam('user', 'ID of pet that needs to be fetched', 'UserSignupForm')],
        'errorResponses': [, swagger.errors.notFound('pet')],
        'nickname': 'getPetById'
    },
    'action': function (/*req, res*/) {

    }
};


swagger.addPost(signupUser);
//swagger.addGet(findById);
//swagger.addGet();

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
app.listen(port, function () {
    logger.info(arguments);
    logger.info('Express server listening on port %d in %s mode', app.address().port, app.settings.env);
//    logger.info('possible routes are : ' +JSON.stringify(app.routes.routes,{},4));
});

logger.info('catching all exceptions');
// catch the uncaught errors that weren't wrapped in a domain or try catch statement
// do not use this in modules, but only in applications, as otherwise we could have multiple of these bound
process.on('uncaughtException', function (err) {
    // handle the error safely
    logger.info(err);
});

