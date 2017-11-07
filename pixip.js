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
				
			}else{
				
				runtime.error( "PIXIP: image not valid" );
				
			}
			
		}else{
			
			var forgive = new PIXIP( image );
			return forgive;
			
		}
		
	}
	
	//built-in extensions
	
	Object.defineProperties( 
		
		pixiq,
		{
			
			"plot" : {
				
				/*
				"writeable" : false,
				"configurable" : false,
				*/
				"enumerable" : true,
				"value" : {}
			
			}
		
		}
		
	);
	
	//built-in functions
	
	Object.defineProperties(
		pixiq.prototype,
		{
			
			"drawImage" : {
				
				/*
				"writeable" : false,
				"configurable" : false,
				"enumerable" : false,
				*/
				"value" : function( mime_type = 'image/png', channel ){
					
					let 
						virtual = carpenter(),
						virtual.width = this.plot.length,
						virtual.height = this.plot[0].length,
						context = virtual.getContext( "2d" ),
						imagedata = this.raw;
						graphic = new Image();
					
					if( channel >= 0 && channel <= 3 ){
							
						imagedata = new Uint8ClampedArray();
						
						
						const limit = virtual.width * virtual.height;
						for( let index = 0, relative = 0; index < limit; index++, relative++ ){
							
							if( relative === 4 )
								relative = 0;
							
							imagedata[ index ] = ( relative === channel ) ?
								this.channel[ channel ][ ( index - relative ) / 4 ] :
								0;
							
						}
						
					}
					
					context.putImageData( imagedata, 0, 0, virtual.width, virtual.height );
					
					graphic.src = virtual.toDataURL( mime_type );
					return graphic;
					
				}
			
			},
			
		}
		
	)
	
	/*
	Additional Interfaces
	
	- extender
	*/
	
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
	
	return pixiq;

} )