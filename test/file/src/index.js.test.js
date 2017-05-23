require( '@jrapp/node-project-setup' ).testing.file( './test/file' )( ( router ) => {} )
	.it( 'should', ( assert, index ) => assert.ok( true ) )
	.done();
