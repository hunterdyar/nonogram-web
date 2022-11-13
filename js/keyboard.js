class Keyboard {
    flipButton;
    upButton;
    downButton;
    leftButton;
    rightButton;
    allButtons ;
    constructor() {
        this.flipButton = new ButtonState("Space","Enter");
        this.upButton = new ButtonState("KeyW","ArrowUp");
        this.downButton = new ButtonState("KeyS","ArrowDown");
        this.leftButton = new ButtonState("KeyA","ArrowLeft");
        this.rightButton = new ButtonState("KeyD","ArrowRight");
        this.allButtons = [this.flipButton,this.downButton,this.upButton,this.leftButton,this.rightButton]
    }

    tick() {
        this.flipButton.tick();
        this.upButton.tick();
        this.downButton.tick();
        this.leftButton.tick();
        this.rightButton.tick();
    }
    anyKeyDown()
    {
        return this.flipButton.isDown || this.upButton.isDown || this.downButton.isDown || this.leftButton.isDown || this.rightButton.isDown;
    }
}

class ButtonState
{
    keyCode;
    altCode;
    constructor(keycode,altcode) {
        this.keyCode = keycode;
        this.altCode = altcode;
    }
    prevDown = false;//internally used
    isDown = false;
    isPressed = false;
    isReleased = false;
    rebind(keycode)
    {
        this.keyCode = keycode;
    }
    //das
    tick()
    {
        if(this.isDown && !this.prevDown)
        {
            this.isPressed = true;
        }else{
            this.isPressed = false;
        }

        if(!this.isDown && this.prevDown)
        {
            this.isReleased = true;
        }else{
            this.isReleased = false;
        }

        this.prevDown = this.isDown;
    }
}

const keyboard = new Keyboard();
window.addEventListener(
        "keydown", (event) => {
            console.log(event.code);
            keyboard.allButtons.forEach(function(b){
                if(b.keyCode === event.code || b.altCode === event.code)
                {
                    b.isDown = true;
                }
            });
        }, false
    );

window.addEventListener(
        "keyup", (event) => {
            keyboard.allButtons.forEach(function(b){
                if(b.keyCode === event.code || b.altCode === event.code)
                {
                    b.isDown = false;
                }
            });
        }, false
    );

export {keyboard};