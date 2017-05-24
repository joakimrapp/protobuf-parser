const path = require( 'path' );
const log = require( '@jrapp/log-emitter' ).log( 'protobuf-parser' );
const modules = Object.defineProperties( {}, {
	files: { configurable: true, get: function() { return Object.defineProperty( this, 'files', { value: log.timer()
		.set( require( '@jrapp/files-finder' ) ).metric( 'loaded module', '@jrapp/files-finder' ).get() } ).files; } },
	protobufjs: { configurable: true, get: function() { return Object.defineProperty( this, 'protobufjs', { value: log.timer()
		.set( require( 'protobufjs' ) ).metric( 'loaded module', 'protobufjs' ).get() } ).protobufjs; } },
	stacktrace: { configurable: true, get: function() { return Object.defineProperty( this, 'stacktrace', { value: log.timer()
		.set( require( 'stack-trace' ) ).metric( 'loaded module', 'stack-trace' ).get() } ).stacktrace; } }
} );
class ProtoParser {
	static isService( reflectionObject ) { return reflectionObject instanceof modules.protobufjs.Service; }
	static getMethodsRecursive( reflectionObject ) { return ProtoParser.isService( reflectionObject ) ?
		reflectionObject.methodsArray.map( method => method.resolve() ) :
		Array.prototype.concat( ...reflectionObject.nestedArray.map( ProtoParser.getMethodsRecursive ) ); }
	constructor() { return Object.assign( this, { context: { absolutepaths: [], jsons: [] } } ); }
	get promise() { return ( this.context.promise = ( this.context.promise || Promise.resolve() ) ); }
	set promise( value ) { this.context.promise = value; }
	get isResolved() { return this.context.absolutepaths.length + this.context.jsons.length === 0; }
	get resolved() { return ( this.promise = this.promise.then( () => this.isResolved ?
		this.context.root :
		Promise.all( this.context.absolutepaths.splice( 0 ).map( absolutepath => modules.files( absolutepath, '*.proto' ) ) )
			.then( result => [ ...new Set( Array.prototype.concat( ...result ) ) ] )
			.then( filepaths => ( this.context.root || modules.protobufjs ).load( filepaths ) )
			.then( root => this.context.jsons.splice( 0 ).reduce( ( root, json ) => root.addJSON( json ), ( this.context.root = root ) ) ) ) );
	}
	get add() { return {
		path: ( scanpath = '.' ) => {
			const absolutepath = path.isAbsolute( scanpath ) ? scanpath : path.resolve( path.dirname( modules.stacktrace.get()[ 1 ].getFileName() ), scanpath );
			this.promise = this.promise.then( () => this.context.absolutepaths.push( absolutepath ) );
			return this;
		},
		json: ( json ) =>  {
			this.promise = this.promise.then( () => this.context.jsons.push( json ) );
			return this;
		}
	}; }
	methods( ...args ) { this.promise = this.resolved.then( root => ProtoParser.getMethodsRecursive( root ) ).then( ...args ); return this; }
	json( ...args ) { this.promise = this.resolved.then( root => root.toJSON().nested ).then( ...args ); return this; }
	then( ...args ) { this.promise = this.resolved.then( ...args ); return this; }
	catch( ...args ) { this.promise = this.promise.catch( ...args ); return this; }
}
module.exports = () => new ProtoParser();
