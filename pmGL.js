/*
Rundown: Environement checkpoint

Commentary: Environment support

-AMD support
-CommonJS support
-browser support

nodejs is not supported, due to lack of DOM.
Use a "get pixel" library instead.
*/

( function ( root, factory ){
	
	if( typeof define === "function" && define.amd ){ //AMD
	
		define( [ "PhotoMap" ], function(){
		
			return root.PhotoMap = factory();
		
		} );
		
	}else if( typeof module === "object" && module.exports ){ //CommonJS

		module.exports = root.PhotoMap = factory();
	
	}else{ //Browser
		
		root.PhotoMap = factory();
		
	}
	
}( window !== "undefined" ? window : this, function factory(){
	
	/*
	Label: Module-enclosed variable mapping 
	
	Commentary: replaces unmapped keys variable from previous version
	*/

	var
		runtime = {
			
			/*
			Label: Runtime keys
			
			-(console control) log, error, warn 
			*/
			
			"log" : ( log ) => { console.log( log ) },
			"error" : ( error ) => { console.log( error ) },
			"warn" : ( warn ) => { console.log( warn ) },
			
		},
		
		//Label: the "main" definition
		
		PhotoMap = function( img ){
	
			//Label: PhotoMap constructor
	
			if( new.target ){
				
				var source = { "src", "type", "data" }, plot, frame, drawing;
				
				/*
				Commentary: Direct and delayed construction options
				
				To what extent te PhotoMap is fully constructed at construction depends on the `img` argument
				
				If an image is supplied to the argument, the PhotoMap is constructed to plotting, else it is left alone.
				*/
				
				//Label: Direct construction
				
				if( img instanceof Image ){
					
					//Rundown: rip image source from
					
					source.src = img.src;
					source.type = "URI";
					
					//Rundown: extract data using a virtual canvas:
				
					var virtual = document.createElement( "canvas" );
					virtual.width = this.width;
					virtual.height = this.height;
				
					var context = virtual.getContext( "2d" );
					
					//Commentary: virtual will no longer be referenced
					
					context.drawImage( this, 0, 0 );
					
					/*
					Commentary: images with no data to extract
					
					Images that do not have either a width or a height have no data to extract, so no plotting can be done.
					However, the PhotoMap will be initiated with the private properties required for staging to be run.
					There is no reason to terminate construction, but direct construction is not an option.
					
					It is also important to note that an image whose source is not loaded will not produce any pixels.
					So, this will also a catch-all for images not loaded
					
					Commentary: where is the `this` object?
					
					Since we are in the constructor, it is not needed.
					
					Rundown: check if data is available by checking the dimensions of the image
					*/
					
					if( img.width < 0 || img.width < 0 ){
					
						source.data = context.getImageData( 0, 0, img.width , img.height ); //Rundown: extract image data
						plot = new PhotoMap.PhotoMapPlot( source ); //Rundown: extract plot
						
						delete virtuaal, context, img; //Commentary: use this line to conserve resources
						
					}
					else
					{
						delete virtuaal, context, img; //Commentary: use this line to conserve resources
						
						runtime.warn( 
							"PhotoMap Object Auto-staging WARNING: " +
								"provided image is either not loaded properly, or has no image data - zero pixels" 
						);
						
					}
					
				}
				
			}else{ //Endfor: PhotoMap constructor
				
				//Commentary: S.e.
				
				var forgive = new PhotoMap( img );
				return forgive;
				
			}

		}; //Endfor: "main" definition
	
	/*
	Commentary: prototype methods and pipeline factories
	
	The PhotoMap library allows for complete control of the image-to-PhotoMap pipeline with 2 methods:
	-Using the PhotoMap object and its properties
	-Using the pipeline factories
	
	The PhotoMap Objects themselves inherit from a prototype (define below)
	The prototype contains public methods for each step in the process of making a PhotoMap, which include:
	
	- staging:
	This the process dedicated to ripping source data off of an image and supplying it to the source property of the PhotoMap object.
	*Once, staging is complete within a PhotoMap, plotting is immediately invoked. See explanation below the "prototype staging method" label
	
	- plotting:
	From the data extracted during staging, a collection of coordinates for the main vertices of the PhotoMap object are calculated
	
	- framing:
	From the plot made in the previouse process, a collection of triangles and their vertices is formulated
	
	- drawing:
	The frame or collection of trinagles is then drawn in a WebGL canvas
	
	Each of these methods do at least 2 things:
	-return an object created by a *pipeline factory*
	-get the current relevant object from within the PhotoMapDrawing
	
	The pipeline factories do everything the object methods are supposed to (i.e. all those things listed above),
	but they are exposed factories and not object methods, which means they operate on I/O rather than modifying PhotoMaps
	*/
	
	/*
	Label: prototype methods
	
	Label: prototype staging method
	
	Commentary: Immediate plot invokation and optional callback for staging
	
	The point of the PhotoMap Object is to eventually construct a PhotoMap.
	With that said, if pipeline control is not required, the plotting function should be invoked immediately,
	especially since staging is offered as a pipeline factory
	
	However, if additional object control or a delay is required a callback is setup.
	This callback is defaulted to a function that will immediately invoke plotting
	
	*It is important to note that this control is intended for delay, and not termination in fully constructing a PhotoMap plot.
	If you do not wish to construct one, please use the pipeline factory instead
	*This callback option is not available for direct construction
	*/
	
	Photomap.prototype.stage = function(
	
		source,
		type,
		callback = function(){
			
			this.plot = new PhotoMap.createPlot( this.source );
			
		}
	
	){
		
		switch ( 
		
			!this.source ?
				source - !method :  //returns:
										//-1 for no original source, no new source, and no new method
										//0 for no original source, new source, but no new method
										//1 for no original source, new source and new method
				source ? ( source !== this.source.src && /* !method || - method will differ if method is null/undefined */ method !== this.source.type ) + 1 : 2
			
		){
			
			case -1: //error out - no original source, no new source, and no method
			
				//break; - case -1 and 0 do the same thing
			case 0: //error out - no original source, there is a new source, but no method
			
				runtime.error( 
					"PhotoMap Object Staging ERROR: " +
						"Original source does not exist, and the amount of arguments provided to the staging function is insufficient" +
						"(" + ( !!source + 0 ) + " argument" + ( source ? "" : "s" ) + " given--function requires 2)"
				)
				return;

			case 1: //create new source object - either:
					//there is no original source, but there is a new source & method
					//or
					//there is an original source, and the new source & method differ
					
				
				this.source = PhotoMap.stage(
				
					method ? method: this.source.type,
					source,
					callback instanceof Function ? callback( this.source ) : undefined
				
				);
					
				break;
			//case 2: //case 2 block can be deleted and is unnecessary as it will not do anything. All successful (no error) calls to this function will return this.source
					
					//return original source - original source exists, but the new source & method differ or they are not provided in arguments (getter function)
					
				//break;
			
		}
		
		return this.source;
		
	} //Endfor: prototype staging method

	PhotoMap.prototype.plot = function(){
		
		if( this.plot )
			return this.plot;
		else{
			runtime.warn( "PhotoMap Object Plot WARNING: plot not yet defined, please wait!" );
			return null;
		}
	}

	PhotoMap.prototype.frame = function( plot ){
		
		if( !plot && !this.frame ){
			
			runtime.error( 
				"PhotoMap Object Framing ERROR: " +
					"Original plot either does not exist or has not yet been framed, and the amount of arguments provided to the framing function is insufficient" +
					"(0 arguments given--function requires 1)"
			)
			return;
			
		}
			
		if( plot && ( this.plot != plot || !this.frame ) )
			this.frame = new PhotoMap.PhotoMapFrame( plot );
		
		return this.frame;
		
	}
	
	PhotoMap.prototype.draw = function( frame ){
		
		if( !frame && !this.drawing ){
			
			runtime.error( 
				"PhotoMap Object Framing ERROR: " +
					"Original frame either does not exist or has not yet been drawn, and the amount of arguments provided to the drawing function is insufficient" +
					"(0 arguments given--function requires 1)"
			)
			return;
			
		}
			
		if( frame && ( this.frame != frame || !this.drawing ) )
			this.drawing = new PhotoMap.PhotoMapDrawing( frame );

		return this.drawing;
		
	}
	
	//Label: pipeline factories
	
	PhotoMap.stage = ( type, source, callback ) => {
	
		if( source === undefined ){
			
			runtime.error( "Photomap Generic Staging ERROR: what am I supposed to stage? I need a source!" );
			return;
			
		}
		
		var modified = { "src", "type", "data" } //data can be `undefined`, if data is undefined, plotting should not be run, but it is called as a constructor and not a method, so shouldn't matter anyway currently -- even when called as a method, the method is only a getter function currently
		
		//either create image in blob or with filereader, or load from URL. The set the source reference
		//if no arguments are supplied, error out
		
		switch( type )
		{
			case undefined:
				runtime.error( "PhotoMap Generic Staging ERROR: No arguments supplied" );
				return;
			case "URI":
				try{
					
					//WIP
					
					modified.src = typeof source === "string" ? ( new URI( source ) ).toString() : URI.expand( source.template, source.arguments );
				
				}
				catch( e ){
					
					//WIP
					
					runtime.error( "URI: " + e.message );
				
				}
				
				//URI library will throw an exception if it errors out; This needs to be caught
				
				break;
			case "Blob":
				modified.src = window.URL.createObjectURL( source );
				break;
			default:
				runtime.error( "PhotoMap Generic Staging ERROR: method " + method + " is not supported" );
				return;
		}
		
		var img = new Image;
		(( modifiee/*, type*/, callback ) => {
			
			//if revoking the source of the image is required, whether that be, because the image lives in the blob, or the DOM image object and/or URL is no longer needed uncomment this, if that depends on the source type as well
			
			img.addEventListener( "load", function (){
			
				//extract data using a virtual canvas:
			
				var virtual = document.createElement( "canvas" );
				virtual.width = this.width;
				virtual.height = this.height;
			
				var context = virtual.getContext( "2d" );
			
				context.drawImage( this, 0, 0 );
				modifiee.data = context.getImageData( 0, 0, this.width , this.height );
			
				window.URL.revokeObjectURL( this.src );
				this = null; //use this line to save resources - remove calls to the image if you turn this on
				
				if( callback instanceof Function )
					callback( modifiee );
				
			})
			
		})( modified/*, method*/, callback );
		
		img.src = modified.src;
	
		modified.type = method;
	
		return modified; //return a source usable by PhotoMapGL
		
	}

	PhotoMap.PhotoMapPlot = function( source ){}
	PhotoMap.PhotoMapFrame = function( plot ){}
	PhotoMap.PhotoMapDrawing = function( frame ){}
	

} ) );