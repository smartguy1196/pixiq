/*
Commentary: pixiq Extender

The library comes with a native extender function to allow developers to add to the API

The extender use the global object defineProperty API to append to the pixiq prototype.

Usage syntax:

pixiq.extend( addition )

Parameters:

addition
	- a list of extension definitions presented as an object (usually an object literal - easier to use)
	- the addition object defines extensions with it's keys and values
		- the keys are the names of the extensions to be added and later referenced by pixiq[name]
		- the values in this object literal are descriptor objects (learn more at MDN - Object.defineProperty)
			- the value key can be anything, but objects are the most useful
			- *Note: the enumerable key can be set to false AND IS TRUE BY DEFAULT BY THIS LIBRARY
				- if you don't want your library to be enumerable, set to false.

Example:

pixiq.extend({
	
	"cool_ext_bro" : {
		
		"enumerable" : true,
		"value" : {
			
			"new_prop" : 1
			"addon_method" : () => console.log( "hello world" );
		
		}
		
	}

});
pixiq.cool_ext_bro.new_prop //1
pixiq[ "cool_ext_bro" ] //only works if enumerable is set to true
pixiq[ "cool_ext_bro" ].addon_method() //console - hello world
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