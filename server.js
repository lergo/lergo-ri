/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./backend/Routes'),
    swagger = require("swagger-node-express");

var app = module.exports = express.createServer();

// Configuration
var useStatic = express.static(__dirname + '/swagger-ui/dist');
console.log(typeof(useStatic));
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'your secret here' }));
    app.use(app.router);

    app.use('/swagger', function(){ console.log('in static'); return useStatic.apply(this,arguments)});
});

app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));


// Routes

app.get('/', routes.index);
app.get('/swagger', function(req, res, next) { if ( req.url.indexOf("swagger/") < 0 ){ res.redirect('/swagger/'); } else{next()}});

swagger.setHeaders = function setHeaders(res) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
    res.header("Access-Control-Allow-Headers", "Content-Type, X-API-KEY");
    res.header("Content-Type", "application/json; charset=utf-8");
};
swagger.configureSwaggerPaths("", "/api/api-docs", "");
swagger.setAppHandler(app);


// Serve up swagger ui at /docs via static route
var docs_handler = express.static('/swagger',__dirname + '/../../swagger-ui/');
app.get(/^\/docs(\/.*)?$/, function(req, res, next) {
    if (req.url === '/docs') { // express static barfs on root url w/o trailing slash
        res.writeHead(302, { 'Location' : req.url + '/' });
        res.end();
        return;
    }
    // take off leading /docs so that connect locates file correctly
    req.url = req.url.substr('/docs'.length);
    return docs_handler(req, res, next);
});



var findById = {
    'spec': {
        "description" : "Operations about pets",
        "path" : "/guy",
        "notes" : "Returns a pet based on ID",
        "summary" : "Find pet by ID",
        "method": "GET",
        "parameters" : [swagger.pathParam("petId", "ID of pet that needs to be fetched", "string")],
        "type" : "Pet",
        "errorResponses" : [swagger.errors.invalid('id'), swagger.errors.notFound('pet')],
        "nickname" : "getPetById"
    },
    'action': function (req,res) {
        console.log("in action");
        res.send("hello world!");
    }
};

swagger.addGet(findById);
swagger.configure("http://localhost:3000", "0.1");
//app.use('/api-docs', swagger.resourceListing);

app.listen(3000, function(){
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
    console.log("possible routes are : " +JSON.stringify(app.routes.routes,{},4));
});
