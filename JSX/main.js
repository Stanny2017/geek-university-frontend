
import { createElement, Component } from './framework';
import './carousel.css';

class Carousel extends Component {
    constructor() {
        super();
        // 创建一个空对象
        this.attributes = Object.create(null);
        this.root = null;
    }

    setAttribute(name, value) {
        this.attributes[name] = value;
    }

    mountTo(parent) {
        parent.appendChild(this.render())
    }

    animates() {
        let wrapper = this.root;
        let children = wrapper.children;

        // let currentIndex = 0;
        // setInterval(() => {
        //     let nextIndex = (currentIndex + 1) % children.length;
        //     let current = children[currentIndex];
        //     let next = children[nextIndex];

        //     // 每次只管当前和后一张图片的位置
        //     // 先把后一张挪过来
        //     next.style.transition = 'none';
        //     next.style.transform = `translateX( ${-100 * nextIndex + 100}%)`;

        //     setTimeout(() => {
        //         next.style.transition = '';// 自动 css 样式
        //         current.style.transform = `translateX( ${-100 * (currentIndex + 1)}%)`;
        //         next.style.transform = `translateX( ${-100 * (nextIndex)}%)`;

        //         currentIndex = nextIndex;
        //     }, 0)
        // }, 2000)


        let startX;
        let position = 0;
        let moveX = 0;

        let current, prev, next;
        let currIdx = 0, prevIdx, nextIdx;

        let imgWidth = 1130;


        let getRightIdx = (idx, len) => {
            return (idx + len) % len;
        }

        let move = event => {
            moveX = event.clientX - startX;

            current.style.transition = 'none';
            prev.style.transition = 'none';
            next.style.transition = 'none';

            prev.style.transform = `translateX(${(-1 * prevIdx - 1) * imgWidth + (moveX)}px)`;
            current.style.transform = `translateX(${(-1 * currIdx) * imgWidth + (moveX)}px)`;
            next.style.transform = `translateX(${(-1 * nextIdx + 1) * imgWidth + (moveX)}px)`;
        }

        wrapper.addEventListener('mousedown', event => {
            startX = event.clientX;

            currIdx = getRightIdx(currIdx, children.length);
            prevIdx = getRightIdx(currIdx - 1, children.length);
            nextIdx = getRightIdx(currIdx + 1, children.length);

            console.log(`prevIdx ${prevIdx} currIdx ${currIdx} nextIdx ${nextIdx}`)

            current = children[currIdx];
            prev = children[prevIdx];
            next = children[nextIdx];

            // current 的位置总是对的，只需要调整 prev 和 next
            prev.style.transition = 'none';
            prev.style.transform = `translateX(${(-1 * prevIdx - 1) * imgWidth}px)`

            current.style.transition = 'none';
            current.style.transform = `translateX(${(-1 * currIdx) * imgWidth}px)`

            next.style.transition = 'none';
            next.style.transform = `translateX(${(-1 * nextIdx + 1) * imgWidth}px)`

            document.addEventListener('mousemove', move)
        })

        document.addEventListener('mouseup', event => {
            position = Math.round((moveX / imgWidth)) * imgWidth;

            current.style.transition = '';
            prev.style.transition = '';
            next.style.transition = '';

            prev.style.transform = `translateX(${(-1 * prevIdx - 1) * imgWidth + position}px)`;
            current.style.transform = `translateX(${(-1 * currIdx) * imgWidth + position}px)`;
            next.style.transform = `translateX(${(-1 * nextIdx + 1) * imgWidth + position}px)`;

            let t = Math.round(moveX / imgWidth);
            if (t > 0) {
                currIdx--;
            } else if (t < 0) {
                currIdx++;
            }

            console.log('currIdx', currIdx)
            document.removeEventListener('mousemove', move)
        })
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.classList.add('carousel');

        const imgs = this.attributes['src'];
        for (let imgSrc of imgs) {
            // img 可拖拽，不建议直接用 img 元素

            let child = document.createElement('div');
            child.style.backgroundImage = `url(${imgSrc})`;
            wrapper.append(child);
        }

        this.root = wrapper;
        this.animates(wrapper)

        return this.root;
    }
}

const data = [
    'https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg',
    'https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg',
    'https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg',
    'https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg',
]

let a = <Carousel src={data} />



// document.body.appendChild(a)
a.mountTo(document.body);
