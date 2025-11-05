import { assertEquals } from "@std/assert";
import { helloWorld } from "./main.ts";

Deno.test(function addTest() {
  assertEquals(helloWorld(), "Hello, random art!");
});
