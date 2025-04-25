placeholder = ""
placeholder += "# Use javascript code here!\n"
placeholder += "\n"
placeholder += "## Variables\n"
placeholder += "\n"
placeholder += "COMMAND: string\n"
placeholder += "STATE: <string, any>\n"
placeholder += "PROPS: <string, any>\n"
placeholder += "NODES: Node[]\n"
placeholder += "GROUPS: Group[]\n"
placeholder += "LINKS: Link[]\n"
placeholder += "ARGS: any[]\n"
placeholder += "DATE: Date\n"
placeholder += "YEAR: number\n"
placeholder += "MONTH: number\n"
placeholder += "DAY: number\n"
placeholder += "HOURS: number\n"
placeholder += "MINUTES: number\n"
placeholder += "SECONDS: number\n"
placeholder += "QUEUE_MODE: \"disabled\"|\"instant\"|\"change\"\n"
placeholder += "AUTO_QUEUE: boolean\n"
placeholder += "BATCH_COUNT: number\n"
placeholder += "\n"
placeholder += "## Methods\n"
placeholder += "\n"
placeholder += "Node(ID|TITLE|TYPE) => Node\n"
placeholder += "Nodes(ID|TITLE|TYPE) => Node[]\n"
placeholder += "Group(TITLE) => Group\n"
placeholder += "Groups(TITLE) => Group[]\n"
placeholder += "generateSeed() => number\n"
placeholder += "generateFloat(min, max) => number\n"
placeholder += "generateInt(min, max) => number\n"
placeholder += "generatePlots(...any[][]) => any[][]\n"
placeholder += "random(...any[]) => any\n"
placeholder += "create(TYPE, { key: value, ... }) => Node\n"
placeholder += "connect(OUTPUT_NODE, INPUT_NODE, OUTPUT_SLOT_NAME?, INPUT_SLOT_NAME?)\n"
placeholder += "getValues(Node) => { key: value, ... }\n"
placeholder += "setValues(Node, { key: value, ... })\n"
placeholder += "getRect(Node) => [x, y, width, height]\n"
placeholder += "setRect(Node, [x, y, width, height])\n"
# placeholder += "putOnLeft(Node, TARGET_NODE)\n"
# placeholder += "putOnRight(Node, TARGET_NODE)\n"
# placeholder += "putOnTop(Node, TARGET_NODE)\n"
# placeholder += "putOnBottom(Node, TARGET_NODE)\n"
# placeholder += "moveToRight(Node)\n"
# placeholder += "moveToBottom(Node)\n"
placeholder += "bypass(...(Node|Group)[])\n"
placeholder += "unbypass(...(Node|Group)[])\n"
placeholder += "pin(...(Node|Group)[])\n"
placeholder += "unpin(...(Node|Group)[])\n"
placeholder += "select(...(Node|Group)[])\n"
placeholder += "remove(...(Node|Group)[])\n"
placeholder += "run(...RUN_JS_NODE[])\n"
placeholder += "generate() => Promise<void>\n"
placeholder += "cancel() => Promise<void>\n"
placeholder += "getQueue() => Promise<number>\n"
placeholder += "setQueueMode(string)\n"
placeholder += "setBatchCount(number)\n"

class RunJS():
  def __init__(self):
    pass

  @classmethod
  def IS_CHANGED(self, **kwargs):
    return float("NaN")

  @classmethod
  def INPUT_TYPES(cls):
    return {
      "required": {
        "event": ((
          "None",
          "before_queued",
          "after_queued",
          "status",
          "progress",
          "executing",
          "executed",
          "execution_start",
          "execution_success",
          "execution_error",
          "execution_cached",
          "b_preview",
        ),),
        "text": ("STRING", {"default": "", "multiline": True, "placeholder": placeholder}),
      }
    }
  
  CATEGORY = "utils"
  RETURN_TYPES = ()
  RETURN_NAMES = ()
