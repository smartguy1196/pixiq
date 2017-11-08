( function ( root, factory ){
	
	//Catch-all (Browser)
	
	root.pixiq = factory( );
	
	if( typeof define === "function" && define.amd ){ //AMD
	
		define( [ "pixip" ], root.pixiq );
		
	}else if( typeof module === "object" && module.exports ){ //CommonJS

		module.exports = root.pixiq;
	
	}
	
}( window !== "undefined" ? window : this, function( ){

	var
		runtime = {
				
			"log" : ( message ) => { console.log( message ) },
			"error" : ( message ) => { console.error( message ) },
			"warn" : ( message ) => { console.warn( message ) }
			
		}
		carpenter = function(){
			
			if( typeof root.Canvas !== "function" ){
				
				let virtual;
				
				try{
					
					virtual = document.createElement( "canvas" ); //Commentary: Error will ONLY throw if document does not exist
					virtual.getContext( "2d" ); //Commentary: Error will only throw if WebGL is not supported - NECESSARY!
					virtual.width = arguments[0];
					virtual.height = arguments[1];
					
					return virtual;
					
				}catch(e){
					
					runtime.error( "PIXIP - FAILURE: required canvas API not detected!" );
					return null;
					
				}
				
			}else{
				
				try{
					
					root.Image = Canvas.Image;
					
				}catch(e){
					
					runtime.error( "PIXIP - FAILURE: required canvas API not detected!" );
					return null;
					
				}
					
				return new Canvas.createCanvas.apply( Canvas, arguments );
				
			}
		}
	
	var pixiq = function( image ){
		
		if( new.target ){
			
			if( image instanceof Image ){
			
				var
					source = new Image(),
					raw = new Uint8ClampedArray,
					channel = [];
				
				source.src = image.src;
	
				//WIP: make data extractor
				
				this.math.plot();
				
			}else{
				
				runtime.error( "PIXIP: image not valid" );
				
			}
			
		}else{
			
			var forgive = new PIXIP( image );
			return forgive;
			
		}
		
	}
	
	return pixiq;

} )