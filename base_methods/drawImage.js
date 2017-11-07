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