// Visual upgrade + selectable pseudo-3D RPG heroes for El Reino de la Quimica
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
        if (document.getElementById('chem-visual-v3-style')) return;
        var style = document.createElement('style');
        style.id = 'chem-visual-v3-style';
        style.textContent = [
            '#game-shell{background:radial-gradient(circle at 50% 42%,#23344c 0%,#0b1220 48%,#03060b 100%)!important;}',
            '#game-shell canvas{width:min(92vmin,860px)!important;height:min(92vmin,860px)!important;max-width:94vw!important;max-height:94vh!important;image-rendering:auto!important;border:1px solid rgba(170,230,220,.22);border-radius:18px;box-shadow:0 28px 80px rgba(0,0,0,.62),0 0 42px rgba(83,196,178,.11);filter:saturate(1.16) contrast(1.06) brightness(1.03);}',
            '@media(max-width:700px){#game-shell canvas{width:96vmin!important;height:96vmin!important;border-radius:10px;}}'
        ].join('\n');
        document.head.appendChild(style);
    }

    function createShadowBitmap(game) {
        var bmd = game.add.bitmapData(72, 36), ctx = bmd.ctx;
        var gradient = ctx.createRadialGradient(36, 18, 2, 36, 18, 31);
        gradient.addColorStop(0, 'rgba(0,0,0,0.48)');
        gradient.addColorStop(0.55, 'rgba(0,0,0,0.27)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.save(); ctx.scale(1, 0.48); ctx.beginPath(); ctx.arc(36, 37, 30, 0, Math.PI * 2, false); ctx.fillStyle = gradient; ctx.fill(); ctx.restore();
        bmd.dirty = true;
        return bmd;
    }

    proto._decorateEntityV3 = function (entity, kind) {
        if (!entity || !entity.exists || entity._visualV3) return entity;
        entity._visualV3 = true; entity._visualKindV3 = kind || 'entity'; entity.smoothed = true;
        if (kind === 'player') entity.scale.setTo(0.56, 0.56);
        else if (kind === 'enemy') entity.scale.setTo(2.18, 2.28);
        else if (kind === 'boss') entity.scale.setTo(2.12, 2.2);
        else if (kind === 'chest') entity.scale.setTo(2.16, 2.26);
        else if (kind === 'potion') entity.scale.setTo(1.35, 1.48);

        if (this._shadowGroupV3 && this._shadowBitmapV3 && kind !== 'gold') {
            var shadow = this.game.add.sprite(0, 0, this._shadowBitmapV3, 0, this._shadowGroupV3);
            shadow.anchor.setTo(0.5, 0.5);
            shadow.alpha = kind === 'boss' ? 0.72 : 0.54;
            entity._shadowV3 = shadow;
            this._syncShadowV3(entity);
        }
        return entity;
    };

    proto._syncShadowV3 = function (entity) {
        if (!entity || !entity._shadowV3) return;
        var shadow = entity._shadowV3;
        if (!entity.exists || !entity.visible || entity.alive === false) { shadow.visible = false; return; }
        shadow.visible = true;
        shadow.x = entity.x + (entity.width || 32) * 0.5;
        shadow.y = entity.y + (entity.height || 32) * 0.9;
        if (entity._visualKindV3 === 'player') shadow.scale.setTo(0.82, 0.52);
        else if (entity._visualKindV3 === 'boss') shadow.scale.setTo(1.3, 0.95);
        else shadow.scale.setTo(0.58, 0.72);
    };

    proto._buildTerrainV3 = function () {
        this._terrainGroupV3 = this.game.add.group();
        var terrain = this.game.add.graphics(0, 0, this._terrainGroupV3), worldW = this.game.world.width, worldH = this.game.world.height;
        for (var i = 0; i < 125; i++) {
            var x = Math.random()*worldW, y = Math.random()*worldH, rw = 30+Math.random()*105, rh = 12+Math.random()*50, dark = Math.random()>0.52;
            terrain.beginFill(dark ? 0x173f2b : 0x91c869, dark ? 0.075 : 0.055); terrain.drawEllipse(x,y,rw,rh); terrain.endFill();
        }
        for (var j = 0; j < 180; j++) {
            var sx = Math.random()*worldW, sy = Math.random()*worldH;
            terrain.beginFill(0xe5f1ba,0.10); terrain.drawEllipse(sx,sy,4+Math.random()*7,2+Math.random()*4); terrain.endFill();
            terrain.beginFill(0x0b271d,0.10); terrain.drawEllipse(sx+2,sy+3,5+Math.random()*8,2+Math.random()*4); terrain.endFill();
        }
        try { this.game.world.setChildIndex(this._terrainGroupV3,1); } catch(e) {}
    };

    proto._heroProfileV3 = function () {
        var selection = window.TheodoricSelection || { id:'kimi-man', name:'Kimi Man' };
        var profiles = {
            'kimi-man': { id:'kimi-man', name:'Kimi Man', accent:0x52b7ff },
            'kimi-woman': { id:'kimi-woman', name:'Kimi Woman', accent:0xf06cdc },
            'alternative-kim': { id:'alternative-kim', name:'Alternative Kim', accent:0x54e58d }
        };
        return profiles[selection.id] || profiles['kimi-man'];
    };

    proto._setHeroFacingV3 = function (direction) {
        if (!this.player || !this.player.characterId) return;
        var key = this.player.characterId + '-' + (direction === 'left' || direction === 'right' ? 'side' : direction);
        if (this.player.key !== key) this.player.loadTexture(key);
        var base = 0.56;
        this.player.scale.y = base;
        this.player.scale.x = direction === 'left' ? -base : base;
        this.player.anchor.x = direction === 'left' ? 1 : 0;
    };

    proto.generatePlayer = function () {
        var player = originalGeneratePlayer.apply(this, arguments);
        var p = this._heroProfileV3();
        player.loadTexture(p.id + '-down');
        player.animations.stop();
        player.animations.remove('down'); player.animations.remove('left'); player.animations.remove('right'); player.animations.remove('up');
        player.name = p.name; player.characterId = p.id; player.characterAccent = p.accent; player.smoothed = true;
        player.scale.setTo(0.56,0.56); player.anchor.setTo(0,0);
        player.body.setSize(42, 34, 27, 88);
        return player;
    };

    proto.playerMovementHandler = function () {
        var p = this.player, s = p.speed;
        if (this.controls.up.isDown && this.controls.left.isDown) { p.body.velocity.setTo(-s,-s); this._setHeroFacingV3('left'); }
        else if (this.controls.up.isDown && this.controls.right.isDown) { p.body.velocity.setTo(s,-s); this._setHeroFacingV3('right'); }
        else if (this.controls.down.isDown && this.controls.left.isDown) { p.body.velocity.setTo(-s,s); this._setHeroFacingV3('left'); }
        else if (this.controls.down.isDown && this.controls.right.isDown) { p.body.velocity.setTo(s,s); this._setHeroFacingV3('right'); }
        else if (this.controls.up.isDown) { p.body.velocity.setTo(0,-s); this._setHeroFacingV3('up'); }
        else if (this.controls.down.isDown) { p.body.velocity.setTo(0,s); this._setHeroFacingV3('down'); }
        else if (this.controls.left.isDown) { p.body.velocity.setTo(-s,0); this._setHeroFacingV3('left'); }
        else if (this.controls.right.isDown) { p.body.velocity.setTo(s,0); this._setHeroFacingV3('right'); }
        else { p.body.velocity.setTo(0,0); }
    };

    proto._buildVisualLayerV3 = function () {
        this._buildTerrainV3(); this._shadowBitmapV3 = createShadowBitmap(this.game); this._shadowGroupV3 = this.game.add.group();
        try { this.game.world.setChildIndex(this._shadowGroupV3,2); } catch(e) {}
        if (this.player) this._decorateEntityV3(this.player,'player');
        if (this.enemies) this.enemies.forEach(function(e){this._decorateEntityV3(e,'enemy');},this);
        if (this.bosses) this.bosses.forEach(function(e){this._decorateEntityV3(e,'boss');},this);
        if (this.collectables) this.collectables.forEach(function(e){this._decorateEntityV3(e,e.name==='chest'?'chest':(e.name==='gold'?'gold':'potion'));},this);
        if (this.obstacles) this.obstacles.forEach(function(o){o.smoothed=true;var v=2.05+Math.random()*0.22;o.scale.setTo(v,v*1.05);},this);
        [this.notificationLabel,this.xpLabel,this.healthLabel,this.goldLabel,this.spellLabel,this.knowledgeLabel,this.questionLabel].forEach(function(label){if(label){label.setShadow(1.5,2,'rgba(0,0,0,.85)',3);label.smoothed=true;}});
        if(this.notificationLabel){this.notificationLabel.fontSize=14;this.notificationLabel.x=22;this.notificationLabel.y=18;}
        if(this.knowledgeLabel){this.knowledgeLabel.fontSize=14;this.knowledgeLabel.x=22;this.knowledgeLabel.y=48;}
        if(this.questionLabel){this.questionLabel.fontSize=14;this.questionLabel.x=22;this.questionLabel.y=70;}
        if(this.xpLabel){this.xpLabel.fontSize=13;this.xpLabel.x=22;this.xpLabel.y=this.game.height-34;}
        if(this.goldLabel){this.goldLabel.fontSize=13;this.goldLabel.x=this.game.width-105;this.goldLabel.y=this.game.height-34;}
        if(this.healthLabel){this.healthLabel.fontSize=20;this.healthLabel.x=Math.round(this.game.width/2)-58;this.healthLabel.y=this.game.height-62;}
        if(this.spellLabel){this.spellLabel.fontSize=12;this.spellLabel.x=Math.round(this.game.width/2)-30;this.spellLabel.y=this.game.height-34;}
    };

    proto._updateVisualLayerV3 = function () {
        if(this.player)this._syncShadowV3(this.player);
        if(this.enemies)this.enemies.forEachAlive(function(e){this._syncShadowV3(e);},this);
        if(this.bosses)this.bosses.forEachAlive(function(e){this._syncShadowV3(e);},this);
        if(this.collectables)this.collectables.forEachAlive(function(e){this._syncShadowV3(e);},this);
    };

    proto.generateEnemy=function(){var e=originalGenerateEnemy.apply(this,arguments);if(this._shadowGroupV3)this._decorateEntityV3(e,'enemy');return e;};
    proto.generateDragon=function(){var e=originalGenerateDragon.apply(this,arguments);if(this._shadowGroupV3)this._decorateEntityV3(e,'boss');return e;};
    proto.generateChest=function(){var e=originalGenerateChest.apply(this,arguments);if(this._shadowGroupV3)this._decorateEntityV3(e,'chest');return e;};
    proto.generateGold=function(){var e=originalGenerateGold.apply(this,arguments);if(this._shadowGroupV3)this._decorateEntityV3(e,'gold');return e;};
    proto.generateHealthPotion=function(){var e=originalHealthPotion.apply(this,arguments);if(this._shadowGroupV3)this._decorateEntityV3(e,'potion');return e;};
    proto.generateVitalityPotion=function(){var e=originalVitalityPotion.apply(this,arguments);if(this._shadowGroupV3)this._decorateEntityV3(e,'potion');return e;};
    proto.generateStrengthPotion=function(){var e=originalStrengthPotion.apply(this,arguments);if(this._shadowGroupV3)this._decorateEntityV3(e,'potion');return e;};
    proto.generateSpeedPotion=function(){var e=originalSpeedPotion.apply(this,arguments);if(this._shadowGroupV3)this._decorateEntityV3(e,'potion');return e;};

    proto.create=function(){originalCreate.call(this);this.game.stage.backgroundColor='#081015';if(this.game.renderer&&this.game.renderer.renderSession)this.game.renderer.renderSession.roundPixels=false;this._buildVisualLayerV3();};
    proto.update=function(){originalUpdate.call(this);this._updateVisualLayerV3();};
    injectCanvasStyle();
})();

Theodoric.game = new Phaser.Game(768, 768, Phaser.AUTO, 'game-shell', null, false, true);
Theodoric.game.state.add('Boot', Theodoric.Boot);
Theodoric.game.state.add('Preloader', Theodoric.Preloader);
Theodoric.game.state.add('MainMenu', Theodoric.MainMenu);
Theodoric.game.state.add('Game', Theodoric.Game);
Theodoric.game.state.start('Boot');
