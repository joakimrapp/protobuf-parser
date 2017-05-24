const path = require( 'path' );
const log = require( '@jrapp/log-emitter' ).log( 'protobuf-parser' );
require( '@jrapp/log-emitter' ).on( '*', console.log );
const modules = Object.defineProperties( {}, {
	files: { configurable: true, get: function() { return Object.defineProperty( this, 'files', { value: log.timer()
		.set( require( '@jrapp/files-finder' ) ).metric( 'loaded module', '@jrapp/files-finder' ).get() } ).files; } },
	protobufjs: { configurable: true, get: function() { return Object.defineProperty( this, 'protobufjs', { value: log.timer()
		.set( require( 'protobufjs' ) ).metric( 'loaded module', 'protobufjs' ).get() } ).protobufjs; } },
	stacktrace: { configurable: true, get: function() { return Object.defineProperty( this, 'stacktrace', { value: log.timer()
		.set( require( 'stack-trace' ) ).metric( 'loaded module', 'stack-trace' ).get() } ).stacktrace; } }
} );
const getAbsolutePath = scanpath => path.isAbsolute( scanpath ) ? scanpath : path.resolve( path.dirname( modules.stacktrace.get()[ 2 ].getFileName() ), scanpath );
const resolve = ( { context } ) => context.promise
	.then( () => Promise.all( context.absolutepaths.splice( 0 ).map( absolutepath => modules.files( absolutepath, '*.proto' ) ) ) )
	.then( result =>  ( context.filepaths = [ ...new Set( context.filepaths.concat( Array.prototype.concat( ...result ) ) ) ] ) )
	.then( filepaths => ( context.root || modules.protobufjs ).load( filepaths.splice( 0 ) ) )
	.then( root => ( context.root = root ) )
	.then( root => context.jsons.splice( 0 ).reduce( ( root, json ) => root.addJSON( json ), root ) );
class ProtoParser {
	constructor() { return Object.assign( this, { context: {
		promise: undefined,
		root: undefined,
		absolutepaths: [],
		jsons: [],
		filepaths: []
	} } ); }
	get promise() { return ( this.context.promise = ( this.context.promise || Promise.resolve() ) ); }
	set promise( value ) { this.context.promise = value; }
	json( ...args ) { this.promise = this.promise.then( root => root.toJSON().nested ).then( ...args ); return this; }
	get add() { return {
		path: ( scanpath = '.' ) => {
			const absolutepath = getAbsolutePath( scanpath );
			this.promise = this.promise.then( () => this.context.absolutepaths.push( absolutepath ) );
			return this;
		},
		json: ( json ) =>  {
			this.promise = this.promise.then( () => this.context.jsons.push( json ) );
			return this;
		}
	}; }
	then( ...args ) { this.promise = resolve( this ).then( ...args ); return this; }
	catch( ...args ) { this.promise = this.promise.catch( ...args ); return this; }
}
module.exports = () => new ProtoParser();
