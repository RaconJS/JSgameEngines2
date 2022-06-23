window.defaultFont="comic-sans";
{//19:16
window. DEBUG_UI=true;
window. TESTING=true;
{
	MainGame;Draw;ctx;Inputs;
	MainGame.layers={
		update:MainGame.mainLayers.update,
		draw:MainGame.mainLayers.draw,
		chunk:MainGame.mainLayers.chunk,
		cameraDraw:new MainGame.UpdateLayer(8),
	};
	MainGame.layers.draw.camera=MainGame.layers.cameraDraw;
	MainGame.updateOrder=[
		MainGame.layers.update,
		MainGame.layers.draw,
	];
}
importJavascriptFromSrc(
	"game/classes/Button.js",
	"game/classes/Menu.js",
	"game/mainMenu.js",
	"game/levelEnvioment.js",
	"game/levels.js",
	"game/setDebug.js",
).then(()=>{MainGame.start();});
}