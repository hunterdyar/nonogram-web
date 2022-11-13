class Keyboard {
    flipButton;
    upButton;
    downButton;
    leftButton;
    rightButton;
    allButtons ;
    constructor() {
        this.flipButton = new ButtonState("Space");
        this.upButton = new ButtonState("KeyW");
        this.downButton = new ButtonState("KeyS");
        this.leftButton = new ButtonState("KeyA");
        this.rightButton = new ButtonState("KeyD");
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
    constructor(keycode) {
        this.keyCode = keycode;
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
            keyboard.allButtons.forEach(function(b){
                if(b.keyCode === event.code)
                {
                    b.isDown = true;
                }
            });
        }, false
    );

window.addEventListener(
        "keyup", (event) => {
            keyboard.allButtons.forEach(function(b){
                if(b.keyCode === event.code)
                {
                    b.isDown = false;
                }
            });
        }, false
    );

export {keyboard};