// Visual upgrade for El Reino de la Quimica
// Keeps the original gameplay logic while improving presentation and readability.
var Theodoric = Theodoric || {};

(function () {
    if (!Theodoric.Game || !Theodoric.Game.prototype) return;

    var proto = Theodoric.Game.prototype;
    var originalCreate = proto.create;
    var originalUpdate = proto.update;
    var originalGeneratePlayer = proto.generatePlayer;
    var originalGenerateEnemy = proto.generateEnemy;
    var originalGenerateDragon = proto.generateDragon;
    var originalGenerateChest = proto.generateChest;
    var originalGenerateGold = proto.generateGold;
    var originalHealthPotion = proto.generateHealthPotion;
    var originalVitalityPotion = proto.generateVitalityPotion;
    var originalStrengthPotion = proto.generateStrengthPotion;
    var originalSpeedPotion = proto.generateSpeedPotion;

    function injectCanvasStyle() {
        if (document.getElementById('chem-visual-v2-style')) return;
        var style = document.createElement('style');
        style.id = 'chem-visual-v2-style';
        style.textContent = [
            '#game-shell{background:radial-gradient(circle at 50% 42%,#23344c 0%,#0b1220 48%,#03060b 100%)!important;}',
            '#game-shell canvas{',
            '  width:min(92vmin,860px)!important;',
            '  height:min(92vmin,860px)!important;',
            '  max-width:94vw!important;',
            '  max-height:94vh!important;',
            '  image-rendering:auto!important;',
            '  border:1px solid rgba(170,230,220,.22);',
            '  border-radius:18px;',
            '  box-shadow:0 28px 80px rgba(0,0,0,.62),0 0 0 1px rgba(255,255,255,.03),0 0 42px rgba(83,196,178,.11);',
            '  filter:saturate(1.16) contrast(1.06) brightness(1.03);',
            '}',
            '@media(max-width:700px){#game-shell canvas{width:96vmin!important;height:96vmin!important;border-radius:10px;}}'
        ].join('\n');
        document.head.appendChild(style);
    }

    function createShadowBitmap(game) {
        var bmd = game.add.bitmapData(72, 36);
        var ctx = bmd.ctx;
        var gradient = ctx.createRadialGradient(36, 18, 2, 36, 18, 31);
        gradient.addColorStop(0, 'rgba(0,0,0,0.48)');
        gradient.addColorStop(0.55, 'rgba(0,0,0,0.27)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.save();
        ctx.scale(1, 0.48);
        ctx.beginPath();
        ctx.arc(36, 37, 30, 0, Math.PI * 2, false);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
        bmd.dirty = true;
        return bmd;
    }

    proto._decorateEntityV2 = function (entity, kind) {
        if (!entity || !entity.exists || entity._visualV2) return entity;
        entity._visualV2 = true;
        entity._visualKindV2 = kind || 'entity';
        entity.smoothed = true;

        if (kind === 'player') {
            entity.scale.setTo(2.28, 2.38);
        } else if (kind === 'enemy') {
            entity.scale.setTo(2.18, 2.28);
        } else if (kind === 'boss') {
            entity.scale.setTo(2.12, 2.2);
        } else if (kind === 'chest') {
            entity.scale.setTo(2.16, 2.26);
        } else if (kind === 'potion') {
            entity.scale.setTo(1.35, 1.48);
        }

        if (this._shadowGroupV2 && this._shadowBitmapV2 && kind !== 'gold') {
            var shadow = this.game.add.sprite(0, 0, this._shadowBitmapV2, 0, this._shadowGroupV2);
            shadow.anchor.setTo(0.5, 0.5);
            shadow.alpha = kind === 'boss' ? 0.72 : 0.54;
            shadow.scale.setTo(kind === 'boss' ? 1.25 : (kind === 'player' ? 0.68 : 0.58), kind === 'boss' ? 0.9 : 0.72);
            entity._shadowV2 = shadow;
            this._syncShadowV2(entity);
        }

        return entity;
    };

    proto._syncShadowV2 = function (entity) {
        if (!entity || !entity._shadowV2) return;
        var shadow = entity._shadowV2;
        if (!entity.exists || !entity.visible || entity.alive === false) {
            shadow.visible = false;
            return;
        }
        shadow.visible = true;

        var w = entity.width || 32;
        var h = entity.height || 32;
        shadow.x = entity.x + w * 0.5;
        shadow.y = entity.y + h * 0.88;

        if (entity._visualKindV2 === 'boss') {
            shadow.scale.x = 1.3;
            shadow.scale.y = 0.95;
        }
    };

    proto._buildTerrainV2 = function () {
        this._terrainGroupV2 = this.game.add.group();
        var terrain = this.game.add.graphics(0, 0, this._terrainGroupV2);
        var worldW = this.game.world.width;
        var worldH = this.game.world.height;

        for (var i = 0; i < 125; i++) {
            var x = Math.random() * worldW;
            var y = Math.random() * worldH;
            var rw = 30 + Math.random() * 105;
            var rh = 12 + Math.random() * 50;
            var dark = Math.random() > 0.52;
            terrain.beginFill(dark ? 0x173f2b : 0x91c869, dark ? 0.075 : 0.055);
            terrain.drawEllipse(x, y, rw, rh);
            terrain.endFill();
        }

        for (var j = 0; j < 180; j++) {
            var sx = Math.random() * worldW;
            var sy = Math.random() * worldH;
            terrain.beginFill(0xe5f1ba, 0.10);
            terrain.drawEllipse(sx, sy, 4 + Math.random() * 7, 2 + Math.random() * 4);
            terrain.endFill();
            terrain.beginFill(0x0b271d, 0.10);
            terrain.drawEllipse(sx + 2, sy + 3, 5 + Math.random() * 8, 2 + Math.random() * 4);
            terrain.endFill();
        }

        try {
            this.game.world.setChildIndex(this._terrainGroupV2, 1);
        } catch (e) {}
    };

    proto._buildVisualLayerV2 = function () {
        this._buildTerrainV2();
        this._shadowBitmapV2 = createShadowBitmap(this.game);
        this._shadowGroupV2 = this.game.add.group();

        try {
            this.game.world.setChildIndex(this._shadowGroupV2, 2);
        } catch (e) {}

        if (this.player) this._decorateEntityV2(this.player, 'player');
        if (this.enemies) this.enemies.forEach(function (e) { this._decorateEntityV2(e, 'enemy'); }, this);
        if (this.bosses) this.bosses.forEach(function (e) { this._decorateEntityV2(e, 'boss'); }, this);
        if (this.collectables) {
            this.collectables.forEach(function (e) {
                var kind = e.name === 'chest' ? 'chest' : (e.name === 'gold' ? 'gold' : 'potion');
                this._decorateEntityV2(e, kind);
            }, this);
        }

        if (this.obstacles) {
            this.obstacles.forEach(function (o) {
                o.smoothed = true;
                var variation = 2.05 + Math.random() * 0.22;
                o.scale.setTo(variation, variation * 1.05);
            }, this);
        }

        var hudTexts = [this.notificationLabel, this.xpLabel, this.healthLabel, this.goldLabel, this.spellLabel, this.knowledgeLabel, this.questionLabel];
        hudTexts.forEach(function (label) {
            if (!label) return;
            label.setShadow(1.5, 2, 'rgba(0,0,0,.85)', 3);
            label.smoothed = true;
        });

        if (this.notificationLabel) {
            this.notificationLabel.fontSize = 14;
            this.notificationLabel.x = 22;
            this.notificationLabel.y = 18;
        }
        if (this.knowledgeLabel) {
            this.knowledgeLabel.fontSize = 14;
            this.knowledgeLabel.x = 22;
            this.knowledgeLabel.y = 48;
        }
        if (this.questionLabel) {
            this.questionLabel.fontSize = 14;
            this.questionLabel.x = 22;
            this.questionLabel.y = 70;
        }
        if (this.xpLabel) {
            this.xpLabel.fontSize = 13;
            this.xpLabel.x = 22;
            this.xpLabel.y = this.game.height - 34;
        }
        if (this.goldLabel) {
            this.goldLabel.fontSize = 13;
            this.goldLabel.x = this.game.width - 105;
            this.goldLabel.y = this.game.height - 34;
        }
        if (this.healthLabel) {
            this.healthLabel.fontSize = 20;
            this.healthLabel.x = Math.round(this.game.width / 2) - 58;
            this.healthLabel.y = this.game.height - 62;
        }
        if (this.spellLabel) {
            this.spellLabel.fontSize = 12;
            this.spellLabel.x = Math.round(this.game.width / 2) - 30;
            this.spellLabel.y = this.game.height - 34;
        }
    };

    proto._updateVisualLayerV2 = function () {
        if (this.player) this._syncShadowV2(this.player);
        if (this.enemies) this.enemies.forEachAlive(function (e) { this._syncShadowV2(e); }, this);
        if (this.bosses) this.bosses.forEachAlive(function (e) { this._syncShadowV2(e); }, this);
        if (this.collectables) this.collectables.forEachAlive(function (e) { this._syncShadowV2(e); }, this);
    };

    // The character sheet already contains three separate hero columns.
    // Connect the selection screen to those three visual variants.
    proto.generatePlayer = function () {
        var player = originalGeneratePlayer.apply(this, arguments);
        var selection = window.TheodoricSelection || { id: 'kimi-woman', name: 'Kimi Woman' };
        var profiles = {
            'kimi-man': {
                name: 'Kimi Man',
                base: 0,
                accent: 0x8fd8ff
            },
            'kimi-woman': {
                name: 'Kimi Woman',
                base: 3,
                accent: 0xffb7df
            },
            'alternative-kim': {
                name: 'Alternative Kim',
                base: 6,
                accent: 0xc7ff9b
            }
        };
        var profile = profiles[selection.id] || profiles['kimi-woman'];
        var b = profile.base;

        player.animations.remove('down');
        player.animations.remove('left');
        player.animations.remove('right');
        player.animations.remove('up');
        player.animations.add('down', [b, b + 1, b + 2], 10, true);
        player.animations.add('left', [b + 12, b + 13, b + 14], 10, true);
        player.animations.add('right', [b + 24, b + 25, b + 26], 10, true);
        player.animations.add('up', [b + 36, b + 37, b + 38], 10, true);
        player.animations.play('down');

        player.name = profile.name;
        player.characterId = selection.id;
        player.characterAccent = profile.accent;

        return player;
    };

    proto.generateEnemy = function () {
        var entity = originalGenerateEnemy.apply(this, arguments);
        if (this._shadowGroupV2) this._decorateEntityV2(entity, 'enemy');
        return entity;
    };

    proto.generateDragon = function () {
        var entity = originalGenerateDragon.apply(this, arguments);
        if (this._shadowGroupV2) this._decorateEntityV2(entity, 'boss');
        return entity;
    };

    proto.generateChest = function () {
        var entity = originalGenerateChest.apply(this, arguments);
        if (this._shadowGroupV2) this._decorateEntityV2(entity, 'chest');
        return entity;
    };

    proto.generateGold = function () {
        var entity = originalGenerateGold.apply(this, arguments);
        if (this._shadowGroupV2) this._decorateEntityV2(entity, 'gold');
        return entity;
    };

    proto.generateHealthPotion = function () {
        var entity = originalHealthPotion.apply(this, arguments);
        if (this._shadowGroupV2) this._decorateEntityV2(entity, 'potion');
        return entity;
    };
    proto.generateVitalityPotion = function () {
        var entity = originalVitalityPotion.apply(this, arguments);
        if (this._shadowGroupV2) this._decorateEntityV2(entity, 'potion');
        return entity;
    };
    proto.generateStrengthPotion = function () {
        var entity = originalStrengthPotion.apply(this, arguments);
        if (this._shadowGroupV2) this._decorateEntityV2(entity, 'potion');
        return entity;
    };
    proto.generateSpeedPotion = function () {
        var entity = originalSpeedPotion.apply(this, arguments);
        if (this._shadowGroupV2) this._decorateEntityV2(entity, 'potion');
        return entity;
    };

    proto.create = function () {
        originalCreate.call(this);
        this.game.stage.backgroundColor = '#081015';
        if (this.game.renderer && this.game.renderer.renderSession) {
            this.game.renderer.renderSession.roundPixels = false;
        }
        this._buildVisualLayerV2();
    };

    proto.update = function () {
        originalUpdate.call(this);
        this._updateVisualLayerV2();
    };

    injectCanvasStyle();
})();

// Square high-resolution viewport. The world itself remains large (1920 x 1920),
// but the player now sees a much more useful square exploration area.
Theodoric.game = new Phaser.Game(768, 768, Phaser.AUTO, 'game-shell', null, false, true);

Theodoric.game.state.add('Boot', Theodoric.Boot);
Theodoric.game.state.add('Preloader', Theodoric.Preloader);
Theodoric.game.state.add('MainMenu', Theodoric.MainMenu);
Theodoric.game.state.add('Game', Theodoric.Game);

Theodoric.game.state.start('Boot');
