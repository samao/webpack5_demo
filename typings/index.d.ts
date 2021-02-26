/*
 * Copyright (c) QieTv, Inc. 2018 
 * @Author: idzeir 
 * @Date: 2021-02-25 17:44:43 
 * @Last Modified by: idzeir
 * @Last Modified time: 2021-02-26 09:58:14
 */
declare module "babel-polyfill";

declare module "*.sass" {
    const css: {
        [index: string]: string;
    };
    export default css;
}

declare module "*.scss" {
    const css: {
        [index: string]: string;
    };
    export default css;
}
