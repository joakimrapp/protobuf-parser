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
	static getMethodsRecursive( reflectionObject ) {
		return ProtoParser.isService( reflectionObject ) ? reflectionObject.methodsArray.map( method => method.resolve() ) :
		Array.isArray( reflectionObject.nestedArray ) ? Array.prototype.concat( ...reflectionObject.nestedArray.map( ProtoParser.getMethodsRecursive ) ) :
	 	[];
	}
	constructor() {
		const importpaths = [];
		Object.assign( this, {
			promise: Promise.resolve(),
			root: Object.assign( new modules.protobufjs.Root(), { resolvePath: ( origin, target ) => {
				if( origin ) {
					target = target.replace( /\\/g, '/' );
					return path.resolve( importpaths.find( ( { prefix, basepath } ) => target.indexOf( prefix ) === 0 ).basepath, target );
				}
				else
					return target;
			} } ),
			importpaths
		} );
		this.add.importpath( path.dirname( require.resolve( 'protobufjs' ) ), 'google/' );
	}
	get add() { return {
		importpath: ( scanpath, prefix ) => {
			const absolutepath = path.normalize( path.isAbsolute( scanpath ) ? scanpath : path.resolve( path.dirname( modules.stacktrace.get()[ 1 ].getFileName() ), scanpath ) );
			this.importpaths.unshift( { prefix, basepath: absolutepath } );
			return this;
		},
		path: ( scanpath = '.' ) => {
			const absolutepath = path.normalize( path.isAbsolute( scanpath ) ? scanpath : path.resolve( path.dirname( modules.stacktrace.get()[ 1 ].getFileName() ), scanpath ) );
			this.add.importpath( path.dirname( absolutepath ), `${path.basename( absolutepath )}/` );
			this.promise = this.promise.then( () => modules.files( absolutepath, '*.proto' ) ).then( this.root.load.bind( this.root ) );
			return this;
		},
		json: ( json ) =>  {
			this.promise = this.promise.then( () => this.root.addJSON( json ) );
			return this;
		}
	}; }
	methods( ...args ) { this.promise = this.promise.then( () => ProtoParser.getMethodsRecursive( this.root ) ).then( ...args ); return this; }
	json( ...args ) { this.promise = this.promise.then( () => this.root.toJSON().nested ).then( ...args ); return this; }
	then( ...args ) { this.promise = this.promise.then( () => this.root ).then( ...args ); return this; }
	catch( ...args ) { this.promise = this.promise.catch( ...args ); return this; }
}
module.exports = () => new ProtoParser();
