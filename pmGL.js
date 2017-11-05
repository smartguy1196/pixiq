/*
Rundown: Environement checkpoint

Commentary: Environment support

-AMD support
-CommonJS support
-browser support

nodejs is not supported, due to lack of DOM.
Use a "get pixel" library instead.

WIP - provide a get pixel library
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
			WIP: get better console control
			*specfically one that works well with node-like environments (at least for get-pixel library)
			*/
			
			"log" : ( log ) => { console.log( log ) },
			"error" : ( error ) => { console.log( error ) },
			"warn" : ( warn ) => { console.log( warn ) }
			
		},
		
		//Label: the "main" definition
		
		PhotoMap = function( img ){
	
			//Label: PhotoMap constructor
	
			if( new.target ){
				
				var source = { "src", "type", "data" }, plot, frame, drawing;
				
				/*
				Commentary: Skeletal and frugal construction options
				
				To what extent the PhotoMap is fully constructed at construction depends on the presence and validity of the `img` argument
				
				The argument is valid, if an image is supplied as the argument.
				If supplied properly, the PhotoMap is constructed immediately to plotting to conserve processing time.
				Hence, it is named frugal construction
				
				If no argument is provided, PhotoMap's properties and methods are constructed only.
				This is PhotoMap's Object-ive backbone. Hence, it is called skeletal construction
				*skeletal doesn't have it's own section, because what it is, is a lack of a section or lack of additional processing to be specific
				*/
				
				//Label: Frugal construction
				
				if( img instanceof Image ){
					
					//Rundown: rip image source from
					
					source.src = img.src;
					source.type = "URI";
					
					//Rundown: extract data using a virtual canvas:
				
					let virtual = document.createElement( "canvas" );
					virtual.width = this.width;
					virtual.height = this.height;
				
					let context = virtual.getContext( "2d" );
					
					//Commentary: virtual will no longer be referenced
					
					context.drawImage( this, 0, 0 );
					
					/*
					Commentary: Images with no data to extract
					
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
												
					}
					else
					{
						
						runtime.warn( 
							"PhotoMap Object Auto-staging WARNING: " +
								"provided image is either not loaded properly, or has no image data - zero pixels" 
						);
						
					}
					
				} //Endfor: Frugal construction
				
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
	This process is dedicated to ripping source data off of an image and supplying it to the source property of the PhotoMap object.
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
	
	WIP - consideration of adding this callback function
	*/
	
	Photomap.prototype.stage = function(
	
		source,
		type,
		callback = function(){
			
			this.plot = new PhotoMap.createPlot( this.source );
			
		}
	
	){
		
		//Label: stage validator
		
		switch ( 
		
			/*
			Rundown: stage validator
			
			validates the source argument for 2 reasons:
			-is the source stageable?
			-does the source change anything?
			
			factors:
			-presence of original source
			-presence of new source
			-do the sources divert?
			
			Outcomes:
			
			These are errors (not stageable):
			-(-1): neither source is present, nothing to stage
			-0: original source is not present. New source is present, but type argument was *not provided
			*bad, because there is no type to cast the source
						
			These are proper (stageable):
			-(+1)(will stage): Either both sources are present and divert
			 or the new source is fully present and is the only one,
			 so staging is possible
			-(+2)(will not stage - it is not required): Either both sources are present and do not divert
			 or the old source is the only one present,
			 so there is nothing new to stage
			
			*case (-1) will fall down through case 0
			*case (+2) does not stage a new source, because there is none, so it is left out
			*/
		
			!this.source ?
				source - !type :  
				source ? 
					( source !== this.source.src && type !== this.source.type ) + 1 :
					2
			
		){
			
			case -1:
			case 0: 
			
				runtime.error( 
					"PhotoMap Object Staging ERROR: " +
						"Original source does not exist, and the amount of arguments provided to the staging function is insufficient" +
						"(" + ( !!source + 0 ) + " argument" + ( source ? "" : "s" ) + " given--function requires 2)"
				)
				return;

			case 1: 
				
				/*
				Rundown: valid staging
				
				Once validated to case 1, all of the properties are reset, because a new source is provided
				
				WIP - inconistency bug fix could use revision
				*/
				
				this.plot = this.frame = this.drawing = undefined;
				
				this.source = PhotoMap.stage(
				
					type ? type: this.source.type,
					source,
					callback instanceof Function ? callback( this.source ) : undefined
				
				);
					
				break;
			//case 2:
				//Commentary: case 2 will not stage anything, so stage validator does nothing with stage 2
			
		}
		
		return this.source;
		
	} //Endfor: prototype staging method
	
	/*
	Label: prototype plotting method
	
	Plotting image data is dependent on the image data being present and ready itself.
	This means plotting is completely dependent on staging being finished.
	This is the only prototype method that offers no pipeline control, because
	the pipeline control should be done with the callback function used by staging after staging
	*/

	PhotoMap.prototype.plot = function(){
		
		if( this.plot )
			return this.plot;
		else{
			runtime.warn( "PhotoMap Object Plot WARNING: plot not yet defined, please wait!" );
			return null;
		}
	}

	/*
	Label: prototype framing and drawing methods
	
	Rundown: prototype framing and drawing methods
	
	For the following, relevant object refers to the frame object during the framing pipeline
	and the draw object during the drawing pipeline.
	
	Framing and drawing prototype methods both share identical pipelines.
	Both can be used as getter functions, if 2 conditions are met:
	-The argument is not used. The argument is reserved only for setting the relevant object, not retrieving it
	--If the argument is used and it does not add any new data, then it is considered "to not be used,"
	because there is no point in using it.
	-The relevant object already exists. If it doesn't there will be no object to get, hence there is an error
	
	If the argument is used, the relevant object is set based on what was data is inside the argument
	and the properties depenedent on the relevant object are reset
	
	*If there is no argument or the relevant object is not previously set, this function can't do anything,
	because there is nothing to set and nothing to get
	*/
	
	PhotoMap.prototype.frame = function( plot ){
		
		if( !this.frame && !plot ){ //Rundown: nothing to set and nothing to get? error out...
			
			runtime.error( 
				"PhotoMap Object Framing ERROR: " +
					"Original plot either does not exist or has not yet been framed, and the amount of arguments provided to the framing function is insufficient - nothing to set, nothing to get" +
					"(0 arguments given--function requires 1)"
			)
			return;
			
		}
			
		if( plot && ( this.plot != plot || !this.frame ) ){
		
			this.drawing = undefined;
			this.frame = new PhotoMap.PhotoMapFrame( plot );
			this.plot = this.frame.plot ? this.frame.plot : undefined;
			this.source = this.frame.plot.source ? this.frame.plot.source : undefined;
		
		}
		
		return this.frame;
		
	}
	
	PhotoMap.prototype.draw = function( frame ){
		
		if( !frame && !this.drawing ){
			
			runtime.error( //Rundown: nothing to set and nothing to get? error out...
				"PhotoMap Object Framing ERROR: " +
					"Original frame either does not exist or has not yet been drawn, and the amount of arguments provided to the drawing function is insufficient - nothing to set, nothing to get" +
					"(0 arguments given--function requires 1)"
			)
			return;
			
		}
			
		if( frame && ( this.frame != frame || !this.drawing ) ){
			
			this.drawing = new PhotoMap.PhotoMapDrawing( frame );
			this.frame = this.drawing.frame ? this.drawing.frame : undefined;
			this.plot = this.drawing.frame.plot ? this.drawing.frame.plot : undefined;
			this.source = this.drawing.frame.plot.source ? this.drawing.frame.plot.source : undefined;
		
		}

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
					
					modified.src = typeof source === "string" ? 
						( new URI( source ) ).toString() :
						URI.expand( source.template, source.arguments );
				
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