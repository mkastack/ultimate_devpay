import { createServerFn } from "@tanstack/react-start";

const fn = createServerFn({ method: "POST" });
console.log("fn keys:");
for (let key in fn) {
  console.log(`  ${key}: ${typeof fn[key]}`);
}
console.log("fn own properties:", Object.getOwnPropertyNames(fn));
console.log("fn prototype properties:", Object.getOwnPropertyNames(Object.getPrototypeOf(fn)));
