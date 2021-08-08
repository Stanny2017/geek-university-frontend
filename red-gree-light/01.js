// 绿灯 10s 黄灯 2s 红灯 5s 无线循环


function sleep(time) {
    return new Promise(resolve => {
        setTimeout(resolve, time)
    })
}

class Light {
    constructor() {
        this._color = ''
    }

    set color(newColor) {
        this._color = newColor
        console.log('color changed: ' + newColor)

        this.updateDOM(newColor)
    }

    updateDOM(newColor) {
        // set color 的时候， remove 对应的 gray  为其他灯增加gray
        const lights = document.getElementsByClassName('light')
        for (let i = 0; i < lights.length; i++) {
            if (lights[i].classList.contains(newColor)) {
                lights[i].classList.remove('gray')
            } else {
                lights[i].classList.add('gray')
            }
        }
    }

    start() {
        this.green()
    }

    async green() {
        this.color = 'green'

        await sleep(10 * 1000)
        this.yellow();
    }

    async yellow() {
        this.color = 'yellow'
        await sleep(2 * 1000)
        this.red();
    }

    async red() {
        this.color = 'red'
        await sleep(5 * 1000)
        this.green();
    }
}

new Light().start()


