// log handling:

var placeHolders = {  //These functions are namespaced here in case they will be changed in the future
	
	"log" : ( log ) => { console.log( log ) },
	"error" : ( error ) => { console.log( error ) },
	"warn" : ( warn ) => { console.log( warn ) },
	"make_URI" : ( placeholder_array ){} //WIP
	
}

var PhotoMap = function( image ){
	
	var source = { "image","type","reference" }, plot, frame, drawing;

}

//Object Functions - these are the methods of PhotoMap
//The plotting method is used only as a getter method, because when using the staging function inside PhotoMap instead of the generic staging function way down below, the need to plot is implied, so it is plotted immediately once the image data is extracted

PhotoMap.prototype.stage = function( source, method, callback = function(){
				
				//default callback is called once image is loaded, and data is extracted.
				
				this.plot = new PhotoMap.PhotoMapPlot( this.source );
				
			}.bind( this/* - this 'this' is not the 'this' from the scope where this method was called, unless .call() was used to call the stage method and a this value was supplied*/ ) ){
	
	this.plot;
	
	switch ( 
	
		!this.source ?
			source - !method :  //returns:
									//-1 for no original source, no new source, and no new method
									//0 for no original source, new source, but no new method
									//1 for no original source, new source and new method
			source ? ( source !== this.source.reference && /* !method || - method will differ if method is null/undefined */ method !== this.source.type ) + 1 : 2
		
	){
		
		case -1: //error out - no original source, no new source, and no method
		
			//break; - case -1 and 0 do the same thing
		case 0: //error out - no original source, there is a new source, but no method
		
			placeHolders.error( 
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
	
}

PhotoMap.prototype.plot = function(){
	
	if( this.plot )
		return this.plot;
	else{
		placeHolders.warn( "PhotoMap Object Plot WARNING: plot not yet defined, please wait!" );
		return null;
	}
}

PhotoMap.prototype.frame = function( plot ){
	
	if( !plot && !this.frame ){
		
		placeHolders.error( 
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
		
		placeHolders.error( 
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

//Generic Functions - these are the non-method counterparts to each of the methods in PhotoMap

PhotoMap.stage = ( method, source, callback ) => {
	
	if( source === undefined ){
		
		placeHolders.error( "Photomap Generic Staging ERROR: what am I supposed to stage? I need a source!" );
		return;
		
	}
	
	var modified = { "reference", "type", "data" }
	
	//either create image in blob or with filereader, or load from URL. The set the source reference
	//if no arguments are supplied, error out
	
	switch( method )
	{
		case undefined:
			placeHolders.error( "PhotoMap Generic Staging ERROR: No arguments supplied" );
			return;
		case "URI": //Library Potential? - use placeholder function
			modified.reference = placeHolders.make_URI( [ source ] );
			break;
		case "Blob":
			modified.reference = window.URL.createObjectURL( source );
			break;
		default:
			placeHolders.error( "PhotoMap Generic Staging ERROR: method " + method + " is not supported" );
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
			var modifee.data = context.getImageData( 0, 0, this.width , this.height );
		
			window.URL.revokeObjectURL( this.src );
			this = null; //save resources.
			
			if( callback instanceof Function )
				callback( modifiee );
			
		})
		
	})( modified/*, method*/, callback );
	
    img.src = modified.reference;
	
	modified.type = method;
	
	return modified; //return a source usable by PhotoMapGL
	
}

PhotoMap.PhotoMapPlot = function( source ){}
PhotoMap.PhotoMapFrame = function( plot ){}
PhotoMap.PhotoMapDrawing = function( frame ){}