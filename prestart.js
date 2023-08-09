sc.DungeonKeyHud = ig.GuiElementBase.extend({
    gfx: new ig.Image("media/gui/el-key-display.png"),
    ninepatch: new ig.NinePatch("media/gui/el-key-display.png",{
        width: 0,
        height: 0,
        left: 28,
        top: 11,
        right: 0,
        bottom: 0,
        offsets: {
            "cold-dng": {
                x: 0,
                y: 0
            },
            "heat-dng": {
                x: 0,
                y: 12
            },
            "shock-dng": {
                x: 0,
                y: 24
            },
            "wave-dng": {
                x: 0,
                y: 36
            },
            "tree-dng": {
                x: 0,
                y: 48
            },
            "final-dng": {
                x: 0,
                y: 60
            },
        }
    }),
    transitions: {
        DEFAULT: {
            state: {},
            time: 0,
            timeFunction: KEY_SPLINES.LINEAR
        },
        HIDDEN: {
            state: {
                alpha: 0,
                scaleY: 0
            },
            time: 0,
            timeFunction: KEY_SPLINES.LINEAR
        }
    },
    numberGui: null,
    hasMaster: false,

    init(area) {
        this.parent();
        this.numberGui = new sc.NumberGui(9, {});
        this.numberGui.setNumber(0);
        this.numberGui.setPos(11, 2);
        this.addChildGui(this.numberGui);
        //this.doStateTransition("HIDDEN");
        this.setSize(28, 11);
        sc.Model.addObserver(sc.model.player, this);
        sc.Model.addObserver(sc.model, this);
        this.hook.localAlpha = 0.8;
        
        this.area = area;
    },
    updateDrawables(renderer) {
        this.ninepatch.draw(renderer, this.hook.size.x, this.hook.size.y, this.area)
        renderer.addGfx(this.gfx, 1, 0, 28, this.hasMaster ? 12 : 0, 8, 11);
    },
    modelChanged(model, message) {
        if(model == sc.model.player) {
            if(message == sc.PLAYER_MSG.ITEM_OBTAINED || message == sc.PLAYER_MSG.ITEM_REMOVED) {
                this.updateItemCount();
            }
        } else if(model == sc.model) {
            this.updateVisibility();
        }
    },
    updateVisibility() {
        if(!sc.map.currentArea) return;
        this.numberGui.setColor(sc.map.currentArea.path == this.area ? sc.GUI_NUMBER_COLOR.WHITE : sc.GUI_NUMBER_COLOR.GREY)
        this.updateItemCount();
    },
    updateItemCount() {
        let area = sc.map.areas[this.area];
        let keyCount = sc.model.player.getItemAmount(area.keyItem);
        this.hasMaster = sc.model.player.getItemAmount(area.masterKeyItem) > 0;

        this.numberGui.setNumber(keyCount + (this.hasMaster ? 1 : 0));
    }
})

sc.StatusHudGui.inject({
    init() {
        this.parent();
        this.removeChildGui(this.keyHud);
        this.dungeonKeyBase = new ig.GuiElementBase;
        this.dungeonKeyBase.setPos(this.keyHud.hook.pos.x, this.keyHud.hook.pos.y)
        this.addChildGui(this.dungeonKeyBase);
        let offset = 0;
        for(let dungeon of ["cold-dng", "heat-dng", "shock-dng", "wave-dng", "tree-dng", "final-dng"]) {
            let gui = new sc.DungeonKeyHud(dungeon);
            gui.setPos(0, offset);
            offset += gui.hook.size.y + 1;    
            this.dungeonKeyBase.addChildGui(gui);
        }

        this.keyHud.doPosTranstition = this._doDungeonKeyHudTransition.bind(this);
    },

    _doDungeonKeyHudTransition(x, y, time, keySpline) {
        this.dungeonKeyBase.doPosTranstition(x, y, time, keySpline)

        this.partyGui.hook.posTransition.x += this.dungeonKeyBase.hook.size.x - 4;
    },
})