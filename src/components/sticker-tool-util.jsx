import { StateNode } from 'tldraw';

const OFFSET = 12;

export class StickerTool extends StateNode {
  static id = 'sticker';

  constructor(editor, tool) {
    super(editor, tool);
    this.stickerText = 'Default Text'; // Default text
  }

  onEnter = () => {
    this.editor.setCursor({ type: 'cross', rotation: 0 });
  };

  onPointerDown = () => {
    const { currentPagePoint } = this.editor.inputs;

    const sensorTagShape = {
      type: 'text',
      x: currentPagePoint.x - OFFSET,
      y: currentPagePoint.y - OFFSET,
      props: {
        text: this.stickerText, // Use the text set in the tool
      },
    };

    this.editor.createShape(sensorTagShape);
  };

  setStickerText(text) {
    this.stickerText = text; // Update text dynamically
  }

  getStickerText() {
    return this.stickerText;
  }
}
