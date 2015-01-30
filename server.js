'use strict';
/**
 * Module dependencies.
 */

var port = 3000;

var express = require('express');
var _ = require('lodash');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var errorHandler = require('errorhandler');
//var routes = require('./backend/Routes');
var swagger = require('swagger-node-express');
var passport = require('passport');
var OpenIDStrategy = require('passport-openid').Strategy;

var log4js = require('log4js');
var logger = log4js.getLogger('server');
var lergoMiddleware = require('./backend/LergoMiddleware');
logger.info('loading services');
var services = require('./backend/services');
logger.info('services loaded');
var path = require('path');
var sm = require('sitemap');
var lergoUtils = require('./backend/LergoUtils');
var conf = services.conf;

if ( !!services.conf.log4js ){
    log4js.configure(services.conf.log4js);
}

var middlewares = require('./backend/middlewares');


services.emailTemplates.load( path.resolve(__dirname, 'emails') );
//var errorManager = appContext.errorManager;

var app = module.exports = express();
var backendHandler = express();
var swaggerAppHandler = backendHandler;

/** swagger configuration: start **/

swagger.setHeaders = function setHeaders(res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-API-KEY');
    res.header('Content-Type', 'application/json; charset=utf-8');
};
swagger.configureSwaggerPaths('', '/api/api-docs', '');
swagger.setAppHandler(swaggerAppHandler);

/** swagger configuration :end **/


// Configuration
var useStatic = express.static(__dirname + '/swagger-ui/dist');
logger.info(typeof(useStatic));

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(bodyParser());
app.use(methodOverride());
app.use(cookieParser());

app.use(cookieSession( { 'secret' : conf.cookieSessionSecret } ));

// lergo middlewares.. not optimized right now..
// not all requests need emailResources. we should optimize it somehow later
app.use(lergoMiddleware.origin);
app.use(lergoMiddleware.addGetQueryList);
app.use(lergoMiddleware.emailResources);
app.use('/backend/user', middlewares.session.isLoggedIn);
app.use('/backend/admin', middlewares.session.isAdmin);

app.use(errorHandler({ dumpExceptions: true, showStack: true }));

app.use('/backend', backendHandler);
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

        if ( !action.action ){
            throw 'action ' + action.spec.name + ' - ' + action.spec.nickname + ' is not mapped properly';
        }
        logger.info('adding [%s] [%s] [%s] [%s]:[%s]', action.spec.name, action.spec.nickname, typeof(action.action), action.spec.method, action.spec.path);

        // add middlewares
        if ( !!action.middlewares ){

            for ( var m = 0; m < action.middlewares.length; m++) {

                var middleware = action.middlewares[m];
                try {
                    logger.info('adding middleware [%s]', lergoUtils.functionName(middleware));
                }catch(e){
                    logger.error('error while adding action on middleware at index [' + m + ']', action.spec.name);
                    throw e;
                }

                // switch between swagger syntax {id} to express :id
                swaggerAppHandler.use(action.spec.path.replace(/\{([a-z,A-Z]+)\}/g,':$1'), middleware);
            }
        }

        var method = action.spec.method;
        if ( method === 'POST' ){
            swagger.addPost( action );
        }else{
            swagger.addGet( action );
        }
    }
}


/**
 * send front-end the public configuration.
 * used for integrating with google analytics and stuff..
 */
app.get('/backend/public/conf', function( req, res ){
    res.send('var ' + (req.params.name || 'conf') + '=' + JSON.stringify(services.conf.public) + ';' );
});

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



//app.use('/public', express.static(__dirname + '/public'));
app.use('/swagger', function () {
    return useStatic.apply(this, arguments);
});


app.get('/backend/sitemap.xml', function(req, res){
    var Lesson = require('./backend/models/Lesson');
    var dateFormat = require('dateformat');

    Lesson.connect(function(db, collection){

        collection.find({ 'public' : { '$exists' : true }},{ '_id' : 1, 'lastUpdate':1 }).sort( { 'lastUpdate' : -1 }).limit(10000).toArray(function(err, result) {

            var sitemap = sm.createSitemap({
                hostname: req.origin,
                cacheTime: 6000000,        // 600 sec - cache purge period
                urls: [ ]
            });

            for (var i = 0; i < result.length; i++) {
                var lesson = result[i];
                var entry = { url: '/#!/public/lessons/' + lesson._id + '/intro', changefreq: 'hourly', priority: 0.5 };

                if (!!lesson.lastUpdate) {
                    console.log('last update exists');
                    entry.lastmod = dateFormat(new Date(lesson.lastUpdate), 'yyyy-mm-dd');
                    console.log(entry.lastmod);
//                entry.lastmod = dateFormat(new Date(lesson.lastUpdate), 'YYYY-MM-DDThh:mmTZD');
                }

                sitemap.urls.push(entry);
            }

            // add homepage with languages
            _.each(['he','en'], function(lang){
                sitemap.urls.push( { url: '/#!/public/homepage?lergoLanguage=' + lang , 'changefreq': 'hourly', priority: 0.5 } );
            });

            sitemap.toXML(function (xml) {
                res.header('Content-Type', 'application/xml');
                res.send(xml);
            });
        });

    });

//
}) ;

app.get('/backend/crawler', function(req, res){
    var url = req.param('_escaped_fragment_');
    url = req.absoluteUrl('/index.html#!' + decodeURIComponent(url) );
    logger.info('prerendering url : ' + url ) ;


    var phantom = require('phantom');
    phantom.create(function (ph) {

        setTimeout( function(){
            try{
                ph.exit();
            }catch(e){
                logger.debug('unable to close phantom',e);
            }
        }, 30000);


        return ph.createPage(function (page) {
            page.open(url, function ( status ) {
                if ( status === 'fail'){
                    res.send(500,'unable to open url');
                    ph.exit();
                }else {
                    page.evaluate(function () {
                        return document.documentElement.innerHTML;
                    }, function (result) {
                        res.send( result);
                        ph.exit();
                    });
                }

            });
        });
    });
});


logger.info('catching all exceptions');
// catch the uncaught errors that weren't wrapped in a domain or try catch statement
// do not use this in modules, but only in applications, as otherwise we could have multiple of these bound
process.on('uncaughtException', function (err) {
    logger.error('catchall error happened',err);
});



