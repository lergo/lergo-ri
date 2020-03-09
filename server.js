'use strict';
/**
 * Module dependencies.
 */

var port = 3000;
process.title='lergo';
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


var mongoose = require('mongoose');
mongoose.connect(conf.dbUrl, { useNewUrlParser: true , useUnifiedTopology: true });



if ( !!services.conf.log4js ){
    log4js.configure(services.conf.log4js);
}


services.emailTemplates.load( path.resolve(__dirname, 'emails') );
//var errorManager = appContext.errorManager;

var app = module.exports = express();
var backendHandler = express();
var swaggerAppHandler = express(); // split the two
var subpath = express();

/** swagger configuration: start **/

swagger.setHeaders = function setHeaders(res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-API-KEY');
    res.header('Content-Type', 'application/json; charset=utf-8');
};
swagger.configureSwaggerPaths('', '/api/api-docs', '');
/*swagger.setAppHandler(swaggerAppHandler);*/

/** swagger configuration :end **/


// Configuration
var useStatic = express.static(__dirname + '/swagger-ui/dist');
logger.info(typeof(useStatic));

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// use  for https
app.set('trust proxy', true);
logger.info('set trust proxy to true');



app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use('/v1', subpath);

var swagger = require('swagger-node-express').createNew(subpath);

app.use(methodOverride());
app.use(cookieParser());

app.use(cookieSession( { 'secret' : conf.cookieSessionSecret } ));

// lergo middlewares.. not optimized right now..
// not all requests need emailResources. we should optimize it somehow later
app.use(lergoMiddleware.origin);
app.use(lergoMiddleware.addGetQueryList);
app.use(lergoMiddleware.emailResources);
app.use(errorHandler({ dumpExceptions: true, showStack: true }));

app.use( require('request-param')() );
app.use('/backend', backendHandler);
app.use('/swagger-docs', swaggerAppHandler);
// Routes

app.get('/swagger', function (req, res, next) {
    if (req.url.indexOf('swagger/') < 0) {
        res.redirect('/swagger/');
    } else {
        next();
    }
});

// Serve up swagger ui at /docs via static route
//https://github.com/swagger-api/swagger-node/issues/189
var docsHandler = express.static( __dirname + '/../../swagger-ui/');
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



_.each(actions,function(action) {

    if (!action.action) {
        throw 'action ' + action.spec.name + ' - ' + action.spec.nickname + ' is not mapped properly';
    }
    logger.info('adding [%s] [%s] [%s]:[%s]', action.spec.nickname, typeof(action.action), action.spec.method, action.spec.path);

    // add middlewares
    if (!!action.middlewares) {

        for (var m = 0; m < action.middlewares.length; m++) {

            var middleware = action.middlewares[m];
            try {
                logger.info('adding middleware [%s]', lergoUtils.functionName(middleware));
            } catch (e) {
                logger.error('error while adding action on middleware at index [' + m + ']', action.spec.name);
                throw e;
            }

            // switch between swagger syntax {id} to express :id
            //swaggerAppHandler.use(action.spec.path.replace(/\{([a-z,A-Z]+)\}/g,':$1'), middleware);
        }
    }

    var method = action.spec.method;
    var lcMethod = method.toLowerCase();
    swagger.addHandlers(method, [action]);
    var expressRoute = backendHandler.route(action.spec.path.replace(/\{([a-z,A-Z]+)\}/g, ':$1'));
    _.each(action.middlewares, function (m) {
        expressRoute[lcMethod](m);
    });
    expressRoute[lcMethod](action.action);
});

/**
 * send front-end the public configuration.
 * used for integrating with google analytics and stuff..
 */
app.get('/backend/public/conf', function( req, res ){
    res.send('var ' + (req.params.name || 'conf') + '=' + JSON.stringify(services.conf.public) + ';' );
});

swagger.configure('http://localhost:3000/backend', '0.1');
//app.use('/backend/api/api-docs', swagger.resourceListing);


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

// to be used by lambda function to check that mongo / backend are up
app.get('/backend/lesson', function(req, res){
    var Lesson = require('./backend/models/Lesson');
    Lesson.connect(function(db, collection){
        collection.find({ 'age' : {$eq : 8 }},{ '_id' : 1, 'lastUpdate':1 }).sort( { 'lastUpdate' : -1 }).project( { 'age': 1, _id: 0 }).limit(2).toArray(function(err, result) {
            if (err) {
                return res.status(500).end();
            }
        res.send( result[0] );
        });
    });
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
                var entry = { url: '/index.html#!/public/lessons/' + lesson._id + '/intro', changefreq: 'hourly', priority: 0.5 };

                if (!!lesson.lastUpdate) {
                    logger.info('last update exists');
                    entry.lastmod = dateFormat(new Date(lesson.lastUpdate), 'yyyy-mm-dd');
                    logger.info(entry.lastmod);
//                entry.lastmod = dateFormat(new Date(lesson.lastUpdate), 'YYYY-MM-DDThh:mmTZD');
                }

                sitemap.urls.push(entry);
            }

            // add homepage with languages
            _.each(['he','en'], function(lang){
                sitemap.urls.push( { url: '/index.html#!/public/homepage?lergoLanguage=' + lang , 'changefreq': 'hourly', priority: 0.5 } );
            });

            sitemap.toXML( function (err, xml) {
                if (err) {
                    return res.status(500).end();
                }
                res.header('Content-Type', 'application/xml');
                res.send( xml );
            });

        });

    });
}) ;

/* jshint ignore:start */

 // Only allow index.html or public/lesson/:lesson_number/intro to be prerendered
 // often a certain url is prerendered many times in the same second or two
 // to prevent unnecessary cpu usage, we will cache the url and resend same page if repeated consecutively
 // index.html will be updated every day 

 var heCachedHomePage = '';
 var enCachedHomePage = '';
 var indexCachedHomePage = '';
 var previousDate = 0;
 var repeatedLessonUrl = '';
 var numRepeats = 0;
 
 app.get('/backend/crawler', function(req, res){
    var url = req.param('_escaped_fragment_');
    url = req.absoluteUrl('/index.html#!' + decodeURIComponent(url) );

    var indexHomePage = /^(.*)\/index\.html#!(.{0,17})$/.test(url);
    var heHomePage = /^(.*)\/public\/homepage\?lergoLanguage=he$/.test(url);
    var enHomePage = /^(.*)\/public\/homepage\?lergoLanguage=en$/.test(url);
    var publicLessons = /^(.*)\/public\/lessons\/.*\/intro$/.test(url);
    var d = new Date();
    var currentDate = d.getDate();

    // for hebrew home page if page has already been cached
    if (heHomePage && heCachedHomePage !== '') {
        logger.info('using cached hebrew home page: ', url);
        res.status(200).send(heCachedHomePage);
        if (currentDate !== previousDate) { // reset the home page link every day
            previousDate = currentDate;
            logger.info('updating date to ', previousDate);
            heCachedHomePage = '';
            enCachedHomePage = '';
            indexCachedHomePage = '';
        }
        return;
    }

    // for index home page if page has already been cached
    if ( indexHomePage && indexCachedHomePage !== '') {
        logger.info('cached index home page: ', url);
        res.status(200).send(indexCachedHomePage);
        if (currentDate !== previousDate) { // reset the home page link every day
            previousDate = currentDate;
            logger.info('updating date to ', previousDate);
            heCachedHomePage = '';
            enCachedHomePage = '';
            indexCachedHomePage = '';
        }
        return;
    }

    // for english home page if page has already been cached
    if ( enHomePage && enCachedHomePage !== '') {
        logger.info('cached english home page: ', url);
        res.status(200).send(enCachedHomePage);
        if (currentDate !== previousDate) { // reset the home page link every day
            previousDate = currentDate;
            logger.info('updating date to ', previousDate);
            heCachedHomePage = '';
            enCachedHomePage = '';
            indexCachedHomePage = '';
        }
        return;
    }
    
    // invalid url is one that is not lesson/intro or home page
    if (!publicLessons && !enHomePage && !heHomePage && !indexHomePage) {
        logger.info('prerender does not accept invalid urls: ', url);
        res.status(400).send('invalid url');
        return;
    }

    // prevent the same lessonUrl from running more than 4 times in a row
    if (url !== repeatedLessonUrl) {
        repeatedLessonUrl = url;
        numRepeats = 1;
        } else {
        numRepeats += 1;
        logger.info('repeatedLessonUrl: ',numRepeats, ' ' , repeatedLessonUrl);
        if (numRepeats > 4) {
            logger.info('prerender repeats exceeded: ', url);
            res.status(400).send('repeats exceeded');
            return;
        } 
    }

    // no cached page, need to prerender new one
    logger.info('prerendering url : ' + url ) ;
    const createPhantomPool = require('phantom-pool')
    const pool = createPhantomPool({
        max: 5,
        min: 2,
        validator: () => Promise.resolve(true),
        phantomArgs: [[], {
        }],
    });

    pool.use(async (instance) => {
    const page = await instance.createPage()
    const status = await page.open(url, { operation: 'GET' })
    if (status !== 'success') {
    throw new Error('cannot open url')
    }
    var html = await page.evaluate(function () {
    return document.documentElement.innerHTML
    })
    var count = (html.match(/public\/lessons/g) || []).length;
    console.log('the count is ', count);
    if ( count !== 72 && count !== 2 ) { // insure that prerender gives valid result
        html = '';
        logger.info('error forming html');
        res.status(400).send('error in url');
    } 
        else if ( heHomePage )  //  we need to cache and send the hebrew home page page
        {
            logger.info('caching hebrew home page', url);

            heCachedHomePage = html;
            res.send(html);
        } else if ( enHomePage ) {  //  we need to cache and send the english home page
            logger.info('caching english home page', url);
            enCachedHomePage = html;
            res.send(html);
        } else if ( indexHomePage ) {  //  we need to cache and send the index home page
            logger.info('caching index home page', url);
            indexCachedHomePage = html;
            res.send(html);
        }else {  // send the lesson/intro page (no caching)
            logger.info(' sending lesson/intro', url);
            res.send(html);
        }
    })                    

    // Destroying the pool:
    pool.drain().then(() => pool.clear())
    }); 

    /* jshint ignore:end */
    
logger.info('catching all exceptions');
// catch the uncaught errors that weren't wrapped in a domain or try catch statement
// do not use this in modules, but only in applications, as otherwise we could have multiple of these bound
process.on('uncaughtException', function (err) {
    logger.error('catchall error happened',err);
});



