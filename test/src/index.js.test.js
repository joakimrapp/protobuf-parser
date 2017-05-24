require( '@jrapp/node-project-setup' ).testing.file( './test' )( ( index ) => {} )
	.it( 'should run a sanity check', ( assert, index ) => index()
		.add.path( '../assets/ok/folder1' )
		.add.json( { "test": { "nested": {
			"RequestMessage2": { "fields": { "input": { "type": "string", "id": 1 } } },
			"ResponseMessage2": { "fields": { "output": { "type": "string", "id": 1 } } },
			"Service2": { "methods": { "Method2": { "requestType": "RequestMessage2", "responseType": "ResponseMessage2" } } }
		} } } )
		.then( root => assert.ok( !!root.lookup( 'test.Service2' ) ) ) )
	.it( 'should scan for all proto-files', ( assert, index ) => index()
		.add.path( require( 'path' ).resolve( __dirname, '../assets/ok' ) )
		.then( root => assert.ok( !!root.lookup( 'test.Service2' ) && !!root.lookup( 'test.Service1' ) ) ) )
	.it( 'should catch errors', ( assert, index ) => new Promise( resolve => index()
		.add.path( '../assets/fail' )
	 	.then( () => assert.fail() )
	 	.catch( () => resolve() ) ) )
	.it( 'should output json', ( assert, index ) => index().add.path( '../assets/ok' )
		.json( ( json ) => assert.ok( json ) ) )
	.done();
