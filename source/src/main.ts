import "x_ite";
import "./style.css";

const viewer = document.querySelector("x3d-canvas");

if (!viewer) {
  throw new Error("The X_ITE viewer element is missing from the page.");
}
