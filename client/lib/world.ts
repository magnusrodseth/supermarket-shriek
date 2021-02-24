import { CustomElement } from "../../types";

export default class World {
  private element: Element;

  constructor(rootElement: Element) {
    this.element = rootElement;
  }

  get walls() {
    return this.element.querySelector("#walls");
  }

  get goal() {
    return this.element.querySelector("#goal");
  }

  get opponents() {
    return this.element.querySelector("#opponents");
  }

  obstacles() {
    return this.walls.children;
  }

  drawWalls(nodes: CustomElement[]) {
    if (this.walls.children.length === 0) {
      createSvgNodes(nodes).forEach((svgEl) => {
        this.walls.appendChild(svgEl);
      });
    }
  }

  drawGoal(nodes: CustomElement[]) {
    if (this.goal.children.length === 0) {
      createSvgNodes(nodes).forEach((svgEl) => {
        this.goal.appendChild(svgEl);
      });
    }
  }

  updateOpponents(nodes: CustomElement[]) {
    nodes.forEach(this.createOrUpdateNode);
  }

  removeOpponents(playerId: string) {
    const svgEl = this.opponents.querySelector(`#player-${playerId}`);
    if (svgEl) {
      svgEl.remove();
    }
  }

  private createOrUpdateNode = (node: CustomElement) => {
    const existingOpponent = Array.from(this.opponents.children).find((el) => {
      return el.id == getAttribute(node, "id");
    });

    if (!existingOpponent) {
      const svgEl = createNode(node);
      this.opponents.appendChild(svgEl);
    } else {
      existingOpponent.setAttribute(
        "transform",
        getAttribute(node, "transform")
      );
    }
  };
}

function getAttribute(node: CustomElement, name) {
  for (let attr of node.attributes) {
    if (attr.name === name) return attr.value;
  }
  return undefined;
}

function createSvgNodes(nodes: CustomElement[]) {
  return nodes.map(createNode);
}

function createNode(node: CustomElement) {
  const svgEl = document.createElementNS(
    "http://www.w3.org/2000/svg",
    node.nodeName
  );
  Array.from(node.attributes).forEach((a) => {
    svgEl.setAttribute(a.name, a.value);
  });

  return svgEl;
}
