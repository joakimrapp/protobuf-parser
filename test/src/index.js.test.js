require( '@jrapp/node-project-setup' ).testing.file( './test' )( ( index ) => {} )
	.it( 'should', ( assert, index ) => index()
		.add.path( '../assets/folder1' )
		.then( root => console.log( root ) )
		.add.json( {

                "test": {
                        "nested": {
                                "RequestMessage2": {
                                        "fields": {
                                                "input": {
                                                        "type": "string",
                                                        "id": 1
                                                }
                                        }
                                },
                                "ResponseMessage2": {
                                        "fields": {
                                                "output": {
                                                        "type": "string",
                                                        "id": 1
                                                }
                                        }
                                },
                                "Service2": {
                                        "methods": {
                                                "Method2": {
                                                        "requestType": "RequestMessage2",
                                                        "responseType": "ResponseMessage2"
                                                }
                                        }
                                }
                        }
                }

} )
	 	.then( root => console.log( JSON.stringify( root.toJSON(), undefined, '\t' ) ) ) )
	.done();
