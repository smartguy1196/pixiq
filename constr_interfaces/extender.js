Object.defineProperties(

	pixiq,
	{
		
		"extend" : {
			
			/*
			"writeable" : false,
			"configurable" : false,
			"enumerable" : false,
			*/
			"value" : function( library ){
				
				let keys = Object.keys( library );
				for( let index = 0, name; name = keys[ index ]; i++ ){
					
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