/*
 * Copyright (c) QieTv, Inc. 2018
 * @Author: idzeir
 * @Date: 2021-02-07 11:27:19
 * @Last Modified by: idzeir
 * @Last Modified time: 2021-02-26 09:57:57
 */
import User from "./User";
import "./render";

import './style.scss'
import css from './index.module.scss'


function component() {
    const element = document.createElement("div");
    const button = document.createElement("button");
    const br = document.createElement("br");

    button.innerHTML = "Click me and look at the console";
    element.innerHTML = "Hello webpack";

    element.appendChild(br);
    element.appendChild(button);

    button.classList.add(css.btnGreen)

    button.onclick = (e) =>
        import(
            /* webpackChunkName: "print" */
            /* webpackMode: "lazy" */
            /* webpackPrefetch: true */
            /* webpackPreload: true */
            "./print"
        ).then((module) => {
            module.default();

            import(/* webpackChunkName: "runtime" */ "babel-polyfill").then(
                () => {
                    new User("三炸弹", 199).sayHi();
                }
            );
        });

    return element;
}

declare namespace module {
    const hot: {
        accept(url: string, cb: () => void): void
    }
}

if (module.hot) {
    module.hot.accept('./user', () => {
        new User('二小子', 89).sayHi()
    })
}

document.body.appendChild(component());
