// log handling:

var loggerBox = {  //These functions are namespaced here in case they will be changed in the future
	
	"log" : ( log ) => { console.log( log ) },
	"error" : ( error ) => { console.log( error ) }
	
}

var PhotoMap = function( image ){
	
	var source = { "image","type","reference" }, plot, frame, drawing;

}

//Object Functions - these are the methods of PhotoMap
//The plotting method is not needed, because when using the staging function inside PhotoMap instead of the generic staging function way down below, the need to plot is implied, so it is plotted right away, and the plot itself is returned instead of the source

PhotoMap.prototype.stage = function( source, method ){
	
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
		
			loggerBox.error( 
				"PhotoMap Object Staging ERROR: " +
					"Original source does not exist, and the amount of arguments provided to the staging function is insufficient" +
					"(" + ( !!source + 0 ) + " argument" + ( source ? "" : "s" ) + " given--function requires 2)"
			)
			return;

		case 1: //create new source object - either:
				//there is no original source, but there is a new source & method
				//or
				//there is an original source, and the new source & method differ
				
			
			this.source = PhotoMap.stage( method ? method: this.source.type, source );
				
			break;
		//case 2: //case 2 block can be deleted and is unnecessary as it will not do anything. All successful (no error) calls to this function will return this.source
				
				//return original source (via the plot object) - original source exists, but the new source & method differ or they are not provided in arguments (getter function)
				
			//break;
		
	}
	
	//read the note on why plotting is done immediately within staging using the comment above this function
	
	this.plot = new PhotoMap.PhotoMapPlot( this.source );
	
	return this.plot
	
}

PhotoMap.prototype.frame = function( plot ){
	
	if( !plot && !this.frame ){
		
		loggerBox.error( 
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
		
		loggerBox.error( 
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

PhotoMap.stage = ( method, source ) => {
	
	if( source === undefined ){
		
		loggerBox.error( "Photomap Generic Staging ERROR: what am I supposed to stage? I need a source!" );
		return;
		
	}
	
	var modified = { "reference", "type" }
	
	//either create image in blob or with filereader, or load from URL. The set the source reference
	//if no arguments are supplied, error out
	
	switch( method )
	{
		case undefined:
			loggerBox.error( "PhotoMap Generic Staging ERROR: No arguments supplied" );
			return;
		case "URI": //Library Potential?
			break;
		case "Blob":
			break;
		case "FileReader"
			break;
		default:
			return;
		
	}
	
	modified.type = method;
	
	return modified; //return a source usable by PhotoMapGL
	
}

PhotoMap.PhotoMapPlot = function( source ){}
PhotoMap.PhotoMapFrame = function( plot ){}
PhotoMap.PhotoMapDrawing = function( frame ){}