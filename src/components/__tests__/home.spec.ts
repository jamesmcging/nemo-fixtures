import { describe, it, expect } from "vitest";

import { mount } from "@vue/test-utils";
import homePage from "../home.vue";

describe("Home", () => {
  it("renders properly", () => {
    const wrapper = mount(homePage);
    console.log(wrapper);
    expect(wrapper.text()).toContain("Home");
  });
});
