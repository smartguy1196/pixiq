/*
Commentary: pixiq Extender

This script is well documented in the "Extensions and Extending" wiki. Questions should be directed there.
Any other questions on pixiq extensions can be directed to StackOverflow or opened as an issue.
*/

Object.defineProperties(

	pixiq,
	{
		
		"extend" : { //Label: pixiq library extender
			
			/*
			"writeable" : false,
			"configurable" : false,
			"enumerable" : true,
			*/
			"value" : function( library ){
				
				let keys = Object.keys( library );
				for( let index = 0, name; name = keys[ index ]; i++ ){
					
					if( !library[ name ].enumerable ){
						
						library[ name ].enumerable = true;
						
					}
					
					Object.defineProperty(
					
						this.prototype,
						name,
						library[ name ]
						
					)
					
				}
				
			}
			
		},
		
	}

)