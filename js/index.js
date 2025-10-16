"use strict";

import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

const CLASS_NAME = "RunJS";
const DEFAULT_MARGIN_X = 32;
const DEFAULT_MARGIN_Y = 64;

function getRunNodes(type) {
  return app.graph._nodes.filter(e => e.comfyClass === CLASS_NAME && 
    e.widgets?.find(e => e.name === "event")?.value === type);
}

function execNodes(type, args) {
  const nodes = getRunNodes(type)
    .filter((node) => node.mode === 0);

  for (const node of nodes) {
    execNode(node, args);
  }
}

function execNode(node, args) {
  try {
    if (!node.STATE) {
      node.STATE = {};
    }
    if (!node.properties) {
      node.properties = {};
    }
    if (!node.properties.PROPS) {
      node.properties.PROPS = {};
    }
    if (!node.PROPS) {
      node.PROPS = node.properties.PROPS;
    }

    const SELF = node;
    const COMMAND = node.widgets?.find(e => e.name === "text")?.value;
    const STATE = node.STATE;
    const PROPS = node.PROPS;
    const NODES = app.graph._nodes;
    const GROUPS = app.graph._groups;
    const LINKS = app.graph._links;
    const ARGS = args ?? [];

    const DATE = new Date();
    const YYYY = ("" + DATE.getFullYear());
    const MM = ("" + (DATE.getMonth() + 1)).padStart(2, "0");
    const DD = ("" + DATE.getDate()).padStart(2, "0");;
    const hh = ("" + DATE.getHours()).padStart(2, "0");
    const mm = ("" + DATE.getMinutes()).padStart(2, "0");
    const ss = ("" + DATE.getSeconds()).padStart(2, "0");

    const BATCH_COUNT = getBatchCount();
    const QUEUE_MODE = getQueueMode();
    const AUTO_QUEUE = getQueueMode() !== "disabled";

    const create = (className, values, options) => createComfyNode.apply(node, [className, values, options]);

    try {
      eval(COMMAND);
    } catch(err) {
      console.error(err);
      showError(`#${node.id}: ${err.message}`);
    }
  } catch(err) {
    console.error(err);
  }
}

function run(...nodes) {
  nodes = nodes.map(Node);
  for (const node of nodes) {
    node.run();
  }
}

function getQueueMode() {
  return app.extensionManager.queueSettings.mode;
}

function setQueueMode(v) {
  if (["disabled","instant","change"].indexOf(v) === -1) {
    throw new Error(`Queue mode must be "disabled", "instant" or "change"`);
  }
  app.extensionManager.queueSettings.mode = v;
}

function getBatchCount() {
  return app.extensionManager.queueSettings.batchCount;
}

function setBatchCount(v) {
  app.extensionManager.queueSettings.batchCount = v;
}

const createComfyNode = function(className, values, options) {
  values = values ?? {};
  options = { select: true, shiftY: 0, before: false, ...(options || {}) };
  const node = LiteGraph.createNode(className);
  if (!node) {
    throw new Error(`${className} not found.`);
  }

  if (node.widgets) {
    for (const [key, value] of Object.entries(values)) {
      const widget = node.widgets.find(e => e.name === key);
      if (widget) {
        widget.value = value;
      }
    }
  }

  app.graph.add(node);

  if (options.select) {
    app.canvas.selectNode(node, false);
  }

  putOnRight(node, this);
  moveToBottom(node);

  return node;
}

// methods

function wait(delay) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, delay);
  });
}

function showInfo(message = "", life = 5000) {
  app.extensionManager.toast.add({
    severity: "info",
    summary: "Information",
    detail: message,
    life,
  });
}

function showSuccess(message = "", life = 5000) {
  app.extensionManager.toast.add({
    severity: "success",
    summary: "Success",
    detail: message,
    life,
  });
}

function showWarn(message = "", life = 5000) {
  app.extensionManager.toast.add({
    severity: "warn",
    summary: "Warning",
    detail: message,
    life,
  });
}

function showError(message = "", life = 5000) {
  app.extensionManager.toast.add({
    severity: "error",
    summary: "Error",
    detail: message,
    life,
  });
}

const queryNode = function(node, query) {
  if (typeof query === "number") {
    return node.id === query;
  }
  if (typeof query === "string") {
    return node.title === query || node.comfyClass === query || node.type === query;
  }
  if (typeof query === "object") {
    return node.id === query.id;
  }
  return false;
}

const queryGroup = function(group, query) {
  // if (typeof query === "number") {
  //   return group.id === query;
  // }
  if (typeof query === "string") {
    return group.title === query;
  }
  if (typeof query === "object") {
    return group.id === query.id;
  }
  return false;
}

const $ = function(...args) {
  const groups = [], nodes = [];
  for (const arg of args) {
    if (arg instanceof LGraphGroup) {
      arg.recomputeInsideNodes();
      groups.push(arg);
      continue;
    }

    const node = Node(arg);
    if (node) {
      nodes.push(node);
      continue;
    }

    const group = Group(arg);
    if (group) {
      groups.push(group);
    }
  }
  return [nodes, groups];
}

const Node = function(query, reverse) {
  if (!reverse) {
    for (let i = 0; i < app.graph._nodes.length; i++) {
      const n = app.graph._nodes[i];
      if (queryNode(n, query)) {
        return n;
      }
    }
  } else {
    for (let i = app.graph._nodes.length - 1; i >= 0; i--) {
      const n = app.graph._nodes[i];
      if (queryNode(n, query)) {
        return n;
      }
    }
  }
}

const Nodes = function(query, reverse) {
  const result = [];
  if (!reverse) {
    for (let i = 0; i < app.graph._nodes.length; i++) {
      const n = app.graph._nodes[i];
      if (queryNode(n, query)) {
        result.push(n);
      }
    }
  } else {
    for (let i = app.graph._nodes.length - 1; i >= 0; i--) {
      const n = app.graph._nodes[i];
      if (queryNode(n, query)) {
        result.push(n);
      }
    }
  }
  return result;
}

const Group = function(query, reverse) {
  if (!reverse) {
    for (let i = 0; i < app.graph._groups.length; i++) {
      const g = app.graph._groups[i];
      if (queryGroup(g, query)) {
        g.recomputeInsideNodes();
        return g;
      }
    }
  } else {
    for (let i = app.graph._groups.length - 1; i >= 0; i--) {
      const g = app.graph._groups[i];
      if (queryGroup(g, query)) {
        g.recomputeInsideNodes();
        return g;
      }
    }
  }
}

const Groups = function(query, reverse) {
  const result = [];
  if (!reverse) {
    for (let i = 0; i < app.graph._groups.length; i++) {
      const g = app.graph._groups[i];
      if (queryGroup(g, query)) {
        g.recomputeInsideNodes();
        result.push(g);
      }
    }
  } else {
    for (let i = app.graph._groups.length - 1; i >= 0; i--) {
      const g = app.graph._groups[i];
      if (queryGroup(g, query)) {
        g.recomputeInsideNodes();
        result.push(g);
      }
    }
  }
  return result;
}

const getValues = function(node) {
  node = Node(node);
  let result = {};
  if (node.widgets) {
    for (const widget of node.widgets) {
      result[widget.name] = widget.value;
    }
  }
  return result;
}

const getValue = getValues;

const setValues = function(node, values) {
  node = Node(node);
  if (node.widgets) {
    for (const [key, value] of Object.entries(values)) {
      const widget = node.widgets.find(e => e.name === key);
      if (widget) {
        widget.value = value;
        node.setDirtyCanvas(true, true);
      }
    }
  }
}

const setValue = setValues;

const connect = function(outputNode, inputNode, outputName, inputName) {
  outputNode = Node(outputNode);
  inputNode = Node(inputNode);

  if (!outputName) {
    if (outputNode.outputs.length === 1) {
      outputName = outputNode.outputs[0].name;
    } else {
      for (const output of outputNode.outputs) {
        const outputType = output.type;
        for (const input of inputNode.inputs) {
          const inputType = input.type;
          if (outputType === inputType) {
            outputName = output.name;
            inputName = input.name;
            break;
          }
        }
      }
    }
  }

  if (!inputName) {
    inputName = outputName;
  }

  let output = outputName ? outputNode.outputs?.find(e => e.name === outputName) : null;
  let outputSlot;
  let input = inputName ? inputNode.inputs?.find(e => e.name === inputName) : null;
  let inputSlot;

  if (output) {
    outputSlot = outputNode.findOutputSlot(output.name);
    if (!input) {
      input = inputNode.inputs?.find(e => e.type === output.type);
      if (input) {
        inputSlot = inputNode.findInputSlot(input.name);
      }
    }
  }

  if (input) {
    inputSlot = inputNode.findInputSlot(input.name);
    if (!output) {
      output = outputNode.outputs?.find(e => e.type === input.type);
      if (output) {
        outputSlot = outputNode.findOutputSlot(output.name);
      }
    }
  }

  if (typeof inputSlot === "number" && typeof outputSlot === "number") {
    outputNode.connect(outputSlot, inputNode.id, inputSlot);
  }
}

const generateSeed = function() {
  const MIN_SEED = 0;
  const MAX_SEED = parseInt("0xffffffffffffffff", 16);
  const STEPS_OF_SEED = 10;
  let max = Math.min(1125899906842624, MAX_SEED);
  let min = Math.max(-1125899906842624, MIN_SEED);
  let range = (max - min) / (STEPS_OF_SEED / 10);
  return Math.floor(Math.random() * range) * (STEPS_OF_SEED / 10) + min;
}

const generateFloat = function(min, max) {
  if (typeof min !== "number") {
    min = Number.MIN_SAFE_INTEGER;
  }
  if (typeof max !== "number") {
    max = Number.MAX_SAFE_INTEGER;
  }
  return Math.random() * (max - min) + min;
}

const generateInt = function(min, max) {
  return Math.floor(generateFloat(min, max));
}

const generatePlots = function(...args) {
  // remove empty arrays
  args = args.filter((arg) => arg.length !== 0);

  const result = [],
    indexes = Array(args.length).fill(0);

  let isFinished = args.length === 0;

  const increase = function () {
    for (let i = args.length - 1; i >= 0; i--) {
      // decrease current index
      if (indexes[i] < args[i].length - 1) {
        indexes[i] += 1;
        return;
      }
      // reset current index
      indexes[i] = 0;
    }
    isFinished = true;
  };

  const getValues = function () {
    const result = [];
    for (let i = 0; i < args.length; i++) {
      result.push(args[i][indexes[i]]);
    }
    return result;
  };

  while (!isFinished) {
    result.push(getValues());
    increase();
  }

  return result;
}

const random = function(...args) {
  return args[generateInt(0, args.length)];
}

const bypass = function(...args) {
  const [nodes, groups] = $(...args);
  for (const node of nodes) {
    node.mode = 4;
  }

  for (const group of groups) {
    for (const node of group.nodes) {
      node.mode = 4;
    }
  }
}

const unbypass = function(...args) {
  const [nodes, groups] = $(...args);
  for (const node of nodes) {
    node.mode = 0;
  }
  for (const group of groups) {
    for (const node of group.nodes) {
      node.mode = 0;
    }
  }
}

const pin = function(...args) {
  const [nodes, groups] = $(...args);
  for (const node of nodes) {
    node.pin(true);
  }
  for (const group of groups) {
    for (const node of group.nodes) {
      node.pin(true);
    }
  }
}

const unpin = function(...args) {
  const [nodes, groups] = $(...args);
  for (const node of nodes) {
    node.pin(false);
  }
  for (const group of groups) {
    for (const node of group.nodes) {
      node.pin(false);
    }
  }
}

const remove = function(...args) {
  const [nodes, groups] = $(...args);
  for (const node of nodes) {
    app.graph.remove(node);    
  }
  for (const group of groups) {
    group.recomputeInsideNodes();
    app.graph.remove(group);
  }
}

const select = function(...args) {
  const [nodes, groups] = $(...args);
  for (const group of groups) {
    for (const node of group.nodes) {
      nodes.push(node);
    }
  }
  app.canvas.deselectAllNodes();
  app.canvas.selectNodes(nodes);
}

const getQueue = async function() {
  const res = await api.getQueue();
  return res.Running.length + res.Pending.length;
}

const generate = async function() {
  await app.queuePrompt(0, getBatchCount());
}

const cancel = async function() {
  await api.interrupt();
}

const putOnLeft = function(targetNode, anchorNode) {
  targetNode = Node(targetNode);
  anchorNode = Node(anchorNode);
  targetNode.pos[0] = anchorNode.pos[0] - targetNode.size[0] - DEFAULT_MARGIN_X;
  targetNode.pos[1] = anchorNode.pos[1];
}

const putOnRight = function(targetNode, anchorNode) {
  targetNode = Node(targetNode);
  anchorNode = Node(anchorNode);
  targetNode.pos[0] = anchorNode.pos[0] + anchorNode.size[0] + DEFAULT_MARGIN_X;
  targetNode.pos[1] = anchorNode.pos[1];
}

const putOnTop = function(targetNode, anchorNode) {
  targetNode = Node(targetNode);
  anchorNode = Node(anchorNode);
  targetNode.pos[0] = anchorNode.pos[0];
  targetNode.pos[1] = anchorNode.pos[1] - targetNode.size[1] - DEFAULT_MARGIN_Y;
}

const putOnBottom = function(targetNode, anchorNode) {
  targetNode = Node(targetNode);
  anchorNode = Node(anchorNode);
  targetNode.pos[0] = anchorNode.pos[0];
  targetNode.pos[1] = anchorNode.pos[1] + anchorNode.size[1] + DEFAULT_MARGIN_Y;
}

const moveToRight = function(targetNode) {
  targetNode = Node(targetNode);
  let isChanged = true;
  while(isChanged) {
    isChanged = false;
    for (const node of app.graph._nodes) {
      if (node.id === targetNode.id) {
        continue;
      }
      const top = node.pos[1];
      const bottom = node.pos[1] + node.size[1];
      const left = node.pos[0];
      const right = node.pos[0] + node.size[0];
      const isCollisionX = left <= node.pos[0] + targetNode.size[0] && 
        right >= targetNode.pos[0];
      const isCollisionY = top <= node.pos[1] + targetNode.size[1] && 
        bottom >= targetNode.pos[1];

      if (isCollisionX && isCollisionY) {
        targetNode.pos[0] = right + DEFAULT_MARGIN_X;
        isChanged = true;
      }
    }
  }
}

const moveToBottom = function(targetNode) {
  targetNode = Node(targetNode);
  let isChanged = true;
  while(isChanged) {
    isChanged = false;
    for (const node of app.graph._nodes) {
      if (node.id === targetNode.id) {
        continue;
      }
      const top = node.pos[1];
      const bottom = node.pos[1] + node.size[1];
      const left = node.pos[0];
      const right = node.pos[0] + node.size[0];
      const isCollisionX = left <= targetNode.pos[0] + targetNode.size[0] && 
        right >= targetNode.pos[0];
      const isCollisionY = top <= targetNode.pos[1] + targetNode.size[1] && 
        bottom >= targetNode.pos[1];

      if (isCollisionX && isCollisionY) {
        targetNode.pos[1] = bottom + DEFAULT_MARGIN_Y;
        isChanged = true;
      }
    }
  }
}

const getX = function(node) {
  return Node(node).pos[0];
}

const getY = function(node) {
  return Node(node).pos[1];
}

const getWidth = function(node) {
  return Node(node).size[0];
}

const getHeight = function(node) {
  return Node(node).size[1];
}

const getRect = function(node) {
  node = Node(node);
  return [
    node.pos[0],
    node.pos[1],
    node.size[0],
    node.size[1],
  ];
} 

const setX = function(node, n) {
  node = Node(node);
  node.pos[0] = n;
}

const setY = function(node, n) {
  node = Node(node);
  node.pos[1] = n;
}

const setWidth = function(node, w) {
  node = Node(node);
  node.size[0] = w;
  node.onResize(node.size);
}

const setHeight = function(node, h) {
  node = Node(node);
  node.size[1] = h;
  node.onResize(node.size);
}

const setRect = function(node, [x, y, width, height]) {
  node = Node(node);
  if (typeof x !== "number") {
    x = getX(node);
  }
  if (typeof y !== "number") {
    y = getY(node);
  }
  if (typeof width !== "number") {
    width = getWidth(node);
  }
  if (typeof height !== "number") {
    height = getHeight(node);
  }
  node.pos[0] = x;
  node.pos[1] = y;
  node.size[0] = width;
  node.size[1] = height;
  node.onResize(node.size);
}

app.registerExtension({
	name: "shinich39.RunJS",
  setup() {
    // append event last of loading extensions
    setTimeout(() => {
      
      const origQueuePrompt = api.queuePrompt;
      api.queuePrompt = async function(...args) {
        execNodes("before_queued", args);
        const r = await origQueuePrompt.apply(this, arguments);
        return r;
      }
  
      api.addEventListener("promptQueued", function(...args) {
        execNodes("after_queued", args);
      });
  
      api.addEventListener("status", function(...args) {
        execNodes("status", args);
      });
  
      api.addEventListener("progress", function(...args) {
        execNodes("progress", args);
      });
  
      api.addEventListener("executing", function(...args) {
        execNodes("executing", args);
      });
  
      api.addEventListener("executed", function(...args) {
        execNodes("executed", args);
      });
  
      api.addEventListener("execution_start", function(...args) {
        execNodes("execution_start", args);
      });
  
      api.addEventListener("execution_success", function(...args) {
        execNodes("execution_success", args);
      });
  
      api.addEventListener("execution_error", function(...args) {
        execNodes("execution_error", args);
      });
  
      api.addEventListener("execution_cached", function(...args) {
        execNodes("execution_cached", args);
      });

      console.log("[comfyui-run-js] initialized");

      execNodes("comfyui_setup", []);
    }, 1024 * 3);
  },
  nodeCreated(node) {
    if (node.comfyClass === CLASS_NAME) {
      const b = node.addWidget("button", "Run", null, () => {}, { serialize: false, });
      b.computeSize = () => [0, 26];
      b.callback = () => execNode(node, []);
      node.run = () => execNode(node, []);
    }
	},
});