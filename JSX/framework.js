export {
    createElement,
    Component
}

function createElement(type, attributes, ...children) {
    let element;
    if (typeof type === 'string') {
        element = new ElementWrapper(type);
    } else {
        element = new type;
    }

    if (attributes !== null) {
        for (let k in attributes) {
            element.setAttribute(k, attributes[k]);
        }
    }

    for (let i = 0; i < children.length; i++) {
        let child = children[i];
        if (typeof child === 'string') {
            child = new TextNodeWrapper(child);
        }
        element.appendChild(child);
    }

    return element;
}


class Component {
    constructor() {
    }

    mountTo(parent) {
        parent.appendChild(this.root);
    }

    setAttribute(name, value) {
        this.root.setAttribute(name, value);
    }

    appendChild(child) {
        child.mountTo(this.root);
    }
}

class ElementWrapper extends Component {
    constructor(type) {
        super();
        this.root = document.createElement(type);
    }
}

class TextNodeWrapper extends Component {
    constructor(text) {
        super();
        this.root = document.createTextNode(text);
    }
}
