/* jshint esversion: 6 */
// Add Express
var express = require('express');
var app = express();
var path = require('path');
// Body Parser
var bodyParser = require('body-parser');
app.use( bodyParser.urlencoded({ extended: true }));
app.use( bodyParser.json() );

// Postgres Setup
var pg = require( 'pg' );
var connectionString = process.env.DATABASE_URL || 'postgres:localhost:5432/mr_muggles';

// Open /public
app.use( express.static( 'public' ) );
app.use( express.static( 'node_modules/jquery/dist' ) );
app.use( express.static( 'node_modules/normalize.css' ) );

// Set Port
var port = process.env.PORT || 9200;

// Listen on port
app.listen( port, function () {

	console.log( "Server listening on port ", port );

});

// Serve Home Page
app.get( '/', function( req, res ) {

	console.log( 'Base URL hit' );
	res.sendFile(path.resolve( 'public/index.html' ));

});
app.use( express.static( 'node_modules/jquery/dist/') );

// route for employee info
app.route('/employee')
	// add employee
	.post((req,res) => {
		console.log('/employee hit', req.body);
		var first_name = req.body.first_name;
		var last_name = req.body.last_name;

		pg.connect(connectionString, function(err, client, done){
			if(err){
				console.log(err);
			} else {
				console.log('connected to db');
				console.log(first_name);
				client.query('INSERT INTO server(first_name, last_name) VALUES($1, $2)', [first_name, last_name]);
				res.send({success: true});
			}
		});
	}) // end add employee

	// retrieve employee
	.get(function(req, res){
		console.log('/employee base hit');

		pg.connect(connectionString, (err, client, done) => {
			if(err) res.status(500).send( "Whoops!");

				var resultsArray = [];
				var query = client.query('SELECT * FROM server ORDER BY last_name ASC');

				query.on('row', (row) => {
					resultsArray.push(row);
				});

				query.on('end', () => {
					done();
					return res.send(resultsArray);
				});
		});

	}) // end retrieve employee

	// update employee
	.put(function(req, res){

		// Body Data
		var data = req.body;

		console.log( "Data Recieved:", data );

		  pg.connect( connectionString, ( err, client, done ) => {

		    if( err ) res.status(500).send( "Oops!");

		    var resultsArray = [];
		    var query = client.query( 'UPDATE server SET "status"$=1 WHERE "id"=$2', [data.status,  data.id]);

		    query.on( 'row', ( row ) => {
		      resultsArray.push( row );
		    });

		    query.on( 'end', ( ) => {
		      done();
		      return res.status(200).send( { status: "Okay" });
		    });
		  });
	}); // end update employee

/* -- /booth Route -- */
app.route( '/booth' )
// get booth
.get( ( req, res ) => {

	  pg.connect( connectionString, ( err, client, done ) => {

	    if( err ) res.status(500).send( "Oops!");

	    var resultsArray = [];
	    var query = client.query( 'SELECT * FROM booth ORDER BY id ASC' );

	    query.on( 'row', ( row ) => {
	      resultsArray.push( row );
	    });

	    query.on( 'end', ( ) => {
	      done();
	      return res.send( resultsArray );
	    });
	  });

}) // end get booth

// add booth
.post( ( req, res ) => {

	var data = req.body;

	console.log( "Data Recieved:", data );

	var objectToSend= {}; //end objectToSend
	  pg.connect( connectionString, ( err, client, done ) => {

	    if( err ) res.status(500).send( "Oops!");

	    var resultsArray = [];
	    var query = client.query( 'INSERT INTO "public"."booth"("capacity", "name", "status") VALUES($1, $2, 1);', [ data.capacity, data.name ] );

	    query.on( 'row', ( row ) => {
	      resultsArray.push( row );
	    });

	    query.on( 'end', ( ) => {
	      done();
	      return res.status(200).send( { status: "Okay" });
	    });
	  });

 } ) // end add booth

 // update booth
.put( ( req, res ) => {

	var data = req.body;

	console.log( "Data Recieved:", data );

	var objectToSend= {}; //end objectToSend
	  pg.connect( connectionString, ( err, client, done ) => {

	    if( err ) res.status(500).send( "Oops!");

	    var resultsArray = [];
	    var query = client.query( 'UPDATE "public"."booth" SET "server_id"=$1 WHERE "id"=$2', [ data.serverId, data.id ] );

	    query.on( 'row', ( row ) => {
	      resultsArray.push( row );
	    });

	    query.on( 'end', ( ) => {
	      done();
	      return res.status(200).send( { status: "Okay" });
	    });
	  });

} ); // end update booth
