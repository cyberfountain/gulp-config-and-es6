import { func1, func2 } from "./Modules/Shake"
import Unshakable from "./Modules/Unshakable"

const un = new Unshakable();
un.method1();

func1();
func2();

(async () => {
    const m = await import("./Modules/Dog")
        .then(m => m.default)

    const dog = new m()
    dog.bark()
})()

console.log("ts")
