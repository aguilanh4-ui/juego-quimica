Theodoric.Preloader = function (game) {
	this.background = null;
	this.preloadBar = null;
	this.ready = false;
};

Theodoric.Preloader.prototype = {
	preload: function () {
		this.splash = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
		this.splash.anchor.setTo(0.5);
		this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 128, 'preloaderBar');
		this.preloadBar.anchor.setTo(0.5);
		this.load.setPreloadSprite(this.preloadBar);

		this.load.image('playButton', 'assets/images/play.png');
		this.load.image('flame', 'assets/images/flame.png');
		this.load.image('sword', 'assets/images/sword.png');
		this.load.image('levelParticle', 'assets/images/level-particle.png');
		this.load.image('spellParticle', 'assets/images/spell-particle.png');

		// New pseudo-3D RPG heroes: three identities, each with front/rear/side art.
		this.load.image('kimi-man-down', 'assets/images/characters/kimi-man-down.svg');
		this.load.image('kimi-man-up', 'assets/images/characters/kimi-man-up.svg');
		this.load.image('kimi-man-side', 'assets/images/characters/kimi-man-side.svg');
		this.load.image('kimi-woman-down', 'assets/images/characters/kimi-woman-down.svg');
		this.load.image('kimi-woman-up', 'assets/images/characters/kimi-woman-up.svg');
		this.load.image('kimi-woman-side', 'assets/images/characters/kimi-woman-side.svg');
		this.load.image('alternative-kim-down', 'assets/images/characters/alternative-kim-down.svg');
		this.load.image('alternative-kim-up', 'assets/images/characters/alternative-kim-up.svg');
		this.load.image('alternative-kim-side', 'assets/images/characters/alternative-kim-side.svg');

		this.load.spritesheet('tiles', 'assets/images/tiles.png', 16, 16);
		this.load.spritesheet('things', 'assets/images/things.png', 16, 16);
		this.load.spritesheet('characters', 'assets/images/characters.png', 16, 16);
		this.load.spritesheet('dead', 'assets/images/dead.png', 16, 16);
		this.load.spritesheet('potions', 'assets/images/potions.png', 16, 16);
		this.load.spritesheet('dragons', 'assets/images/dragons.png', 32, 32);
		this.load.spritesheet('fireball', 'assets/images/fireball.png', 16, 16);
		this.load.spritesheet('spell', 'assets/images/spell.png', 12, 12);

		this.load.audio('openingMusic', 'assets/sound/opening.ogg');
		this.load.audio('overworldMusic', 'assets/sound/overworld.ogg');
		this.load.audio('attackSound', 'assets/sound/attack.wav');
		this.load.audio('playerSound', 'assets/sound/player.wav');
		this.load.audio('skeletonSound', 'assets/sound/skeleton.wav');
		this.load.audio('slimeSound', 'assets/sound/slime.wav');
		this.load.audio('batSound', 'assets/sound/bat.wav');
		this.load.audio('ghostSound', 'assets/sound/ghost.wav');
		this.load.audio('spiderSound', 'assets/sound/spider.wav');
		this.load.audio('goldSound', 'assets/sound/gold.wav');
		this.load.audio('potionSound', 'assets/sound/potion.ogg');
		this.load.audio('levelSound', 'assets/sound/level.ogg');
		this.load.audio('fireballSound', 'assets/sound/fireball.wav');
		this.load.audio('dragonSound', 'assets/sound/dragon.wav');
	},

	create: function () {
		this.preloadBar.cropEnabled = false;
	},

	update: function () {
		if (this.cache.isSoundDecoded('openingMusic') && this.ready == false) {
			this.ready = true;
			this.state.start('MainMenu');
		}
	}
};
