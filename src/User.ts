/*
 * Copyright (c) QieTv, Inc. 2018 
 * @Author: idzeir 
 * @Date: 2021-02-07 14:42:16 
 * @Last Modified by: idzeir
 * @Last Modified time: 2021-02-25 10:35:32
 */
interface IUser {
    name: string;
    age: number
}

export default class User implements IUser {
    constructor(public readonly name = '王二小', public readonly age = 1) {}

    sayHi() {
        console.log(`NAME: ${this.name}, AGE is: ${this.age}`)
    }
}