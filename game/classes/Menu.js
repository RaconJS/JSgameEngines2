class Menu{
	constructor(load){
		this.load=load??this.load;
		this.detach();
	}
	module=new MainGame.UpdateModule([]);
	load=function(){};
	reload(){//restarts scripts
		this.module.detach();//deactivate any scripts that might be there
		this.module.clear();
		this.load();
		this.module.attach();
	}
	unload(){
		this.module.detach();
		this.module.clear();
	}//ends scripts
	attach(){//unpauses scripts
		this.module.attach();
	}
	detach(){//pauses scripts
		this.module.detach();
	}
};