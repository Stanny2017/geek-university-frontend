// 0 -> 空
// 1 -> ○
// 2 -> × 

let data = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
]

let flag = 1

let rootDom = document.getElementsByClassName('root')[0]

function getFlag(t) {
    if (t == 0) return ''
    if (t == 1) return '○'
    if (t == 2) return '×'
}

function show() {
    rootDom.innerHTML = ''

    for (let i = 0; i < data.length; i++) {

        for (let j = 0; j < data[i].length; j++) {
            let divTag = document.createElement('div')
            divTag.className = 'cell'
            divTag.innerText = getFlag(data[i][j])
            divTag.addEventListener('click', () => move(i, j))
            rootDom.appendChild(divTag)

            if (j === data[i].length - 1) {
                rootDom.appendChild(document.createElement('br'))
            }
        }
    }
}

function clone(d) {
    return JSON.parse(JSON.stringify(d))
}

function willWin(row, col) {
    const cloneData = clone(data)
    const nextFlag = 3 - flag;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (cloneData[i][j] == 0) {
                cloneData[i][j] = nextFlag;
                if (check(i, j, cloneData, nextFlag)) {
                    return true
                } else {
                    cloneData[i][j] = 0;
                }
            }
        }
    }

    return false

}

function check(row, col, pattern = data, color = flag) {
    // loop data
    // row
    {
        let win = true
        const currentRow = pattern[row]
        for (let d of currentRow) {
            if (d == 0) {
                win = false
                break
            }
            if (d !== color) {
                win = false
            }
        }

        if (win) return win
    }

    // column
    {
        let win = true

        for (let i = 0; i < pattern.length; i++) {
            if (pattern[i][col] == 0) {
                win = false
                break
            }
            if (pattern[i][col] !== color) {

                win = false
            }
        }

        if (win) return win
    }

    // angles
    {
        let win = true
        if (row == col) {
            for (let i = 0; i < pattern.length; i++) {
                if (pattern[i][i] == 0) {
                    win = false
                    break
                }
                if (pattern[i][i] !== color) {
                    win = false
                }
            }
        } else {
            win = false
        }
        if (win) return win
    }

    {
        let win = true
        if (row + col == pattern.length - 1) {
            for (let i = 0; i < pattern.length; i++) {
                if (pattern[i][pattern.length - 1 - i] == 0) {
                    win = false
                    break
                }
                if (pattern[i][pattern.length - 1 - i] !== color) {
                    win = false
                }
            }
        } else {
            win = false
        }
        if (win) return win
    }

    return false
}

function move(i, j) {
    if (data[i][j] !== 0) return
    flag = 3 - flag;
    data[i][j] = flag;

    show()

    if (check(i, j)) {
        alert(`${getFlag(flag)} wins!`)
    }

    if (willWin(i, j)) {
        console.log(`${getFlag(3 - flag)} will wins!`)
    }
}

show();