(function(){
	
	var MAP = window.MAP = window.MAP || {};
	
	Math.sinh = function(value){
		var a = Math.pow(Math.E, value);
		var b = Math.pow(Math.E, -value);
		return (a-b)/2;
	}
		
	// Position [lon,lat,zoom] ou [min:{lon,lat},max:{lon,lat}]
	// param = {width,height,source,lon,lat,zoom,min:{lon,lat},max:{lon,lat},virtual,onProgress,onReady}
	// event = {count,ready,error,percent}
	// param.get(redraw) = {type:"GenerateMAP",canvas,ctx,r,tl,br,min:{lon,lat},max:{lon,lat},toPoint,toCoor}
	MAP.create = function(param){
		param = param || {};
		
		/* Vars */
		
		var width = param.width; if (!isFinite(width) || width<=0) width = 256;
		var height = param.height; if (!isFinite(height) || height<=0) height = 256;
		
		var source = param.source || "openstreetmap";
		var resolution = 256;
		var zoom = param.zoom || 6;
		var lon = param.lon = param.lon || 2.506256;
		var lat = param.lat = param.lat || 46.612893;
		var virtual = !!param.virtual;
		
		var center,r,tl,br,x,y,z,nx,ny,sx,sy;
		var lock = 0;
		
		/* Intern */
		function BadSize(delta){
			zoom+=delta;
			var p1 = ToPoint(param.min.lon,param.min.lat);
			var p2 = ToPoint(param.max.lon,param.max.lat);
			var w = Math.abs(p1.x - p2.x);
			var h = Math.abs(p1.y - p2.y);
			zoom-=delta;
			return (w>width || h>height);
		}
		
		function ToPoint(lon, lat){
			var x = Math.floor((lon + 180) / 360 * (1<<zoom) * resolution);
			var y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * (1<<zoom) * resolution);
			return {x:x,y:y,lon:lon,lat:lat,zoom:zoom,resolution:resolution};
		}
		
		function ToCoor(x, y){
			var lon = x * 360 / (1<<zoom) / resolution - 180;
			var lat = y * 2 / (1<<zoom) / resolution;
			lat = 1 - lat;
			lat = lat * Math.PI;
			lat = Math.atan(Math.sinh(lat)) * 180 / Math.PI;
			return {x:x,y:y,lon:lon,lat:lat,zoom:zoom,resolution:resolution};
		}
		
		function Init(){
			
			if (lock){
				lock = 2; return;
			}
			
			if (param.min && param.max && 
				!isNaN(param.min.lon) && !isNaN(param.min.lat) && 
				!isNaN(param.max.lon) && !isNaN(param.max.lat)){
				
				lon = param.lon = (param.min.lon+param.max.lon)/2;
				lat = param.lat = (param.min.lat+param.max.lat)/2;
				
				if (!isFinite(param.zoom)){
					if (BadSize(0)) while (zoom>6 && BadSize(0)) zoom--;
					else while (zoom<20 && !BadSize(1)) zoom++;
				}
			}
			
			center = param.center = ToPoint(lon,lat);
			
			r = {left:0,top:0,rigth:width,bottom:height,width:width,height:height};
			tl = param.tl = ToCoor(center.x-(width>>1),center.y-(height>>1));
			br = ToCoor(tl.x+width,tl.y+height);
			
			if (virtual) return;
			
			canvas.width = width; canvas.height = height;
			
			ctx.fillStyle = "white";
			ctx.fillRect(0,0,width,height);
			
			x = (tl.x>>8); y = (tl.y>>8); z = zoom;
			nx = (br.x>>8)-x+1; ny = (br.y>>8)-y+1;
			sx = ((tl.x>>8)<<8)-tl.x; sy = ((tl.y>>8)<<8)-tl.y;
			
			lock = 1; imgCount = 0; imgReady = 0; imgError = 0;
			for (var j=0;j<ny;j++)
				for (var i=0;i<nx;i++)
					LoadImage(x+i,y+j,z);
			lock = 0;
			
			Progress();
		}
		
		/* Canvas */
		if (virtual){
			var canvas = false, ctx = false;
		}else{
			var canvas = document.createElement("CANVAS");
			var ctx = canvas.getContext("2d");
		}
		
		/* Images */
		var images = {};
		var imgCount = 0, imgReady = 0, imgError = 0;
		
		function Progress(){
			if (lock) return;
			if (typeof param.onProgress=="function"){
				var p = Math.floor((imgReady+imgError)*100/imgCount);
				param.onProgress(param,{count:imgCount,ready:imgReady,error:imgError,percent:p});
			}
			if (typeof param.onReady=="function" && imgReady+imgError==imgCount){
				param.onReady(param,{count:imgCount,ready:imgReady,error:imgError,percent:100});
			}
		}
		
		function LoadImage(x,y,z){
			imgCount++;
			var id = x+"/"+y+"/"+z;
			var img = images[id];
			if (img && img.state!=2){
				if (img.state==1 || img.state==3) {
					img.state=1;
					imgReady++;
				}
				return;
			}
			if (img) img.disable = true;
			img = images[id] = new Image();
			img.uid = id;
			img.state = 0;
			img.crossOrigin = "anonymous";
			img.onload = function(){
				clearTimeout(timer);
				if (img.disable) return;
				if(img.state==0) {img.state=1;imgReady++}
				if(img.state==2) {img.state=1;imgError--;imgReady++}
				Progress();
			}
			img.onerror = function(){
				clearTimeout(timer);
				if (img.disable) return;
				if(img.state==0) {img.state=2;imgError++}
				if(img.state==1) {img.state=2;imgError++;imgReady--}
				Progress();
			}
			if (source=="google") img.src = "https://mts1.google.com/vt/x="+x+"&y="+y+"&z="+z;
			else if (source=="openstreetmap") img.src = "http://tile.openstreetmap.org/"+z+"/"+x+"/"+y+".png";
			else img.src = (DEBUG?".":"")+"./map/"+source+"/"+z+"/"+x+"/"+y;
			var timer = setTimeout(function(){
				img.onerror();
			},20000);
		}
		
		function ClearImage(){
			for (var id in images) images[id].disable = true;
			images = [];
		}
		
		/* Extern */
		param.toPoint = ToPoint;
		param.toCoor = function(x,y,relative){
			if (relative) {x+=tl.x;y+=tl.y}
			return ToCoor(x,y);
		};
		param.get = function(redraw){
			if (virtual) return {type:"GenerateMAP",virtual:true,canvas:false,ctx:false,r:r,tl:tl,br:br,
				min:{lon:Math.min(tl.lon,br.lon),lat:Math.min(tl.lat,br.lat)},
				max:{lon:Math.max(tl.lon,br.lon),lat:Math.max(tl.lat,br.lat)},
				toPoint:ToPoint,toCoor:ToCoor};
			
			if (redraw){
				ctx.fillStyle = "white";
				ctx.fillRect(0,0,width,height);
			}
			for (var j=0;j<ny;j++)
			{
				for (var i=0;i<nx;i++)
				{
					var img = images[(x+i)+"/"+(y+j)+"/"+z];
					if (img.state==1 || (redraw && img.state==3)){
						ctx.drawImage(img,0,0,256,256,i*256+sx,j*256+sy,256,256);
						img.state=3;
					}
				}
			}
			return {type:"GenerateMAP",canvas:canvas,ctx:ctx,r:r,tl:tl,br:br,
				min:{lon:Math.min(tl.lon,br.lon),lat:Math.min(tl.lat,br.lat)},
				max:{lon:Math.max(tl.lon,br.lon),lat:Math.max(tl.lat,br.lat)},
				toPoint:ToPoint,toCoor:ToCoor};
		};
		param.info = function(){
			return {r:r,tl:tl,br:br,center:center,
				min:{lon:Math.min(tl.lon,br.lon),lat:Math.min(tl.lat,br.lat)},
				max:{lon:Math.max(tl.lon,br.lon),lat:Math.max(tl.lat,br.lat)}
			};
		};
		param.copy = function(redraw){
			var r = param.get(redraw); if (!r.canvas) return false;
			var canvas = document.createElement("CANVAS");
			canvas.width = r.canvas.width;
			canvas.height = r.canvas.height;
			var ctx = canvas.ctx = canvas.getContext("2d");
			ctx.drawImage(r.canvas,0,0);
			MapCopyTools(canvas,zoom,resolution,tl.x,tl.y);
			return canvas;
		};
		param.setSize = function(w,h){
			if (!isFinite(w) || w<=0) return;
			if (!isFinite(h) || h<=0) return;
			width = w; height = h;
			Init();
		};
		param.getZoom = function(z){
			return zoom;
		};
		param.setZoom = function(z){
			if (z==="+") z=zoom+1;
			if (z==="-") z=zoom-1;
			if (!isFinite(z) || z<6 || z>19 || z==zoom) return;
			param.zoom = zoom = z;
			Init();
		};
		param.setCenter = function(a,b){
			if (isNaN(a) || isNaN(b)) return;
			lon = param.lon = a; lat = param.lat = b;
			delete param.min; delete param.max;
			Init();
		};
		param.setBoundary = function(info){
			if (info.min && info.max && 
				!isNaN(info.min.lon) && !isNaN(info.min.lat) && 
				!isNaN(info.max.lon) && !isNaN(info.max.lat)){
				
				param.min = info.min;
				param.max = info.max;
				delete param.zoom;
				Init();
			}
		};
		param.setSource = function(s){
			if (source==s) return;
			source = param.source = s;
			ClearImage();
			Init();
		};
		param.lock = function(){
			if (!lock) lock = 1;
		};
		param.unlock = function(){
			if (lock>1){
				lock = 0; Init();
			} else lock = 0;
			Progress();
		};
		param.stop = function(){
			for (var id in images) {
				var img = images[id];
				if (img.state==0 || img.state==2){
					img.disable = true;
					img.state=2;
				}
			}
		};
		
		/* Init */
		Init(); 
		
		return param;
	}
	
	function MapCopyTools(canvas,zoom,resolution,left,top){
		canvas.toPoint = function(lon,lat){
			var x = Math.floor((lon + 180) / 360 * (1<<zoom) * resolution);
			var y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * (1<<zoom) * resolution);
			return {ix:x-left,iy:y-top,x:x,y:y,lon:lon,lat:lat,zoom:zoom,resolution:resolution};
		}
		canvas.toCoor = function(x, y, relative){
			if (relative) {x+=left;y+=top}
			var lon = x * 360 / (1<<zoom) / resolution - 180;
			var lat = y * 2 / (1<<zoom) / resolution;
			lat = 1 - lat;
			lat = lat * Math.PI;
			lat = Math.atan(Math.sinh(lat)) * 180 / Math.PI;
			return {ix:x-left,iy:y-top,x:x,y:y,lon:lon,lat:lat,zoom:zoom,resolution:resolution};
		}
		canvas.zoom = zoom;
		canvas.tl = {x:left,y:top};
	}
	
	MAP.toPoint = function(lon, lat, zoom, resolution){
		zoom = typeof zoom !== 'undefined' ? zoom : 6;
		resolution = typeof resolution !== 'undefined' ? resolution : 256;
		var x = Math.floor((lon + 180) / 360 * (1<<zoom) * resolution);
		var y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * (1<<zoom) * resolution);
		return {x:x,y:y,lon:lon,lat:lat,zoom:zoom,resolution:resolution};
	}
	
	MAP.toCoor = function(x, y, zoom, resolution){
		zoom = typeof zoom !== 'undefined' ? zoom : 6;
		resolution = typeof resolution !== 'undefined' ? resolution : 256;
		var lon = x * 360 / (1<<zoom) / resolution - 180;
		var lat = y * 2 / (1<<zoom) / resolution;
		lat = 1 - lat;
		lat = lat * Math.PI;
		lat = Math.atan(Math.sinh(lat)) * 180 / Math.PI;
		return {x:x,y:y,lon:lon,lat:lat,zoom:zoom,resolution:resolution};
	}
	
})();